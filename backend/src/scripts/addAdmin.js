const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const devUri = "mongodb+srv://growwyouteam_db_user:asdf1234@jayshreepco.2yrgsje.mongodb.net/development-db";
const prodClusterUri = "mongodb+srv://growwyoumanagement_db_user:jUnuSGKXaC1YNZcE@jayshreepco.1wfs27v.mongodb.net/?appName=JayshreePCO";

const TARGET_PHONE = "7017669405";
const TARGET_PASSWORD = "Admin@1234";

async function addAdminToConnection(conn, dbDescription) {
    console.log(`\n---------------------------------------------`);
    console.log(`Processing Database: ${dbDescription}`);
    console.log(`---------------------------------------------`);

    const User = conn.model('User', new mongoose.Schema({
        name: { type: String, required: true },
        phone: { type: String, required: true, unique: true },
        email: { type: String, sparse: true },
        role: { type: String, enum: ['user', 'admin', 'verifier'], default: 'user' },
        password: { type: String, select: true },
        isBlocked: { type: Boolean, default: false }
    }, { timestamps: true, strict: false }));

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(TARGET_PASSWORD, salt);

    let user = await User.findOne({ phone: TARGET_PHONE });

    if (user) {
        console.log(`User with phone ${TARGET_PHONE} found. Updating role to 'admin' and resetting password.`);
        user.role = 'admin';
        user.password = hashedPassword;
        user.isBlocked = false;
        if (!user.name) user.name = 'Admin';
        await user.save();
        console.log(`✅ Admin updated successfully in [${dbDescription}]`);
    } else {
        console.log(`User with phone ${TARGET_PHONE} not found. Creating new admin user.`);
        user = await User.create({
            name: 'Admin',
            phone: TARGET_PHONE,
            email: 'admin7017@localpco.com',
            password: hashedPassword,
            role: 'admin',
            isBlocked: false
        });
        console.log(`✅ Admin created successfully in [${dbDescription}] with ID: ${user._id}`);
    }

    // Verification check
    const verifyUser = await User.findOne({ phone: TARGET_PHONE });
    const isMatch = await bcrypt.compare(TARGET_PASSWORD, verifyUser.password);
    console.log(`🔐 Verification Check: Phone=${verifyUser.phone}, Role=${verifyUser.role}, isBlocked=${verifyUser.isBlocked}, PasswordMatch=${isMatch}`);
}

async function main() {
    try {
        console.log("=== STEP 1: DEVELOPMENT DATABASE ===");
        console.log("Connecting to Development DB...");
        const devConn = await mongoose.createConnection(devUri, { serverSelectionTimeoutMS: 15000 }).asPromise();
        console.log("Connected to Development DB.");
        await addAdminToConnection(devConn, "Development DB (development-db)");
        await devConn.close();

        console.log("\n=== STEP 2: PRODUCTION DATABASE(S) ===");
        console.log("Connecting to Production Cluster...");
        const prodClusterConn = await mongoose.createConnection(prodClusterUri, { serverSelectionTimeoutMS: 15000 }).asPromise();
        console.log("Connected to Production Cluster.");

        const adminDb = prodClusterConn.db.admin();
        const dbsResult = await adminDb.listDatabases();
        console.log("Databases on Production Cluster:", dbsResult.databases.map(d => d.name));

        const ignoreDbs = ['admin', 'local', 'config'];
        const targetProdDbs = dbsResult.databases
            .map(d => d.name)
            .filter(name => !ignoreDbs.includes(name));

        if (targetProdDbs.length === 0) {
            targetProdDbs.push('test');
        }

        for (const dbName of targetProdDbs) {
            console.log(`Connecting to Production Database: ${dbName}...`);
            const prodDbConn = await mongoose.createConnection(`mongodb+srv://growwyoumanagement_db_user:jUnuSGKXaC1YNZcE@jayshreepco.1wfs27v.mongodb.net/${dbName}?appName=JayshreePCO`, { serverSelectionTimeoutMS: 15000 }).asPromise();
            await addAdminToConnection(prodDbConn, `Production DB (${dbName})`);
            await prodDbConn.close();
        }

        await prodClusterConn.close();
        console.log("\n🎉 ALL ADMIN ACCOUNTS CREATED / UPDATED SUCCESSFULLY IN BOTH DEV AND PROD!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error executing admin script:", err);
        process.exit(1);
    }
}

main();
