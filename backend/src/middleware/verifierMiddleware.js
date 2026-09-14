const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protectVerifier = async (req, res, next) => {
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
                throw new Error('User not found');
            }

            // check if user is verifier or admin (admins can also access verifier routes)
            if (req.user.role !== 'verifier' && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Not authorized as a verifier' });
            }

            next();
        } catch (error) {
            console.error('JWT Error:', error.message);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }
};

module.exports = { protectVerifier };