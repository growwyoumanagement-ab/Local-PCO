const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);

const User = require('./src/models/User');
const connectDB = require('./src/config/db');

dotenv.config();

const createVerifier = async () => {
    try {
        await connectDB();

        const verifierExists = await User.findOne({ email: 'verifier@localpco.com' });

        if (verifierExists) {
            console.log('Verifier user already exists');
            process.exit();
        }

        const password = process.env.SEED_VERIFIER_PASSWORD;
        if (!password || password.trim() === '') {
            console.error('Error: SEED_VERIFIER_PASSWORD environment variable is not configured. Aborting.');
            process.exit(1);
        }

        const user = await User.create({
            name: 'Verifier',
            email: 'verifier@localpco.com',
            phone: '8888888888',
            password,
            role: 'verifier'
        });

        console.log('Verifier user created successfully');
        console.log('Phone: 8888888888');
        console.log('Password: [set via SEED_VERIFIER_PASSWORD env variable — do not share or log in production]');
        process.exit();
    } catch (error) {
        console.error('Error creating verifier:', error);
        process.exit(1);
    }
};

createVerifier();
