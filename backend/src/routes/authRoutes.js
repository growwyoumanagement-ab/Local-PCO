const express = require('express');
const router = express.Router();
const {
    authClient,
    registerClient,
    registerPartner,
    authPartner,
    requestClientOTP,
    verifyClientOTP,
    requestPartnerOTP,
    verifyPartnerOTP,
    refreshTokenHandler,
    partnerLogout,
    validatePartnerToken,
    resetPartnerPassword,
    getClientProfile,
    updateClientProfile,
    forgotPassword,
    resetPassword
} = require('../controllers/authController');
const { otpRequestLimiter, otpRequestIpLimiter, otpVerifyLimiter, authLimiter } = require('../middleware/rateLimitMiddleware');
const { protectPartner, protectClient } = require('../middleware/authMiddleware');
const User = require('../models/User');

router.post('/forgot-password', otpRequestIpLimiter, otpRequestLimiter, forgotPassword);
router.post('/reset-password', otpVerifyLimiter, resetPassword);


/**
 * @swagger
 * tags:
 *   - name: Client Auth
 *     description: Client registration and login endpoints
 *   - name: Partner Auth
 *     description: Partner registration and authentication endpoints
 */

/**
 * @swagger
 * /api/v1/auth/client/login:
 *   post:
 *     tags: [Client Auth]
 *     summary: Login a client with phone and password
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phone, password]
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Login successful, returns JWT tokens
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Incorrect password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/client/login', authLimiter, authClient);

/**
 * @swagger
 * /api/v1/auth/client/register:
 *   post:
 *     tags: [Client Auth]
 *     summary: Register a new client account
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, phone]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Jane Doe"
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *               email:
 *                 type: string
 *                 example: "jane@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       201:
 *         description: Client registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: User already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/client/register', registerClient);
router.post('/client/request-otp', otpRequestIpLimiter, otpRequestLimiter, requestClientOTP);
router.post('/client/verify-otp', otpVerifyLimiter, verifyClientOTP);
router.get('/client/profile', protectClient, getClientProfile);
router.put('/client/profile', protectClient, updateClientProfile);
router.put('/client/fcm-token', protectClient, async (req, res) => {
    try {
        const { fcmToken } = req.body;
        if (fcmToken === undefined) {
            return res.status(400).json({ success: false, message: 'fcmToken is required' });
        }
        await User.findByIdAndUpdate(req.user._id, { $set: { fcmToken } });
        res.json({ success: true, message: 'FCM token updated successfully' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.post('/partner/register', registerPartner);
router.post('/partner/login', authLimiter, authPartner);
router.post('/partner/request-otp', otpRequestIpLimiter, otpRequestLimiter, requestPartnerOTP);
router.post('/partner/verify-otp', otpVerifyLimiter, verifyPartnerOTP);
router.post('/partner/logout', protectPartner, partnerLogout);
router.post('/partner/reset-password', otpVerifyLimiter, resetPartnerPassword);
router.get('/partner/validate', protectPartner, validatePartnerToken);

router.post('/refresh', refreshTokenHandler);

module.exports = router;
