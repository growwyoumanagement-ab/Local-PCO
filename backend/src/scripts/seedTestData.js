// backend/src/scripts/seedTestData.js
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Partner = require('../models/Partner');
const ServiceCategory = require('../models/ServiceCategory');
const ServiceRequest = require('../models/ServiceRequest');
const fs = require('fs');
const path = require('path');

const TEST_CLIENT_DATA = {
    name: 'Test Client',
    phone: '9999911111',
    email: 'testclient@example.com',
    password: 'password123',
};

const TEST_PARTNER_DATA = {
    name: 'Test Partner (Expert Tech)',
    phone: '9999922222',
    email: 'testpartner@example.com',
    password: 'password123',
};

async function seedTestData() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB.');

        // 1. Seed or find Service Categories
        let category = await ServiceCategory.findOne({ name: 'Plumbing Services' });
        if (!category) {
            category = await ServiceCategory.create({
                name: 'Plumbing Services',
                icon: '🔧',
                description: 'Expert plumbing leak repairs and pipe fittings',
                basePrice: 350,
                priority: 1,
                isActive: true,
                subcategories: [
                    { name: 'Leak Repair', icon: '💧', isActive: true },
                    { name: 'Tap Fitting', icon: '🚰', isActive: true }
                ]
            });
            console.log('✅ Created Service Category: Plumbing Services');
        } else {
            console.log('ℹ️ Found existing Service Category:', category.name);
        }

        // 2. Create or reset Test Client
        let client = await User.findOne({ phone: TEST_CLIENT_DATA.phone });
        if (client) {
            client.password = TEST_CLIENT_DATA.password;
            client.isBlocked = false;
            await client.save();
            console.log('✅ Updated existing Test Client:', client._id);
        } else {
            client = await User.create({
                ...TEST_CLIENT_DATA,
                savedAddresses: [{
                    label: 'Home',
                    type: 'home',
                    full: 'Sector 62, Noida, UP',
                    city: 'Noida',
                    pincode: '201301',
                    lat: 28.6273,
                    lng: 77.3725,
                    isDefault: true
                }]
            });
            console.log('✅ Created Test Client:', client._id);
        }

        // 3. Create or reset Test Partner
        let partner = await Partner.findOne({ phone: TEST_PARTNER_DATA.phone });
        if (partner) {
            partner.password = TEST_PARTNER_DATA.password;
            partner.isActive = true;
            partner.isOnline = true;
            partner.kycStatus = 'approved';
            partner.isVerified = true;
            partner.serviceCategory = category._id;
            partner.currentLocation = {
                type: 'Point',
                coordinates: [77.3725, 28.6273]
            };
            await partner.save();
            console.log('✅ Updated existing Test Partner:', partner._id);
        } else {
            partner = await Partner.create({
                ...TEST_PARTNER_DATA,
                serviceCategory: category._id,
                isActive: true,
                isOnline: true,
                kycStatus: 'approved',
                isVerified: true,
                currentLocation: {
                    type: 'Point',
                    coordinates: [77.3725, 28.6273]
                },
                address: {
                    street: 'Sector 62',
                    city: 'Noida',
                    state: 'UP',
                    pincode: '201301',
                    country: 'India'
                }
            });
            console.log('✅ Created Test Partner:', partner._id);
        }

        // 4. Clean up pending/active jobs between test client and partner for a fresh test run
        const deletedJobs = await ServiceRequest.deleteMany({
            $or: [
                { clientId: client._id },
                { partnerId: partner._id }
            ]
        });
        console.log(`🧹 Cleaned up ${deletedJobs.deletedCount} old test service requests.`);

        // 5. Output config file for tests
        const testsDir = path.resolve(__dirname, '../../tests');
        if (!fs.existsSync(testsDir)) {
            fs.mkdirSync(testsDir, { recursive: true });
        }

        const configPath = path.join(testsDir, 'test-config.json');
        const testConfig = {
            baseUrl: 'http://localhost:5000/api/v1',
            clientCredentials: {
                phone: TEST_CLIENT_DATA.phone,
                password: TEST_CLIENT_DATA.password,
                id: client._id.toString()
            },
            partnerCredentials: {
                phone: TEST_PARTNER_DATA.phone,
                password: TEST_PARTNER_DATA.password,
                id: partner._id.toString()
            },
            serviceCategory: {
                id: category._id.toString(),
                name: category.name
            }
        };

        fs.writeFileSync(configPath, JSON.stringify(testConfig, null, 2));
        console.log(`🎉 Test data seeded successfully! Config saved to: ${configPath}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding test data:', error);
        process.exit(1);
    }
}

seedTestData();
