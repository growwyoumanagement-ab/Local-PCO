const mongoose = require('mongoose');
const dns = require('dns');

// Fix for Node >= 18 SRV resolution issues in some environments (like user's local network)
dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = async () => {
    try {
        console.log('Connecting to MongoDB...');
        // console.log('URI:', process.env.MONGO_URI); // Only for debugging, don't leave in production
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000, // Timeout after 10 seconds
            autoIndex: process.env.NODE_ENV !== 'production'
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        if (error.code) console.error(`Error Code: ${error.code}`);
        // process.exit(1); // Do not exit in serverless environment
    }
};

module.exports = connectDB;
