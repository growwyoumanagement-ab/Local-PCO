const mongoose = require('mongoose');

const prodClusterUri = "mongodb+srv://growwyoumanagement_db_user:jUnuSGKXaC1YNZcE@jayshreepco.1wfs27v.mongodb.net/?appName=JayshreePCO";

async function migrateAllProductionDatabases() {
    try {
        console.log("Connecting to Production MongoDB Cluster...");
        const clientConn = await mongoose.createConnection(prodClusterUri, { serverSelectionTimeoutMS: 8000 }).asPromise();
        console.log("Connected successfully.");

        // List all databases on the cluster
        const adminDb = clientConn.db.admin();
        const dbsResult = await adminDb.listDatabases();
        console.log("\nFound databases on cluster:", dbsResult.databases.map(d => d.name));

        const ignoreDbs = ['admin', 'local', 'config'];
        const targetDbs = dbsResult.databases
            .map(d => d.name)
            .filter(name => !ignoreDbs.includes(name));

        for (const dbName of targetDbs) {
            console.log(`\n========================================`);
            console.log(`🔍 Checking Database: [${dbName}]`);
            console.log(`========================================`);

            const dbConn = await mongoose.createConnection(`mongodb+srv://growwyoumanagement_db_user:jUnuSGKXaC1YNZcE@jayshreepco.1wfs27v.mongodb.net/${dbName}?appName=JayshreePCO`).asPromise();
            
            const Partner = dbConn.model('Partner', new mongoose.Schema({}, { strict: false }));
            
            const partners = await Partner.find({});
            console.log(`Total partners in [${dbName}]: ${partners.length}`);
            
            partners.forEach(p => {
                console.log(`  - [${p.phone}] ${p.name || 'Unnamed'}: isActive = ${p.isActive}, kycStatus = ${p.kycStatus || 'N/A'}`);
            });

            const updateResult = await Partner.updateMany(
                { isActive: { $ne: true } },
                { $set: { isActive: true } }
            );

            console.log(`Migration result in [${dbName}]: Matched ${updateResult.matchedCount}, Modified ${updateResult.modifiedCount}`);
            await dbConn.close();
        }

        await clientConn.close();
        console.log("\n✅ Production database migration completed successfully.");
    } catch (err) {
        console.error("Migration error:", err);
    }
}

migrateAllProductionDatabases();
