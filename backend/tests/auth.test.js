const request = require('supertest');
const app = require('../app');
const User = require('../src/models/User');
const Partner = require('../src/models/Partner');
const ServiceCategory = require('../src/models/ServiceCategory');

describe('Auth Endpoint Integration Tests', () => {
    const clientPhone = '9876543210';
    const partnerPhone = '9876543211';
    let serviceCat;

    beforeEach(async () => {
        serviceCat = await ServiceCategory.create({
            name: 'Cleaning',
            slug: 'cleaning',
            isActive: true,
            basePrice: 300
        });
    });

    it('should register a client successfully', async () => {
        const res = await request(app)
            .post('/api/v1/auth/client/register')
            .send({
                name: 'Test Client',
                phone: clientPhone,
                email: 'client@test.com',
                password: 'password123'
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.phone).toBe(clientPhone);

        const client = await User.findOne({ phone: clientPhone });
        expect(client).toBeDefined();
        expect(client.name).toBe('Test Client');
    });

    it('should request and verify OTP for client login', async () => {
        // Register client first
        await User.create({
            name: 'Test Client 2',
            phone: clientPhone,
            email: 'client2@test.com',
            password: 'password123'
        });

        // Request OTP
        const reqOtpRes = await request(app)
            .post('/api/v1/auth/client/request-otp')
            .send({ phone: clientPhone });

        expect(reqOtpRes.statusCode).toBe(200);

        // Fetch OTP from database
        const client = await User.findOne({ phone: clientPhone }).select('+otp');
        expect(client.otp).toBeDefined();

        // Verify OTP
        const verifyRes = await request(app)
            .post('/api/v1/auth/client/verify-otp')
            .send({
                phone: clientPhone,
                otp: client.otp
            });

        expect(verifyRes.statusCode).toBe(200);
        expect(verifyRes.body.success).toBe(true);
        expect(verifyRes.body.data.accessToken).toBeDefined();
        expect(verifyRes.body.data.refreshToken).toBeDefined();
    });

    it('should register a partner successfully', async () => {
        const res = await request(app)
            .post('/api/v1/auth/partner/register')
            .send({
                name: 'Test Partner',
                phone: partnerPhone,
                email: 'partner@test.com',
                password: 'password123',
                serviceCategory: serviceCat._id.toString()
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.partner.phone).toBe(partnerPhone);
    });

    it('should login partner with password', async () => {
        await Partner.create({
            name: 'Test Partner 2',
            phone: partnerPhone,
            email: 'partner2@test.com',
            password: 'password123',
            serviceCategory: serviceCat._id.toString(),
            isActive: true
        });

        const loginRes = await request(app)
            .post('/api/v1/auth/partner/login')
            .send({
                phone: partnerPhone,
                password: 'password123'
            });

        expect(loginRes.statusCode).toBe(200);
        expect(loginRes.body.success).toBe(true);
        expect(loginRes.body.data.accessToken).toBeDefined();
    });

    it('should refresh authentication tokens successfully', async () => {
        const user = await User.create({
            name: 'Test Client 3',
            phone: clientPhone,
            email: 'client3@test.com',
            password: 'password123'
        });
        const jwt = require('jsonwebtoken');
        const refreshToken = jwt.sign({ id: user._id, type: 'refresh' }, process.env.JWT_SECRET, { expiresIn: '7d' });
        user.refreshToken = refreshToken;
        await user.save();

        const refreshRes = await request(app)
            .post('/api/v1/auth/refresh')
            .send({ refreshToken });

        expect(refreshRes.statusCode).toBe(200);
        expect(refreshRes.body.success).toBe(true);
        expect(refreshRes.body.data.accessToken).toBeDefined();
    });
});
