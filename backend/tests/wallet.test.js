const request = require('supertest');
const app = require('../app');
const Partner = require('../src/models/Partner');
const Transaction = require('../src/models/Transaction');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

describe('Wallet and Webhook Integration Tests', () => {
    let partnerToken;
    let partnerUser;

    beforeEach(async () => {
        partnerUser = await Partner.create({
            name: 'Wallet Partner',
            phone: '9876543211',
            email: 'partner@test.com',
            password: 'password123',
            serviceCategory: '60c72b2f9b1d8b2bad0a3d4f',
            isActive: true,
            isOnline: true
        });

        partnerToken = jwt.sign({ id: partnerUser._id }, process.env.JWT_SECRET);
    });

    it('should add a bank account successfully with secure OTP verification', async () => {
        // Set OTP in database
        partnerUser.otp = '123456';
        partnerUser.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        await partnerUser.save();

        const res = await request(app)
            .post('/api/v1/wallet/partner/bank-accounts')
            .set('Authorization', `Bearer ${partnerToken}`)
            .send({
                bankName: 'SBI Bank',
                accountNumber: '1234567890',
                ifsc: 'SBIN0001234',
                accountHolderName: 'Wallet Partner',
                otp: '123456'
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.bankName).toBe('SBI Bank');

        const updatedPartner = await Partner.findById(partnerUser._id);
        expect(updatedPartner.bankAccounts.length).toBe(1);
    });

    it('should reject bank account submission with incorrect OTP', async () => {
        partnerUser.otp = '123456';
        partnerUser.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        await partnerUser.save();

        const res = await request(app)
            .post('/api/v1/wallet/partner/bank-accounts')
            .set('Authorization', `Bearer ${partnerToken}`)
            .send({
                bankName: 'SBI Bank',
                accountNumber: '1234567890',
                ifsc: 'SBIN0001234',
                accountHolderName: 'Wallet Partner',
                otp: '000000'
            });

        expect(res.statusCode).toBe(401);
        expect(res.body.success).toBe(false);
    });

    it('should allow partner to list their wallet summary and transactions', async () => {
        await Transaction.create({
            partnerId: partnerUser._id,
            type: 'credit',
            amount: 500,
            description: 'Test Job Completion',
            status: 'completed'
        });

        const res = await request(app)
            .get('/api/v1/wallet/partner')
            .set('Authorization', `Bearer ${partnerToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.currentBalance).toBe(500);
    });

    it('should successfully handle and verify Razorpay webhook signatures', async () => {
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'test_secret';
        
        const payloadObj = {
            event: 'payment.captured',
            payload: {
                payment: {
                    entity: {
                        id: 'pay_ABC123xyz',
                        amount: 50000, // Rs 500
                        notes: {
                            partnerId: partnerUser._id.toString()
                        }
                    }
                }
            }
        };

        const payload = JSON.stringify(payloadObj);
        const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

        const res = await request(app)
            .post('/api/v1/payments/webhook')
            .set('x-razorpay-signature', signature)
            .set('Content-Type', 'application/json')
            .send(payload);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);

        // Verify credit transaction was logged in database
        const tx = await Transaction.findOne({ partnerId: partnerUser._id });
        expect(tx).toBeDefined();
        expect(tx.amount).toBe(500);
        expect(tx.type).toBe('credit');
    });

    it('should reject webhook with invalid signature', async () => {
        const payload = JSON.stringify({ event: 'payment.captured' });
        const res = await request(app)
            .post('/api/v1/payments/webhook')
            .set('x-razorpay-signature', 'invalid_signature')
            .set('Content-Type', 'application/json')
            .send(payload);

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
    });
});
