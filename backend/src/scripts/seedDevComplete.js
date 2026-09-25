// backend/src/scripts/seedDevComplete.js
// Seeds complete dummy dataset and admin credentials into the development MongoDB

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dns = require('dns');

// Fix for Node >= 18 SRV resolution
try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
    // ignore
}

const User = require('../models/User');
const Partner = require('../models/Partner');
const ServiceCategory = require('../models/ServiceCategory');
const ServiceRequest = require('../models/ServiceRequest');
const Review = require('../models/Review');
const Transaction = require('../models/Transaction');
const KYCDocument = require('../models/KYCDocument');
const ContentSection = require('../models/ContentSection');

// Password helper
async function hashPw(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}

// Coordinate helper around Noida / Delhi NCR
// Base: Noida Sector 62 (28.6273 N, 77.3725 E)
const NOIDA_COORDS = [77.3725, 28.6273];

async function seedData(connectionDescription) {
    console.log(`\n======================================================`);
    console.log(`🌱 Seeding Data for: ${connectionDescription}`);
    console.log(`======================================================\n`);

    // ------------------------------------------------------------------
    // 1. SERVICE CATEGORIES & SUBCATEGORIES
    // ------------------------------------------------------------------
    console.log('📌 1/7 Seeding Service Categories...');
    const categoriesData = [
        {
            name: 'Plumbing Services',
            icon: 'water-outline',
            description: 'Expert plumbing leak repairs, tap fittings and pipe installations',
            basePrice: 350,
            priority: 1,
            isActive: true,
            subcategories: [
                { name: 'Leak Repair', icon: 'water', isActive: true },
                { name: 'Tap & Shower Fitting', icon: 'construct', isActive: true },
                { name: 'Toilet & Flush Repair', icon: 'home', isActive: true },
                { name: 'Water Tank Cleaning', icon: 'cube', isActive: true }
            ]
        },
        {
            name: 'Electrical Services',
            icon: 'flash-outline',
            description: 'Professional electrical wiring, switchboard repair and light fitting',
            basePrice: 299,
            priority: 2,
            isActive: true,
            subcategories: [
                { name: 'Wiring Check & Fault', icon: 'flash', isActive: true },
                { name: 'Ceiling Fan Repair', icon: 'refresh', isActive: true },
                { name: 'Switchboard Fixing', icon: 'power', isActive: true },
                { name: 'MCB & Fuse Installation', icon: 'shield', isActive: true }
            ]
        },
        {
            name: 'AC & Appliance Repair',
            icon: 'snow-outline',
            description: 'AC servicing, gas refilling, refrigerator & washing machine repair',
            basePrice: 499,
            priority: 3,
            isActive: true,
            subcategories: [
                { name: 'AC Deep Foam Cleaning', icon: 'snow', isActive: true },
                { name: 'AC Gas Charging', icon: 'flame', isActive: true },
                { name: 'Washing Machine Repair', icon: 'settings', isActive: true },
                { name: 'Refrigerator Repair', icon: 'nutrition', isActive: true }
            ]
        },
        {
            name: 'Home Cleaning',
            icon: 'sparkles-outline',
            description: 'Deep home cleaning, sofa cleaning & kitchen sanitation',
            basePrice: 799,
            priority: 4,
            isActive: true,
            subcategories: [
                { name: 'Full House Deep Cleaning', icon: 'sparkles', isActive: true },
                { name: 'Sofa & Carpet Shampooing', icon: 'bed', isActive: true },
                { name: 'Kitchen Sanitization', icon: 'restaurant', isActive: true },
                { name: 'Bathroom Acid Cleaning', icon: 'water', isActive: true }
            ]
        },
        {
            name: 'Medical & Healthcare',
            icon: 'medical-outline',
            description: 'Doctor home visits, nursing care and emergency health assistance',
            basePrice: 500,
            priority: 5,
            isActive: true,
            subcategories: [
                { name: 'Doctor Home Visit', icon: 'medkit', isActive: true },
                { name: 'Home Nursing Support', icon: 'heart', isActive: true },
                { name: 'Physiotherapy Session', icon: 'fitness', isActive: true },
                { name: 'Diagnostic Blood Pickup', icon: 'flask', isActive: true }
            ]
        },
        {
            name: 'Carpentry & Furniture',
            icon: 'hammer-outline',
            description: 'Furniture assembly, door lock repair and custom woodwork',
            basePrice: 399,
            priority: 6,
            isActive: true,
            subcategories: [
                { name: 'Furniture Assembly', icon: 'construct', isActive: true },
                { name: 'Door & Lock Repair', icon: 'lock-closed', isActive: true },
                { name: 'Modular Kitchen Fitting', icon: 'grid', isActive: true }
            ]
        },
        {
            name: 'Painting & Decor',
            icon: 'color-palette-outline',
            description: 'Full house painting, waterproofing and wall textures',
            basePrice: 1200,
            priority: 7,
            isActive: true,
            subcategories: [
                { name: 'Full House Painting', icon: 'brush', isActive: true },
                { name: 'Waterproofing Service', icon: 'rainy', isActive: true },
                { name: 'Wall Stencil & Design', icon: 'image', isActive: true }
            ]
        },
        {
            name: 'Pest Control',
            icon: 'shield-checkmark-outline',
            description: 'Cockroach, termite, bed bug and mosquito pest treatment',
            basePrice: 650,
            priority: 8,
            isActive: true,
            subcategories: [
                { name: 'Cockroach & Ant Control', icon: 'bug', isActive: true },
                { name: 'Termite Protection', icon: 'shield', isActive: true },
                { name: 'Bed Bug Extermination', icon: 'warning', isActive: true }
            ]
        }
    ];

    const categoryMap = {};
    for (const cat of categoriesData) {
        let categoryDoc = await ServiceCategory.findOne({ name: cat.name });
        if (!categoryDoc) {
            categoryDoc = await ServiceCategory.create(cat);
            console.log(`  ➕ Created Category: ${cat.name}`);
        } else {
            categoryDoc.subcategories = cat.subcategories;
            categoryDoc.icon = cat.icon;
            categoryDoc.description = cat.description;
            categoryDoc.basePrice = cat.basePrice;
            categoryDoc.priority = cat.priority;
            categoryDoc.isActive = cat.isActive;
            await categoryDoc.save();
            console.log(`  🔄 Updated Category: ${cat.name}`);
        }
        categoryMap[cat.name] = categoryDoc;
    }

    // ------------------------------------------------------------------
    // 2. ADMIN & VERIFIER CREDENTIALS
    // ------------------------------------------------------------------
    console.log('\n📌 2/7 Seeding Admin & Verifier Credentials...');

    const adminUsers = [
        {
            name: 'Local PCO Admin',
            phone: '7017669405',
            email: 'admin@localpco.com',
            plainPassword: 'Admin@1234',
            role: 'admin',
            isBlocked: false
        },
        {
            name: 'Operations Admin',
            phone: '9876543210',
            email: 'operations@localpco.com',
            plainPassword: 'Ops@1234',
            role: 'admin',
            isBlocked: false
        },
        {
            name: 'KYC Verifier Officer',
            phone: '9876500001',
            email: 'verifier@localpco.com',
            plainPassword: 'Verifier@1234',
            role: 'verifier',
            isBlocked: false
        }
    ];

    for (const adm of adminUsers) {
        let user = await User.findOne({ phone: adm.phone });

        if (user) {
            user.name = adm.name;
            user.email = adm.email;
            user.password = adm.plainPassword;
            user.role = adm.role;
            user.isBlocked = false;
            await user.save();
            console.log(`  🔄 Updated ${adm.role.toUpperCase()}: ${adm.name} (${adm.phone})`);
        } else {
            user = await User.create({
                name: adm.name,
                phone: adm.phone,
                email: adm.email,
                password: adm.plainPassword,
                role: adm.role,
                isBlocked: false
            });
            console.log(`  ➕ Created ${adm.role.toUpperCase()}: ${adm.name} (${adm.phone})`);
        }
    }

    // ------------------------------------------------------------------
    // 3. DUMMY CLIENTS / USERS
    // ------------------------------------------------------------------
    console.log('\n📌 3/7 Seeding Dummy Clients...');
    const clientUsersData = [
        {
            name: 'Rahul Sharma',
            phone: '9811122233',
            email: 'rahul.sharma@example.com',
            plainPassword: 'password123',
            role: 'user',
            isBlocked: false,
            savedAddresses: [
                {
                    label: 'Home',
                    type: 'home',
                    full: 'Tower 4, Flat 402, Gaur City 1, Sector 4, Greater Noida West',
                    landmark: 'Near Gaur City Mall',
                    city: 'Greater Noida',
                    pincode: '201301',
                    lat: 28.6139,
                    lng: 77.2090,
                    isDefault: true
                },
                {
                    label: 'Office',
                    type: 'work',
                    full: 'Tech Boulevard, Sector 127, Noida',
                    landmark: 'Tower C',
                    city: 'Noida',
                    pincode: '201304',
                    lat: 28.5355,
                    lng: 77.3910,
                    isDefault: false
                }
            ]
        },
        {
            name: 'Pooja Gupta',
            phone: '9822233344',
            email: 'pooja.gupta@example.com',
            plainPassword: 'password123',
            role: 'user',
            isBlocked: false,
            savedAddresses: [
                {
                    label: 'Home',
                    type: 'home',
                    full: 'B-12, Sector 62, Noida, Uttar Pradesh',
                    landmark: 'Opposite Fortis Hospital',
                    city: 'Noida',
                    pincode: '201309',
                    lat: 28.6273,
                    lng: 77.3725,
                    isDefault: true
                }
            ]
        },
        {
            name: 'Ankit Verma',
            phone: '9833344455',
            email: 'ankit.verma@example.com',
            plainPassword: 'password123',
            role: 'user',
            isBlocked: false,
            savedAddresses: [
                {
                    label: 'Apartment',
                    type: 'home',
                    full: 'Flat 1004, Supertech Capetown, Sector 74, Noida',
                    landmark: 'Near City Center Metro',
                    city: 'Noida',
                    pincode: '201301',
                    lat: 28.5700,
                    lng: 77.3800,
                    isDefault: true
                }
            ]
        },
        {
            name: 'Test Client',
            phone: '9999911111',
            email: 'testclient@example.com',
            plainPassword: 'password123',
            role: 'user',
            isBlocked: false,
            savedAddresses: [
                {
                    label: 'Home',
                    type: 'home',
                    full: 'Sector 62, Noida, UP',
                    city: 'Noida',
                    pincode: '201301',
                    lat: 28.6273,
                    lng: 77.3725,
                    isDefault: true
                }
            ]
        }
    ];

    const seededClients = [];
    for (const cData of clientUsersData) {
        let client = await User.findOne({ phone: cData.phone });

        if (client) {
            client.name = cData.name;
            client.email = cData.email;
            client.password = cData.plainPassword;
            client.role = 'user';
            client.isBlocked = false;
            client.savedAddresses = cData.savedAddresses;
            await client.save();
            console.log(`  🔄 Updated Client: ${cData.name} (${cData.phone})`);
        } else {
            client = await User.create({
                name: cData.name,
                phone: cData.phone,
                email: cData.email,
                password: cData.plainPassword,
                role: 'user',
                isBlocked: false,
                savedAddresses: cData.savedAddresses
            });
            console.log(`  ➕ Created Client: ${cData.name} (${cData.phone})`);
        }
        seededClients.push(client);
    }

    // ------------------------------------------------------------------
    // 4. PARTNERS (Active Verified & Pending Review)
    // ------------------------------------------------------------------
    console.log('\n📌 4/7 Seeding Partners...');
    const partnersData = [
        {
            name: 'Rajesh Kumar',
            phone: '9876543211',
            email: 'rajesh.plumber@example.com',
            plainPassword: 'password123',
            categoryName: 'Plumbing Services',
            serviceSubcategory: 'Leak Repair',
            location: 'Sector 62, Noida',
            coordinates: [77.3725, 28.6273],
            averageRating: 4.9,
            totalReviews: 48,
            totalJobs: 135,
            walletBalance: 4250,
            kycStatus: 'approved',
            isVerified: true,
            isActive: true,
            isOnline: true
        },
        {
            name: 'Vikram Singh',
            phone: '9876543212',
            email: 'vikram.plumbing@example.com',
            plainPassword: 'password123',
            categoryName: 'Plumbing Services',
            serviceSubcategory: 'Tap & Shower Fitting',
            location: 'Indirapuram, Ghaziabad',
            coordinates: [77.3685, 28.6412],
            averageRating: 4.8,
            totalReviews: 36,
            totalJobs: 98,
            walletBalance: 2900,
            kycStatus: 'approved',
            isVerified: true,
            isActive: true,
            isOnline: true
        },
        {
            name: 'Amit Patel',
            phone: '9876543213',
            email: 'amit.electrical@example.com',
            plainPassword: 'password123',
            categoryName: 'Electrical Services',
            serviceSubcategory: 'Wiring Check & Fault',
            location: 'Sector 18, Noida',
            coordinates: [77.3235, 28.5708],
            averageRating: 4.75,
            totalReviews: 29,
            totalJobs: 72,
            walletBalance: 3100,
            kycStatus: 'approved',
            isVerified: true,
            isActive: true,
            isOnline: true
        },
        {
            name: 'Suresh Sharma',
            phone: '9876543214',
            email: 'suresh.electrical@example.com',
            plainPassword: 'password123',
            categoryName: 'Electrical Services',
            serviceSubcategory: 'Ceiling Fan Repair',
            location: 'Vaishali, Ghaziabad',
            coordinates: [77.3400, 28.6450],
            averageRating: 4.9,
            totalReviews: 54,
            totalJobs: 152,
            walletBalance: 5600,
            kycStatus: 'approved',
            isVerified: true,
            isActive: true,
            isOnline: true
        },
        {
            name: 'Manoj Verma',
            phone: '9876543215',
            email: 'manoj.ac@example.com',
            plainPassword: 'password123',
            categoryName: 'AC & Appliance Repair',
            serviceSubcategory: 'AC Deep Foam Cleaning',
            location: 'Sector 12, Noida',
            coordinates: [77.3350, 28.5950],
            averageRating: 4.85,
            totalReviews: 62,
            totalJobs: 115,
            walletBalance: 4800,
            kycStatus: 'approved',
            isVerified: true,
            isActive: true,
            isOnline: true
        },
        {
            name: 'Priya Sanitation Services',
            phone: '9876543216',
            email: 'priya.cleaning@example.com',
            plainPassword: 'password123',
            categoryName: 'Home Cleaning',
            serviceSubcategory: 'Full House Deep Cleaning',
            location: 'Sector 50, Noida',
            coordinates: [77.3620, 28.5720],
            averageRating: 4.95,
            totalReviews: 88,
            totalJobs: 215,
            walletBalance: 8200,
            kycStatus: 'approved',
            isVerified: true,
            isActive: true,
            isOnline: true
        },
        {
            name: 'Dr. Ramesh Chandra',
            phone: '9876543217',
            email: 'dr.ramesh@example.com',
            plainPassword: 'password123',
            categoryName: 'Medical & Healthcare',
            serviceSubcategory: 'Doctor Home Visit',
            location: 'Sector 62, Noida',
            coordinates: [77.3750, 28.6290],
            averageRating: 4.9,
            totalReviews: 125,
            totalJobs: 310,
            walletBalance: 12500,
            kycStatus: 'approved',
            isVerified: true,
            isActive: true,
            isOnline: true
        },
        {
            name: 'Dinesh Carpenter',
            phone: '9876543218',
            email: 'dinesh.wood@example.com',
            plainPassword: 'password123',
            categoryName: 'Carpentry & Furniture',
            serviceSubcategory: 'Furniture Assembly',
            location: 'Sector 76, Noida',
            coordinates: [77.3850, 28.5700],
            averageRating: 4.75,
            totalReviews: 40,
            totalJobs: 86,
            walletBalance: 3400,
            kycStatus: 'approved',
            isVerified: true,
            isActive: true,
            isOnline: true
        },
        {
            name: 'Test Partner (Expert Tech)',
            phone: '9999922222',
            email: 'testpartner@example.com',
            plainPassword: 'password123',
            categoryName: 'Plumbing Services',
            serviceSubcategory: 'Leak Repair',
            location: 'Sector 62, Noida',
            coordinates: [77.3725, 28.6273],
            averageRating: 4.9,
            totalReviews: 50,
            totalJobs: 60,
            walletBalance: 2500,
            kycStatus: 'approved',
            isVerified: true,
            isActive: true,
            isOnline: true
        },
        // Pending Partners for KYC Verification flows
        {
            name: 'Deepak Chauhan (New Applicant)',
            phone: '9876543219',
            email: 'deepak.kyc@example.com',
            plainPassword: 'password123',
            categoryName: 'Electrical Services',
            serviceSubcategory: 'Wiring Check & Fault',
            location: 'Sector 15, Noida',
            coordinates: [77.3100, 28.5800],
            averageRating: 0,
            totalReviews: 0,
            totalJobs: 0,
            walletBalance: 0,
            kycStatus: 'pending',
            isVerified: false,
            isActive: false,
            isOnline: false
        },
        {
            name: 'Sunil Kumar (Under Review)',
            phone: '9876543220',
            email: 'sunil.review@example.com',
            plainPassword: 'password123',
            categoryName: 'Plumbing Services',
            serviceSubcategory: 'Toilet & Flush Repair',
            location: 'Sector 22, Noida',
            coordinates: [77.3400, 28.5950],
            averageRating: 0,
            totalReviews: 0,
            totalJobs: 0,
            walletBalance: 0,
            kycStatus: 'under_review',
            isVerified: false,
            isActive: false,
            isOnline: false
        }
    ];

    const seededPartners = [];
    for (const pData of partnersData) {
        const catDoc = categoryMap[pData.categoryName];
        let partner = await Partner.findOne({ phone: pData.phone });

        const partnerPayload = {
            name: pData.name,
            phone: pData.phone,
            email: pData.email,
            password: pData.plainPassword,
            serviceCategory: catDoc._id,
            serviceSubcategory: pData.serviceSubcategory,
            isActive: pData.isActive,
            isOnline: pData.isOnline,
            kycStatus: pData.kycStatus,
            isVerified: pData.isVerified,
            averageRating: pData.averageRating,
            totalReviews: pData.totalReviews,
            totalJobs: pData.totalJobs,
            address: {
                street: pData.location,
                city: 'Noida',
                state: 'Uttar Pradesh',
                pincode: '201301',
                country: 'India'
            },
            currentLocation: {
                type: 'Point',
                coordinates: pData.coordinates
            }
        };

        if (partner) {
            Object.assign(partner, partnerPayload);
            await partner.save();
            console.log(`  🔄 Updated Partner: ${pData.name} (${pData.phone}) [KYC: ${pData.kycStatus}]`);
        } else {
            partner = await Partner.create(partnerPayload);
            console.log(`  ➕ Created Partner: ${pData.name} (${pData.phone}) [KYC: ${pData.kycStatus}]`);
        }
        seededPartners.push(partner);
    }

    // ------------------------------------------------------------------
    // 5. KYC DOCUMENTS FOR APPLICANT PARTNERS
    // ------------------------------------------------------------------
    console.log('\n📌 5/7 Seeding KYC Documents for Pending Partners...');
    const pendingPartners = seededPartners.filter(p => ['pending', 'under_review'].includes(p.kycStatus));
    for (const pendingP of pendingPartners) {
        const existingDocs = await KYCDocument.find({ partner: pendingP._id });
        if (existingDocs.length === 0) {
            await KYCDocument.create([
                {
                    partner: pendingP._id,
                    documentType: 'aadhaar',
                    side: 'front',
                    documentNumber: '849204918234',
                    imageUrl: 'https://res.cloudinary.com/de2iukqnt/image/upload/v1700000000/sample_aadhaar_front.jpg',
                    cloudinaryPublicId: 'sample_aadhaar_front',
                    status: pendingP.kycStatus === 'under_review' ? 'under_review' : 'pending'
                },
                {
                    partner: pendingP._id,
                    documentType: 'aadhaar',
                    side: 'back',
                    imageUrl: 'https://res.cloudinary.com/de2iukqnt/image/upload/v1700000000/sample_aadhaar_back.jpg',
                    cloudinaryPublicId: 'sample_aadhaar_back',
                    status: pendingP.kycStatus === 'under_review' ? 'under_review' : 'pending'
                },
                {
                    partner: pendingP._id,
                    documentType: 'pan',
                    side: 'front',
                    documentNumber: 'ABCDE1234F',
                    imageUrl: 'https://res.cloudinary.com/de2iukqnt/image/upload/v1700000000/sample_pan_front.jpg',
                    cloudinaryPublicId: 'sample_pan_front',
                    status: pendingP.kycStatus === 'under_review' ? 'under_review' : 'pending'
                }
            ]);
            console.log(`  ➕ Added Sample KYC Documents for: ${pendingP.name}`);
        }
    }

    // ------------------------------------------------------------------
    // 6. SERVICE REQUESTS (BOOKINGS) & REVIEWS
    // ------------------------------------------------------------------
    console.log('\n📌 6/7 Seeding Service Requests (Bookings) & Reviews...');

    // Clear old test service requests for idempotency
    const activePartners = seededPartners.filter(p => p.isVerified);
    const primaryClient = seededClients[0];
    const secondaryClient = seededClients[1];
    const testClient = seededClients[3];

    const sampleRequests = [
        // Completed Requests with Reviews
        {
            clientId: primaryClient._id,
            partnerId: activePartners[0]._id, // Rajesh (Plumbing)
            bookingType: 'instant',
            serviceType: 'plumber',
            serviceName: 'Plumbing Leak Repair & Pipe Fitting',
            status: 'completed',
            notes: 'Main bathroom washbasin pipe is leaking and making water puddle.',
            estimatedCharges: 350,
            finalCharges: 420,
            completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
            isReviewed: true,
            reviewData: {
                rating: 5,
                feedback: 'Excellent work! Rajesh arrived within 20 minutes and fixed the leak cleanly.',
                tags: ['Punctual', 'Clean Work', 'Professional']
            },
            address: primaryClient.savedAddresses[0],
            location: { type: 'Point', coordinates: [primaryClient.savedAddresses[0].lng, primaryClient.savedAddresses[0].lat] },
            statusHistory: [
                { status: 'pending', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 - 3600000), updatedBy: 'client' },
                { status: 'accepted', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 - 3000000), updatedBy: 'partner' },
                { status: 'in_progress', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 - 1800000), updatedBy: 'partner' },
                { status: 'completed', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), updatedBy: 'partner' }
            ]
        },
        {
            clientId: secondaryClient._id,
            partnerId: activePartners[2]._id, // Amit (Electrical)
            bookingType: 'appointment',
            scheduledAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            serviceType: 'electrician',
            serviceName: 'Ceiling Fan Installation & Wiring Check',
            status: 'completed',
            notes: 'Need to install new Crompton high-speed ceiling fan in master bedroom.',
            estimatedCharges: 299,
            finalCharges: 350,
            completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            isReviewed: true,
            reviewData: {
                rating: 5,
                feedback: 'Great electrician. Highly recommended for electrical installations.',
                tags: ['Polite', 'Skilled']
            },
            address: secondaryClient.savedAddresses[0],
            location: { type: 'Point', coordinates: [secondaryClient.savedAddresses[0].lng, secondaryClient.savedAddresses[0].lat] },
            statusHistory: [
                { status: 'pending', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 - 7200000), updatedBy: 'client' },
                { status: 'accepted', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 - 5400000), updatedBy: 'partner' },
                { status: 'completed', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), updatedBy: 'partner' }
            ]
        },
        {
            clientId: primaryClient._id,
            partnerId: activePartners[4]._id, // Manoj (AC)
            bookingType: 'appointment',
            scheduledAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            serviceType: 'ac_repair',
            serviceName: 'AC Deep Foam Cleaning & Filter Service',
            status: 'completed',
            notes: 'Split AC is not cooling properly and blowing warm air.',
            estimatedCharges: 499,
            finalCharges: 599,
            completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            isReviewed: true,
            reviewData: {
                rating: 4,
                feedback: 'Cooling is back to super chilled! Cleaned with high-pressure jet.',
                tags: ['High Quality', 'Fair Price']
            },
            address: primaryClient.savedAddresses[0],
            location: { type: 'Point', coordinates: [primaryClient.savedAddresses[0].lng, primaryClient.savedAddresses[0].lat] },
            statusHistory: [
                { status: 'pending', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 - 7200000), updatedBy: 'client' },
                { status: 'completed', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), updatedBy: 'partner' }
            ]
        },
        {
            clientId: testClient._id,
            partnerId: activePartners[5]._id, // Priya (Cleaning)
            bookingType: 'instant',
            serviceType: 'cleaner',
            serviceName: 'Full House Deep Cleaning',
            status: 'completed',
            notes: 'Post-renovation dust cleaning for 2BHK flat.',
            estimatedCharges: 799,
            finalCharges: 1199,
            completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            isReviewed: true,
            reviewData: {
                rating: 5,
                feedback: 'Top-notch deep cleaning. The team was thorough and every corner shines!',
                tags: ['Thorough', 'Teamwork']
            },
            address: testClient.savedAddresses[0],
            location: { type: 'Point', coordinates: [testClient.savedAddresses[0].lng, testClient.savedAddresses[0].lat] },
            statusHistory: [
                { status: 'pending', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 - 10000000), updatedBy: 'client' },
                { status: 'completed', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), updatedBy: 'partner' }
            ]
        },
        // Active / In-Progress Requests
        {
            clientId: secondaryClient._id,
            partnerId: activePartners[0]._id, // Rajesh
            bookingType: 'instant',
            serviceType: 'plumber',
            serviceName: 'Kitchen Sink Drainage Unclogging',
            status: 'in_progress',
            notes: 'Kitchen sink water overflowing. High priority.',
            estimatedCharges: 350,
            address: secondaryClient.savedAddresses[0],
            location: { type: 'Point', coordinates: [secondaryClient.savedAddresses[0].lng, secondaryClient.savedAddresses[0].lat] },
            statusHistory: [
                { status: 'pending', timestamp: new Date(Date.now() - 3600000), updatedBy: 'client' },
                { status: 'accepted', timestamp: new Date(Date.now() - 2700000), updatedBy: 'partner' },
                { status: 'in_progress', timestamp: new Date(Date.now() - 900000), updatedBy: 'partner' }
            ]
        },
        // Assigned / Accepted Request
        {
            clientId: primaryClient._id,
            partnerId: activePartners[3]._id, // Suresh
            bookingType: 'appointment',
            scheduledAt: new Date(Date.now() + 4 * 60 * 60 * 1000), // Today in 4 hours
            serviceType: 'electrician',
            serviceName: 'Inverter & Battery Wiring Setup',
            status: 'accepted',
            notes: 'Need to hook up new Luminous 1050VA inverter with tubular battery.',
            estimatedCharges: 450,
            address: primaryClient.savedAddresses[0],
            location: { type: 'Point', coordinates: [primaryClient.savedAddresses[0].lng, primaryClient.savedAddresses[0].lat] },
            statusHistory: [
                { status: 'pending', timestamp: new Date(Date.now() - 1800000), updatedBy: 'client' },
                { status: 'accepted', timestamp: new Date(Date.now() - 600000), updatedBy: 'partner' }
            ]
        },
        // Pending Request (Awaiting Partner)
        {
            clientId: primaryClient._id,
            partnerId: activePartners[6]._id, // Dr. Ramesh
            bookingType: 'appointment',
            scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
            serviceType: 'doctor',
            serviceName: 'Doctor Consultation Home Visit',
            status: 'pending',
            notes: 'Elderly patient fever and general medical consultation required.',
            estimatedCharges: 500,
            address: primaryClient.savedAddresses[0],
            location: { type: 'Point', coordinates: [primaryClient.savedAddresses[0].lng, primaryClient.savedAddresses[0].lat] },
            statusHistory: [
                { status: 'pending', timestamp: new Date(Date.now() - 300000), updatedBy: 'client' }
            ]
        },
        // Cancelled Request
        {
            clientId: secondaryClient._id,
            partnerId: activePartners[1]._id,
            bookingType: 'instant',
            serviceType: 'plumber',
            serviceName: 'Bathroom Tap Replacement',
            status: 'cancelled',
            cancelledBy: 'client',
            notes: 'Client resolved the loose fitting manually before partner reached.',
            estimatedCharges: 350,
            address: secondaryClient.savedAddresses[0],
            location: { type: 'Point', coordinates: [secondaryClient.savedAddresses[0].lng, secondaryClient.savedAddresses[0].lat] },
            statusHistory: [
                { status: 'pending', timestamp: new Date(Date.now() - 48 * 3600000), updatedBy: 'client' },
                { status: 'cancelled', timestamp: new Date(Date.now() - 47 * 3600000), updatedBy: 'client' }
            ]
        }
    ];

    let createdBookings = 0;
    let createdReviews = 0;

    for (const reqData of sampleRequests) {
        // Check if request with identical client, partner, serviceName exists
        let existingReq = await ServiceRequest.findOne({
            clientId: reqData.clientId,
            partnerId: reqData.partnerId,
            serviceName: reqData.serviceName
        });

        if (!existingReq) {
            const newReq = await ServiceRequest.create(reqData);
            createdBookings++;

            if (reqData.isReviewed && reqData.reviewData) {
                const existingReview = await Review.findOne({ requestId: newReq._id });
                if (!existingReview) {
                    await Review.create({
                        requestId: newReq._id,
                        clientId: reqData.clientId,
                        partnerId: reqData.partnerId,
                        rating: reqData.reviewData.rating,
                        feedback: reqData.reviewData.feedback,
                        tags: reqData.reviewData.tags
                    });
                    createdReviews++;
                }
            }

            // Seed a transaction for completed requests
            if (reqData.status === 'completed') {
                await Transaction.create({
                    partnerId: reqData.partnerId,
                    jobId: newReq._id,
                    type: 'credit',
                    amount: reqData.finalCharges || reqData.estimatedCharges,
                    status: 'completed',
                    description: `Payout credit for job: ${reqData.serviceName}`,
                    paymentId: `PAY-${Date.now()}-${Math.floor(Math.random() * 10000)}`
                });
            }
        }
    }
    console.log(`  ➕ Seeded ${createdBookings} Service Requests, ${createdReviews} Reviews & Completed Job Transactions.`);

    // ------------------------------------------------------------------
    // 7. CONTENT SECTIONS (App Banners & Trending Services)
    // ------------------------------------------------------------------
    console.log('\n📌 7/7 Seeding Mobile App Home Screen Content Sections...');
    const bannerSection = await ContentSection.findOne({ sectionType: 'banner' });
    if (!bannerSection) {
        await ContentSection.create({
            sectionType: 'banner',
            title: 'Featured Offers & Updates',
            priority: 1,
            isActive: true,
            items: [
                {
                    name: 'Summer AC Tune-Up Fest',
                    subtitle: 'Flat 20% OFF on deep foam jet servicing',
                    ctaText: 'Book AC Service',
                    backgroundColor: '#E0F2FE',
                    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
                    priority: 1,
                    isActive: true
                },
                {
                    name: 'Monsoon Proofing Specials',
                    subtitle: 'Waterproofing & instant leak inspections',
                    ctaText: 'Explore Plumbing',
                    backgroundColor: '#FEF3C7',
                    image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80',
                    priority: 2,
                    isActive: true
                }
            ]
        });
        console.log('  ➕ Created Home Banner Content Section');
    }

    const trendingSection = await ContentSection.findOne({ sectionType: 'trending' });
    if (!trendingSection) {
        await ContentSection.create({
            sectionType: 'trending',
            title: 'Most Booked Services This Week',
            priority: 2,
            isActive: true,
            items: [
                { name: 'Leak Repair', icon: 'water', priority: 1, isActive: true },
                { name: 'AC Deep Foam Cleaning', icon: 'snow', priority: 2, isActive: true },
                { name: 'Ceiling Fan Repair', icon: 'refresh', priority: 3, isActive: true },
                { name: 'Full House Deep Cleaning', icon: 'sparkles', priority: 4, isActive: true }
            ]
        });
        console.log('  ➕ Created Trending Services Content Section');
    }

    console.log(`\n✅ Database [${connectionDescription}] seeded successfully!`);
}

async function main() {
    try {
        console.log('Connecting to Development MongoDB Cluster...');
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            throw new Error('MONGO_URI is not set in backend/.env');
        }

        const conn = await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 20000
        });

        console.log(`✅ Connected! Host: ${conn.connection.host}`);
        console.log(`Target Database: ${conn.connection.name}`);

        // Seed target database
        await seedData(conn.connection.name);

        await mongoose.disconnect();
        console.log('\n======================================================');
        console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
        console.log('======================================================\n');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    }
}

main();
