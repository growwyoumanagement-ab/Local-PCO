const cron = require('node-cron');
const ServiceRequest = require('../models/ServiceRequest');
const Partner = require('../models/Partner');
const { admin } = require('../config/firebase');

// Task 1: Send upcoming appointment reminders to partners (Runs every 5 minutes)
cron.schedule('*/5 * * * *', async () => {
    try {
        const now = new Date();
        const nextThirtyMins = new Date(Date.now() + 30 * 60 * 1000);

        // Find eligible requests that are accepted and upcoming in the next 30 mins
        // Exclude jobs already sent or currently being processed (leased)
        const eligibleJobs = await ServiceRequest.find({
            bookingType: 'appointment',
            status: 'accepted',
            scheduledAt: { $lte: nextThirtyMins, $gte: now },
            reminderSent: false,
            reminderSending: { $ne: true }
        });

        for (const job of eligibleJobs) {
            // Atomic lease claim — mark as "in progress" to prevent concurrent runs
            const claimedJob = await ServiceRequest.findOneAndUpdate(
                { _id: job._id, reminderSent: false, reminderSending: { $ne: true } },
                { $set: { reminderSending: true } },
                { new: true }
            ).populate('partnerId');

            if (!claimedJob) continue; // Another worker claimed it first

            if (claimedJob.partnerId?.fcmToken) {
                try {
                    const formattedTime = new Date(claimedJob.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    await admin.messaging().send({
                        token: claimedJob.partnerId.fcmToken,
                        notification: {
                            title: 'Upcoming Appointment ⏰',
                            body: `Reminder: You have a scheduled ${claimedJob.serviceName || 'service'} appointment at ${formattedTime}.`
                        },
                        data: {
                            type: 'upcoming_appointment',
                            jobId: claimedJob._id.toString()
                        },
                        android: { priority: 'high' },
                        apns: {
                            payload: {
                                aps: {
                                    sound: 'default',
                                    badge: 1
                                }
                            }
                        }
                    });
                    // FCM succeeded — mark as permanently sent
                    await ServiceRequest.findByIdAndUpdate(claimedJob._id, {
                        $set: { reminderSent: true, reminderSending: false }
                    });
                    console.log(`[Scheduler] Sent upcoming reminder push to partner: ${claimedJob.partnerId.name}`);
                } catch (pushError) {
                    console.error('[Scheduler] Error sending FCM reminder to partner:', pushError);
                    // Release lease so next cron run can retry
                    await ServiceRequest.findByIdAndUpdate(claimedJob._id, {
                        $set: { reminderSending: false }
                    });
                    if (pushError.code === 'messaging/registration-token-not-registered') {
                        await Partner.findByIdAndUpdate(claimedJob.partnerId._id, { $set: { fcmToken: null } });
                    }
                }
            } else {
                // No FCM token — release lease; nothing to retry
                await ServiceRequest.findByIdAndUpdate(claimedJob._id, {
                    $set: { reminderSending: false, reminderSent: true }
                });
            }
        }
    } catch (error) {
        console.error('[Scheduler] Error in upcoming appointments reminder cron:', error);
    }
});

// Task 2: Auto-cancel unaccepted pending appointments and alert clients (Runs every 15 minutes)
cron.schedule('*/15 * * * *', async () => {
    try {
        const cancellationBuffer = new Date(Date.now() + 2 * 60 * 60 * 1000);

        // 1. Auto-cancel pending requests that are less than 2 hours away
        const cancelResult = await ServiceRequest.updateMany(
            {
                bookingType: 'appointment',
                status: 'pending',
                scheduledAt: { $lte: cancellationBuffer }
            },
            {
                $set: { status: 'cancelled', cancelledBy: 'system', clientNotifiedOfCancel: false },
                $push: {
                    statusHistory: {
                        status: 'cancelled',
                        timestamp: new Date(),
                        updatedBy: 'system',
                        note: 'Auto-cancelled: appointment not accepted 2 hours prior.'
                    }
                }
            }
        );

        if (cancelResult.modifiedCount > 0) {
            console.log(`[Scheduler] Auto-cancelled ${cancelResult.modifiedCount} unaccepted appointments.`);
        }

        // 2. Fetch all unnotified cancelled appointment requests to alert clients
        const unnotifiedCancelledJobs = await ServiceRequest.find({
            bookingType: 'appointment',
            status: 'cancelled',
            cancelledBy: 'system',
            scheduledAt: { $lte: cancellationBuffer },
            clientNotifiedOfCancel: false,
            clientNotifyingSending: { $ne: true }
        }).populate('clientId');

        for (const job of unnotifiedCancelledJobs) {
            // Atomic lease claim
            const claimedJob = await ServiceRequest.findOneAndUpdate(
                { _id: job._id, clientNotifiedOfCancel: false, clientNotifyingSending: { $ne: true } },
                { $set: { clientNotifyingSending: true } },
                { new: true }
            );

            if (!claimedJob) continue; // Another worker claimed it first

            if (job.clientId?.fcmToken) {
                try {
                    const formattedDate = new Date(job.scheduledAt).toLocaleString('en-IN', {
                        weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                    });
                    await admin.messaging().send({
                        token: job.clientId.fcmToken,
                        notification: {
                            title: 'Appointment Cancelled 🚫',
                            body: `Unfortunately, no partner accepted your booking request for ${job.serviceName || 'service'} on ${formattedDate}. Please try booking again.`
                        },
                        data: {
                            type: 'appointment_cancelled',
                            jobId: job._id.toString()
                        },
                        android: { priority: 'high' },
                        apns: {
                            payload: {
                                aps: {
                                    sound: 'default',
                                    badge: 1
                                }
                            }
                        }
                    });
                    // FCM succeeded — mark as permanently notified
                    await ServiceRequest.findByIdAndUpdate(claimedJob._id, {
                        $set: { clientNotifiedOfCancel: true, clientNotifyingSending: false }
                    });
                    console.log(`[Scheduler] Sent auto-cancel alert push to client: ${job.clientId.name}`);
                } catch (pushError) {
                    console.error('[Scheduler] Error sending FCM cancel alert to client:', pushError);
                    
                    const permanentErrors = [
                        'messaging/registration-token-not-registered',
                        'messaging/invalid-argument'
                    ];

                    if (permanentErrors.includes(pushError.code)) {
                        // Permanent token failure — mark request as notified/skipped to avoid infinite loop retries
                        await ServiceRequest.findByIdAndUpdate(claimedJob._id, {
                            $set: { clientNotifiedOfCancel: true, clientNotifyingSending: false }
                        });
                        // Prune dead/invalid token from User collection
                        const User = require('../models/User');
                        await User.findByIdAndUpdate(job.clientId._id, { $set: { fcmToken: null } });
                        console.log(`[Scheduler] Pruned dead/invalid token for client: ${job.clientId.name} and skipped retry.`);
                    } else {
                        // Temporary failure (e.g., network timeout) — release lease so next cron run can retry
                        await ServiceRequest.findByIdAndUpdate(claimedJob._id, {
                            $set: { clientNotifyingSending: false }
                        });
                    }
                }
            } else {
                // No FCM token — release lease; nothing to retry
                await ServiceRequest.findByIdAndUpdate(claimedJob._id, {
                    $set: { clientNotifyingSending: false, clientNotifiedOfCancel: true }
                });
            }
        }
    } catch (error) {
        console.error('[Scheduler] Error in auto-cancel appointments cron:', error);
    }
});

console.log('[Scheduler] Appointment scheduler crons initialized.');
