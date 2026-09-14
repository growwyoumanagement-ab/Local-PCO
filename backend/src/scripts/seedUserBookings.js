// backend/src/scripts/seedUserBookings.js
// Seed sample bookings for user 6a3a4c446e8cda23c825c96a

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const ServiceRequest = require('../models/ServiceRequest');
const Partner = require('../models/Partner');

const USER_ID = '6a3a4c446e8cda23c825c96a';

const SAMPLE_BOOKINGS = [
    {
        clientId: USER_ID,
        serviceType: 'plumber',
        serviceName: 'Plumbing Leak Repair & Fitting',
        bookingType: 'instant',
        status: 'pending',
        notes: 'Bathroom pipe is leaking continuously. Need urgent assistance.',
        estimatedCharges: 350,
        address: {
            full: 'Gaur City 1, Mall Gaurs, Sector 4, Noida',
            landmark: 'Near Mall Gaurs',
            city: 'Noida',
            pincode: '201301',
            lat: 28.6139,
            lng: 77.2090,
        },
        location: {
            type: 'Point',
            coordinates: [77.2090, 28.6139],
        },
        statusHistory: [
            { status: 'pending', timestamp: new Date(), updatedBy: 'client' },
        ],
    },
    {
        clientId: USER_ID,
        serviceType: 'ac_repair',
        serviceName: 'AC Deep Cleaning & Filter Service',
        bookingType: 'appointment',
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        status: 'completed',
        notes: 'Split AC deep foam jet service required.',
        estimatedCharges: 499,
        finalCharges: 499,
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        isReviewed: true,
        address: {
            full: 'Gaur City 1, Mall Gaurs, Sector 4, Noida',
            landmark: 'Near Mall Gaurs',
            city: 'Noida',
            pincode: '201301',
            lat: 28.6139,
            lng: 77.2090,
        },
        location: {
            type: 'Point',
            coordinates: [77.2090, 28.6139],
        },
        statusHistory: [
            { status: 'pending', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), updatedBy: 'client' },
            { status: 'accepted', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000), updatedBy: 'partner' },
            { status: 'in_progress', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), updatedBy: 'partner' },
            { status: 'completed', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000), updatedBy: 'partner' },
        ],
    },
    {
        clientId: USER_ID,
        serviceType: 'electrician',
        serviceName: 'Main Switchboard & Circuit Breaker Fix',
        bookingType: 'instant',
        status: 'completed',
        notes: 'MCB tripping repeatedly in bedroom line.',
        estimatedCharges: 299,
        finalCharges: 350,
        completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        address: {
            full: 'Gaur City 1, Mall Gaurs, Sector 4, Noida',
            landmark: 'Near Mall Gaurs',
            city: 'Noida',
            pincode: '201301',
            lat: 28.6139,
            lng: 77.2090,
        },
        location: {
            type: 'Point',
            coordinates: [77.2090, 28.6139],
        },
        statusHistory: [
            { status: 'pending', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), updatedBy: 'client' },
            { status: 'completed', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000), updatedBy: 'partner' },
        ],
    },
    {
        clientId: USER_ID,
        serviceType: 'cleaning',
        serviceName: 'Full Home Deep Sanitisation & Cleaning',
        bookingType: 'appointment',
        status: 'cancelled',
        cancelledBy: 'client',
        notes: 'Full house cleaning service.',
        estimatedCharges: 1299,
        address: {
            full: 'Gaur City 1, Mall Gaurs, Sector 4, Noida',
            landmark: 'Near Mall Gaurs',
            city: 'Noida',
            pincode: '201301',
            lat: 28.6139,
            lng: 77.2090,
        },
        location: {
            type: 'Point',
            coordinates: [77.2090, 28.6139],
        },
        statusHistory: [
            { status: 'pending', timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), updatedBy: 'client' },
            { status: 'cancelled', timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 20 * 60 * 1000), updatedBy: 'client' },
        ],
    },
];

async function seed() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB.');

        // Find an existing partner to link
        let partner = await Partner.findOne();
        if (!partner) {
            console.log('No partner found, creating a default seed partner...');
            partner = await Partner.create({
                name: 'Rajesh Kumar (Expert Technician)',
                phone: '9876543210',
                services: ['plumber', 'electrician', 'ac_repair', 'cleaning'],
                servicePincodes: ['201301', '201309', '110001'],
                kycStatus: 'approved',
                isApproved: true,
                rating: { average: 4.9, count: 124 },
            });
        }

        console.log('Partner selected:', partner.name, partner._id);

        // Delete existing mock bookings for this user to avoid duplicates
        await ServiceRequest.deleteMany({ clientId: USER_ID });

        // Add partnerId to sample bookings
        const bookingsToInsert = SAMPLE_BOOKINGS.map((b) => ({
            ...b,
            partnerId: partner._id,
        }));

        const inserted = await ServiceRequest.insertMany(bookingsToInsert);
        console.log(`Successfully seeded ${inserted.length} service bookings for user ID ${USER_ID}!`);

        process.exit(0);
    } catch (error) {
        console.error('Error seeding bookings:', error);
        process.exit(1);
    }
}

seed();
