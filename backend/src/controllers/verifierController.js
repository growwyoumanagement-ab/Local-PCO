const Partner = require('../models/Partner');
const KYCAuditLog = require('../models/KYCAuditLog');
const KYCDocument = require('../models/KYCDocument');

// @desc    Get verification queue (partners needing KYC review)
// @route   GET /api/v1/verifier/queue
// @access  Private (Verifier)
exports.getVerificationQueue = async (req, res) => {
    try {
        const { status, city, category, startDate, endDate } = req.query;

        // Build filter
        let filter = {};

        // Status filter - default to pending if not specified
        if (status) {
            if (status === 'all') {
                filter.kycStatus = { $in: ['pending', 'under_review', 'on_hold', 'need_info', 'rejected'] };
            } else {
                filter.kycStatus = status;
            }
        } else {
            filter.kycStatus = { $in: ['pending', 'under_review', 'on_hold', 'need_info'] };
        }

        // City filter
        if (city) {
            filter['address.city'] = { $regex: new RegExp(city, 'i') };
        }

        // Category filter
        if (category) {
            filter.serviceCategory = category;
        }

        // Date range filter (on kycSubmittedAt)
        if (startDate || endDate) {
            filter.kycSubmittedAt = {};
            if (startDate) filter.kycSubmittedAt.$gte = new Date(startDate);
            if (endDate) filter.kycSubmittedAt.$lte = new Date(endDate);
        }

        const partners = await Partner.find(filter)
            .select('-password')
            .populate('serviceCategory', 'name')
            .populate('kycDocuments')
            .sort({ kycSubmittedAt: 1 }); // Oldest first

        // Calculate SLA status for each partner
        const now = new Date();
        const partnersWithSLA = partners.map(p => {
            const partner = p.toObject({ virtuals: true });
            const submittedAt = partner.kycSubmittedAt || partner.createdAt;
            const hoursElapsed = (now - new Date(submittedAt)) / (1000 * 60 * 60);
            partner.slaHoursElapsed = Math.round(hoursElapsed * 10) / 10;
            partner.slaBreached = hoursElapsed > 24;
            partner.slaWarning = hoursElapsed > 18 && hoursElapsed <= 24;
            return partner;
        });

        res.json({
            success: true,
            count: partnersWithSLA.length,
            data: partnersWithSLA
        });
    } catch (error) {
        console.error('getVerificationQueue error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Perform verification action on a partner
// @route   PUT /api/v1/verifier/partners/:id/action
// @access  Private (Verifier)
exports.performVerificationAction = async (req, res) => {
    try {
        const { action, reason } = req.body;
        const partnerId = req.params.id;
        const verifierId = req.user._id;

        // Validate action
        const validActions = ['approve', 'reject', 'put_on_hold', 'request_more_info'];
        if (!validActions.includes(action)) {
            return res.status(400).json({
                success: false,
                message: `Invalid action. Must be one of: ${validActions.join(', ')}`
            });
        }

        // Validate reason is present for reject and request_more_info
        if (['reject', 'request_more_info'].includes(action) && !reason) {
            return res.status(400).json({
                success: false,
                message: 'Reason is mandatory for reject and request more info actions'
            });
        }

        const partner = await Partner.findById(partnerId);
        if (!partner) {
            return res.status(404).json({ success: false, message: 'Partner not found' });
        }

        const siteVisit = await KYCAuditLog.findOne({
            partnerId: partner._id,
            action: 'site_visit'
        }).sort({ timestamp: -1 });

        // Enforce site visit requirement for approve/reject
        if (['approve', 'reject'].includes(action)) {
            if (!siteVisit) {
                return res.status(400).json({
                    success: false,
                    message: 'Site visit photo is required before approving or rejecting a partner. Please upload a site visit first.'
                });
            }
        }

        const previousStatus = partner.kycStatus;

        // Map action to new status
        const actionStatusMap = {
            'approve': 'approved',
            'reject': 'rejected',
            'put_on_hold': 'on_hold',
            'request_more_info': 'need_info'
        };

        const newStatus = actionStatusMap[action];
        partner.kycStatus = newStatus;

        // Set reason for rejection/hold/need_info
        if (['reject', 'put_on_hold', 'request_more_info'].includes(action)) {
            partner.kycRejectionReason = reason;
        } else {
            partner.kycRejectionReason = null;
        }

        // Auto-activate on KYC approval
        if (action === 'approve') {
            partner.isVerified = true;
            partner.isActive = true;
        }

        await partner.save();

        // Create immutable audit log entry
        await KYCAuditLog.create({
            partnerId: partner._id,
            verifierId,
            action,
            reason: reason || null,
            previousStatus,
            newStatus,
            siteVisitImage: siteVisit ? siteVisit.siteVisitImage : undefined,
            siteVisitLocation: siteVisit ? siteVisit.siteVisitLocation : undefined
        });

        res.json({
            success: true,
            data: partner,
            message: `Partner KYC ${newStatus} successfully`
        });
    } catch (error) {
        console.error('performVerificationAction error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get audit log for a specific partner
// @route   GET /api/v1/verifier/partners/:id/audit-log
// @access  Private (Verifier)
exports.getPartnerAuditLog = async (req, res) => {
    try {
        const logs = await KYCAuditLog.find({ partnerId: req.params.id })
            .populate('verifierId', 'name email phone')
            .sort({ timestamp: -1 });

        res.json({ success: true, count: logs.length, data: logs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get verification dashboard stats
// @route   GET /api/v1/verifier/stats
// @access  Private (Verifier)
exports.getVerifierDashboardStats = async (req, res) => {
    try {
        const isVerifier = req.user.role === 'verifier';
        const verifierId = req.user._id;

        // Pending and SLA wait times are global logic (Open Queue system)
        const pendingCount = await Partner.countDocuments({ kycStatus: { $in: ['pending', 'under_review'] } });
        
        const slaThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const slaBreachedCount = await Partner.countDocuments({
            kycStatus: { $in: ['pending', 'under_review'] },
            kycSubmittedAt: { $lte: slaThreshold }
        });

        let approvedCount, rejectedCount, onHoldCount, needInfoCount;

        if (isVerifier) {
            // Verifiers see count of their personal actions
            [approvedCount, rejectedCount, onHoldCount, needInfoCount] = await Promise.all([
                KYCAuditLog.countDocuments({ verifierId, action: 'approve' }),
                KYCAuditLog.countDocuments({ verifierId, action: 'reject' }),
                KYCAuditLog.countDocuments({ verifierId, action: 'put_on_hold' }),
                KYCAuditLog.countDocuments({ verifierId, action: 'request_more_info' })
            ]);
        } else {
            // Admins see global current platform state
            [approvedCount, rejectedCount, onHoldCount, needInfoCount] = await Promise.all([
                Partner.countDocuments({ kycStatus: 'approved' }),
                Partner.countDocuments({ kycStatus: 'rejected' }),
                Partner.countDocuments({ kycStatus: 'on_hold' }),
                Partner.countDocuments({ kycStatus: 'need_info' })
            ]);
        }

        // Recent verification actions
        let recentQuery = {};
        if (isVerifier) recentQuery.verifierId = verifierId;

        const recentActions = await KYCAuditLog.find(recentQuery)
            .populate('partnerId', 'name phone')
            .populate('verifierId', 'name')
            .sort({ timestamp: -1 })
            .limit(10);

        // Today's actions
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let todayQuery = { timestamp: { $gte: today } };
        if (isVerifier) todayQuery.verifierId = verifierId;

        const todayActionsCount = await KYCAuditLog.countDocuments(todayQuery);

        res.json({
            success: true,
            data: {
                pendingCount,
                approvedCount,
                rejectedCount,
                onHoldCount,
                needInfoCount,
                slaBreachedCount,
                todayActionsCount,
                recentActions,
                statusDistribution: [
                    { name: 'Pending', value: pendingCount },
                    { name: 'Approved', value: approvedCount },
                    { name: 'Rejected', value: rejectedCount },
                    { name: 'On Hold', value: onHoldCount },
                    { name: 'Need Info', value: needInfoCount }
                ]
            }
        });
    } catch (error) {
        console.error('getVerifierDashboardStats error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all verification history (audit logs)
// @route   GET /api/v1/verifier/history
// @access  Private (Verifier)
exports.getVerificationHistory = async (req, res) => {
    try {
        const { page = 1, limit = 50 } = req.query;

        let query = { action: { $ne: 'site_visit' } };
        if (req.user.role === 'verifier') {
            query.verifierId = req.user._id;
        }

        const logs = await KYCAuditLog.find(query)
            .populate('partnerId', 'name phone email kycLocation')
            .populate('verifierId', 'name email')
            .sort({ timestamp: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await KYCAuditLog.countDocuments(query);

        res.json({
            success: true,
            count: logs.length,
            total,
            page: parseInt(page),
            data: logs
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Upload site visit photo with location
// @route   POST /api/v1/verifier/partners/:id/site-visit
// @access  Private (Verifier)
exports.uploadSiteVisit = async (req, res) => {
    try {
        const { image, latitude, longitude, address } = req.body;
        const partnerId = req.params.id;
        const verifierId = req.user._id;

        if (!image || !latitude || !longitude) {
            return res.status(400).json({
                success: false,
                message: 'Site visit image and GPS location are required'
            });
        }

        const partner = await Partner.findById(partnerId);
        if (!partner) {
            return res.status(404).json({ success: false, message: 'Partner not found' });
        }

        // Upload image to Cloudinary
        let imageUrl = '';
        if (image.startsWith('data:')) {
            const { uploadBase64Image } = require('../utils/uploadService');
            const uploadResult = await uploadBase64Image(image, 'verifier_site_visits');
            if (uploadResult.success) {
                imageUrl = uploadResult.url;
            } else {
                return res.status(500).json({ success: false, message: 'Failed to upload site visit image' });
            }
        } else {
            imageUrl = image; // Already a URL
        }

        // Create audit log entry for site visit
        const auditEntry = await KYCAuditLog.create({
            partnerId: partner._id,
            verifierId,
            action: 'site_visit',
            previousStatus: partner.kycStatus,
            newStatus: partner.kycStatus, // No status change
            siteVisitImage: imageUrl,
            siteVisitLocation: {
                latitude,
                longitude,
                address: address || null,
                capturedAt: new Date()
            }
        });

        res.status(201).json({
            success: true,
            data: auditEntry,
            message: 'Site visit uploaded successfully'
        });
    } catch (error) {
        console.error('uploadSiteVisit error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
