const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Partner = require('../models/Partner');

const protectClient = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ success: false, message: 'User not found' });
            }

            return next();
        } catch (error) {
            console.error('protectClient error:', error.message);
            return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
        }
    }

    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
};

const protectPartner = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.partner = await Partner.findById(decoded.id).select('-password');

            if (!req.partner) {
                return res.status(401).json({ success: false, message: 'Partner not found' });
            }

            if (req.partner.isActive === false) {
                return res.status(403).json({ success: false, message: 'Your account is inactive. Please contact support.' });
            }

            return next();
        } catch (error) {
            console.error('protectPartner error:', error.message);
            return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
        }
    }

    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
};

module.exports = { protectClient, protectPartner };
