const User = require('../models/User');
const Partner = require('../models/Partner');
const ServiceRequest = require('../models/ServiceRequest');
const Transaction = require('../models/Transaction');
const ServiceCategory = require('../models/ServiceCategory');
const ContentSection = require('../models/ContentSection');
const KycDocument = require('../models/KYCDocument');
const KYCAuditLog = require('../models/KYCAuditLog');

// @desc    Get Admin Dashboard Stats
// @route   GET /api/v1/admin/stats
// @access  Private (Admin)
exports.getDashboardStats = async (req, res) => {
    try {
        const totalPartners = await Partner.countDocuments();
        const totalClients = await User.countDocuments({ $or: [{ role: 'user' }, { role: { $exists: false } }] });
        const totalBookings = await ServiceRequest.countDocuments();
        const activeBookings = await ServiceRequest.countDocuments({ status: 'pending' });

        // Calculate Revenue (Total charges from completed jobs)
        const revenueResult = await ServiceRequest.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$finalCharges' } } }
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        // Recent Bookings (Last 5)
        const recentBookings = await ServiceRequest.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('clientId', 'name')
            .populate('partnerId', 'name');

        // Status Distribution for Charts
        const statusStats = await ServiceRequest.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        const bookingStatusDistribution = statusStats.map(stat => ({
            name: stat._id.charAt(0).toUpperCase() + stat._id.slice(1), // Capitalize
            value: stat.count
        }));

        res.json({
            success: true,
            data: {
                totalPartners,
                totalClients,
                totalBookings,
                activeBookings,
                totalRevenue,
                recentBookings,
                bookingStatusDistribution
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get All Partners
// @route   GET /api/v1/admin/partners
// @access  Private (Admin)
exports.getAllPartners = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const query = {};
        if (req.query.status && req.query.status !== 'all') {
            query.isActive = req.query.status === 'active';
        }
        if (req.query.kycStatus && req.query.kycStatus !== 'all') {
            query.kycStatus = req.query.kycStatus === 'verified' ? 'approved' : req.query.kycStatus;
        }

        // Server-side search across name, phone, email, and city
        if (req.query.search && req.query.search.trim()) {
            const searchRegex = new RegExp(req.query.search.trim(), 'i');
            query.$or = [
                { name: searchRegex },
                { phone: searchRegex },
                { email: searchRegex },
                { 'address.city': searchRegex }
            ];
        }

        // Server-side sorting
        let sort = { createdAt: -1, _id: -1 };
        if (req.query.sortBy === 'name') {
            const order = req.query.sortOrder === 'desc' ? -1 : 1;
            sort = { name: order, _id: -1 };
        } else if (req.query.sortBy === 'createdAt') {
            const order = req.query.sortOrder === 'asc' ? 1 : -1;
            sort = { createdAt: order, _id: -1 };
        }

        const total = await Partner.countDocuments(query);
        const partners = await Partner.find(query)
            .select('-password')
            .populate('serviceCategory', 'name')
            .populate('serviceCategories', 'name')
            .populate('kycDocuments')
            .collation({ locale: 'en', strength: 2 })
            .sort(sort)
            .skip(skip)
            .limit(limit);

        res.json({
            success: true,
            count: partners.length,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            },
            data: partners
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Verify Partner KYC
// @route   PUT /api/v1/admin/partners/:id/kyc
// @access  Private (Admin)
exports.verifyPartnerKyc = async (req, res) => {
    try {
        const { status, reason } = req.body; // 'approved' or 'rejected'
        const partner = await Partner.findById(req.params.id);

        if (!partner) {
            return res.status(404).json({ success: false, message: 'Partner not found' });
        }

        const previousStatus = partner.kycStatus;
        partner.kycStatus = status;
        if (status === 'approved') {
            partner.isActive = true; // Auto-activate on KYC approval
            partner.isVerified = true;
        } else if (status === 'rejected') {
            partner.kycRejectionReason = reason || 'Rejected by Admin';
        }
        await partner.save();

        // Create KYC Audit Log record so Verification History is complete
        try {
            await KYCAuditLog.create({
                partnerId: partner._id,
                verifierId: req.user._id,
                action: status === 'approved' ? 'approve' : 'reject',
                reason: reason || (status === 'approved' ? 'Approved by Admin' : 'Rejected by Admin'),
                previousStatus: previousStatus,
                newStatus: status,
                timestamp: new Date()
            });
        } catch (auditErr) {
            console.error('Failed to create KYC audit log:', auditErr);
        }

        res.json({ success: true, data: partner });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Toggle Partner Active Status
// @route   PUT /api/v1/admin/partners/:id/status
// @access  Private (Admin)
exports.togglePartnerStatus = async (req, res) => {
    try {
        const { isActive } = req.body;
        const partner = await Partner.findById(req.params.id);

        if (!partner) {
            return res.status(404).json({ success: false, message: 'Partner not found' });
        }

        partner.isActive = Boolean(isActive);
        await partner.save();

        res.json({ success: true, data: partner });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get All Clients
// @route   GET /api/v1/admin/clients
// @access  Private (Admin)
exports.getAllClients = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const matchQuery = { $or: [{ role: 'user' }, { role: { $exists: false } }] };

        if (req.query.search && req.query.search.trim()) {
            const searchRegex = new RegExp(req.query.search.trim(), 'i');
            matchQuery.$and = [
                {
                    $or: [
                        { name: searchRegex },
                        { phone: searchRegex },
                        { email: searchRegex }
                    ]
                }
            ];
        }

        let sortStage = { createdAt: -1, _id: -1 };
        if (req.query.sortBy === 'name') {
            const order = req.query.sortOrder === 'desc' ? -1 : 1;
            sortStage = { name: order, _id: -1 };
        } else if (req.query.sortBy === 'createdAt') {
            const order = req.query.sortOrder === 'asc' ? 1 : -1;
            sortStage = { createdAt: order, _id: -1 };
        }

        const total = await User.countDocuments(matchQuery);
        const clients = await User.aggregate([
            { $match: matchQuery },
            { $sort: sortStage },
            { $skip: skip },
            { $limit: limit },
            {
                $lookup: {
                    from: 'servicerequests',
                    localField: '_id',
                    foreignField: 'clientId',
                    as: 'bookings'
                }
            },
            {
                $addFields: {
                    bookingCount: { $size: '$bookings' }
                }
            },
            {
                $project: {
                    password: 0,
                    bookings: 0
                }
            }
        ]);

        res.json({
            success: true,
            count: clients.length,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            },
            data: clients
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Toggle Client Block Status
// @route   PUT /api/v1/admin/clients/:id/block
// @access  Private (Admin)
exports.toggleClientBlock = async (req, res) => {
    try {
        const { isBlocked } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.isBlocked = isBlocked;
        await user.save();

        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get All Bookings
// @route   GET /api/v1/admin/bookings
// @access  Private (Admin)
exports.getAllBookings = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const query = {};
        if (req.query.status && req.query.status !== 'all') {
            query.status = req.query.status;
        }

        // Date range filtering with validation
        if (req.query.startDate || req.query.endDate) {
            if (req.query.startDate && req.query.endDate) {
                const start = new Date(req.query.startDate);
                const end = new Date(req.query.endDate);
                if (start > end) {
                    return res.status(400).json({ success: false, message: 'Start date cannot be after end date.' });
                }
            }

            query.createdAt = {};
            if (req.query.startDate) {
                const start = new Date(req.query.startDate);
                start.setHours(0, 0, 0, 0);
                query.createdAt.$gte = start;
            }
            if (req.query.endDate) {
                const end = new Date(req.query.endDate);
                end.setHours(23, 59, 59, 999);
                query.createdAt.$lte = end;
            }
        }

        // Server search across serviceName, bookingType
        if (req.query.search && req.query.search.trim()) {
            const searchRegex = new RegExp(req.query.search.trim(), 'i');
            query.$or = [
                { serviceName: searchRegex },
                { serviceType: searchRegex },
                { bookingType: searchRegex },
                { 'address.city': searchRegex },
                { 'address.full': searchRegex }
            ];
        }

        let sort = { createdAt: -1, _id: -1 };
        if (req.query.sortBy === 'createdAt' || req.query.sortBy === 'date') {
            const order = req.query.sortOrder === 'asc' ? 1 : -1;
            sort = { createdAt: order, _id: -1 };
        } else if (req.query.sortBy === 'status') {
            const order = req.query.sortOrder === 'desc' ? -1 : 1;
            sort = { status: order, _id: -1 };
        }

        const total = await ServiceRequest.countDocuments(query);
        const bookings = await ServiceRequest.find(query)
            .populate('clientId', 'name email phone')
            .populate({
                path: 'partnerId',
                select: 'name email serviceCategory serviceCategories phone address',
                populate: {
                    path: 'serviceCategory',
                    select: 'name'
                }
            })
            .populate({
                path: 'interestedPartners.partnerId',
                select: 'name phone email'
            })
            .sort(sort)
            .skip(skip)
            .limit(limit);

        // Enrich with derived data for legacy bookings
        const enriched = bookings.map(b => {
            const obj = b.toObject();

            // Derive completedAt from statusHistory if not set
            if (!obj.completedAt && obj.status === 'completed') {
                const completedEntry = obj.statusHistory?.find(s => s.status === 'completed');
                obj.completedAt = completedEntry?.timestamp || obj.updatedAt;
            }

            // Include the assigned partner in interestedPartners if not already there
            if (obj.partnerId && (!obj.interestedPartners || obj.interestedPartners.length === 0)) {
                obj.interestedPartners = [{
                    partnerId: {
                        _id: obj.partnerId._id,
                        name: obj.partnerId.name,
                        phone: obj.partnerId.phone,
                        email: obj.partnerId.email
                    },
                    clickedAt: obj.createdAt
                }];
            }

            return obj;
        });

        res.json({
            success: true,
            count: enriched.length,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            },
            data: enriched
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get Bookings for a specific client
// @route   GET /api/v1/admin/clients/:id/bookings
// @access  Private (Admin)
exports.getClientBookings = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const query = { clientId: req.params.id };
        if (req.query.status && req.query.status !== 'all') {
            query.status = req.query.status;
        }

        const total = await ServiceRequest.countDocuments(query);
        const bookings = await ServiceRequest.find(query)
            .populate({
                path: 'partnerId',
                select: 'name email serviceCategory phone',
                populate: {
                    path: 'serviceCategory',
                    select: 'name'
                }
            })
            .populate({
                path: 'interestedPartners.partnerId',
                select: 'name phone'
            })
            .sort({ createdAt: -1, _id: -1 })
            .skip(skip)
            .limit(limit);

        // Enrich with derived data for legacy bookings
        const enriched = bookings.map(b => {
            const obj = b.toObject();

            // Derive completedAt from statusHistory if not set
            if (!obj.completedAt && obj.status === 'completed') {
                const completedEntry = obj.statusHistory?.find(s => s.status === 'completed');
                obj.completedAt = completedEntry?.timestamp || obj.updatedAt;
            }

            // Include the assigned partner in interestedPartners if not already there
            if (obj.partnerId && (!obj.interestedPartners || obj.interestedPartners.length === 0)) {
                obj.interestedPartners = [{
                    partnerId: {
                        _id: obj.partnerId._id,
                        name: obj.partnerId.name,
                        phone: obj.partnerId.phone
                    },
                    clickedAt: obj.createdAt
                }];
            }

            return obj;
        });

        res.json({
            success: true,
            count: enriched.length,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            },
            data: enriched
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get Wallets / Payouts
// @route   GET /api/v1/admin/wallets
// @access  Private (Admin)
exports.getAllWallets = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const wallets = await Partner.aggregate([
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
                $lookup: {
                    from: 'transactions',
                    localField: '_id',
                    foreignField: 'partnerId',
                    as: 'transactions'
                }
            },
            {
                $project: {
                    _id: 1,
                    partnerName: '$name',
                    bankAccounts: 1,
                    totalEarned: {
                        $sum: {
                            $map: {
                                input: {
                                    $filter: {
                                        input: '$transactions',
                                        as: 'tx',
                                        cond: { $and: [{ $eq: ['$$tx.type', 'credit'] }, { $eq: ['$$tx.status', 'completed'] }] }
                                    }
                                },
                                as: 'tx',
                                in: '$$tx.amount'
                            }
                        }
                    },
                    totalPaidOut: {
                        $sum: {
                            $map: {
                                input: {
                                    $filter: {
                                        input: '$transactions',
                                        as: 'tx',
                                        cond: { $and: [{ $eq: ['$$tx.type', 'payout'] }, { $eq: ['$$tx.status', 'completed'] }] }
                                    }
                                },
                                as: 'tx',
                                in: '$$tx.amount'
                            }
                        }
                    },
                    pendingPayoutTotal: {
                        $sum: {
                            $map: {
                                input: {
                                    $filter: {
                                        input: '$transactions',
                                        as: 'tx',
                                        cond: { $and: [{ $eq: ['$$tx.type', 'payout'] }, { $eq: ['$$tx.status', 'pending'] }] }
                                    }
                                },
                                as: 'tx',
                                in: '$$tx.amount'
                            }
                        }
                    },
                    pendingPayoutsList: {
                        $filter: {
                            input: '$transactions',
                            as: 'tx',
                            cond: { $and: [{ $eq: ['$$tx.type', 'payout'] }, { $eq: ['$$tx.status', 'pending'] }] }
                        }
                    }
                }
            },
            {
                $addFields: {
                    balance: { $subtract: ['$totalEarned', { $add: ['$totalPaidOut', '$pendingPayoutTotal'] }] },
                    pendingPayout: '$pendingPayoutTotal'
                }
            },
            {
                $project: {
                    totalEarned: 0,
                    totalPaidOut: 0,
                    pendingPayoutTotal: 0
                }
            }
        ]);

        const total = await Partner.countDocuments();

        res.json({
            success: true,
            count: wallets.length,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            },
            data: wallets
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Approve Payout
// @route   PUT /api/v1/admin/payouts/:transactionId/approve
// @access  Private (Admin)
exports.approvePayout = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.transactionId);
        if (!transaction || transaction.type !== 'payout' || transaction.status !== 'pending') {
            return res.status(404).json({ success: false, message: 'Pending payout not found' });
        }
        transaction.status = 'completed';
        await transaction.save();
        res.json({ success: true, data: transaction });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Reject Payout
// @route   PUT /api/v1/admin/payouts/:transactionId/reject
// @access  Private (Admin)
exports.rejectPayout = async (req, res) => {
    try {
        const { reason } = req.body;
        const transaction = await Transaction.findById(req.params.transactionId);
        if (!transaction || transaction.type !== 'payout' || transaction.status !== 'pending') {
            return res.status(404).json({ success: false, message: 'Pending payout not found' });
        }
        transaction.status = 'failed';
        if (reason) transaction.reason = reason;
        
        // Return funds to partner's available balance by failing the transaction 
        // (dynamic balance calculation auto-reverts it)
        await transaction.save();
        res.json({ success: true, data: transaction });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get All Service Categories
// @route   GET /api/v1/admin/services
// @access  Private (Admin)
exports.getAllServiceCategories = async (req, res) => {
    try {
        const services = await ServiceCategory.find().sort({ priority: -1 });
        res.json({ success: true, count: services.length, data: services });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create Service Category
// @route   POST /api/v1/admin/services
// @access  Private (Admin)
exports.createServiceCategory = async (req, res) => {
    try {
        const { name, icon, description, priority, subcategories, isActive } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ success: false, message: 'Category name is required' });
        }

        const trimmedName = name.trim();

        // Case-insensitive duplicate check
        const existing = await ServiceCategory.findOne({
            name: { $regex: new RegExp(`^${trimmedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
        });

        if (existing) {
            return res.status(400).json({ success: false, message: 'A service category with this name already exists' });
        }

        // Raw code / Icon format validation
        if (icon && icon.trim()) {
            const rawIcon = icon.trim();
            if (!/^[a-z0-9-]+$/i.test(rawIcon)) {
                return res.status(400).json({ success: false, message: 'Icon raw code must contain only letters, numbers, and hyphens (e.g. "hammer", "construct", "home")' });
            }
        }

        // Validate subcategories if present
        const validatedSubcategories = (subcategories || []).map(sub => {
            const subIcon = sub.icon ? sub.icon.trim() : '';
            return {
                name: sub.name ? sub.name.trim() : '',
                icon: subIcon,
                isActive: sub.isActive !== undefined ? sub.isActive : true
            };
        }).filter(sub => sub.name.length > 0);

        const service = await ServiceCategory.create({
            name: trimmedName,
            icon: icon ? icon.trim() : undefined,
            description: description ? description.trim() : '',
            priority: Number(priority) || 0,
            subcategories: validatedSubcategories,
            isActive: isActive !== undefined ? isActive : true
        });

        res.status(201).json({ success: true, data: service });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update Service Category (Edit or Toggle Status)
// @route   PUT /api/v1/admin/services/:id
// @access  Private (Admin)
exports.updateServiceCategory = async (req, res) => {
    try {
        const { name, icon, description, priority, subcategories, isActive } = req.body;

        const updateData = {};

        if (name !== undefined) {
            if (!name.trim()) {
                return res.status(400).json({ success: false, message: 'Category name cannot be empty' });
            }
            const trimmedName = name.trim();

            // Case-insensitive duplicate check excluding current id
            const existing = await ServiceCategory.findOne({
                _id: { $ne: req.params.id },
                name: { $regex: new RegExp(`^${trimmedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
            });

            if (existing) {
                return res.status(400).json({ success: false, message: 'A service category with this name already exists' });
            }
            updateData.name = trimmedName;
        }

        if (icon !== undefined) {
            const rawIcon = icon.trim();
            if (rawIcon && !/^[a-z0-9-]+$/i.test(rawIcon)) {
                return res.status(400).json({ success: false, message: 'Icon raw code must contain only letters, numbers, and hyphens (e.g. "hammer", "construct", "home")' });
            }
            updateData.icon = rawIcon;
        }

        if (description !== undefined) updateData.description = description.trim();
        if (priority !== undefined) updateData.priority = Number(priority) || 0;
        if (isActive !== undefined) updateData.isActive = isActive;

        if (subcategories !== undefined) {
            updateData.subcategories = (subcategories || []).map(sub => {
                const subIcon = sub.icon ? sub.icon.trim() : '';
                return {
                    name: sub.name ? sub.name.trim() : '',
                    icon: subIcon,
                    isActive: sub.isActive !== undefined ? sub.isActive : true
                };
            }).filter(sub => sub.name.length > 0);
        }

        const service = await ServiceCategory.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true
        });

        if (!service) {
            return res.status(404).json({ success: false, message: 'Service not found' });
        }
        res.json({ success: true, data: service });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete Service Category
// @route   DELETE /api/v1/admin/services/:id
// @access  Private (Admin)
exports.deleteServiceCategory = async (req, res) => {
    try {
        const service = await ServiceCategory.findByIdAndDelete(req.params.id);
        if (!service) {
            return res.status(404).json({ success: false, message: 'Service not found' });
        }
        res.json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update KYC Document Status
// @route   PUT /api/v1/admin/kyc-documents/:id/status
// @access  Private (Admin)
exports.updateKycDocumentStatus = async (req, res) => {
    try {
        const { status, rejectionReason } = req.body;
        const KYCDocument = require('../models/KYCDocument');
        const KYCAuditLog = require('../models/KYCAuditLog');

        const document = await KYCDocument.findById(req.params.id);
        if (!document) {
            return res.status(404).json({ success: false, message: 'Document not found' });
        }

        const prevDocStatus = document.status;
        document.status = status;
        if (rejectionReason) {
            document.rejectionReason = rejectionReason;
        }

        if (status === 'approved') {
            document.verifiedAt = Date.now();
            document.verifiedBy = req.user._id;
        }

        await document.save();

        // Write to KYCAuditLog
        try {
            await KYCAuditLog.create({
                partnerId: document.partner,
                verifierId: req.user._id,
                action: status === 'approved' ? 'approve' : 'reject',
                reason: rejectionReason || `Document ${document.documentType} marked ${status} by Admin`,
                previousStatus: prevDocStatus,
                newStatus: status,
                timestamp: new Date()
            });
        } catch (auditErr) {
            console.error('Failed to create KYC document audit log:', auditErr);
        }

        res.json({ success: true, data: document });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Verify Partner Bank Details
// @route   PUT /api/v1/admin/partners/:id/bank-verify
// @access  Private (Admin)
exports.verifyPartnerBankDetails = async (req, res) => {
    try {
        const partner = await Partner.findById(req.params.id);

        if (!partner) {
            return res.status(404).json({ success: false, message: 'Partner not found' });
        }

        if (!partner.bankAccounts || partner.bankAccounts.length === 0) {
            return res.status(400).json({ success: false, message: 'No bank accounts found' });
        }

        const accountId = req.body.accountId;
        if (accountId) {
            const targetAccount = partner.bankAccounts.id(accountId);
            if (targetAccount) {
                targetAccount.isActive = true;
            } else {
                partner.bankAccounts[0].isActive = true;
            }
        } else {
            // Verify all or primary account
            partner.bankAccounts.forEach(acc => {
                if (acc.isPrimary) acc.isActive = true;
            });
            if (!partner.bankAccounts.some(acc => acc.isPrimary)) {
                partner.bankAccounts[0].isActive = true;
            }
        }

        await partner.save();

        res.json({ success: true, data: partner });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Add Partner Bank Account
// @route   POST /api/v1/admin/partners/:id/bank-accounts
// @access  Private (Admin)
exports.addPartnerBankAccount = async (req, res) => {
    try {
        const { accountHolderName, accountNumber, bankName, ifsc, isPrimary } = req.body;

        if (!accountHolderName || !accountNumber || !bankName || !ifsc) {
            return res.status(400).json({ success: false, message: 'Please provide account holder name, account number, bank name, and IFSC code' });
        }

        const partner = await Partner.findById(req.params.id);
        if (!partner) {
            return res.status(404).json({ success: false, message: 'Partner not found' });
        }

        if (!partner.bankAccounts) {
            partner.bankAccounts = [];
        }

        if (isPrimary) {
            partner.bankAccounts.forEach(acc => { acc.isPrimary = false; });
        }

        partner.bankAccounts.push({
            accountHolderName: accountHolderName.trim(),
            accountNumber: accountNumber.trim(),
            bankName: bankName.trim(),
            ifsc: ifsc.trim().toUpperCase(),
            isPrimary: Boolean(isPrimary || partner.bankAccounts.length === 0),
            isActive: true
        });

        await partner.save();

        res.status(201).json({ success: true, data: partner });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Content Management
exports.getAllContent = async (req, res) => {
    try {
        const sections = await ContentSection.find().sort({ priority: -1 });
        res.json({ success: true, data: sections });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createContent = async (req, res) => {
    try {
        const section = await ContentSection.create(req.body);
        res.status(201).json({ success: true, data: section });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateContent = async (req, res) => {
    try {
        const section = await ContentSection.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!section) {
            return res.status(404).json({ success: false, message: 'Content section not found' });
        }
        res.json({ success: true, data: section });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteContent = async (req, res) => {
    try {
        const section = await ContentSection.findByIdAndDelete(req.params.id);
        if (!section) {
            return res.status(404).json({ success: false, message: 'Content section not found' });
        }
        res.json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Upload a single image to Cloudinary
// @route   POST /api/v1/admin/upload-image
// @access  Private (Admin)
exports.uploadImage = async (req, res) => {
    try {
        const { image, folder } = req.body;

        if (!image || !image.startsWith('data:')) {
            return res.status(400).json({ success: false, message: 'No valid base64 image provided' });
        }

        const { uploadBase64Image } = require('../utils/uploadService');
        const uploadResult = await uploadBase64Image(image, folder || 'verifier_documents');

        if (!uploadResult.success) {
            return res.status(500).json({ success: false, message: 'Image upload failed' });
        }

        res.json({ success: true, data: { url: uploadResult.url } });
    } catch (error) {
        console.error('Upload image error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get All Verifiers
// @route   GET /api/v1/admin/verifiers
// @access  Private (Admin)
exports.getVerifiers = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const query = { role: 'verifier' };

        if (req.query.search && req.query.search.trim()) {
            const searchRegex = new RegExp(req.query.search.trim(), 'i');
            query.$or = [
                { name: searchRegex },
                { phone: searchRegex },
                { email: searchRegex },
                { houseAddress: searchRegex }
            ];
        }

        let sort = { createdAt: -1, _id: -1 };
        if (req.query.sortBy === 'name') {
            const order = req.query.sortOrder === 'desc' ? -1 : 1;
            sort = { name: order, _id: -1 };
        } else if (req.query.sortBy === 'createdAt') {
            const order = req.query.sortOrder === 'asc' ? 1 : -1;
            sort = { createdAt: order, _id: -1 };
        }

        const total = await User.countDocuments(query);
        const verifiers = await User.find(query)
            .select('-password')
            .collation({ locale: 'en', strength: 2 })
            .sort(sort)
            .skip(skip)
            .limit(limit);

        res.json({
            success: true,
            count: verifiers.length,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            },
            data: verifiers
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create Verifier
// @route   POST /api/v1/admin/verifiers
// @access  Private (Admin)
exports.createVerifier = async (req, res) => {
    try {
        const { 
            firstName, lastName, email, phone, password,
            aadhaarCard, panCard, houseNumber, houseAddress,
            workplaceAddress, phone2, housePhone,
            photoUrl, aadhaarFrontUrl, aadhaarBackUrl, panCardUrl
        } = req.body;

        const name = `${firstName} ${lastName}`.trim();

        const userExists = await User.findOne({ phone });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User with this phone already exists' });
        }

        const verifier = await User.create({
            name,
            firstName,
            lastName,
            email,
            phone,
            password,
            role: 'verifier',
            aadhaarCard,
            panCard,
            houseNumber,
            houseAddress,
            workplaceAddress,
            phone2,
            housePhone,
            photo: photoUrl || undefined,
            aadhaarFrontImage: aadhaarFrontUrl || undefined,
            aadhaarBackImage: aadhaarBackUrl || undefined,
            panCardImage: panCardUrl || undefined,
        });

        res.status(201).json({
            success: true,
            data: {
                _id: verifier._id,
                name: verifier.name,
                firstName: verifier.firstName,
                lastName: verifier.lastName,
                email: verifier.email,
                phone: verifier.phone,
                role: verifier.role,
                isBlocked: verifier.isBlocked,
                aadhaarCard: verifier.aadhaarCard,
                panCard: verifier.panCard,
                houseNumber: verifier.houseNumber,
                houseAddress: verifier.houseAddress,
                workplaceAddress: verifier.workplaceAddress,
                phone2: verifier.phone2,
                housePhone: verifier.housePhone,
                photo: verifier.photo,
                createdAt: verifier.createdAt
            }
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Toggle Verifier Status
// @route   PUT /api/v1/admin/verifiers/:id/status
// @access  Private (Admin)
exports.toggleVerifierStatus = async (req, res) => {
    try {
        const { isBlocked } = req.body;
        const user = await User.findById(req.params.id);

        if (!user || user.role !== 'verifier') {
            return res.status(404).json({ success: false, message: 'Verifier not found' });
        }

        user.isBlocked = isBlocked;
        await user.save();

        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create a new partner
// @route   POST /api/v1/admin/partners
// @access  Private (Admin)
exports.createPartner = async (req, res) => {
    try {
        const { name, phone, email, password, serviceCategory, serviceCategories, serviceSubcategory, address } = req.body;

        // Support single or multiple categories
        const categoriesList = Array.isArray(serviceCategories) && serviceCategories.length > 0 
            ? serviceCategories 
            : (serviceCategory ? [serviceCategory] : []);

        if (!name || !phone || !password || categoriesList.length === 0) {
            return res.status(400).json({ success: false, message: 'Please provide name, phone, password, and at least one service category' });
        }

        const partnerExists = await Partner.findOne({ phone });

        if (partnerExists) {
            return res.status(400).json({ success: false, message: 'Partner already exists with this phone number' });
        }

        // Format address cleanly
        let partnerAddress = undefined;
        if (address) {
            if (typeof address === 'string') {
                partnerAddress = { city: address.trim() };
            } else if (typeof address === 'object') {
                partnerAddress = {
                    street: address.street ? address.street.trim() : undefined,
                    city: address.city ? address.city.trim() : undefined,
                    state: address.state ? address.state.trim() : undefined,
                    pincode: address.pincode ? address.pincode.trim() : undefined,
                    country: address.country || 'India'
                };
            }
        }

        const partner = await Partner.create({
            name: name.trim(),
            phone: phone.trim(),
            email: email && email.trim() ? email.toLowerCase().trim() : undefined,
            password,
            serviceCategory: categoriesList[0],
            serviceCategories: categoriesList,
            serviceSubcategory: serviceSubcategory ? serviceSubcategory.trim() : undefined,
            address: partnerAddress
        });

        res.status(201).json({ success: true, data: partner });
    } catch (error) {
        console.error('Create partner error:', error);
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get single partner by ID
// @route   GET /api/v1/admin/partners/:id
// @access  Private (Admin)
exports.getPartnerById = async (req, res) => {
    try {
        const partner = await Partner.findById(req.params.id)
            .populate('serviceCategory', 'name')
            .populate('serviceCategories', 'name')
            .populate('kycDocuments');

        if (!partner) {
            return res.status(404).json({ success: false, message: 'Partner not found' });
        }

        res.json({ success: true, data: partner });
    } catch (error) {
        console.error('getPartnerById error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Reset partner password
// @route   PUT /api/v1/admin/partners/:id/reset-password
// @access  Private (Admin)
exports.resetPartnerPassword = async (req, res) => {
    try {
        const { password } = req.body;
        if (!password || password.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
        }

        const partner = await Partner.findById(req.params.id);
        if (!partner) {
            return res.status(404).json({ success: false, message: 'Partner not found' });
        }

        partner.password = password;
        await partner.save();

        res.json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
        console.error('resetPartnerPassword error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
