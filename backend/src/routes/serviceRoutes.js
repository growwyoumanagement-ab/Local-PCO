const express = require('express');
const router = express.Router();
const ServiceCategory = require('../models/ServiceCategory');

// @desc    Get all active service categories (Public)
// @route   GET /api/v1/services
// @access  Public
router.get('/', async (req, res) => {
    try {
        const services = await ServiceCategory.find({ isActive: true })
            .select('name icon description subcategories priority')
            .sort({ priority: -1 });
        res.json({ success: true, data: services });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
