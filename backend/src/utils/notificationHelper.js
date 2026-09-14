// src/utils/notificationHelper.js
// Polymorphic FCM push notification helper.
// Automatically prunes dead device tokens from the correct MongoDB collection
// when Firebase returns messaging/registration-token-not-registered.

const { admin, firebaseInitialized } = require('../config/firebase');
const logger = require('./logger');

/**
 * Send an FCM push notification to a single device.
 * Automatically prunes the dead token from the DB on delivery failure.
 *
 * @param {Object} opts
 * @param {string} opts.token   - Device FCM registration token
 * @param {string} opts.title   - Notification title
 * @param {string} opts.body    - Notification body
 * @param {Object} opts.data    - Optional key-value data payload (all values must be strings)
 * @param {string} opts.role    - 'client' | 'partner' — determines which collection to prune
 * @param {string} opts.userId  - MongoDB _id of the recipient (for dead-token pruning)
 */
const notifyUser = async ({ token, title, body, data = {}, role, userId }) => {
    if (!firebaseInitialized || !token) {
        logger.info('[FCM] Skipped — Firebase not initialized or no token', { role, userId, title });
        return;
    }

    try {
        await admin.messaging().send({
            token,
            notification: { title, body },
            // All data payload values must be strings per FCM spec
            data: Object.fromEntries(
                Object.entries(data).map(([k, v]) => [k, String(v)])
            ),
            android: { priority: 'high' },
            apns: {
                payload: { aps: { sound: 'default', badge: 1 } }
            }
        });
        logger.info('[FCM] Push notification sent', { title, role, userId });
    } catch (err) {
        logger.error('[FCM] Push notification failed', { error: err.message, code: err.code, role, userId });

        const deadTokenCodes = [
            'messaging/registration-token-not-registered',
            'messaging/invalid-argument'
        ];
        if (deadTokenCodes.includes(err.code)) {
            try {
                if (role === 'client') {
                    const User = require('../models/User');
                    await User.findOneAndUpdate(
                        { _id: userId, fcmToken: token },
                        { $unset: { fcmToken: '' } }
                    );
                    logger.info('[FCM] Dead token pruned from User collection', { userId });
                } else if (role === 'partner') {
                    const Partner = require('../models/Partner');
                    await Partner.findOneAndUpdate(
                        { _id: userId, fcmToken: token },
                        { $unset: { fcmToken: '' } }
                    );
                    logger.info('[FCM] Dead token pruned from Partner collection', { userId });
                }
            } catch (pruneErr) {
                logger.error('[FCM] Failed to prune dead token', { error: pruneErr.message, role, userId });
            }
        }
    }
};

module.exports = { notifyUser };
