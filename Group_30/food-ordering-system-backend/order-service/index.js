const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const orderRoutes = require('./routes/orderRoutes');

dotenv.config();

const app = express();
app.use(express.json());

// Swagger setup
const swaggerDocument = {
    openapi: '3.0.0',
    info: { title: 'Order Service API', version: '1.0.0' },
    servers: [{ url: 'http://localhost:3003', description: 'Order Service' }],
    paths: {
        '/orders': {
            post: {
                summary: 'Create a new order',
                tags: ['Orders'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    userId: { type: 'string', example: '64a7f3e1b8c2d5e9f1a2b3c4' },
                                    restaurantId: { type: 'string', example: '64a7f3e1b8c2d5e9f1a2b3c5' },
                                    items: { type: 'array', items: { type: 'object' }, example: [{ foodId: '123', quantity: 2 }] },
                                    totalAmount: { type: 'number', example: 250.50 },
                                    location: { type: 'string', example: '123 Main St, City' }
                                },
                                required: ['userId', 'restaurantId', 'items', 'totalAmount', 'location']
                            }
                        }
                    }
                },
                responses: {
                    '201': { description: 'Order created successfully' },
                    '400': { description: 'Validation error' }
                },
                security: [{ bearerAuth: [] }]
            },
            get: {
                summary: 'Get all orders (Admin only)',
                tags: ['Orders'],
                responses: {
                    '200': { description: 'List of all orders' },
                    '403': { description: 'Unauthorized - Admin access required' }
                },
                security: [{ bearerAuth: [] }]
            }
        },
        '/orders/detail/{id}': {
            get: {
                summary: 'Get order details by order ID',
                tags: ['Orders'],
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', example: '64a7f3e1b8c2d5e9f1a2b3c6' }, description: 'Order ID' }],
                responses: {
                    '200': {
                        description: 'Order details retrieved',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        _id: { type: 'string' },
                                        userId: { type: 'string' },
                                        restaurantId: { type: 'string' },
                                        items: { type: 'array', items: { type: 'object', properties: { menuId: { type: 'string' }, name: { type: 'string' }, price: { type: 'number' }, quantity: { type: 'number' } } } },
                                        totalAmount: { type: 'number' },
                                        location: { type: 'string' },
                                        status: { type: 'string', enum: ['Pending', 'Confirmed', 'Preparing', 'Delivered', 'Cancelled'] },
                                        createdAt: { type: 'string', format: 'date-time' },
                                        updatedAt: { type: 'string', format: 'date-time' }
                                    }
                                }
                            }
                        }
                    },
                    '400': { description: 'Invalid order ID format' },
                    '404': { description: 'Order not found' }
                },
                security: [{ bearerAuth: [] }]
            }
        },
        '/orders/{userId}': {
            get: {
                summary: 'Get orders by user ID',
                tags: ['Orders'],
                parameters: [{ in: 'path', name: 'userId', required: true, schema: { type: 'string', example: '64a7f3e1b8c2d5e9f1a2b3c4' } }],
                responses: {
                    '200': { description: 'User orders retrieved' },
                    '400': { description: 'Invalid userId format' },
                    '404': { description: 'No orders found' }
                },
                security: [{ bearerAuth: [] }]
            }
        },
        '/orders/{id}/status': {
            put: {
                summary: 'Update order status (Admin only)',
                tags: ['Orders'],
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', enum: ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Delivered', 'Cancelled'], example: 'Confirmed' }
                                },
                                required: ['status']
                            }
                        }
                    }
                },
                responses: {
                    '200': { description: 'Order status updated' },
                    '404': { description: 'Order not found' }
                },
                security: [{ bearerAuth: [] }]
            }
        },
        '/orders/{id}': {
            delete: {
                summary: 'Delete/Cancel an order',
                tags: ['Orders'],
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', example: '64a7f3e1b8c2d5e9f1a2b3c6' } }],
                responses: {
                    '200': { description: 'Order deleted successfully' },
                    '404': { description: 'Order not found' }
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

app.use('/orders', orderRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3003;

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB (Order DB)');
        app.listen(PORT, () => console.log(`Order Service running on port ${PORT}`));
    })
    .catch(err => console.error('MongoDB connection error:', err));
