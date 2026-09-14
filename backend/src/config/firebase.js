const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

let serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');
let firebaseInitialized = false;
let serviceAccount = null;

// Check if environment variable is available first
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } catch (error) {
        console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT env variable:', error.message);
    }
}

// If no environment variable, search for the local file
if (!serviceAccount) {
    if (!fs.existsSync(serviceAccountPath)) {
        try {
            const files = fs.readdirSync(__dirname);
            const autoKey = files.find(f => f.endsWith('.json') && f.includes('firebase-adminsdk'));
            if (autoKey) {
                serviceAccountPath = path.join(__dirname, autoKey);
            }
        } catch (e) {
            console.warn('Error reading config directory:', e.message);
        }
    }

    if (fs.existsSync(serviceAccountPath)) {
        try {
            serviceAccount = require(serviceAccountPath);
        } catch (error) {
            console.error('Failed to read Firebase config file:', error.message);
        }
    }
}

// Initialize Firebase if service account details are resolved
if (serviceAccount) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        firebaseInitialized = true;
        const source = process.env.FIREBASE_SERVICE_ACCOUNT ? 'environment variable' : path.basename(serviceAccountPath);
        console.log(`Firebase Admin SDK initialized successfully using: ${source}`);
    } catch (error) {
        console.error('Failed to initialize Firebase Admin SDK:', error.message);
    }
}

// Fallback to mock interface if not initialized
if (!firebaseInitialized) {
    if (process.env.NODE_ENV === 'production') {
        console.error('Firebase Admin SDK could not be initialized in production environment!');
        admin.messaging = () => ({
            send: async (payload) => {
                throw new Error('Firebase Admin SDK is not initialized. FCM notifications cannot be sent in production.');
            }
        });
    } else {
        console.warn('Firebase Admin SDK could not be initialized (no config file or env variable found).');
        console.warn('FCM push notifications will be mocked.');
        
        admin.messaging = () => ({
            send: async (payload) => {
                console.log('[MOCK FCM] Sending message:', JSON.stringify(payload, null, 2));
                return 'mock-message-id';
            }
        });
    }
}

module.exports = { admin, firebaseInitialized };
