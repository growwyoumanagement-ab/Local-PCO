const axios = require('axios');
const logger = require('./logger');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

/**
 * Send OTP via SMS using Twilio REST API
 * @param {string} phone - Target phone number
 * @param {string} otp - Generated OTP
 * @returns {Promise<boolean>}
 */
const sendOTP = async (phone, otp) => {
    let formattedPhone = phone.trim();
    if (!formattedPhone.startsWith('+')) {
        if (formattedPhone.length === 10) {
            formattedPhone = `+91${formattedPhone}`;
        } else {
            logger.warn(`Phone number ${phone} does not start with + and is not 10 digits. Sending as-is.`);
        }
    }

    const messageBody = `Your Local PCO verification code is ${otp}. Valid for 10 minutes.`;

    // Fallback if Twilio credentials are not configured or when in test environment
    if (process.env.NODE_ENV === 'test' || !accountSid || !authToken || !twilioPhone) {
        logger.info(`[SMS Fallback] SMS to ${formattedPhone}: ${messageBody}`);
        console.log(`[SMS Fallback] SMS to ${formattedPhone}: ${messageBody}`);
        return { success: true, delivered: false };
    }

    try {
        const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
        const authHeader = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');

        const params = new URLSearchParams();
        params.append('To', formattedPhone);
        params.append('From', twilioPhone);
        params.append('Body', messageBody);

        const response = await axios.post(url, params.toString(), {
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        logger.info(`OTP SMS sent successfully to ${formattedPhone}. Message SID: ${response.data.sid}`);
        return { success: true, delivered: true };
    } catch (error) {
        const errorDetails = error.response && error.response.data
            ? JSON.stringify(error.response.data)
            : error.message;

        logger.error(`Failed to send OTP SMS to ${formattedPhone}: ${errorDetails}`);

        // Graceful fallback for Twilio trial restrictions (e.g. error 21608: unverified number)
        // or any other Twilio failure. OTP is logged to server console so it's retrievable
        // from Render dashboard logs during development/testing on a trial account.
        const twilioCode = error.response?.data?.code;
        if (twilioCode === 21608) {
            logger.warn(`[TWILIO TRIAL] Number ${formattedPhone} is not verified on Twilio trial account. OTP: ${otp}`);
            console.log(`==========================================`);
            console.log(`[OTP FALLBACK - TWILIO TRIAL] Phone: ${formattedPhone} | OTP: ${otp}`);
            console.log(`Reason: Twilio trial accounts can only SMS verified numbers.`);
            console.log(`Fix: Upgrade Twilio or verify this number at console.twilio.com`);
            console.log(`==========================================`);
        } else {
            console.log(`[OTP FALLBACK] SMS failed for ${formattedPhone}. OTP: ${otp} | Error: ${errorDetails}`);
        }

        return { success: false, delivered: false };
    }
};

module.exports = {
    sendOTP
};
