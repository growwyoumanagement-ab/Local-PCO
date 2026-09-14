// backend/src/scripts/migrateLegacyEmails.js
// Migration script to assign placeholder emails to legacy Users/Partners lacking email addresses.
// MUST be executed BEFORE applying `unique: true` constraint on Mongoose email schemas.

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const connectDB = require('../config/db');
const User = require('../models/User');
const Partner = require('../models/Partner');

async function migrateLegacyEmails() {
    try {
        console.log('Connecting to database...');
        await connectDB();
        console.log('Database connected.');

        // 1. Migrate Users without email
        const usersWithoutEmail = await User.find({
            $or: [
                { email: { $exists: false } },
                { email: null },
                { email: '' }
            ]
        });

        console.log(`Found ${usersWithoutEmail.length} user(s) missing email address.`);
        let userUpdatedCount = 0;
        for (const user of usersWithoutEmail) {
            const fallbackEmail = `legacy-user-${user._id}@localpco.com`;
            user.email = fallbackEmail;
            await user.save({ validateBeforeSave: false });
            console.log(`Updated user ${user._id} with email ${fallbackEmail}`);
        }

        const partnersWithoutEmail = await Partner.find({
            $or: [{ email: { $exists: false } }, { email: null }, { email: '' }]
        });
        console.log(`Found ${partnersWithoutEmail.length} partners without email`);

        let partnerUpdatedCount = 0;
        for (const partner of partnersWithoutEmail) {
            const fallbackEmail = `legacy-partner-${partner._id}@localpco.com`;
            partner.email = fallbackEmail;
            await partner.save({ validateBeforeSave: false });
            partnerUpdatedCount++;
        }
        console.log(`Successfully updated ${partnerUpdatedCount} partner(s) with placeholder emails.`);

        console.log('Legacy email migration complete.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrateLegacyEmails();
