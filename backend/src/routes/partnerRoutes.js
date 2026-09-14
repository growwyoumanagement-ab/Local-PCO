const express = require('express');
const router = express.Router();
const { protectPartner } = require('../middleware/authMiddleware');
const Partner = require('../models/Partner');

// @desc    Get partner profile
// @route   GET /api/v1/partner/profile
// @access  Private (Partner)
router.get('/profile', protectPartner, async (req, res) => {
    try {
        const partner = await Partner.findById(req.partner._id).populate('serviceCategory', 'name');
        if (partner) {
            let rating = partner.averageRating || partner.rating || 0.0;
            let totalReviews = partner.totalReviews || 0;
            if (!rating || rating === 0) {
                const Review = require('../models/Review');
                const mongoose = require('mongoose');
                const pObjectId = mongoose.Types.ObjectId.isValid(partner._id) ? new mongoose.Types.ObjectId(partner._id) : partner._id;
                const reviewAgg = await Review.aggregate([
                    { $match: { partnerId: pObjectId } },
                    { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
                ]);
                if (reviewAgg.length > 0 && reviewAgg[0].count > 0) {
                    rating = Math.round(reviewAgg[0].avgRating * 10) / 10;
                    totalReviews = reviewAgg[0].count;
                    await Partner.findByIdAndUpdate(partner._id, { averageRating: rating, totalReviews });
                }
            }

            res.json({
                success: true,
                data: {
                    profile: {
                        id: partner._id,
                        name: partner.name,
                        phone: partner.phone,
                        email: partner.email,
                        avatar: partner.avatar,
                        serviceCategory: partner.serviceCategory,
                        serviceSubcategory: partner.serviceSubcategory,
                        rating: rating,
                        totalReviews: totalReviews,
                        totalJobs: partner.totalJobs || 0, // Count from ServiceRequest when needed
                        joinedAt: partner.createdAt,
                        address: partner.address
                    },
                    availability: partner.isOnline ? 'online' : 'offline',
                    kycStatus: partner.kycStatus,
                }
            });
        } else {
            res.status(404).json({ success: false, message: 'Partner not found' });
        }
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

const { uploadBase64Image, deleteImage } = require('../utils/uploadService');

// @desc    Update partner profile
// @route   PUT /api/v1/partner/profile
// @access  Private (Partner)
router.put('/profile', protectPartner, async (req, res) => {
    try {
        const { name, email, avatar, address } = req.body;
        const partner = await Partner.findById(req.partner._id);

        if (partner) {
            partner.name = name || partner.name;
            partner.email = email || partner.email;

            if (address) {
                partner.address = {
                    ...partner.address,
                    ...address
                };
            }

            if (avatar) {
                // If avatar is a base64 string, upload it
                if (avatar.startsWith('data:image')) {
                    // Delete old avatar if it exists and is a Cloudinary URL (basic check)
                    if (partner.avatar && partner.avatar.includes('cloudinary')) {
                        // Extract public ID logic could be complex without storing it separately, 
                        // but for now let's just upload the new one.
                        // Ideally we should store publicId in the model for avatars too, 
                        // but for Simplicity/Time we'll just overwrite the URL.
                        // Future TODO: Store avatarPublicId in Partner model.
                    }

                    const uploadResult = await uploadBase64Image(avatar, 'partner_avatars');
                    if (uploadResult.success) {
                        partner.avatar = uploadResult.url;
                    } else {
                        throw new Error('Failed to upload profile image');
                    }
                } else {
                    // If it's not base64 (e.g. just a URL being passed back), keep it or update if valid
                    // Assuming frontend only sends base64 for new images
                    // If it's the same URL, we don't need to do anything, but the logic above assumes 'avatar' 
                    // in body means NEW value. 
                }
            }

            await partner.save();

            // Re-fetch to get populated category
            const updatedPartner = await Partner.findById(partner._id).populate('serviceCategory', 'name');

            res.json({
                success: true,
                data: {
                    id: updatedPartner._id,
                    name: updatedPartner.name,
                    phone: updatedPartner.phone,
                    email: updatedPartner.email,
                    avatar: updatedPartner.avatar,
                    serviceCategory: updatedPartner.serviceCategory,
                    serviceSubcategory: updatedPartner.serviceSubcategory,
                    address: updatedPartner.address
                }
            });
        } else {
            res.status(404).json({ success: false, message: 'Partner not found' });
        }
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(400).json({ success: false, message: error.message });
    }
});

// @desc    Update partner status (online/offline)
// @route   PUT /api/v1/partner/status
// @access  Private (Partner)
router.put('/status', protectPartner, async (req, res) => {
    try {
        const { status } = req.body;
        const partner = await Partner.findById(req.partner._id);

        if (partner) {
            partner.isOnline = status === 'online';
            await partner.save();

            res.json({
                success: true,
                data: {
                    status: partner.isOnline ? 'online' : 'offline'
                }
            });
        } else {
            res.status(404).json({ success: false, message: 'Partner not found' });
        }
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// @desc    Get bank details
// @route   GET /api/v1/partner/bank-details
// @access  Private (Partner)
router.get('/bank-details', protectPartner, async (req, res) => {
    try {
        const partner = await Partner.findById(req.partner._id);
        if (partner && partner.bankDetails && partner.bankDetails.accountNumber) {
            res.json({
                success: true,
                data: {
                    bankAccount: partner.bankDetails,
                    hasBankAccount: true
                }
            });
        } else {
            res.json({
                success: true,
                data: {
                    bankAccount: null,
                    hasBankAccount: false
                }
            });
        }
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// @desc    Add/Update bank details
// @route   PUT /api/v1/partner/bank-details
// @access  Private (Partner)
router.put('/bank-details', protectPartner, async (req, res) => {
    try {
        const { accountHolderName, accountNumber, bankName, ifsc } = req.body;

        const partner = await Partner.findById(req.partner._id);
        if (!partner) {
            return res.status(404).json({ success: false, message: 'Partner not found' });
        }

        partner.bankDetails = {
            accountHolderName,
            accountNumber,
            bankName,
            ifsc,
            isVerified: false
        };

        await partner.save();

        res.json({
            success: true,
            data: partner.bankDetails
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// @desc    Get partner stats
// @route   GET /api/v1/partner/stats
// @access  Private (Partner)
router.get('/stats', protectPartner, async (req, res) => {
    const ServiceRequest = require('../models/ServiceRequest');
    const partnerId = req.partner._id;

    try {
        const totalJobs = await ServiceRequest.countDocuments({ partnerId });
        const completedJobs = await ServiceRequest.countDocuments({ partnerId, status: 'completed' });
        const pendingJobs = await ServiceRequest.countDocuments({ partnerId, status: 'pending' });

        // Calculate total earnings
        const earningsResult = await ServiceRequest.aggregate([
            { $match: { partnerId, status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$finalCharges' } } }
        ]);

        const partner = await Partner.findById(partnerId);
        let actualRating = partner ? (partner.averageRating || 0.0) : 0.0;
        if (!actualRating || actualRating === 0) {
            const Review = require('../models/Review');
            const mongoose = require('mongoose');
            const pObjectId = mongoose.Types.ObjectId.isValid(partnerId) ? new mongoose.Types.ObjectId(partnerId) : partnerId;
            const reviewAgg = await Review.aggregate([
                { $match: { partnerId: pObjectId } },
                { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
            ]);
            if (reviewAgg.length > 0 && reviewAgg[0].count > 0) {
                actualRating = Math.round(reviewAgg[0].avgRating * 10) / 10;
                await Partner.findByIdAndUpdate(partnerId, {
                    averageRating: actualRating,
                    totalReviews: reviewAgg[0].count
                });
            }
        }

        res.json({
            success: true,
            data: {
                totalJobs,
                completedJobs,
                pendingJobs,
                totalEarnings: earningsResult.length > 0 ? earningsResult[0].total : 0,
                rating: actualRating,
                completionRate: totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 0
            }
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// @desc    Search partners (Public/Client)
// @route   GET /api/v1/partner/search
// @access  Public
router.get('/search', async (req, res) => {
    try {
        const { category, subcategory, query, lat, lng, pincode, availableNow, sortBy } = req.query;
        const ServiceCategory = require('../models/ServiceCategory');
        const mongoose = require('mongoose');

        let filter = {
            isActive: true, // Only active partners
        };

        if (process.env.NODE_ENV === 'production') {
            filter.kycStatus = 'approved';
        }

        if (availableNow === 'true' || availableNow === true) {
            filter.isOnline = true;
        }

        // Handle category filtering - category could be ObjectId or name
        if (category && category !== 'general' && category !== 'all') {
            if (mongoose.Types.ObjectId.isValid(category)) {
                filter.$or = [
                    { serviceCategory: category },
                    { serviceCategories: category }
                ];
            } else {
                const categoryDocs = await ServiceCategory.find({
                    $or: [
                        { name: { $regex: category, $options: 'i' } },
                        { icon: { $regex: category, $options: 'i' } },
                        { description: { $regex: category, $options: 'i' } },
                        { 'subcategories.name': { $regex: category, $options: 'i' } }
                    ]
                }).select('_id');
                if (categoryDocs.length > 0) {
                    const ids = categoryDocs.map(c => c._id);
                    filter.$or = [
                        { serviceCategory: { $in: ids } },
                        { serviceCategories: { $in: ids } }
                    ];
                }
            }
        }

        if (subcategory) {
            filter.serviceSubcategory = { $regex: subcategory, $options: 'i' };
        }

        if (pincode) {
            filter['address.pincode'] = pincode;
        }

        if (query && query.trim()) {
            const trimmedQuery = query.trim();
            const matchingCategories = await ServiceCategory.find({
                $or: [
                    { name: { $regex: trimmedQuery, $options: 'i' } },
                    { icon: { $regex: trimmedQuery, $options: 'i' } },
                    { description: { $regex: trimmedQuery, $options: 'i' } },
                    { 'subcategories.name': { $regex: trimmedQuery, $options: 'i' } }
                ]
            }).select('_id');
            const categoryIds = matchingCategories.map(c => c._id);

            const searchConditions = [
                { name: { $regex: trimmedQuery, $options: 'i' } },
                { serviceSubcategory: { $regex: trimmedQuery, $options: 'i' } },
                { 'address.city': { $regex: trimmedQuery, $options: 'i' } },
                { 'address.street': { $regex: trimmedQuery, $options: 'i' } }
            ];

            if (categoryIds.length > 0) {
                searchConditions.push({ serviceCategory: { $in: categoryIds } });
                searchConditions.push({ serviceCategories: { $in: categoryIds } });
            }

            if (filter.$or) {
                // Combine with existing category filter using $and
                filter = {
                    $and: [
                        { $or: filter.$or },
                        { $or: searchConditions },
                        ...Object.entries(filter).filter(([k]) => k !== '$or').map(([k, v]) => ({ [k]: v }))
                    ]
                };
            } else {
                filter.$or = searchConditions;
            }
        }

        let sortOption = {};

        // Sorting
        if (sortBy === 'rating') {
            sortOption = { averageRating: -1, rating: -1 };
        }

        // Geo-spatial filter and sort if lat/lng are provided and sortBy is distance (or default)
        if (lat && lng && (!sortBy || sortBy === 'distance')) {
            filter.currentLocation = {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    }
                }
            };
        } else if (!sortBy) {
            sortOption = { createdAt: -1 };
        }

        const partners = await Partner.find(filter)
            .populate('serviceCategory', 'name icon')
            .populate('serviceCategories', 'name icon')
            .select('-password -bankDetails -__v')
            .sort(sortOption);

        res.json({
            success: true,
            data: partners.map(p => ({
                _id: p._id,
                id: p._id,
                name: p.name,
                image: p.avatar,
                phone: p.phone,
                serviceCategory: p.serviceCategory,
                serviceSubcategory: p.serviceSubcategory,
                rating: p.averageRating || p.rating || 0,
                totalReviews: p.totalReviews || 0,
                location: p.address?.city || (p.currentLocation?.coordinates ? 'View on Map' : 'Location not set'),
                distance: 'Calculated in Client', // Placeholder
                isVerified: p.kycStatus === 'approved',
                isAvailable: p.isOnline,
                pincode: p.address?.pincode,
                availableUntil: '8:00 pm', // Mock
            }))
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(400).json({ success: false, message: error.message });
    }
});

// @desc    Get partner reviews
// @route   GET /api/v1/partner/reviews
// @access  Private (Partner)
router.get('/reviews', protectPartner, async (req, res) => {
    const Review = require('../models/Review');
    try {
        const reviews = await Review.find({ partnerId: req.partner._id })
            .populate('clientId', 'name avatar') // Using 'name' for the client who wrote it
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: reviews
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// @desc    Update partner FCM token
// @route   PUT /api/v1/partner/fcm-token
// @access  Private (Partner)
router.put('/fcm-token', protectPartner, async (req, res) => {
    try {
        const { fcmToken } = req.body;
        if (fcmToken === undefined) {
            return res.status(400).json({ success: false, message: 'fcmToken is required' });
        }
        await Partner.findByIdAndUpdate(req.partner._id, { $set: { fcmToken } });
        res.json({ success: true, message: 'FCM token updated successfully' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

module.exports = router;
