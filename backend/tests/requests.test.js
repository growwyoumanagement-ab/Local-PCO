const request = require('supertest');
const app = require('../app');
const User = require('../src/models/User');
const Partner = require('../src/models/Partner');
const ServiceCategory = require('../src/models/ServiceCategory');
const ServiceRequest = require('../src/models/ServiceRequest');
const jwt = require('jsonwebtoken');

describe('Service Request Endpoint Integration Tests', () => {
    let clientToken;
    let clientUser;
    let partnerUser;
    let serviceCategory;

    beforeEach(async () => {
        clientUser = await User.create({
            name: 'Client User',
            phone: '9876543210',
            email: 'client@test.com'
        });
        clientToken = jwt.sign({ id: clientUser._id }, process.env.JWT_SECRET);

        serviceCategory = await ServiceCategory.create({
            name: 'Carpentry',
            slug: 'carpentry',
            isActive: true,
            basePrice: 500
        });

        partnerUser = await Partner.create({
            name: 'Carpentry Partner',
            phone: '9876543211',
            email: 'partner@test.com',
            password: 'password123',
            serviceCategory: serviceCategory._id,
            isActive: true,
            isOnline: true
        });
    });

    it('should create a new service request successfully', async () => {
        const res = await request(app)
            .post('/api/v1/requests')
            .set('Authorization', `Bearer ${clientToken}`)
            .send({
                serviceId: serviceCategory._id.toString(),
                partnerId: partnerUser._id.toString(),
                bookingType: 'instant',
                address: '123 Main St, New Delhi'
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.clientId.toString()).toBe(clientUser._id.toString());
        expect(res.body.data.partnerId.toString()).toBe(partnerUser._id.toString());
        expect(res.body.data.status).toBe('pending');
    });

    it('should return error if partner is offline', async () => {
        partnerUser.isOnline = false;
        await partnerUser.save();

        const res = await request(app)
            .post('/api/v1/requests')
            .set('Authorization', `Bearer ${clientToken}`)
            .send({
                serviceId: serviceCategory._id.toString(),
                partnerId: partnerUser._id.toString(),
                bookingType: 'instant',
                address: '123 Main St, New Delhi'
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain('offline');
    });

    it('should allow a client to cancel their pending request', async () => {
        const sr = await ServiceRequest.create({
            clientId: clientUser._id,
            partnerId: partnerUser._id,
            serviceName: 'Carpentry',
            serviceType: 'instant',
            bookingType: 'instant',
            address: { full: '123 Main St, New Delhi' },
            status: 'pending'
        });

        const res = await request(app)
            .put(`/api/v1/requests/${sr._id}/cancel`)
            .set('Authorization', `Bearer ${clientToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.status).toBe('cancelled');
    });

    it('should not allow a client to cancel another client request', async () => {
        const otherUser = await User.create({
            name: 'Other User',
            phone: '9876543212',
            email: 'other@test.com',
            password: 'password123'
        });

        const sr = await ServiceRequest.create({
            clientId: otherUser._id,
            partnerId: partnerUser._id,
            serviceName: 'Carpentry',
            serviceType: 'instant',
            bookingType: 'instant',
            address: { full: '123 Main St, New Delhi' },
            status: 'pending'
        });

        const res = await request(app)
            .put(`/api/v1/requests/${sr._id}/cancel`)
            .set('Authorization', `Bearer ${clientToken}`);

        expect(res.statusCode).toBe(403);
        expect(res.body.success).toBe(false);
    });
});
