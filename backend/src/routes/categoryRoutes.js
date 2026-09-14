const express = require('express');
const router = express.Router();
const ServiceCategory = require('../models/ServiceCategory');

// @desc    Get all active service categories with subcategories
// @route   GET /api/v1/categories
// @access  Public
router.get('/', async (req, res) => {
    try {
        const categories = await ServiceCategory.find({ isActive: true })
            .select('name icon description subcategories priority')
            .sort({ priority: -1 });

        // Filter out inactive subcategories
        const filteredCategories = categories.map(cat => {
            const categoryObj = cat.toObject();
            if (categoryObj.subcategories && categoryObj.subcategories.length > 0) {
                categoryObj.subcategories = categoryObj.subcategories.filter(sub => sub.isActive);
            }
            return categoryObj;
        });

        res.json({
            success: true,
            count: filteredCategories.length,
            data: filteredCategories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
