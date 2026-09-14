const express = require('express');
const router = express.Router();
const { razorpayWebhook } = require('../controllers/paymentController');

router.post('/webhook', razorpayWebhook);

module.exports = router;
