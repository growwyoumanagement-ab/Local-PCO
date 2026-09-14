const cloudinary = require('cloudinary').v2;

// Validate that all required Cloudinary environment variables are set.
// Missing or empty values will cause "Invalid api_key" errors at upload time.
// This check makes the misconfiguration visible immediately at server startup.
const REQUIRED_CLOUDINARY_VARS = [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
];

const missingVars = REQUIRED_CLOUDINARY_VARS.filter(
    (key) => !process.env[key] || process.env[key].trim() === ''
);

if (missingVars.length > 0) {
    console.error(
        '[Cloudinary] FATAL: Missing required environment variables:',
        missingVars.join(', ')
    );
    console.error(
        '[Cloudinary] KYC document uploads will fail until these are set in the .env file.'
    );
}

// Configure Cloudinary with credentials from environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

module.exports = cloudinary;
