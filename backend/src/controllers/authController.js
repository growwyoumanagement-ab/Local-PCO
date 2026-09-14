const User = require('../models/User');
const Partner = require('../models/Partner');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sendOTP } = require('../utils/smsHelper');
const { sendPasswordResetEmail } = require('../utils/emailService');


// @desc    Login client with phone and password
// @route   POST /api/v1/auth/client/login
// @access  Public
const authClient = async (req, res) => {
    const { phone, password } = req.body;

    try {
        if (!phone || !password) {
            return res.status(400).json({ success: false, message: 'Please provide phone and password' });
        }

        const normalizedPhone = String(phone).replace(/\D/g, '').slice(-10);
        const user = await User.findOne({ phone: normalizedPhone }).select('+password');

        if (!user) {
            // Check if it's a partner trying to use the client app
            const isPartner = await Partner.findOne({ phone: normalizedPhone });
            if (isPartner) {
                return res.status(403).json({ success: false, message: 'This number is registered as a Partner. Please use the Partner app.' });
            }
            return res.status(404).json({ success: false, message: 'Account not found. Please register.' });
        }

        if (user.isBlocked) {
            return res.status(403).json({ success: false, message: 'Your account has been deactivated or deleted. Please contact support.' });
        }

        if (await user.matchPassword(password)) {
            const accessToken = generateAccessToken(user._id);
            const refreshToken = generateRefreshToken(user._id);
            user.refreshToken = refreshToken;
            await user.save();

            res.json({
                success: true,
                data: {
                    _id: user._id,
                    name: user.name,
                    phone: user.phone,
                    role: user.role,
                    avatar: user.avatar || null,
                    accessToken,
                    refreshToken
                }
            });
        } else {
            res.status(401).json({ success: false, message: 'Incorrect password. Please try again.' });
        }
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Register a new client
// @route   POST /api/v1/auth/client/register
// @access  Public
const registerClient = async (req, res) => {
    const { name, phone, email, password } = req.body;

    try {
        const normalizedPhone = phone ? String(phone).replace(/\D/g, '').slice(-10) : '';
        if (!normalizedPhone || !/^[6-9]\d{9}$/.test(normalizedPhone)) {
            return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9' });
        }

        let normalizedEmail = undefined;
        if (email && email.trim()) {
            normalizedEmail = email.toLowerCase().trim();
            const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            if (!emailRegex.test(normalizedEmail)) {
                return res.status(400).json({ success: false, message: 'Please enter a valid email address' });
            }

            const existingEmailUser = await User.findOne({ email: normalizedEmail });
            if (existingEmailUser) {
                return res.status(400).json({ success: false, message: 'An account already exists with this email address' });
            }
        }

        let user = await User.findOne({ phone: normalizedPhone });
        if (user) {
            return res.status(400).json({ success: false, message: 'User already exists with this phone number' });
        }

        const isPartner = await Partner.findOne({ phone: normalizedPhone });
        if (isPartner) {
            return res.status(400).json({ success: false, message: 'This phone number is already registered as a Partner. Please use a different number.' });
        }

        user = await User.create({
            name: name ? name.trim() : '',
            phone: normalizedPhone,
            email: normalizedEmail,
            password
        });

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);
        user.refreshToken = refreshToken;
        await user.save();

        res.status(201).json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                phone: user.phone,
                email: user.email,
                avatar: user.avatar || null,
                accessToken,
                refreshToken
            }
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Register a new partner
// @route   POST /api/v1/auth/partner/register
// @access  Public
const registerPartner = async (req, res) => {
    const { name, phone, email, password, serviceCategory, serviceSubcategory } = req.body;

    try {
        const normalizedPhone = phone ? String(phone).replace(/\D/g, '').slice(-10) : '';

        // Validate required fields
        if (!name || !normalizedPhone || !password || !serviceCategory) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, phone, password, and service category'
            });
        }

        if (!/^[6-9]\d{9}$/.test(normalizedPhone)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9'
            });
        }

        let normalizedEmail = undefined;
        if (email && email.trim()) {
            normalizedEmail = email.toLowerCase().trim();
            const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            if (!emailRegex.test(normalizedEmail)) {
                return res.status(400).json({
                    success: false,
                    message: 'Please enter a valid email address'
                });
            }

            const existingEmailPartner = await Partner.findOne({ email: normalizedEmail });
            if (existingEmailPartner) {
                return res.status(400).json({ success: false, message: 'An account already exists with this email address' });
            }
        }

        const partnerExists = await Partner.findOne({ phone: normalizedPhone });
        if (partnerExists) {
            return res.status(400).json({ success: false, message: 'Partner already exists with this phone number' });
        }

        const isClient = await User.findOne({ phone: normalizedPhone });
        if (isClient) {
            return res.status(400).json({ success: false, message: 'This phone number is already registered as a Client. Please use a different number.' });
        }

        // Validate that serviceCategory exists
        const ServiceCategory = require('../models/ServiceCategory');
        const categoryExists = await ServiceCategory.findById(serviceCategory);

        if (!categoryExists) {
            return res.status(400).json({
                success: false,
                message: 'Invalid service category selected'
            });
        }

        const partner = await Partner.create({
            name: name.trim(),
            phone: normalizedPhone,
            email: normalizedEmail,
            password,
            serviceCategory,
            serviceSubcategory,
            isActive: true,
        });

        if (partner) {
            const accessToken = generateAccessToken(partner._id);
            const refreshToken = generateRefreshToken(partner._id);
            partner.refreshToken = refreshToken;
            await partner.save();

            res.status(201).json({
                success: true,
                data: {
                    accessToken,
                    refreshToken,
                    partner: {
                        id: partner._id,
                        name: partner.name,
                        phone: partner.phone,
                        email: partner.email || null,
                        avatar: partner.avatar || null,
                        serviceCategory: partner.serviceCategory,
                        serviceSubcategory: partner.serviceSubcategory,
                        isActive: partner.isActive,
                        kycStatus: partner.kycStatus,
                        isVerified: partner.isVerified
                    }
                }
            });
        } else {
            res.status(400).json({ success: false, message: 'Invalid partner data' });
        }
    } catch (error) {
        console.error('Partner registration error:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Registration failed. Please try again.'
        });
    }
};

// @desc    Auth partner & get token
// @route   POST /api/v1/auth/partner/login
// @access  Public
const authPartner = async (req, res) => {
    const { phone, password } = req.body;

    try {
        const normalizedPhone = phone ? String(phone).replace(/\D/g, '').slice(-10) : '';
        const partner = await Partner.findOne({ phone: normalizedPhone }).select('+password').populate('serviceCategory', 'name');

        if (!partner) {
            // Check if it's a client trying to use the partner app
            const isClient = await User.findOne({ phone: normalizedPhone });
            if (isClient) {
                if (isClient.role === 'user') {
                    return res.status(403).json({ success: false, message: 'This number is registered as a Client. Please use the Client app to log in.' });
                }
                return res.status(403).json({ success: false, message: 'Unauthorized access.' });
            }
            return res.status(404).json({ success: false, message: 'Partner not found. Please register.' });
        }

        if (await partner.matchPassword(password)) {
            if (partner.isActive === false) {
                return res.status(403).json({ success: false, message: 'Your account is inactive. Please contact support.' });
            }

            const accessToken = generateAccessToken(partner._id);
            const refreshToken = generateRefreshToken(partner._id);
            partner.refreshToken = refreshToken;
            await partner.save();

            res.json({
                success: true,
                data: {
                    accessToken,
                    refreshToken,
                    partner: {
                        id: partner._id,
                        name: partner.name,
                        phone: partner.phone,
                        email: partner.email || null,
                        avatar: partner.avatar || null,
                        serviceCategory: partner.serviceCategory,
                        serviceSubcategory: partner.serviceSubcategory,
                        kycStatus: partner.kycStatus,
                        isVerified: partner.isVerified
                    }
                }
            });
        } else {
            res.status(401).json({ success: false, message: 'Incorrect password. Please try again.' });
        }
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get partner profile
// @route   GET /api/v1/partner/profile
// @access  Private
const getPartnerProfile = async (req, res) => {
    try {
        const partner = await Partner.findById(req.partner._id).populate('serviceCategory', 'name');
        if (partner) {
            res.json({
                success: true,
                data: {
                    profile: {
                        id: partner._id,
                        name: partner.name,
                        phone: partner.phone,
                        email: partner.email,
                        avatar: partner.avatar,
                        serviceCategory: partner.serviceCategory,
                        serviceSubcategory: partner.serviceSubcategory,
                        services: [],
                        rating: partner.averageRating || 0.0,
                        totalReviews: partner.totalReviews || 0,
                        totalJobs: partner.totalJobs || 0,
                        joinedAt: partner.createdAt,
                        address: partner.address
                    },
                    availability: partner.isOnline ? 'online' : 'offline',
                    kycStatus: partner.kycStatus
                }
            });
        } else {
            res.status(404).json({ success: false, message: 'Partner not found' });
        }
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Request OTP for client login
// @route   POST /api/v1/auth/client/request-otp
// @access  Public
const requestClientOTP = async (req, res) => {
    const { phone } = req.body;

    try {
        if (!phone) {
            return res.status(400).json({ success: false, message: 'Please provide a phone number' });
        }

        const normalizedPhone = String(phone).replace(/\D/g, '').slice(-10);
        let user = await User.findOne({ phone: normalizedPhone }).select('+isBlocked role');

        if (!user) {
            const isPartner = await Partner.findOne({ phone: normalizedPhone });
            if (isPartner) {
                return res.status(403).json({ success: false, message: 'This number is registered as a Partner. Please use the Partner app.' });
            }
            return res.status(404).json({ success: false, message: 'Account not found. Please register.' });
        }

        if (user.isBlocked) {
            return res.status(403).json({ success: false, message: 'Your account has been deactivated or deleted. Please contact support.' });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        // Send OTP via SMS (Twilio service)
        const smsResult = await sendOTP(normalizedPhone, otp);

        res.json({
            success: true,
            message: smsResult.delivered ? 'OTP sent successfully' : 'OTP generated (SMS delivery failed — check server logs)',
            otp: !smsResult.delivered ? otp : undefined
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Verify OTP and login client
// @route   POST /api/v1/auth/client/verify-otp
// @access  Public
const verifyClientOTP = async (req, res) => {
    const { phone, otp } = req.body;

    try {
        if (!phone || !otp) {
            return res.status(400).json({ success: false, message: 'Please provide phone and OTP' });
        }

        const normalizedPhone = String(phone).replace(/\D/g, '').slice(-10);
        const userCheck = await User.findOne({ phone: normalizedPhone }).select('+otp +otpExpires +isBlocked role');

        if (!userCheck) {
            const isPartner = await Partner.findOne({ phone: normalizedPhone });
            if (isPartner) {
                return res.status(403).json({ success: false, message: 'This number is registered as a Partner. Please use the Partner app.' });
            }
            return res.status(404).json({ success: false, message: 'Account not found. Please register.' });
        }

        if (userCheck.isBlocked) {
            return res.status(403).json({ success: false, message: 'Your account has been deactivated or deleted. Please contact support.' });
        }

        const user = await User.findOne({ 
            phone: normalizedPhone, 
            otp, 
            otpExpires: { $gt: Date.now() } 
        });

        if (!user) {
            return res.status(401).json({ success: false, message: 'Incorrect or expired OTP' });
        }

        // Clear OTP fields
        user.otp = undefined;
        user.otpExpires = undefined;
        
        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);
        user.refreshToken = refreshToken;
        
        await user.save();

        res.json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                phone: user.phone,
                email: user.email,
                avatar: user.avatar || null,
                accessToken,
                refreshToken
            }
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Request OTP for partner login
// @route   POST /api/v1/auth/partner/request-otp
// @access  Public
const requestPartnerOTP = async (req, res) => {
    const { phone } = req.body;

    try {
        if (!phone) {
            return res.status(400).json({ success: false, message: 'Please provide a phone number' });
        }

        const normalizedPhone = String(phone).replace(/\D/g, '').slice(-10);
        let partner = await Partner.findOne({ phone: normalizedPhone });

        if (!partner) {
            const isClient = await User.findOne({ phone: normalizedPhone });
            if (isClient) {
                if (isClient.role === 'user') {
                    return res.status(403).json({ success: false, message: 'This number is registered as a Client. Please use the Client app to log in.' });
                }
                return res.status(403).json({ success: false, message: 'Unauthorized access.' });
            }
            return res.status(404).json({ success: false, message: 'Partner not found. Please register.' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

        partner.otp = otp;
        partner.otpExpires = otpExpires;
        await partner.save();

        // Send OTP via SMS (Twilio service)
        const smsResult = await sendOTP(normalizedPhone, otp);

        res.json({
            success: true,
            message: smsResult.delivered ? 'OTP sent successfully' : 'OTP generated (SMS delivery failed — check server logs)',
            otp: !smsResult.delivered ? otp : undefined
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Verify OTP and login partner
// @route   POST /api/v1/auth/partner/verify-otp
// @access  Public
const verifyPartnerOTP = async (req, res) => {
    const { phone, otp } = req.body;

    try {
        if (!phone || !otp) {
            return res.status(400).json({ success: false, message: 'Please provide phone and OTP' });
        }

        const normalizedPhone = String(phone).replace(/\D/g, '').slice(-10);
        const partnerCheck = await Partner.findOne({ phone: normalizedPhone });

        if (!partnerCheck) {
            const isClient = await User.findOne({ phone: normalizedPhone });
            if (isClient) {
                if (isClient.role === 'user') {
                    return res.status(403).json({ success: false, message: 'This number is registered as a Client. Please use the Client app to log in.' });
                }
                return res.status(403).json({ success: false, message: 'Unauthorized access.' });
            }
            return res.status(404).json({ success: false, message: 'Partner not found. Please register.' });
        }

        if (partnerCheck.isActive === false) {
            return res.status(403).json({ success: false, message: 'Your account is inactive. Please contact support.' });
        }

        const partner = await Partner.findOne({ 
            phone: normalizedPhone, 
            otp, 
            otpExpires: { $gt: Date.now() } 
        }).populate('serviceCategory', 'name');

        if (!partner) {
            return res.status(401).json({ success: false, message: 'Invalid or expired OTP' });
        }

        partner.otp = undefined;
        partner.otpExpires = undefined;
        
        const accessToken = generateAccessToken(partner._id);
        const refreshToken = generateRefreshToken(partner._id);
        partner.refreshToken = refreshToken;
        
        await partner.save();

        res.json({
            success: true,
            data: {
                accessToken,
                refreshToken,
                partner: {
                    id: partner._id,
                    name: partner.name,
                    phone: partner.phone,
                    email: partner.email || null,
                    avatar: partner.avatar || null,
                    serviceCategory: partner.serviceCategory,
                    serviceSubcategory: partner.serviceSubcategory,
                    kycStatus: partner.kycStatus,
                    isVerified: partner.isVerified
                }
            }
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
// @desc    Refresh Access Token using Refresh Token
// @route   POST /api/v1/auth/refresh
// @access  Public
const refreshTokenHandler = async (req, res) => {
    const token = req.body.token || req.body.refreshToken;
    if (!token) return res.status(401).json({ success: false, message: 'Refresh token required' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.type !== 'refresh') {
            return res.status(401).json({ success: false, message: 'Invalid token type' });
        }

        // Try to find the user/partner with this exact token in the DB
        let account = await User.findOne({ _id: decoded.id, refreshToken: token }).select('+refreshToken');

        if (!account) {
            account = await Partner.findOne({ _id: decoded.id, refreshToken: token }).select('+refreshToken');
        }

        if (!account) {
            return res.status(403).json({ success: false, message: 'Invalid or expired refresh token' });
        }

        // Generate new tokens
        const newAccessToken = generateAccessToken(account._id);
        const newRefreshToken = generateRefreshToken(account._id);

        // Rotate the refresh token in the DB
        account.refreshToken = newRefreshToken;
        await account.save();

        res.json({
            success: true,
            data: {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            }
        });

    } catch (error) {
        res.status(403).json({ success: false, message: 'Invalid refresh token' });
    }
};

// @desc    Logout partner
// @route   POST /api/v1/auth/partner/logout
// @access  Private (Partner)
const partnerLogout = async (req, res) => {
    try {
        await Partner.findByIdAndUpdate(req.partner._id, { $set: { refreshToken: null, isOnline: false } });
        res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Validate Partner Token
// @route   GET /api/v1/auth/partner/validate
// @access  Private (Partner)
const validatePartnerToken = async (req, res) => {
    try {
        // If the middleware passed, the token is valid
        res.status(200).json({ success: true, valid: true });
    } catch (error) {
        res.status(500).json({ success: false, valid: false });
    }
};

// @desc    Reset partner password using OTP
// @route   POST /api/v1/auth/partner/reset-password
// @access  Public
const resetPartnerPassword = async (req, res) => {
    const { phone, otp, newPassword } = req.body;
    try {
        if (!phone || !otp || !newPassword) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide phone, otp, and new password' 
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ 
                success: false, 
                message: 'Password must be at least 6 characters long' 
            });
        }

        // Verify OTP on partner profile
        const partner = await Partner.findOne({ 
            phone, 
            otp, 
            otpExpires: { $gt: Date.now() } 
        }).select('+password');

        if (!partner) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid or expired OTP' 
            });
        }

        // Set new password (pre-save hook will hash it)
        partner.password = newPassword;
        partner.otp = undefined;
        partner.otpExpires = undefined;
        await partner.save();

        res.json({
            success: true,
            message: 'Password reset successful. You can now log in with your new password.'
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get client profile
// @route   GET /api/v1/auth/client/profile
// @access  Private (Client)
const getClientProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            res.json({
                success: true,
                data: {
                    _id: user._id,
                    name: user.name,
                    phone: user.phone,
                    email: user.email,
                    avatar: user.avatar,
                    role: user.role,
                }
            });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Update client profile
// @route   PUT /api/v1/auth/client/profile
// @access  Private (Client)
const updateClientProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (req.body.name) {
            user.name = req.body.name.trim();
        }

        if (req.body.email !== undefined) {
            const rawEmail = req.body.email ? req.body.email.trim() : '';
            if (rawEmail) {
                const normalizedEmail = rawEmail.toLowerCase();
                const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
                if (!emailRegex.test(normalizedEmail)) {
                    return res.status(400).json({ success: false, message: 'Please enter a valid email address' });
                }
                const existing = await User.findOne({ email: normalizedEmail, _id: { $ne: user._id } });
                if (existing) {
                    return res.status(400).json({ success: false, message: 'An account already exists with this email address' });
                }
                user.email = normalizedEmail;
            } else {
                user.email = undefined;
            }
        }

        if (req.body.phone && req.body.phone !== user.phone) {
            if (!/^[6-9]\d{9}$/.test(req.body.phone)) {
                return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit Indian mobile number' });
            }
            const existingPhone = await User.findOne({ phone: req.body.phone, _id: { $ne: user._id } });
            if (existingPhone) {
                return res.status(400).json({ success: false, message: 'An account already exists with this phone number' });
            }
            user.phone = req.body.phone;
        }

        if (req.body.avatar) {
            if (req.body.avatar.startsWith('data:image')) {
                try {
                    const { uploadBase64Image } = require('../utils/uploadService');
                    const result = await uploadBase64Image(req.body.avatar, 'client_avatars');
                    if (result && result.url) {
                        user.avatar = result.url;
                    }
                } catch (imgErr) {
                    console.warn('Cloudinary upload fallback to direct string:', imgErr.message);
                    user.avatar = req.body.avatar;
                }
            } else {
                user.avatar = req.body.avatar;
            }
        }

        await user.save();
        res.json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                phone: user.phone,
                email: user.email,
                avatar: user.avatar,
                role: user.role,
            }
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message || 'Failed to update profile' });
    }
};

// @desc    Forgot Password - Send OTP to registered email
// @route   POST /api/v1/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    const { email, userType } = req.body;
    const type = (userType || 'client').toLowerCase();

    try {
        if (!email || !email.trim()) {
            return res.status(400).json({ success: false, message: 'Please provide your registered email address' });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const emailRegex = new RegExp(`^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
        let account = null;

        if (type === 'partner') {
            account = await Partner.findOne({ email: emailRegex });
        } else {
            account = await User.findOne({ email: emailRegex });
        }

        if (!account) {
            return res.status(404).json({ success: false, message: 'No account found with this email address' });
        }

        // Generate cryptographically secure 6-digit OTP
        const otp = crypto.randomInt(100000, 999999).toString();
        const hashedOTP = await bcrypt.hash(otp, 10);

        account.resetPasswordOTP = hashedOTP;
        account.resetPasswordOTPExpires = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
        await account.save({ validateBeforeSave: false });

        try {
            await sendPasswordResetEmail(account.email, otp, account.name);
        } catch (emailError) {
            // Clear the OTP if email delivery fails to prevent a persisted-but-undelivered OTP
            account.resetPasswordOTP = undefined;
            account.resetPasswordOTPExpires = undefined;
            await account.save({ validateBeforeSave: false });
            return res.status(500).json({ success: false, message: 'Failed to send reset email. Please try again later.' });
        }

        res.json({
            success: true,
            message: 'Verification code sent to your registered email address'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'An unexpected error occurred. Please try again.' });
    }
};

// @desc    Reset Password with OTP
// @route   POST /api/v1/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
    const { email, userType, otp, newPassword } = req.body;
    const type = (userType || 'client').toLowerCase();

    try {
        if (!email || !otp || !newPassword) {
            return res.status(400).json({ success: false, message: 'Please provide email, OTP code, and new password' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const emailRegex = new RegExp(`^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
        let account = null;

        if (type === 'partner') {
            account = await Partner.findOne({ email: emailRegex }).select('+password +resetPasswordOTP +resetPasswordOTPExpires');
        } else {
            account = await User.findOne({ email: emailRegex }).select('+password +resetPasswordOTP +resetPasswordOTPExpires');
        }

        if (!account) {
            return res.status(404).json({ success: false, message: 'Account not found' });
        }

        if (!account.resetPasswordOTPExpires || account.resetPasswordOTPExpires < Date.now()) {
            return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new one.' });
        }

        if (!account.resetPasswordOTP) {
            return res.status(400).json({ success: false, message: 'No active password reset request found' });
        }

        const isMatch = await bcrypt.compare(otp.trim(), account.resetPasswordOTP);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid verification code' });
        }

        account.password = newPassword;
        account.resetPasswordOTP = undefined;
        account.resetPasswordOTPExpires = undefined;
        await account.save();

        res.json({
            success: true,
            message: 'Password reset successful. You can now log in with your new password.'
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = {
    authClient,
    registerClient,
    registerPartner,
    authPartner,
    getPartnerProfile,
    getClientProfile,
    updateClientProfile,
    requestClientOTP,
    verifyClientOTP,
    requestPartnerOTP,
    verifyPartnerOTP,
    refreshTokenHandler,
    partnerLogout,
    validatePartnerToken,
    resetPartnerPassword,
    forgotPassword,
    resetPassword
};