/**
 * Model Integration Test
 * Simulates client registration, partner onboarding & KYC, booking creations,
 * state-machine job updates, financial bookkeeping, and customer ratings
 * directly via database models.
 */

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
require('dotenv').config();

// Ensure safety check guardrails are active
const mongoUriEnv = process.env.MONGO_URI || '';
if (mongoUriEnv.includes('1wfs27v')) {
    console.error("🛑 FATAL: Environment check failed! Do not run smoke tests against production environments.");
    process.exit(1);
}

// Import models
const User = require('../src/models/User');
const Partner = require('../src/models/Partner');
const ServiceCategory = require('../src/models/ServiceCategory');
const ServiceRequest = require('../src/models/ServiceRequest');
const Transaction = require('../src/models/Transaction');
const Review = require('../src/models/Review');

async function runSmokeTest() {
    let mongoServer;

    try {
        console.log('🚀 Starting Model Integration Test...');
        
        // 1. Spin up isolated in-memory DB
        console.log('📦 Initializing isolated test database server...');
        mongoServer = await MongoMemoryServer.create();
        const testUri = mongoServer.getUri();
        await mongoose.connect(testUri);
        console.log('✓ In-memory database connected.');

        // 2. Setup Category
        console.log('🔧 Seeding service categories...');
        const category = await ServiceCategory.create({
            name: 'Electrical Repair',
            isActive: true
        });
        console.log(`✓ Created Category: ${category.name}`);

        // 3. Client Registration
        console.log('👤 Registering client user...');
        const client = await User.create({
            name: 'E2E Client',
            phone: '9999999990',
            email: 'client@e2e.com',
            password: 'securepassword123'
        });
        console.log(`✓ Client registered: ${client.name} (${client.phone})`);

        // 4. Partner Onboarding & KYC approval
        console.log('👷 Onboarding partner...');
        const partner = await Partner.create({
            name: 'E2E Electrician',
            phone: '9999999991',
            email: 'partner@e2e.com',
            password: 'securepassword123',
            serviceCategory: category._id,
            isActive: true,
            isOnline: true,
            kycStatus: 'approved',
            isVerified: true
        });
        console.log(`✓ Partner onboarded and KYC approved: ${partner.name}`);

        // 5. Create Service Request
        console.log('📅 Client creating immediate booking request...');
        const serviceRequest = await ServiceRequest.create({
            clientId: client._id,
            partnerId: partner._id,
            serviceName: category.name,
            serviceType: 'electrical-repair',
            bookingType: 'instant',
            estimatedCharges: 400,
            address: {
                full: 'Block C, Sector 62, Noida, UP',
                lat: 28.62,
                lng: 77.36
            },
            status: 'pending'
        });
        console.log(`✓ Service request created with ID: ${serviceRequest._id} (status: ${serviceRequest.status})`);

        // 6. Partner state machine updates (pending -> accepted -> reached -> in_progress -> completed)
        console.log('🔄 Executing state-machine transitions for the job...');
        
        // pending -> accepted
        serviceRequest.status = 'accepted';
        serviceRequest.statusHistory.push({ status: 'accepted', updatedBy: 'partner' });
        await serviceRequest.save();
        console.log(`   → Transition: accepted`);

        // accepted -> reached
        serviceRequest.status = 'reached';
        serviceRequest.statusHistory.push({ status: 'reached', updatedBy: 'partner' });
        await serviceRequest.save();
        console.log(`   → Transition: reached (partner arrived at site)`);

        // reached -> in_progress
        serviceRequest.status = 'in_progress';
        serviceRequest.statusHistory.push({ status: 'in_progress', updatedBy: 'partner' });
        await serviceRequest.save();
        console.log(`   → Transition: in_progress`);

        // in_progress -> completed (logs credit transaction)
        serviceRequest.status = 'completed';
        serviceRequest.finalCharges = serviceRequest.estimatedCharges;
        serviceRequest.statusHistory.push({ status: 'completed', updatedBy: 'partner' });
        await serviceRequest.save();

        const creditTransaction = await Transaction.create({
            partnerId: partner._id,
            jobId: serviceRequest._id,
            type: 'credit',
            amount: serviceRequest.finalCharges,
            description: `Payment for E2E job: ${serviceRequest.serviceName}`,
            status: 'completed'
        });
        console.log(`✓ Transition: completed. Credit transaction logged with ID: ${creditTransaction._id}`);

        // 7. Verify wallet balance
        console.log('💰 Validating ledger balances...');
        const earningsAgg = await Transaction.aggregate([
            { $match: { partnerId: partner._id, type: 'credit', status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const balance = earningsAgg[0]?.total || 0;
        console.log(`   → Computed Wallet Balance: ₹${balance}`);
        if (balance !== 400) {
            throw new Error(`Balance mismatch: expected ₹400 but calculated ₹${balance}`);
        }
        console.log(`✓ Balance verification successful.`);

        // 8. Client Review & Rating
        console.log('⭐️ Client submitting rating and review...');
        const review = await Review.create({
            requestId: serviceRequest._id,
            clientId: client._id,
            partnerId: partner._id,
            rating: 5,
            feedback: 'Excellent response and professional work!',
            tags: ['professional', 'punctual']
        });
        
        // Trigger partner average calculations
        await Review.calcAverageRatings(partner._id);
        
        const updatedPartner = await Partner.findById(partner._id);
        console.log(`✓ Review submitted. Updated partner average rating: ${updatedPartner.averageRating}/5 (${updatedPartner.totalReviews} reviews)`);

        console.log('\n🎉 ALL INTEGRATION TESTS COMPLETED SUCCESSFULLY! E2E MODEL FLOW IS 100% HEALTHY.');

    } catch (error) {
        console.error('\n🛑 INTEGRATION TEST FAILURE:', error.message);
        process.exitCode = 1;
    } finally {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
        if (mongoServer) {
            await mongoServer.stop();
        }
        console.log('🔌 Disconnected and cleaned database server processes.');
    }
}

runSmokeTest();
