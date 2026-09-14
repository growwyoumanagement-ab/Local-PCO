const rateLimit = require('express-rate-limit');

/**
 * OTP request limiter — 5 OTP requests per phone per 10 minutes
 * Applied to: POST /auth/client/request-otp, POST /auth/partner/request-otp
 */
const otpRequestLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 5,
    message: {
        success: false,
        message: 'Too many OTP requests. Please wait 10 minutes before trying again.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    validate: false,
    keyGenerator: (req) => {
        // Rate limit by phone number, not IP (works behind proxies too)
        return req.body?.phone || req.ip;
    }
});

/**
 * IP-based OTP request limiter — 20 OTP requests per IP per 10 minutes
 * Applied alongside otpRequestLimiter so callers cannot bypass per-phone limits
 * by rotating phone numbers from the same IP.
 */
const otpRequestIpLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 20,
    message: {
        success: false,
        message: 'Too many OTP requests from this device. Please wait 10 minutes before trying again.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    validate: false,
    // Default keyGenerator uses req.ip
});

/**
 * OTP verify limiter — 10 attempts per 10 minutes
 * Applied to: POST /auth/client/verify-otp, POST /auth/partner/verify-otp
 */
const otpVerifyLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 10,
    message: {
        success: false,
        message: 'Too many failed OTP attempts. Please wait 10 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    validate: false,
    keyGenerator: (req) => req.body?.phone || req.ip
});

/**
 * General auth limiter — 20 attempts per 15 minutes
 * Applied to: POST /auth/client/login, POST /auth/partner/login
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    message: {
        success: false,
        message: 'Too many login attempts. Please wait 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = { otpRequestLimiter, otpRequestIpLimiter, otpVerifyLimiter, authLimiter };
