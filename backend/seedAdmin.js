const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');

// Temporarily set DNS servers to public ones to troubleshoot SRV resolution
dns.setServers(['8.8.8.8', '8.8.4.4']);

const User = require('./src/models/User');
const connectDB = require('./src/config/db');

dotenv.config();

const createAdmin = async () => {
    try {
        await connectDB();

        const adminExists = await User.findOne({ email: 'admin@localpco.com' });

        if (adminExists) {
            console.log('Admin user already exists');
            process.exit();
        }

        const password = process.env.SEED_ADMIN_PASSWORD;
        if (!password || password.trim() === '') {
            console.error('Error: SEED_ADMIN_PASSWORD environment variable is not configured. Aborting.');
            process.exit(1);
        }

        const user = await User.create({
            name: 'Admin',
            email: 'admin@localpco.com',
            phone: '9999999999',
            password,
            role: 'admin'
        });

        console.log('Admin user created successfully');
        console.log('Email: admin@localpco.com');
        console.log('Password: [set via SEED_ADMIN_PASSWORD env variable — do not share or log in production]');
        process.exit();
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
};

createAdmin();
