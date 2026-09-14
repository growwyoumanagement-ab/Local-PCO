const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./src/config/db');
const mongoose = require('mongoose');
const logger = require('./src/utils/logger');
require('dotenv').config();

// Connect Database
// connectDB(); // Removed global call for Vercel stability


const app = express();

// HTTP request logging — streamed into Winston
app.use(morgan('combined', {
    stream: { write: (message) => logger.http(message.trim()) }
}));

// Trust Vercel/AWS/Render reverse proxy so req.ip returns real client IP
// MUST be set before rate limiting middleware or limiters will use
// the proxy's internal IP, potentially blocking all users globally.
app.set('trust proxy', 1);

// Security headers
app.use(helmet());

// CORS — restrict to known origins only
const allowedOrigins = [];

const adminOrigin = process.env.ADMIN_ORIGIN || 'https://local-pco.vercel.app';
// Fallback client origin to admin origin if not provided
const clientOrigin = process.env.CLIENT_ORIGIN || adminOrigin;

if (process.env.NODE_ENV === 'production') {
    // Validate that the origins do not use localhost in production
    try {
        const adminUrl = new URL(adminOrigin);
        const clientUrl = new URL(clientOrigin);
        if (adminUrl.hostname === 'localhost' || clientUrl.hostname === 'localhost') {
            throw new Error();
        }
    } catch (err) {
        throw new Error('Production CORS origins must be valid public URLs (e.g. starting with https://) and cannot be localhost.');
    }
    
    allowedOrigins.push(adminOrigin, clientOrigin);
} else {
    allowedOrigins.push(
        adminOrigin,
        'http://localhost:5173',
        clientOrigin,
        'http://localhost:8081'
    );
}

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, Postman)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
}));
// Raw body parser for Razorpay webhook signature verification
app.use('/api/v1/payments/webhook', express.raw({ type: 'application/json' }));

app.use(express.json({ limit: '10mb' })); // Limit body size to 10mb for profile uploads
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Error handling middleware for payload limit
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ success: false, message: 'Invalid JSON payload' });
    }
    if (err.type === 'entity.too.large') {
        return res.status(413).json({ success: false, message: 'Image payload too large. Please select a smaller photo or compress it.' });
    }
    next(err);
});

// Middleware to ensure DB is connected before handling requests
app.use(async (req, res, next) => {
    if (mongoose.connection.readyState === 0) {
        try {
            await connectDB();
        } catch (error) {
            return res.status(500).json({ error: 'Database Connection Failed', details: error.message });
        }
    }
    next();
});

// Validating server is running
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Routes will be mounted here
app.use('/api/v1/categories', require('./src/routes/categoryRoutes'));
app.use('/api/v1/auth', require('./src/routes/authRoutes'));
app.use('/api/v1/services', require('./src/routes/serviceRoutes'));
app.use('/api/v1/content', require('./src/routes/contentRoutes'));
app.use('/api/v1/requests', require('./src/routes/requestRoutes'));
app.use('/api/v1/jobs', require('./src/routes/jobRoutes'));
app.use('/api/v1/wallet', require('./src/routes/walletRoutes'));
app.use('/api/v1/payments', require('./src/routes/paymentRoutes'));
app.use('/api/v1/location', require('./src/routes/locationRoutes'));
app.use('/api/v1/partner', require('./src/routes/partnerRoutes'));
app.use('/api/v1/kyc', require('./src/routes/kycRoutes'));
app.use('/api/v1/admin', require('./src/routes/adminRoutes'));
app.use('/api/v1/verifier', require('./src/routes/verifierRoutes'));
app.use('/api/v1/notifications', require('./src/routes/notificationRoutes'));


// Swagger API docs — development/staging only (never expose in production)
if (process.env.NODE_ENV !== 'production') {
    const swaggerUi = require('swagger-ui-express');
    const swaggerDocs = require('./src/config/swagger');
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
    logger.info('Swagger docs available at /api-docs');
}

// Global error handler — catches anything that fell through route handlers
app.use((err, req, res, next) => {
    logger.error('Unhandled Express Error', {
        method: req.method,
        url: req.originalUrl,
        error: err.message,
        stack: err.stack
    });

    const statusCode = err.status || 500;
    let responseMessage = err.message || 'Internal Server Error';

    if (statusCode >= 500 && process.env.NODE_ENV === 'production') {
        responseMessage = 'Internal Server Error';
    }

    res.status(statusCode).json({
        success: false,
        message: responseMessage
    });
});

module.exports = app;

