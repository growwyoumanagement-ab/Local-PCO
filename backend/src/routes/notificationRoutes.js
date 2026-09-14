// src/routes/notificationRoutes.js
// Routes for FCM device token registration.

const express = require('express');
const router = express.Router();
const { registerClientToken, registerPartnerToken } = require('../controllers/notificationController');
const { protectClient, protectPartner } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   - name: Notifications
 *     description: FCM device token registration endpoints
 */

/**
 * @swagger
 * /api/v1/notifications/client/register-token:
 *   put:
 *     tags: [Notifications]
 *     summary: Register client FCM device token for push notifications
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fcmToken]
 *             properties:
 *               fcmToken:
 *                 type: string
 *                 example: "eKXn3k8..."
 *     responses:
 *       200:
 *         description: Token registered
 */
router.put('/client/register-token', protectClient, registerClientToken);

/**
 * @swagger
 * /api/v1/notifications/partner/register-token:
 *   put:
 *     tags: [Notifications]
 *     summary: Register partner FCM device token for push notifications
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fcmToken]
 *             properties:
 *               fcmToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token registered
 */
router.put('/partner/register-token', protectPartner, registerPartnerToken);

module.exports = router;
