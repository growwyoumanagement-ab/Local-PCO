const jwt = require('jsonwebtoken');

const generateAccessToken = (id) => {
    return jwt.sign({ id, type: 'access' }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_ACCESS_EXPIRE || '15m',
    });
};

const generateRefreshToken = (id) => {
    return jwt.sign({ id, type: 'refresh' }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d',
    });
};

module.exports = { generateAccessToken, generateRefreshToken };
