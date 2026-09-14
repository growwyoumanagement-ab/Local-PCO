// MUST be initialized before any other require — captures all crashes from startup
require('dotenv').config();
const Sentry = require('@sentry/node');
if (process.env.SENTRY_DSN) {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV || 'development',
        tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    });
}

const app = require('./app');
const connectDB = require('./src/config/db');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('./src/utils/logger');

// Initialize Firebase SDK
require('./src/config/firebase');

// Start Cron Schedulers
require('./src/services/appointmentScheduler');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, async () => {
    logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    
    // Connect to Database immediately on startup for local development
    try {
        await connectDB();
        logger.info('Database connected successfully on server startup');
    } catch (error) {
        logger.error('Initial DB Connection failed', { error: error.message });
    }
});

// Mount Socket.io
const io = socketIo(server, {
    cors: {
        origin: '*',
        methods: ["GET", "POST"]
    },
    pingInterval: 25000,
    pingTimeout: 20000
});

// Set io instance in Express app context
app.set('io', io);

// Socket.io JWT Handshake Middleware
// Accepts connections from both partners and clients.
// Partners pass { token, userType: 'partner' } in auth.
// Clients pass { token, userType: 'client' } in auth.
io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    const userType = socket.handshake.auth?.userType || 'partner'; // default: partner

    if (!token) {
        return next(new Error('Authentication error: Token missing'));
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        socket.userType = userType;
        // Keep backward-compat: partners still have socket.partnerId set
        if (userType === 'partner') {
            socket.partnerId = decoded.id;
        }
        next();
    } catch (err) {
        return next(new Error('Authentication error: Invalid token'));
    }
});


// Connection Room Join Logic
io.on('connection', async (socket) => {
    // Both partners and clients connect here. Partners have socket.partnerId
    // set by the JWT middleware. Clients need to emit 'join_room' with their userId.

    if (socket.partnerId) {
        logger.info(`Partner connected: ${socket.id}`, { partnerId: socket.partnerId });
        socket.join(socket.partnerId.toString());
    }

    // Allow clients to join their own personal room for receiving job status updates
    socket.on('join_room', (userId) => {
        if (userId) {
            socket.join(userId.toString());
            logger.info(`Client joined room: ${userId}`);
        }
    });

    // Listen for partner live location updates
    socket.on('update_location', async (locationData) => {
        try {
            const Partner = require('./src/models/Partner');
            const ServiceRequest = require('./src/models/ServiceRequest');
            const { latitude, longitude } = locationData;

            if (!latitude || !longitude) return;

            // 1. Persist partner location to DB
            await Partner.findByIdAndUpdate(socket.partnerId, {
                $set: {
                    currentLocation: {
                        type: 'Point',
                        coordinates: [Number(longitude), Number(latitude)]
                    }
                }
            });

            // FIX #38: 2. Broadcast partner location to client's socket room.
            // Find the active job for this partner and emit to the client's room.
            const activeJob = await ServiceRequest.findOne({
                partnerId: socket.partnerId,
                status: { $in: ['accepted', 'reached', 'in_progress'] }
            }).select('clientId').lean();

            if (activeJob?.clientId) {
                io.to(activeJob.clientId.toString()).emit('partner_location_updated', {
                    latitude: Number(latitude),
                    longitude: Number(longitude),
                    partnerId: socket.partnerId,
                    jobId: activeJob._id,
                });
            }
        } catch (err) {
            logger.error(`Failed to update partner location via socket: ${err.message}`);
        }
    });

    socket.on('disconnect', async () => {
        logger.info(`Socket disconnected: ${socket.id}`);
        // Note: Do NOT automatically set partner isOnline: false on transient socket disconnects.
        // Partner stays online until manual toggle or explicit logout.
    });
});

server.on('error', (err) => {
    logger.error('SERVER ERROR', { error: err.message, code: err.code });
    if (err.code === 'EADDRINUSE') {
        process.exit(1);
    }
});

const shutdown = async (err, type) => {
    logger.error(`FATAL PROCESS ERROR (${type})`, { error: err.message || String(err), stack: err.stack });
    
    if (process.env.SENTRY_DSN) {
        Sentry.captureException(err);
    }
    
    if (server && server.listening) {
        server.close(() => {
            logger.info('HTTP server closed.');
        });
    }
    
    try {
        if (process.env.SENTRY_DSN) {
            await Sentry.close(2000);
        }
    } catch (e) {
        logger.error('Failed to flush Sentry telemetry', { error: e.message });
    }
    
    process.exit(1);
};

process.on('uncaughtException', (err) => {
    shutdown(err, 'uncaughtException');
});

process.on('unhandledRejection', (reason) => {
    const error = reason instanceof Error ? reason : new Error(String(reason));
    shutdown(error, 'unhandledRejection');
});

