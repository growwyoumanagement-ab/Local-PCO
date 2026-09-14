const request = require('supertest');
const app = require('../app');
const User = require('../src/models/User');
const Partner = require('../src/models/Partner');
const ServiceRequest = require('../src/models/ServiceRequest');
const jwt = require('jsonwebtoken');

describe('Partner Job Execution Endpoint Integration Tests', () => {
    let partnerToken;
    let partnerUser;
    let clientUser;
    let serviceRequest;

    beforeEach(async () => {
        clientUser = await User.create({
            name: 'Client User',
            phone: '9876543210',
            email: 'client@test.com'
        });

        partnerUser = await Partner.create({
            name: 'Partner Provider',
            phone: '9876543211',
            email: 'partner@test.com',
            password: 'password123',
            serviceCategory: '60c72b2f9b1d8b2bad0a3d4f',
            isActive: true,
            isOnline: true
        });

        partnerToken = jwt.sign({ id: partnerUser._id }, process.env.JWT_SECRET);

        serviceRequest = await ServiceRequest.create({
            clientId: clientUser._id,
            partnerId: partnerUser._id,
            serviceName: 'Cleaning',
            serviceType: 'cleaning',
            address: { full: '123 Test St' },
            bookingType: 'instant',
            estimatedCharges: 350,
            status: 'pending'
        });
    });

    it('should allow partner to update status accepted reached in_progress completed', async () => {
        // pending -> accepted
        let res = await request(app)
            .put(`/api/v1/jobs/${serviceRequest._id}/status`)
            .set('Authorization', `Bearer ${partnerToken}`)
            .send({ status: 'accepted' });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.status).toBe('accepted');

        // accepted -> reached
        res = await request(app)
            .put(`/api/v1/jobs/${serviceRequest._id}/status`)
            .set('Authorization', `Bearer ${partnerToken}`)
            .send({ status: 'reached' });

        expect(res.statusCode).toBe(200);
        expect(res.body.data.status).toBe('reached');

        // reached -> in_progress
        res = await request(app)
            .put(`/api/v1/jobs/${serviceRequest._id}/status`)
            .set('Authorization', `Bearer ${partnerToken}`)
            .send({ status: 'in_progress' });

        expect(res.statusCode).toBe(200);
        expect(res.body.data.status).toBe('in_progress');

        // in_progress -> completed
        res = await request(app)
            .put(`/api/v1/jobs/${serviceRequest._id}/status`)
            .set('Authorization', `Bearer ${partnerToken}`)
            .send({
                status: 'completed',
                proofImages: ['https://cloudinary.com/proof.jpg'],
                notes: 'Finished nicely'
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.data.status).toBe('completed');
    });

    it('should reject invalid state machine transitions', async () => {
        // pending -> in_progress (invalid directly)
        const res = await request(app)
            .put(`/api/v1/jobs/${serviceRequest._id}/status`)
            .set('Authorization', `Bearer ${partnerToken}`)
            .send({ status: 'in_progress' });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it('should reject unauthorized partner job status changes', async () => {
        const otherPartner = await Partner.create({
            name: 'Other Partner',
            phone: '9876543212',
            email: 'otherp@test.com',
            password: 'password123',
            serviceCategory: '60c72b2f9b1d8b2bad0a3d4f',
            isActive: true
        });
        const otherToken = jwt.sign({ id: otherPartner._id }, process.env.JWT_SECRET);

        const res = await request(app)
            .put(`/api/v1/jobs/${serviceRequest._id}/status`)
            .set('Authorization', `Bearer ${otherToken}`)
            .send({ status: 'accepted' });

        expect(res.statusCode).toBe(401);
        expect(res.body.success).toBe(false);
    });
});
