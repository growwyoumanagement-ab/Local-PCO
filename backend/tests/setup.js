const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

beforeAll(async () => {
    // Prevent Mongoose auto-indexing triggers from blocking test connection
    mongoose.set('autoIndex', false);

    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
});

afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany();
    }
});

afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
        await mongoServer.stop();
    }
});

// Set test environment secrets
process.env.JWT_SECRET = 'test_jwt_secret_key_12345';
process.env.JWT_REFRESH_SECRET = 'test_jwt_refresh_secret_key_12345';
process.env.RAZORPAY_WEBHOOK_SECRET = 'test_secret';
process.env.NODE_ENV = 'test';

// Mock Cloudinary uploads
jest.mock('../src/utils/uploadService', () => ({
    uploadBase64Image: jest.fn().mockResolvedValue({
        success: true,
        url: 'https://mock-cloudinary.com/image.jpg'
    })
}));
