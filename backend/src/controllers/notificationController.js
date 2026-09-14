// src/controllers/notificationController.js
// Handles FCM device token registration for client and partner apps.

const User = require('../models/User');
const Partner = require('../models/Partner');
const logger = require('../utils/logger');

const registerClientToken = async (req, res) => {
    try {
        const { fcmToken } = req.body;
        if (fcmToken === undefined) {
            return res.status(400).json({ success: false, message: 'fcmToken is required' });
        }
        await User.findByIdAndUpdate(req.user._id, { fcmToken });
        logger.info('[FCM] Client token updated', { userId: req.user._id, hasToken: !!fcmToken });
        res.json({ success: true, message: 'Device token registered successfully' });
    } catch (error) {
        logger.error('[FCM] Failed to register client token', { error: error.message });
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * @desc   Register or update a partner's FCM device token
 * @route  PUT /api/v1/notifications/partner/register-token
 * @access Private (Partner)
 */
const registerPartnerToken = async (req, res) => {
    try {
        const { fcmToken } = req.body;
        if (fcmToken === undefined) {
            return res.status(400).json({ success: false, message: 'fcmToken is required' });
        }
        await Partner.findByIdAndUpdate(req.partner._id, { fcmToken });
        logger.info('[FCM] Partner token updated', { partnerId: req.partner._id, hasToken: !!fcmToken });
        res.json({ success: true, message: 'Device token registered successfully' });
    } catch (error) {
        logger.error('[FCM] Failed to register partner token', { error: error.message });
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

module.exports = { registerClientToken, registerPartnerToken };
