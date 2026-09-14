// src/config/swagger.js
// OpenAPI 3.0 specification for Local PCO API.
// Only mounted in non-production environments (see app.js).

const swaggerJSDoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Local PCO API',
            version: '1.0.0',
            description: 'Backend REST API for the Local PCO field operations platform. Provides endpoints for partner/client authentication, service requests, job management, photo proof verification, wallet operations, and admin controls.',
        },
        servers: [
            {
                url: 'http://localhost:5000',
                description: 'Local Development Server'
            },
            {
                url: 'https://local-pco-backend.vercel.app',
                description: 'Production Server'
            }
        ],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter your JWT access token'
                }
            },
            schemas: {
                SuccessResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        data: { type: 'object' }
                    }
                },
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string', example: 'Error description' }
                    }
                },
                User: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        name: { type: 'string' },
                        phone: { type: 'string' },
                        email: { type: 'string' },
                        role: { type: 'string', enum: ['user', 'admin', 'verifier'] }
                    }
                },
                Partner: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        name: { type: 'string' },
                        phone: { type: 'string' },
                        email: { type: 'string' },
                        serviceCategory: { type: 'string' },
                        isActive: { type: 'boolean' },
                        isOnline: { type: 'boolean' },
                        kycStatus: { type: 'string', enum: ['pending', 'approved', 'rejected'] },
                        averageRating: { type: 'number' }
                    }
                },
                ServiceRequest: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        clientId: { type: 'string' },
                        partnerId: { type: 'string' },
                        serviceName: { type: 'string' },
                        bookingType: { type: 'string', enum: ['instant', 'appointment', 'call_log'] },
                        status: {
                            type: 'string',
                            enum: ['pending', 'accepted', 'reached', 'in_progress', 'completed', 'cancelled']
                        },
                        estimatedCharges: { type: 'number' },
                        finalCharges: { type: 'number' }
                    }
                },
                Transaction: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        partnerId: { type: 'string' },
                        type: { type: 'string', enum: ['credit', 'debit', 'payout', 'bonus'] },
                        amount: { type: 'number' },
                        status: { type: 'string', enum: ['pending', 'completed', 'failed'] }
                    }
                }
            }
        },
        security: [{ BearerAuth: [] }]
    },
    // Pick up JSDoc @swagger annotations from all route files
    apis: ['./src/routes/*.js']
};

const swaggerDocs = swaggerJSDoc(options);

module.exports = swaggerDocs;
