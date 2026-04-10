const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const paymentRoutes = require('./routes/paymentRoutes');

dotenv.config();

const app = express();
app.use(express.json());

// Swagger setup
const swaggerDocument = {
    openapi: '3.0.0',
    info: { title: 'Payment Service API', version: '1.0.0' },
    servers: [{ url: 'http://localhost:3004', description: 'Payment Service' }],
    paths: {
        '/payments': {
            post: {
                summary: 'Process a new payment',
                tags: ['Payments'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    orderId: { type: 'string', example: '64a7f3e1b8c2d5e9f1a2b3c6' },
                                    amount: { type: 'number', example: 250.50 }
                                },
                                required: ['orderId', 'amount']
                            }
                        }
                    }
                },
                responses: {
                    '201': { description: 'Payment processed successfully' },
                    '400': { description: 'Validation error' }
                },
                security: [{ bearerAuth: [] }]
            }
        },
        '/payments/{orderId}': {
            get: {
                summary: 'Get payment details by order ID',
                tags: ['Payments'],
                parameters: [{ in: 'path', name: 'orderId', required: true, schema: { type: 'string', example: '64a7f3e1b8c2d5e9f1a2b3c6' } }],
                responses: {
                    '200': { description: 'Payment details retrieved' },
                    '404': { description: 'Payment not found' }
                },
                security: [{ bearerAuth: [] }]
            }
        },
        '/payments/{id}': {
            put: {
                summary: 'Update payment status',
                tags: ['Payments'],
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', enum: ['Success', 'Failed', 'Pending', 'Refunded'], example: 'Success' }
                                },
                                required: ['status']
                            }
                        }
                    }
                },
                responses: {
                    '200': { description: 'Payment status updated' },
                    '400': { description: 'Validation error' },
                    '404': { description: 'Payment not found' }
                },
                security: [{ bearerAuth: [] }]
            },
            delete: {
                summary: 'Delete payment record',
                tags: ['Payments'],
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', example: '64a7f3e1b8c2d5e9f1a2b3c8' } }],
                responses: {
                    '200': { description: 'Payment deleted successfully' },
                    '404': { description: 'Payment not found' }
                },
                security: [{ bearerAuth: [] }]
            }
        }
    },
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
            }
        }
    }
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/payments', paymentRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3004;

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB (Payment DB)');
        app.listen(PORT, () => console.log(`Payment Service running on port ${PORT}`));
    })
    .catch(err => console.error('MongoDB connection error:', err));
