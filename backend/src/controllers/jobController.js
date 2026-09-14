// backend/src/controllers/jobController.js
// Job management controller — all partner-facing job operations

const ServiceRequest = require('../models/ServiceRequest');
const Transaction = require('../models/Transaction');
const { notifyUser } = require('../utils/notificationHelper');
const logger = require('../utils/logger');

// @desc    Get pending jobs for partner
// @route   GET /api/v1/jobs/pending-requests
// @access  Private (Partner)
const getPendingJobs = async (req, res) => {
    try {
        const jobs = await ServiceRequest.find({
            partnerId: req.partner._id,
            status: 'pending'
        })
            .populate('clientId', 'name email phone avatar')
            .sort({ createdAt: -1 });

        const formattedJobs = jobs.map(job => ({
            id: job._id,
            clientId: job.clientId?._id,
            clientName: job.clientId?.name || 'Unknown Client',
            clientPhone: job.clientId?.phone || '',
            clientEmail: job.clientId?.email || '',
            clientAvatar: job.clientId?.avatar,
            serviceType: job.serviceName || job.serviceType,
            serviceCategory: job.serviceType,
            serviceName: job.serviceName,
            bookingType: job.bookingType,
            status: job.status,
            pickupAddress: job.address?.full || 'Address not available',
            pickupLatitude: job.address?.lat || 0,
            pickupLongitude: job.address?.lng || 0,
            distance: 0,
            createdAt: job.createdAt,
            estimatedPrice: job.estimatedCharges || 0,
            description: job.notes,
            notes: job.notes,
        }));

        res.json({
            success: true,
            data: {
                jobs: formattedJobs,
                totalCount: formattedJobs.length,
                page: 1,
                limit: formattedJobs.length
            }
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Helper function to format job for frontend
const formatJobResponse = (job) => {
    return {
        id: job._id,
        clientId: job.clientId?._id || job.clientId,
        clientName: job.clientId?.name || 'Unknown Client',
        clientPhone: job.clientId?.phone || '',
        clientEmail: job.clientId?.email || '',
        clientAvatar: job.clientId?.avatar,
        serviceType: job.serviceName || job.serviceType,
        serviceCategory: job.serviceType,
        serviceName: job.serviceName,
        bookingType: job.bookingType,
        status: job.status,
        pickupAddress: job.address?.full || 'Address not available',
        pickupLatitude: job.address?.lat || 0,
        pickupLongitude: job.address?.lng || 0,
        distance: 0,
        createdAt: job.createdAt,
        acceptedAt: job.acceptedAt,
        reachedAt: job.reachedAt,        // FIX #13: was missing
        startedAt: job.startedAt,
        completedAt: job.completedAt,
        estimatedPrice: job.estimatedCharges || 0,
        finalPrice: job.finalCharges,
        description: job.notes,
        notes: job.notes,
        proofImages: job.proofImages || [],
        completionNotes: job.completionNotes
    };
};

// Valid state machine transitions (key = current, value = allowed next states)
const VALID_TRANSITIONS = {
    pending:     ['accepted', 'cancelled', 'rejected'],
    accepted:    ['reached', 'cancelled'],
    reached:     ['in_progress', 'cancelled'],
    in_progress: ['completed', 'cancelled'],
    completed:   [],  // terminal
    cancelled:   [],  // terminal
    rejected:    [],  // terminal
};

// @desc    Update job status
// @route   PUT /api/v1/jobs/:id/status
// @access  Private (Partner)
const updateJobStatus = async (req, res) => {
    try {
        const { status, proofImages, notes } = req.body;
        const job = await ServiceRequest.findById(req.params.id)
            .populate('clientId', 'name email phone avatar fcmToken')
            .populate('partnerId', 'name email phone');

        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        // FIX #6: Handle both ObjectId and populated partnerId safely
        const jobPartnerId = job.partnerId?._id
            ? job.partnerId._id.toString()
            : job.partnerId?.toString();

        if (!jobPartnerId || jobPartnerId !== req.partner._id.toString()) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        // Prevent duplicate updates on simultaneous requests
        if (job.status === status) {
            return res.json({ success: true, data: formatJobResponse(job) });
        }

        const allowed = VALID_TRANSITIONS[job.status] || [];
        if (!allowed.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot transition job from '${job.status}' to '${status}'`
            });
        }

        // Atomic check-lock for cancellations
        if (status === 'cancelled') {
            const updatedJob = await ServiceRequest.findOneAndUpdate(
                { _id: req.params.id, partnerId: req.partner._id, status: job.status },
                {
                    $set: { status: 'cancelled' },
                    $push: { statusHistory: { status: 'cancelled', updatedBy: 'partner' } }
                },
                { new: true }
            ).populate('clientId', 'name email phone avatar fcmToken')
             .populate('partnerId', 'name email phone');

            if (!updatedJob) {
                return res.status(409).json({
                    success: false,
                    message: 'Conflict: Job status has changed. Transition ignored.'
                });
            }

            // Notify Client of Partner Cancellation
            try {
                if (updatedJob.clientId?.fcmToken) {
                    await notifyUser({
                        token: updatedJob.clientId.fcmToken,
                        title: 'Job Cancelled by Partner 🚫',
                        body: `Your service partner ${updatedJob.partnerId?.name || 'Partner'} has cancelled the request.`,
                        data: { type: 'job_cancelled_by_partner', jobId: updatedJob._id.toString() },
                        role: 'client',
                        userId: updatedJob.clientId._id
                    });
                }
            } catch (notifErr) {
                logger.error('FCM partner cancellation notification failed', { error: notifErr.message });
            }

            return res.json({ success: true, data: formatJobResponse(updatedJob) });
        }

        // Track timestamp fields per state
        if (status === 'accepted') job.acceptedAt = new Date();
        if (status === 'reached')   job.reachedAt = new Date();
        if (status === 'in_progress') job.startedAt = new Date();

        job.status = status;
        job.statusHistory.push({ status, updatedBy: 'partner' });

        if (status === 'completed') {
            if (proofImages) job.proofImages = proofImages;
            if (notes) job.completionNotes = notes;
            job.finalCharges = job.estimatedCharges;
            job.completedAt = new Date();

            const amount = job.estimatedCharges || 0;

            // FIX #5: Wallet transaction in isolated try/catch — wallet failure must NOT
            // crash the job completion response. Credit is async & can be retried.
            try {
                await Transaction.create({
                    partnerId: job.partnerId._id || job.partnerId,
                    jobId: job._id,
                    type: 'credit',
                    amount: amount,
                    description: `Payment for job: ${job.serviceName || job.serviceType}`,
                    status: 'completed'
                });
            } catch (walletErr) {
                logger.error('Wallet transaction credit failed — job still marked complete', {
                    jobId: job._id,
                    error: walletErr.message
                });
                // Do not re-throw — job completion succeeds regardless of wallet credit
            }
        }

        await job.save();

        // Dispatch push notifications on partner status updates
        try {
            const clientFcmToken = job.clientId?.fcmToken;
            const clientUserId = job.clientId?._id;
            const partnerName = job.partnerId?.name || 'Partner';

            if (status === 'accepted' && clientFcmToken) {
                await notifyUser({
                    token: clientFcmToken,
                    title: 'Request Accepted! 🛠️',
                    body: `Your service partner ${partnerName} has accepted the booking and will arrive shortly.`,
                    data: { type: 'job_accepted', jobId: job._id.toString() },
                    role: 'client',
                    userId: clientUserId
                });
            } else if (status === 'reached' && clientFcmToken) {
                await notifyUser({
                    token: clientFcmToken,
                    title: 'Partner Arrived! 📍',
                    body: `Your service partner ${partnerName} has reached your location.`,
                    data: { type: 'job_reached', jobId: job._id.toString() },
                    role: 'client',
                    userId: clientUserId
                });
            } else if (status === 'in_progress' && clientFcmToken) {
                await notifyUser({
                    token: clientFcmToken,
                    title: 'Job Started! 🔨',
                    body: 'Your service is now in progress.',
                    data: { type: 'job_in_progress', jobId: job._id.toString() },
                    role: 'client',
                    userId: clientUserId
                });
            } else if (status === 'completed' && clientFcmToken) {
                await notifyUser({
                    token: clientFcmToken,
                    title: 'Job Completed! 🎉',
                    body: 'Your service is complete. Tap to review your partner.',
                    data: { type: 'job_completed', jobId: job._id.toString() },
                    role: 'client',
                    userId: clientUserId
                });
            }
        } catch (notifErr) {
            logger.error('FCM job status transition notification failed', { error: notifErr.message });
        }

        res.json({ success: true, data: formatJobResponse(job) });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Reject a pending job (partner declines without permanently cancelling booking)
// @route   POST /api/v1/jobs/:id/reject
// @access  Private (Partner)
// FIX #4: Dedicated reject endpoint — removes partner from job and allows re-assignment
const rejectJob = async (req, res) => {
    try {
        const { reason } = req.body;

        const job = await ServiceRequest.findById(req.params.id)
            .populate('clientId', 'name email phone avatar fcmToken')
            .populate('partnerId', 'name email phone');

        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        // Only the assigned partner can reject
        const jobPartnerId = job.partnerId?._id
            ? job.partnerId._id.toString()
            : job.partnerId?.toString();

        if (!jobPartnerId || jobPartnerId !== req.partner._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to reject this job' });
        }

        // Only pending jobs can be rejected
        if (job.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `Cannot reject a job that is already '${job.status}'`
            });
        }

        // Track rejection count & reason for analytics
        const rejectionNote = reason || 'Partner declined';
        job.statusHistory.push({ status: 'rejected', updatedBy: 'partner', note: rejectionNote });

        // Remove the partner assignment so the job can be re-queued
        // Set status back to a searchable state or mark as 'rejected'
        // For now, mark as 'cancelled' with cancelledBy = 'partner_reject' for analytics
        // In future: implement re-queue logic to find next available partner
        job.status = 'cancelled';
        job.cancelledBy = 'partner_reject';
        await job.save();

        // Notify client about rejection so they can retry
        try {
            if (job.clientId?.fcmToken) {
                await notifyUser({
                    token: job.clientId.fcmToken,
                    title: 'Partner Unavailable 😞',
                    body: 'Your service partner was unable to accept the request. Please try booking again.',
                    data: { type: 'job_rejected_by_partner', jobId: job._id.toString() },
                    role: 'client',
                    userId: job.clientId._id
                });
            }
        } catch (notifErr) {
            logger.error('FCM partner rejection notification failed', { error: notifErr.message });
        }

        res.json({ success: true, message: 'Job rejected successfully', data: formatJobResponse(job) });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get active jobs for partner (accepted, reached, in_progress)
// @route   GET /api/v1/jobs/active
// @access  Private (Partner)
// FIX #9: These statuses were never fetchable — partner had no visibility of their active job
const getActiveJobs = async (req, res) => {
    try {
        const jobs = await ServiceRequest.find({
            partnerId: req.partner._id,
            status: { $in: ['accepted', 'reached', 'in_progress'] }
        })
            .populate('clientId', 'name email phone avatar')
            .sort({ createdAt: -1 });

        const formattedJobs = jobs.map(job => ({
            id: job._id,
            clientId: job.clientId?._id,
            clientName: job.clientId?.name || 'Unknown Client',
            clientPhone: job.clientId?.phone || '',
            clientEmail: job.clientId?.email || '',
            clientAvatar: job.clientId?.avatar,
            serviceType: job.serviceName || job.serviceType,
            serviceCategory: job.serviceType,
            serviceName: job.serviceName,
            bookingType: job.bookingType,
            status: job.status,
            pickupAddress: job.address?.full || 'Address not available',
            pickupLatitude: job.address?.lat || 0,
            pickupLongitude: job.address?.lng || 0,
            distance: 0,
            createdAt: job.createdAt,
            acceptedAt: job.acceptedAt,
            reachedAt: job.reachedAt,
            startedAt: job.startedAt,
            estimatedPrice: job.estimatedCharges || 0,
            description: job.notes,
            notes: job.notes,
        }));

        res.json({
            success: true,
            data: {
                jobs: formattedJobs,
                totalCount: formattedJobs.length,
            }
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @route   GET /api/v1/jobs/history
// @access  Private (Partner)
const getJobHistory = async (req, res) => {
    try {
        // Include both completed AND cancelled jobs in history
        const jobs = await ServiceRequest.find({
            partnerId: req.partner._id,
            status: { $in: ['completed', 'cancelled'] }
        })
            .populate('clientId', 'name email phone avatar')
            .sort({ createdAt: -1 });

        const formattedJobs = jobs.map(job => ({
            id: job._id,
            clientId: job.clientId?._id,
            clientName: job.clientId?.name || 'Unknown Client',
            clientPhone: job.clientId?.phone || '',
            clientEmail: job.clientId?.email || '',
            clientAvatar: job.clientId?.avatar,
            serviceType: job.serviceName || job.serviceType,
            serviceCategory: job.serviceType,
            serviceName: job.serviceName,
            status: job.status,
            pickupAddress: job.address?.full || 'Address not available',
            pickupLatitude: job.address?.lat || 0,
            pickupLongitude: job.address?.lng || 0,
            distance: 0,
            createdAt: job.createdAt,
            completedAt: job.completedAt,
            estimatedPrice: job.estimatedCharges || 0,
            finalPrice: job.finalCharges,
            description: job.notes,
            notes: job.notes,
            proofImages: job.proofImages || [],
            completionNotes: job.completionNotes
        }));

        res.json({
            success: true,
            data: {
                jobs: formattedJobs,
                totalCount: formattedJobs.length,
                page: 1,
                limit: formattedJobs.length
            }
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get today's summary for partner
// @route   GET /api/v1/jobs/today-summary
// @access  Private (Partner)
const getTodaysSummary = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const partnerId = req.partner._id;

        const totalJobs = await ServiceRequest.countDocuments({
            partnerId,
            createdAt: { $gte: today }
        });

        const completedJobs = await ServiceRequest.countDocuments({
            partnerId,
            status: 'completed',
            createdAt: { $gte: today }
        });

        const pendingJobs = await ServiceRequest.countDocuments({
            partnerId,
            status: 'pending',
            createdAt: { $gte: today }
        });

        const earningsResult = await ServiceRequest.aggregate([
            {
                $match: {
                    partnerId: partnerId,
                    status: 'completed',
                    createdAt: { $gte: today }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$finalCharges' }
                }
            }
        ]);

        const totalEarnings = earningsResult.length > 0 ? earningsResult[0].total : 0;

        res.json({
            success: true,
            data: {
                totalJobs,
                completedJobs,
                pendingJobs,
                totalEarnings
            }
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get job by ID
// @route   GET /api/v1/jobs/:id
// @access  Private (Partner)
const getJobById = async (req, res) => {
    try {
        const job = await ServiceRequest.findById(req.params.id)
            .populate('clientId', 'name email phone avatar')
            .populate('partnerId', 'name email phone');

        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        // FIX #6: Safe authorization check — handle both ObjectId and populated partnerId
        const jobPartnerId = job.partnerId?._id
            ? job.partnerId._id.toString()
            : job.partnerId?.toString();

        if (!jobPartnerId || jobPartnerId !== req.partner._id.toString()) {
            return res.status(401).json({ success: false, message: 'Not authorized to view this job' });
        }

        res.json({ success: true, data: formatJobResponse(job) });
    } catch (error) {
        logger.error('Get job by ID error', { error: error.message });
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Upload proof images for a completed job
// @route   POST /api/v1/jobs/:id/upload-proof
// @access  Private (Partner)
const cloudinary = require('../config/cloudinaryConfig');

const uploadJobProof = async (req, res) => {
    try {
        const { images } = req.body;

        if (!images || !Array.isArray(images) || images.length === 0) {
            return res.status(400).json({ success: false, message: 'No images provided' });
        }

        const job = await ServiceRequest.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        if (job.partnerId.toString() !== req.partner._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const uploadPromises = images.map(image =>
            cloudinary.uploader.upload(image, {
                folder: `local-pco/job-proofs/${job._id}`,
                resource_type: 'image',
            })
        );

        const results = await Promise.all(uploadPromises);
        const imageUrls = results.map(r => r.secure_url);

        job.proofImages = [...(job.proofImages || []), ...imageUrls];
        await job.save();

        res.json({ success: true, data: { proofImages: job.proofImages } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get accepted appointments for partner
// @route   GET /api/v1/jobs/appointments
// @access  Private (Partner)
const getAcceptedAppointments = async (req, res) => {
    try {
        const jobs = await ServiceRequest.find({
            partnerId: req.partner._id,
            bookingType: 'appointment',
            status: { $in: ['pending', 'accepted'] }
        })
            .populate('clientId', 'name email phone avatar')
            .sort({ scheduledAt: 1 });

        const formattedJobs = jobs.map(job => ({
            id: job._id,
            clientId: job.clientId?._id,
            clientName: job.clientId?.name || 'Unknown Client',
            clientPhone: job.clientId?.phone || '',
            clientEmail: job.clientId?.email || '',
            clientAvatar: job.clientId?.avatar,
            serviceType: job.serviceName || job.serviceType,
            serviceCategory: job.serviceType,
            serviceName: job.serviceName,
            bookingType: job.bookingType,
            status: job.status,
            pickupAddress: job.address?.full || 'Address not available',
            pickupLatitude: job.address?.lat || 0,
            pickupLongitude: job.address?.lng || 0,
            distance: 0,
            createdAt: job.createdAt,
            scheduledAt: job.scheduledAt,
            estimatedPrice: job.estimatedCharges || 0,
            finalPrice: job.finalCharges,
            description: job.notes,
            notes: job.notes,
        }));

        res.json({ success: true, data: formattedJobs });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = {
    getPendingJobs,
    getActiveJobs,
    getJobById,
    updateJobStatus,
    rejectJob,
    getJobHistory,
    getTodaysSummary,
    uploadJobProof,
    getAcceptedAppointments
};

