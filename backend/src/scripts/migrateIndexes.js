const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const connectDB = require('../config/db');
const mongoose = require('mongoose');

const deduplicateEmails = async (collection) => {
    // Find duplicate non-null email values
    const duplicates = await collection.aggregate([
        { $match: { email: { $exists: true, $ne: null, $nin: ['', 'null'] } } },
        { $group: { _id: '$email', count: { $sum: 1 }, docs: { $push: '$_id' } } },
        { $match: { count: { $gt: 1 } } }
    ]).toArray();

    for (const dup of duplicates) {
        console.log(`Found ${dup.count} duplicate records for email: "${dup._id}". Cleaning up...`);
        // Keep the first document (or newest), unset email on remaining duplicates
        const [keepId, ...removeIds] = dup.docs;
        await collection.updateMany(
            { _id: { $in: removeIds } },
            { $unset: { email: "" } }
        );
        console.log(`Unset email on ${removeIds.length} duplicate document(s).`);
    }
};

const migrateIndexes = async () => {
    try {
        await connectDB();
        console.log('Connected to MongoDB for index migration...');

        const db = mongoose.connection.db;

        // 1. Migrate Users collection email index
        const usersCollection = db.collection('users');
        await deduplicateEmails(usersCollection);

        try {
            const userIndexes = await usersCollection.indexes();
            const hasEmailIndex = userIndexes.some(idx => idx.name === 'email_1');
            if (hasEmailIndex) {
                console.log('Dropping legacy email_1 index from users collection...');
                await usersCollection.dropIndex('email_1');
                console.log('Successfully dropped email_1 index from users collection.');
            }
        } catch (err) {
            console.log('Notice regarding users index drop:', err.message);
        }

        console.log('Creating sparse unique email index on users collection...');
        await usersCollection.createIndex({ email: 1 }, { unique: true, sparse: true, name: 'email_1_sparse' });
        console.log('Successfully created email_1_sparse index on users.');

        // 2. Migrate Partners collection email index
        const partnersCollection = db.collection('partners');
        await deduplicateEmails(partnersCollection);

        try {
            const partnerIndexes = await partnersCollection.indexes();
            const hasEmailIndex = partnerIndexes.some(idx => idx.name === 'email_1');
            if (hasEmailIndex) {
                console.log('Dropping legacy email_1 index from partners collection...');
                await partnersCollection.dropIndex('email_1');
                console.log('Successfully dropped email_1 index from partners collection.');
            }
        } catch (err) {
            console.log('Notice regarding partners index drop:', err.message);
        }

        console.log('Creating sparse unique email index on partners collection...');
        await partnersCollection.createIndex({ email: 1 }, { unique: true, sparse: true, name: 'email_1_sparse' });
        console.log('Successfully created email_1_sparse index on partners.');

        console.log('Index migration finished successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error during index migration:', error);
        process.exit(1);
    }
};

migrateIndexes();
