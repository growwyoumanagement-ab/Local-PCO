const ServiceRequest = require('../models/ServiceRequest');
const Partner = require('../models/Partner');
const ServiceCategory = require('../models/ServiceCategory');
const Review = require('../models/Review');
const mongoose = require('mongoose');
const { notifyUser } = require('../utils/notificationHelper');
const logger = require('../utils/logger');

// @desc    Get all services
// @route   GET /api/v1/requests/services
// @access  Public
const getServices = async (req, res) => {
    try {
        const categories = await ServiceCategory.find({ isActive: true })
            .select('_id name icon description basePrice')
            .sort({ createdAt: 1 });

        // Shape response to match what the client app expects
        const services = categories.map(c => ({
            id: c._id,
            name: c.name,
            icon: c.icon || '🔧',
            description: c.description || '',
            basePrice: c.basePrice || 0,
        }));

        res.json({ success: true, data: services });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create a new service request
// @route   POST /api/v1/requests
// @access  Private (Client)
const createRequest = async (req, res) => {
    try {
        const { serviceId, partnerId, bookingType, address, notes, imageUri, scheduledAt } = req.body;

        // Basic validation
        if (!serviceId || !partnerId || !bookingType) {
            return res.status(400).json({ success: false, message: 'Please provide service, partner, and booking type' });
        }

        if (bookingType === 'appointment') {
            if (!scheduledAt) {
                return res.status(400).json({ success: false, message: 'Please provide appointment date and time' });
            }
            const appointmentTime = new Date(scheduledAt);
            const minBufferTime = new Date(Date.now() + 2 * 60 * 60 * 1000);
            const maxBufferTime = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

            if (appointmentTime < minBufferTime) {
                return res.status(400).json({ success: false, message: 'Appointments must be scheduled at least 2 hours in advance' });
            }
            if (appointmentTime > maxBufferTime) {
                return res.status(400).json({ success: false, message: 'Appointments cannot be scheduled more than 30 days in advance' });
            }
        }

        if (bookingType !== 'call_log' && !address) {
            return res.status(400).json({ success: false, message: 'Please provide address' });
        }

        const partner = await Partner.findById(partnerId);
        if (!partner) {
            return res.status(404).json({ success: false, message: 'Partner not found' });
        }

        // Idempotency check — check for recent duplicate pending booking from this client within 60 seconds
        const sixtySecondsAgo = new Date(Date.now() - 60 * 1000);
        const existingRecentRequest = await ServiceRequest.findOne({
            clientId: req.user._id,
            partnerId,
            serviceType: serviceId,
            status: 'pending',
            createdAt: { $gte: sixtySecondsAgo }
        });

        if (existingRecentRequest) {
            logger.info('[Booking] Duplicate request detected within 60s window — returning existing request', { requestId: existingRecentRequest._id });
            return res.json({ success: true, data: existingRecentRequest, message: 'Existing booking request retrieved' });
        }

        // Rule: Partner must be ONLINE (Only for instant bookings)
        if (bookingType === 'instant' && !partner.isOnline) {
            return res.status(400).json({ success: false, message: 'Partner is currently offline' });
        }

        // Resolve Service Name
        let serviceName = 'Unknown Service';
        let estimatedCharges = 0;

        // Try to find by ID first
        if (mongoose.Types.ObjectId.isValid(serviceId)) {
            const category = await ServiceCategory.findById(serviceId);
            if (category) {
                serviceName = category.name;
                estimatedCharges = category.basePrice || 0;
            }
        }

        // If not found by ID, try to find by name/slug
        if (serviceName === 'Unknown Service') {
            const category = await ServiceCategory.findOne({
                $or: [
                    { name: { $regex: new RegExp(serviceId, 'i') } },
                    { slug: serviceId }
                ]
            });
            if (category) {
                serviceName = category.name;
                estimatedCharges = category.basePrice || 0;
            } else {
                // Format slug to Title Case as fallback
                serviceName = serviceId
                    .split('_')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
            }
        }

        let finalAddress = {
            full: '',
            city: ''
        };
        let finalLocation = undefined;

        if (address) {
            finalAddress = {
                full: address.full || '',
                landmark: address.landmark || '',
                city: address.city || 'New Delhi',
                pincode: address.pincode || '110001',
                lat: address.lat,
                lng: address.lng
            };
            if (address.lng && address.lat) {
                finalLocation = {
                    type: 'Point',
                    coordinates: [Number(address.lng), Number(address.lat)]
                };
            }
        } else if (req.user && req.user.savedAddresses && req.user.savedAddresses.length > 0) {
            const homeAddr = req.user.savedAddresses.find(a => a.type === 'home' || a.label === 'Home') || req.user.savedAddresses.find(a => a.isDefault) || req.user.savedAddresses[0];
            if (homeAddr) {
                finalAddress = {
                    full: homeAddr.full || '',
                    landmark: homeAddr.landmark || '',
                    city: homeAddr.city || '',
                    pincode: homeAddr.pincode || '',
                    lat: homeAddr.lat,
                    lng: homeAddr.lng
                };
                if (homeAddr.lng && homeAddr.lat) {
                    finalLocation = {
                        type: 'Point',
                        coordinates: [Number(homeAddr.lng), Number(homeAddr.lat)]
                    };
                }
            }
        }

        const request = await ServiceRequest.create({
            clientId: req.user._id,
            partnerId,
            serviceType: serviceId,
            serviceName: serviceName,
            bookingType, // instant or appointment or call_log
            scheduledAt: bookingType === 'appointment' && scheduledAt ? new Date(scheduledAt) : undefined,
            status: 'pending',
            address: finalAddress,
            location: finalLocation,
            notes,
            estimatedCharges: estimatedCharges || 0,
            statusHistory: [{ status: 'pending', updatedBy: 'client' }]
        });

        // Dispatch notifications
        if (bookingType !== 'call_log') {
            const io = req.app.get('io');
            if (io) {
                const jobData = {
                    id: request._id,
                    serviceName: request.serviceName,
                    notes: request.notes,
                    address: request.address,
                    bookingType: request.bookingType,
                    clientName: req.user.name || 'Client',
                    createdAt: request.createdAt
                };
                io.to(partnerId.toString()).emit('new_job_assigned', jobData);
                logger.info(`Socket alert emitted to partner room: ${partnerId}`);
            }

            // FCM push notification via centralized helper (includes dead-token pruning)
            if (partner.fcmToken) {
                let title = 'New Job Request! 📬';
                let body = `A client has requested your ${request.serviceName || 'service'}. Tap to view details.`;

                if (bookingType === 'instant') {
                    title = 'New Instant Job Alert! 🚨';
                    body = 'URGENT: Accept within 60 seconds to secure the booking.';
                } else if (bookingType === 'appointment' && scheduledAt) {
                    const formattedDate = new Date(scheduledAt).toLocaleString('en-IN', {
                        weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                    });
                    title = 'New Appointment Request! 📅';
                    body = `New scheduled request for ${formattedDate}.`;
                }

                await notifyUser({
                    token: partner.fcmToken,
                    title,
                    body,
                    data: { type: 'new_job', jobId: request._id.toString() },
                    role: 'partner',
                    userId: partner._id
                });
            }
        } else {
            // Call log notification - informational ping
            if (partner.fcmToken) {
                await notifyUser({
                    token: partner.fcmToken,
                    title: 'Client Call Attempt 📞',
                    body: `${req.user.name || 'A client'} viewed your profile and attempted to call you.`,
                    data: { type: 'client_call', partnerId: partner._id.toString() },
                    role: 'partner',
                    userId: partner._id
                });
            }
        }

        res.status(201).json({ success: true, data: request });
    } catch (error) {
        logger.error('Create Request Error', { error: error.message });
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get active request for client
// @route   GET /api/v1/requests/active
// @access  Private (Client)
const getActiveRequest = async (req, res) => {
    try {
        // Find latest request that is not completed or cancelled, OR completed but not yet reviewed
        const request = await ServiceRequest.findOne({
            clientId: req.user._id,
            $or: [
                { status: { $in: ['pending', 'assigned', 'accepted', 'confirmed', 'en_route', 'reached', 'arrived', 'in_progress'] } },
                { status: 'completed', isReviewed: false }
            ]
        })
        .populate('partnerId', 'name phone currentLocation')
        .sort({ createdAt: -1 });

        if (!request) {
            return res.json({ success: true, data: null });
        }

        const formatted = request.toObject();
        if (formatted.partnerId) {
            formatted.partnerName = formatted.partnerId.name;
            formatted.partnerPhone = formatted.partnerId.phone;
            
            // Map GeoJSON currentLocation coordinates [longitude, latitude] to client { lat, lng }
            if (formatted.partnerId.currentLocation && formatted.partnerId.currentLocation.coordinates) {
                const coords = formatted.partnerId.currentLocation.coordinates;
                if (coords[0] !== 0 || coords[1] !== 0) {
                    formatted.partnerLocation = {
                        lat: coords[1],
                        lng: coords[0]
                    };
                }
            }
            
            formatted.partnerId = formatted.partnerId._id;
        }

        res.json({ success: true, data: formatted }); 
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get request history
// @route   GET /api/v1/requests/history
// @access  Private (Client)
const getRequestHistory = async (req, res) => {
    try {
        const { status } = req.query;
        let query = { clientId: req.user._id };

        if (status) {
            if (status === 'pending' || status === 'active') {
                query.status = { $in: ['pending', 'assigned', 'accepted', 'confirmed', 'en_route', 'reached', 'arrived', 'in_progress'] };
            } else {
                query.status = status;
            }
        }

        const requests = await ServiceRequest.find(query)
            .populate('partnerId', 'name phone')
            .sort({ createdAt: -1 });

        const formattedRequests = requests.map(req => {
            const formatted = req.toObject();
            if (formatted.partnerId) {
                formatted.partnerName = formatted.partnerId.name;
                formatted.partnerPhone = formatted.partnerId.phone;
                formatted.partnerId = formatted.partnerId._id;
            }
            return formatted;
        });

        res.json({ success: true, data: formattedRequests });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get request by ID
// @route   GET /api/v1/requests/:id
// @access  Private
const getRequestById = async (req, res) => {
    try {
        const request = await ServiceRequest.findById(req.params.id)
            .populate('partnerId', 'name phone');
            
        if (!request) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }
        
        const formatted = request.toObject();
        if (formatted.partnerId) {
            formatted.partnerName = formatted.partnerId.name;
            formatted.partnerPhone = formatted.partnerId.phone;
            formatted.partnerId = formatted.partnerId._id;
        }
        
        res.json({ success: true, data: formatted });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
// @desc    Cancel a service request
// @route   PUT /api/v1/requests/:id/cancel
// @access  Private (Client)
const cancelRequest = async (req, res) => {
    try {
        const request = await ServiceRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        // Only the client who created the request can cancel it
        if (request.clientId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to cancel this request' });
        }

        // Can only cancel non-terminal requests
        const cancellable = ['pending', 'accepted'];
        if (!cancellable.includes(request.status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot cancel a request that is '${request.status}'`
            });
        }

        request.status = 'cancelled';
        request.cancelledBy = 'client';
        request.statusHistory.push({ status: 'cancelled', updatedBy: 'client' });
        await request.save();

        const partner = await Partner.findById(request.partnerId);
        if (partner) {
            // Emit real-time socket alert to partner if connected
            const io = req.app.get('io');
            if (io && request.partnerId) {
                io.to(request.partnerId.toString()).emit('job_cancelled_by_client', {
                    jobId: request._id.toString(),
                    serviceName: request.serviceName
                });
            }

            if (partner.fcmToken) {
                await notifyUser({
                    token: partner.fcmToken,
                    title: 'Job Cancelled 🚫',
                    body: `Client has cancelled the service for ${request.serviceName || 'service'}.`,
                    data: { type: 'job_cancelled', jobId: request._id.toString() },
                    role: 'partner',
                    userId: partner._id
                });
            }
        }

        res.json({ success: true, message: 'Request cancelled successfully', data: request });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Submit a review for a completed service request
// @route   POST /api/v1/requests/:id/review
// @access  Private (Client)
const submitReview = async (req, res) => {
    let session;
    try {
        const { rating, feedback, tags } = req.body;
        const requestId = req.params.id;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: 'Please provide a valid rating between 1 and 5' });
        }

        const request = await ServiceRequest.findById(requestId);

        if (!request) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        // Only the client who created the request can review it
        if (request.clientId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to review this request' });
        }

        if (request.status !== 'completed') {
            return res.status(400).json({ success: false, message: 'Can only review completed requests' });
        }

        if (request.isReviewed) {
            return res.status(400).json({ success: false, message: 'This request has already been reviewed' });
        }

        session = await mongoose.startSession();
        session.startTransaction();

        const review = await Review.create([{
            requestId,
            clientId: req.user._id,
            partnerId: request.partnerId,
            rating,
            feedback,
            tags
        }], { session });

        request.isReviewed = true;
        await request.save({ session });

        // Aggregate ratings and update Partner aggregates within the same transaction
        const stats = await Review.aggregate([
            { $match: { partnerId: mongoose.Types.ObjectId.isValid(request.partnerId) ? new mongoose.Types.ObjectId(request.partnerId) : request.partnerId } },
            {
                $group: {
                    _id: '$partnerId',
                    averageRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 }
                }
            }
        ]).session(session);

        if (stats.length > 0) {
            await Partner.findByIdAndUpdate(request.partnerId, {
                averageRating: Math.round(stats[0].averageRating * 10) / 10,
                totalReviews: stats[0].totalReviews
            }).session(session);
        }

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({ success: true, message: 'Review submitted successfully', data: review[0] });
    } catch (error) {
        if (session) {
            await session.abortTransaction();
            session.endSession();
        }
        logger.error('Submit Review Error', { error: error.message });
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Skip review for a completed request
// @route   PUT /api/v1/requests/:id/skip-review
// @access  Private (Client)
const skipReview = async (req, res) => {
    try {
        const requestId = req.params.id;
        const request = await ServiceRequest.findById(requestId);

        if (!request) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        if (request.clientId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to skip review for this request' });
        }

        request.isReviewed = true;
        await request.save();

        res.json({ success: true, message: 'Review skipped successfully' });
    } catch (error) {
        logger.error('Skip Review Error', { error: error.message });
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Reschedule appointment
// @route   PUT /api/v1/requests/:id/reschedule
// @access  Private (Client)
const rescheduleAppointment = async (req, res) => {
    try {
        const { scheduledAt } = req.body;
        if (!scheduledAt) {
            return res.status(400).json({ success: false, message: 'Please provide a new scheduled date and time' });
        }

        const newTime = new Date(scheduledAt);
        const minTime = new Date(Date.now() + 2 * 60 * 60 * 1000);
        if (newTime < minTime) {
            return res.status(400).json({ success: false, message: 'Appointments must be rescheduled at least 2 hours in advance' });
        }

        const request = await ServiceRequest.findById(req.params.id);
        if (!request) {
            return res.status(404).json({ success: false, message: 'Booking request not found' });
        }

        if (request.clientId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to reschedule this request' });
        }

        if (request.status === 'completed' || request.status === 'cancelled') {
            return res.status(400).json({ success: false, message: 'Cannot reschedule a completed or cancelled request' });
        }

        request.scheduledAt = newTime;
        request.statusHistory.push({
            status: request.status,
            timestamp: new Date(),
            updatedBy: 'client',
            notes: `Rescheduled to ${newTime.toISOString()}`
        });

        await request.save();

        res.json({
            success: true,
            message: 'Appointment rescheduled successfully',
            data: request
        });
    } catch (error) {
        logger.error('Reschedule Error', { error: error.message });
        res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = {
    getServices,
    createRequest,
    cancelRequest,
    getRequestHistory,
    getRequestById,
    getActiveRequest,
    submitReview,
    skipReview,
    rescheduleAppointment,
};
