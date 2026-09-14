const crypto = require('crypto');
const Transaction = require('../models/Transaction');
const Partner = require('../models/Partner');
const logger = require('../utils/logger');

const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'dummy_razorpay_webhook_secret_for_dev';
if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
    logger.warn('WARNING: RAZORPAY_WEBHOOK_SECRET environment variable is missing. Razorpay webhook verification will fail.');
}

exports.razorpayWebhook = async (req, res) => {
    try {
        const signature = req.headers['x-razorpay-signature'];
        if (!signature) {
            return res.status(400).json({ success: false, message: 'Signature missing' });
        }

        // Calculate HMAC signature on the original raw request Buffer
        const shasum = crypto.createHmac('sha256', secret);
        shasum.update(req.body);
        const digest = shasum.digest('hex');

        if (digest !== signature) {
            return res.status(400).json({ success: false, message: 'Invalid signature verification' });
        }

        // Parse payload as JSON after successful signature verification
        let payload;
        try {
            payload = JSON.parse(req.body.toString());
        } catch (e) {
            return res.status(400).json({ success: false, message: 'Invalid JSON payload' });
        }

        const { event, payload: eventPayload } = payload;

        if (event === 'payment.captured') {
            const paymentEntity = eventPayload.payment.entity;
            const amount = paymentEntity.amount / 100; // convert paise to rupees
            const partnerId = paymentEntity.notes ? paymentEntity.notes.partnerId : null;

            if (partnerId) {
                // Verify partner exists
                const partner = await Partner.findById(partnerId);
                if (partner) {
                    try {
                        await Transaction.create({
                            partnerId,
                            type: 'credit',
                            amount,
                            description: `Razorpay Webhook payment capture: ${paymentEntity.id || 'N/A'}`,
                            status: 'completed',
                            paymentId: paymentEntity.id
                        });
                    } catch (error) {
                        if (error.code === 11000) {
                            logger.info('Duplicate payment webhook payload ignored', { paymentId: paymentEntity.id });
                        } else {
                            throw error;
                        }
                    }
                }
            }
        }

        res.json({ success: true });
    } catch (error) {
        logger.error('Razorpay Webhook Error', { error: error.message });
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
