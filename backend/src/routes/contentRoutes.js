const express = require('express');
const router = express.Router();
const ContentSection = require('../models/ContentSection');

// @desc    Get all active content sections (Public)
// @route   GET /api/v1/content
// @access  Public
router.get('/', async (req, res) => {
    try {
        const sections = await ContentSection.find({ isActive: true })
            .sort({ priority: -1 });
        res.json({ success: true, data: sections });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
