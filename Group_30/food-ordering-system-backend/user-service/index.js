const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const userRoutes = require('./routes/userRoutes');

dotenv.config();

const app = express();
app.use(express.json());

// Swagger setup
const swaggerDocument = {
    openapi: '3.0.0',
    info: { title: 'User Service API', version: '1.0.0' },
    servers: [{ url: 'http://localhost:3001', description: 'User Service' }],
    paths: {
        '/users/register': {
            post: {
                summary: 'Register a new user',
                tags: ['Auth'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string', example: 'John Doe' },
                                    email: { type: 'string', example: 'john@example.com' },
                                    password: { type: 'string', example: 'password123' }
                                },
                                required: ['name', 'email', 'password']
                            }
                        }
                    }
                },
                responses: {
                    '201': { description: 'User registered successfully' },
                    '400': { description: 'Validation error' }
                }
            }
        },
        '/users/login': {
            post: {
                summary: 'Login user',
                tags: ['Auth'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    email: { type: 'string', example: 'john@example.com' },
                                    password: { type: 'string', example: 'password123' }
                                },
                                required: ['email', 'password']
                            }
                        }
                    }
                },
                responses: {
                    '200': { description: 'Login successful, returns token' },
                    '401': { description: 'Invalid credentials' }
                }
            }
        },
        '/users/{id}': {
            get: {
                summary: 'Get user profile by ID',
                tags: ['Users'],
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', example: '64a7f3e1b8c2d5e9f1a2b3c4' } }],
                responses: {
                    '200': { description: 'User profile retrieved' },
                    '404': { description: 'User not found' }
                }
            },
            put: {
                summary: 'Update user profile',
                tags: ['Users'],
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string', example: 'Jane Doe' },
                                    email: { type: 'string', example: 'jane@example.com' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '200': { description: 'Profile updated successfully' },
                    '400': { description: 'Validation error' },
                    '404': { description: 'User not found' }
                },
                security: [{ bearerAuth: [] }]
            },
            delete: {
                summary: 'Delete user account',
                tags: ['Users'],
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
                responses: {
                    '200': { description: 'User account deleted successfully' },
                    '404': { description: 'User not found' }
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

// Make sure to match the API Gateway rewrite path if not handled correctly.
// The Gateway rewrites /api/users to /users
app.use('/users', userRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3001;

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB (User DB)');
        app.listen(PORT, () => console.log(`User Service running on port ${PORT}`));
    })
    .catch(err => console.error('MongoDB connection error:', err));
