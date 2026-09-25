// backend/src/utils/emailService.js
// Utility service to send password reset OTP emails using nodemailer.

const nodemailer = require('nodemailer');
const logger = require('./logger');

/**
 * Send Password Reset OTP Email
 * @param {string} to - Recipient email address
 * @param {string} otp - 6-digit OTP code
 * @param {string} name - User / Partner name
 */
async function sendPasswordResetEmail(to, otp, name = 'User') {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const fromEmail = process.env.MAIL_FROM || process.env.FROM_EMAIL || `"Local PCO" <${smtpUser || 'noreply@localpco.com'}>`;

    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #0A5C36; margin: 0 0 4px 0; font-size: 24px; font-weight: bold;">Local PCO</h2>
                <p style="color: #16A34A; margin: 0; font-size: 13px; font-weight: 600; letter-spacing: 1px;">YOUR WORKDAY, CONNECTED</p>
            </div>
            <hr style="border: none; border-top: 1px solid #f1f5f9; margin-bottom: 20px;" />
            <p style="color: #334155; font-size: 15px;">Hello <strong>${name}</strong>,</p>
            <p style="color: #475569; font-size: 14px; line-height: 1.6;">You requested a password reset for your account. Please use the verification code below to reset your password:</p>
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 18px; border-radius: 8px; text-align: center; margin: 24px 0;">
                <span style="font-size: 34px; font-weight: bold; letter-spacing: 8px; color: #0A5C36;">${otp}</span>
            </div>
            <p style="color: #64748b; font-size: 13px; line-height: 1.5;">This code will expire in 10 minutes. If you did not request a password reset, please ignore this email or secure your account.</p>
            <hr style="border: none; border-top: 1px solid #f1f5f9; margin-top: 30px; margin-bottom: 16px;" />
            <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">&copy; ${new Date().getFullYear()} Local PCO Technologies Pvt. Ltd. All rights reserved.</p>
        </div>
    `;

    // If SMTP credentials are provided, attempt real email transmission
    if (smtpHost && smtpUser && smtpPass) {
        try {
            const transporter = nodemailer.createTransport({
                host: smtpHost,
                port: smtpPort,
                secure: smtpPort === 465,
                auth: {
                    user: smtpUser,
                    pass: smtpPass
                }
            });

            const mailOptions = {
                from: fromEmail,
                to: to,
                subject: 'Your Password Reset Verification Code',
                html: htmlContent
            };

            const info = await transporter.sendMail(mailOptions);
            logger.info(`Password reset email sent to ${to}: ${info.messageId}`);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            logger.error(`SMTP Email failed for ${to}: ${error.message}`);
            if (process.env.NODE_ENV === 'production') {
                // In production, propagate the error so the caller can clear the OTP and return a proper error response
                throw error;
            }
            // Fallback: log OTP to console in development/staging mode only
            console.log(`[EMAIL FALLBACK] Password Reset OTP for ${to}: ${otp}`);
            return { success: true, fallback: true };
        }
    } else {
        // Fallback for local development when SMTP is not configured
        logger.info(`[DEV LOG] Password Reset OTP for ${to}: ${otp}`);
        console.log(`==========================================`);
        console.log(`[PASSWORD RESET OTP] Email: ${to} | OTP: ${otp}`);
        console.log(`==========================================`);
        return { success: true, devMode: true };
    }
}

module.exports = {
    sendPasswordResetEmail
};
