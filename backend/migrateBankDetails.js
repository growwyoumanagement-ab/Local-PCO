require('dotenv').config();
const mongoose = require('mongoose');

const migration = async (uri) => {
    try {
        console.log(`Connecting to database...`);
        await mongoose.connect(uri);
        console.log('MongoDB Connected');

        // We use raw collection to avoid Mongoose schema strict mode stripping 'bankDetails'
        const db = mongoose.connection.db;
        const partnersCollection = db.collection('partners');
        
        const partnersToMigrate = await partnersCollection.find({ bankDetails: { $exists: true } }).toArray();
        console.log(`Found ${partnersToMigrate.length} partners to migrate.`);

        let migratedCount = 0;
        let skippedCount = 0;

        for (const p of partnersToMigrate) {
            // Exclude partners that already have bankAccounts
            if (p.bankAccounts && Array.isArray(p.bankAccounts) && p.bankAccounts.length > 0) {
                console.log(`Skipping partner ${p._id} because they already have bankAccounts.`);
                skippedCount++;
                continue;
            }

            const bd = p.bankDetails;
            // Process only complete legacy bankDetails records
            const isComplete = bd &&
                               typeof bd.accountHolderName === 'string' && bd.accountHolderName.trim() !== '' &&
                               typeof bd.accountNumber === 'string' && bd.accountNumber.trim() !== '' &&
                               typeof bd.bankName === 'string' && bd.bankName.trim() !== '' &&
                               typeof bd.ifsc === 'string' && bd.ifsc.trim() !== '';

            if (!isComplete) {
                console.log(`Skipping partner ${p._id} with incomplete legacy bankDetails.`);
                skippedCount++;
                continue;
            }

            const newAccount = {
                accountHolderName: bd.accountHolderName.trim(),
                accountNumber: bd.accountNumber.trim(),
                bankName: bd.bankName.trim(),
                ifsc: bd.ifsc.trim(),
                isPrimary: true,
                isActive: true,
                _id: new mongoose.Types.ObjectId()
            };
            
            // Preserve existing accounts by appending newAccount rather than replacing
            const existingAccounts = Array.isArray(p.bankAccounts) ? p.bankAccounts : [];
            const updatedAccounts = [...existingAccounts, newAccount];

            await partnersCollection.updateOne(
                { _id: p._id },
                { 
                    $set: { bankAccounts: updatedAccounts },
                    $unset: { bankDetails: "" }
                }
            );
            migratedCount++;
        }
        
        console.log(`Successfully migrated ${migratedCount} partners with bank accounts.`);
        console.log(`Skipped ${skippedCount} partners (either incomplete legacy data or existing accounts).`);
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
