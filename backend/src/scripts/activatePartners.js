const mongoose = require('mongoose');

const devUri = "mongodb+srv://growwyouteam_db_user:asdf1234@jayshreepco.2yrgsje.mongodb.net/development-db";
const prodUri = "mongodb+srv://growwyoumanagement_db_user:jUnuSGKXaC1YNZcE@jayshreepco.1wfs27v.mongodb.net/test?appName=JayshreePCO";

async function fixPartners(uri, label) {
    try {
        console.log(`Connecting to ${label}...`);
        const conn = await mongoose.createConnection(uri, { serverSelectionTimeoutMS: 5000 }).asPromise();
        console.log(`Connected to ${label}`);
        
        const Partner = conn.model('Partner', new mongoose.Schema({}, { strict: false }));
        
        const allPartners = await Partner.find({}, { name: 1, phone: 1, email: 1, isActive: 1, kycStatus: 1 });
        console.log(`Found ${allPartners.length} partners in ${label}:`);
        allPartners.forEach(p => console.log(` - [${p.phone}] ${p.name}: isActive = ${p.isActive}, kycStatus = ${p.kycStatus}`));
        
        const updateRes = await Partner.updateMany(
            { isActive: { $ne: true } },
            { $set: { isActive: true } }
        );
        console.log(`Updated in ${label}:`, updateRes);
        
        await conn.close();
    } catch (err) {
        console.error(`Error in ${label}:`, err.message);
    }
}

async function run() {
    await fixPartners(devUri, "DEV DB");
    await fixPartners(prodUri, "PROD DB");
    process.exit(0);
}

run();
