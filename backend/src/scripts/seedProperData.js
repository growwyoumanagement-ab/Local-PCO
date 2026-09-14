// backend/src/scripts/seedProperData.js
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Partner = require('../models/Partner');
const ServiceCategory = require('../models/ServiceCategory');

const CATEGORIES_DATA = [
    {
        name: 'Plumbing Services',
        icon: 'water-outline',
        description: 'Expert plumbing leak repairs, tap fittings and pipe installations',
        basePrice: 350,
        priority: 1,
        isActive: true,
        subcategories: [
            { name: 'Leak Repair', icon: 'water', isActive: true },
            { name: 'Tap Fitting', icon: 'construct', isActive: true },
            { name: 'Toilet Repair', icon: 'home', isActive: true }
        ],
        partners: [
            {
                name: 'Rajesh Kumar',
                phone: '9876543210',
                email: 'rajesh.plumbing@example.com',
                password: 'password123',
                location: 'Sector 62, Noida',
                averageRating: 4.9,
                totalReviews: 42,
                totalJobs: 128,
            },
            {
                name: 'Vikram Singh',
                phone: '9876543211',
                email: 'vikram.plumbing@example.com',
                password: 'password123',
                location: 'Indirapuram, Ghaziabad',
                averageRating: 4.8,
                totalReviews: 35,
                totalJobs: 94,
            }
        ]
    },
    {
        name: 'Electrical Services',
        icon: 'flash-outline',
        description: 'Professional wiring, switchboard repair and light fitting',
        basePrice: 299,
        priority: 2,
        isActive: true,
        subcategories: [
            { name: 'Wiring Check', icon: 'flash', isActive: true },
            { name: 'Fan Repair', icon: 'refresh', isActive: true },
            { name: 'Switchboard Fixing', icon: 'power', isActive: true }
        ],
        partners: [
            {
                name: 'Amit Patel',
                phone: '9876543212',
                email: 'amit.electrical@example.com',
                password: 'password123',
                location: 'Sector 18, Noida',
                averageRating: 4.7,
                totalReviews: 28,
                totalJobs: 65,
            },
            {
                name: 'Suresh Sharma',
                phone: '9876543213',
                email: 'suresh.electrical@example.com',
                password: 'password123',
                location: 'Vaishali, Ghaziabad',
                averageRating: 4.9,
                totalReviews: 50,
                totalJobs: 140,
            }
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
            { name: 'AC Servicing', icon: 'snow', isActive: true },
            { name: 'Gas Charging', icon: 'flame', isActive: true },
            { name: 'Washing Machine Repair', icon: 'settings', isActive: true }
        ],
        partners: [
            {
                name: 'Manoj Verma',
                phone: '9876543214',
                email: 'manoj.ac@example.com',
                password: 'password123',
                location: 'Sector 12, Noida',
                averageRating: 4.85,
                totalReviews: 60,
                totalJobs: 110,
            }
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
            { name: 'Deep Cleaning', icon: 'sparkles', isActive: true },
            { name: 'Sofa Cleaning', icon: 'bed', isActive: true }
        ],
        partners: [
            {
                name: 'Priya Sanitation Services',
                phone: '9876543215',
                email: 'priya.cleaning@example.com',
                password: 'password123',
                location: 'Sector 50, Noida',
                averageRating: 4.95,
                totalReviews: 85,
                totalJobs: 210,
            }
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
            { name: 'Doctor Visit', icon: 'medkit', isActive: true },
            { name: 'Nursing Support', icon: 'heart', isActive: true }
        ],
        partners: [
            {
                name: 'Dr. Ramesh Chandra',
                phone: '9876543216',
                email: 'dr.ramesh@example.com',
                password: 'password123',
                location: 'Sector 62, Noida',
                averageRating: 4.9,
                totalReviews: 120,
                totalJobs: 300,
            }
        ]
    }
];

async function seedProperData() {
    try {
        console.log('Connecting to MongoDB...');
        const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/local-pco';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB successfully.');

        let totalCategories = 0;
        let totalPartners = 0;

        for (const catData of CATEGORIES_DATA) {
            let category = await ServiceCategory.findOne({ name: catData.name });
            if (!category) {
                category = await ServiceCategory.create({
                    name: catData.name,
                    icon: catData.icon,
                    description: catData.description,
                    priority: catData.priority,
                    isActive: catData.isActive,
                    subcategories: catData.subcategories
                });
                console.log(`✅ Created Category: ${category.name} (${category._id})`);
            } else {
                console.log(`ℹ️ Existing Category: ${category.name} (${category._id})`);
            }
            totalCategories++;

            for (const partnerData of catData.partners) {
                let partner = await Partner.findOne({ phone: partnerData.phone });
                if (partner) {
                    partner.name = partnerData.name;
                    partner.email = partnerData.email;
                    partner.password = partnerData.password;
                    partner.serviceCategory = category._id;
                    partner.isActive = true;
                    partner.isOnline = true;
                    partner.kycStatus = 'approved';
                    partner.isVerified = true;
                    partner.averageRating = partnerData.averageRating;
                    partner.totalReviews = partnerData.totalReviews;
                    partner.totalJobs = partnerData.totalJobs;
                    partner.address = {
                        street: partnerData.location,
                        city: 'Noida',
                        state: 'Uttar Pradesh',
                        pincode: '201301',
                        country: 'India'
                    };
                    partner.currentLocation = {
                        type: 'Point',
                        coordinates: [77.3725, 28.6273]
                    };
                    await partner.save();
                    console.log(`  └─ Updated Partner: ${partner.name} (ID: ${partner._id})`);
                } else {
                    partner = await Partner.create({
                        name: partnerData.name,
                        phone: partnerData.phone,
                        email: partnerData.email,
                        password: partnerData.password,
                        serviceCategory: category._id,
                        isActive: true,
                        isOnline: true,
                        kycStatus: 'approved',
                        isVerified: true,
                        averageRating: partnerData.averageRating,
                        totalReviews: partnerData.totalReviews,
                        totalJobs: partnerData.totalJobs,
                        address: {
                            street: partnerData.location,
                            city: 'Noida',
                            state: 'Uttar Pradesh',
                            pincode: '201301',
                            country: 'India'
                        },
                        currentLocation: {
                            type: 'Point',
                            coordinates: [77.3725, 28.6273]
                        }
                    });
                    console.log(`  └─ Created Partner: ${partner.name} (ID: ${partner._id})`);
                }
                totalPartners++;
            }
        }

        console.log(`\n🎉 SEED COMPLETE! Categories: ${totalCategories}, Active Partners: ${totalPartners}`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding proper data:', error);
        process.exit(1);
    }
}

seedProperData();
