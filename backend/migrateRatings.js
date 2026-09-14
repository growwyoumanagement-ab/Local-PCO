require('dotenv').config();
const mongoose = require('mongoose');

const migration = async (uri) => {
    try {
        console.log(`Connecting to database...`);
        await mongoose.connect(uri);
        console.log('MongoDB Connected');

        const db = mongoose.connection.db;
        
        // 1. Migrate Partners
        const partnersCollection = db.collection('partners');
        const partnerResult = await partnersCollection.updateMany(
            { averageRating: { $exists: false } },
            { $set: { averageRating: 0, totalReviews: 0 } }
        );
        console.log(`Migrated ${partnerResult.modifiedCount} partners (added averageRating & totalReviews).`);

        // 2. Migrate Service Requests
        const requestsCollection = db.collection('servicerequests');
        const reqResult = await requestsCollection.updateMany(
            { isReviewed: { $exists: false } },
            { $set: { isReviewed: false } }
        );
        console.log(`Migrated ${reqResult.modifiedCount} service requests (added isReviewed flag).`);

        await mongoose.disconnect();
        console.log('MongoDB Disconnected');
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

const run = async () => {
    const args = process.argv.slice(2);
    let uri;
    if (args.includes('--prod')) {
        console.log('--- RUNNING ON PRODUCTION ---');
        uri = process.env.MONGO_URI_PROD || process.env.MONGO_URI;
        if (!uri) {
            console.error('Error: MONGO_URI_PROD or MONGO_URI environment variable is not defined.');
            process.exit(1);
        }
        // Ensure production database name is used instead of development-db
        if (uri.includes('/development-db')) {
            uri = uri.replace('/development-db', '/production-db');
        }
    } else {
        console.log('--- RUNNING ON DEVELOPMENT ---');
        uri = process.env.MONGO_URI_DEV || process.env.MONGO_URI;
        if (!uri) {
            console.error('Error: MONGO_URI_DEV or MONGO_URI environment variable is not defined.');
            process.exit(1);
        }
    }
    await migration(uri);
};

run();
