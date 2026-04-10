const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const path = require('path');
const restaurantRoutes = require('./routes/restaurantRoutes');
const menuRoutes = require('./routes/menuRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

dotenv.config();

const app = express();
app.use(express.json());

// Swagger setup
const swaggerDocument = {
    openapi: '3.0.0',
    info: { title: 'Restaurant/Menu Service API', version: '1.0.0' },
    servers: [{ url: 'http://localhost:3002', description: 'Restaurant Service' }],
    paths: {
        '/restaurants': {
            post: {
                summary: 'Add a new restaurant with image',
                tags: ['Restaurants'],
                requestBody: {
                    required: true,
                    content: {
                        'multipart/form-data': {
                            schema: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string', example: 'Pizza Palace' },
                                    address: { type: 'string', example: '123 Main St' },
                                    phone: { type: 'string', example: '+1234567890' },
                                    cuisine: { type: 'string', example: 'Italian' },
                                    image: { type: 'string', format: 'binary', description: 'Restaurant image file' }
                                },
                                required: ['name', 'address', 'phone']
                            }
                        }
                    }
                },
                responses: {
                    '201': { description: 'Restaurant created successfully' },
                    '400': { description: 'Validation error' }
                },
                security: [{ bearerAuth: [] }]
            },
            get: {
                summary: 'Get list of all restaurants',
                tags: ['Restaurants'],
                responses: {
                    '200': { description: 'List of restaurants' },
                    '500': { description: 'Server error' }
                }
            }
        },
        '/restaurants/{id}': {
            get: {
                summary: 'Get restaurant details by ID',
                tags: ['Restaurants'],
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
                responses: {
                    '200': { description: 'Restaurant details' },
                    '404': { description: 'Restaurant not found' }
                }
            },
            put: {
                summary: 'Update restaurant details with image',
                tags: ['Restaurants'],
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
                requestBody: {
                    required: true,
                    content: {
                        'multipart/form-data': {
                            schema: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                    address: { type: 'string' },
                                    phone: { type: 'string' },
                                    cuisine: { type: 'string' },
                                    image: { type: 'string', format: 'binary', description: 'Restaurant image file' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '200': { description: 'Restaurant updated' },
                    '404': { description: 'Restaurant not found' }
                },
                security: [{ bearerAuth: [] }]
            },
            delete: {
                summary: 'Delete a restaurant',
                tags: ['Restaurants'],
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
                responses: {
                    '200': { description: 'Restaurant deleted' },
                    '404': { description: 'Restaurant not found' }
                },
                security: [{ bearerAuth: [] }]
            }
        },
        '/menu': {
            post: {
                summary: 'Add a new menu item with image',
                tags: ['Menu'],
                requestBody: {
                    required: true,
                    content: {
                        'multipart/form-data': {
                            schema: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string', example: 'Margherita Pizza' },
                                    description: { type: 'string' },
                                    price: { type: 'number', example: 12.99 },
                                    restaurantId: { type: 'string' },
                                    categoryId: { type: 'string' },
                                    image: { type: 'string', format: 'binary', description: 'Menu item image file' }
                                },
                                required: ['name', 'price', 'restaurantId']
                            }
                        }
                    }
                },
                responses: {
                    '201': { description: 'Menu item created' },
                    '400': { description: 'Validation error' }
                },
                security: [{ bearerAuth: [] }]
            }
        },
        '/menu/{restaurantId}': {
            get: {
                summary: 'Get menu items by restaurant',
                tags: ['Menu'],
                parameters: [{ in: 'path', name: 'restaurantId', required: true, schema: { type: 'string' } }],
                responses: {
                    '200': { description: 'Menu items retrieved' },
                    '404': { description: 'No menu items found' }
                }
            }
        },
        '/menu/{id}': {
            put: {
                summary: 'Update menu item with image',
                tags: ['Menu'],
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
                requestBody: {
                    required: true,
                    content: {
                        'multipart/form-data': {
                            schema: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                    description: { type: 'string' },
                                    price: { type: 'number' },
                                    image: { type: 'string', format: 'binary', description: 'Menu item image file' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '200': { description: 'Menu item updated' },
                    '404': { description: 'Menu item not found' }
                },
                security: [{ bearerAuth: [] }]
            },
            delete: {
                summary: 'Delete menu item',
                tags: ['Menu'],
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
                responses: {
                    '200': { description: 'Menu item deleted' },
                    '404': { description: 'Menu item not found' }
                },
                security: [{ bearerAuth: [] }]
            }
        },
        '/categories': {
            post: {
                summary: 'Add a new category',
                tags: ['Categories'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { type: 'object', properties: { name: { type: 'string', example: 'Appetizers' }, description: { type: 'string' } }, required: ['name'] }
                        }
                    }
                },
                responses: {
                    '201': { description: 'Category created' },
                    '400': { description: 'Validation error' }
                },
                security: [{ bearerAuth: [] }]
            },
            get: {
                summary: 'Get all categories',
                tags: ['Categories'],
                responses: {
                    '200': { description: 'List of categories' }
                }
            }
        },
        '/categories/{id}': {
            put: {
                summary: 'Update category',
                tags: ['Categories'],
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { type: 'object', properties: { name: { type: 'string' }, description: { type: 'string' } } }
                        }
                    }
                },
                responses: {
                    '200': { description: 'Category updated' },
                    '404': { description: 'Category not found' }
                },
                security: [{ bearerAuth: [] }]
            },
            delete: {
                summary: 'Delete category',
                tags: ['Categories'],
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
                responses: {
                    '200': { description: 'Category deleted' },
                    '404': { description: 'Category not found' }
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

app.use('/uploads', express.static('uploads'));
app.use('/categories', categoryRoutes);
app.use('/restaurants', restaurantRoutes);
app.use('/menu', menuRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3002;

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB (Restaurant DB)');
        app.listen(PORT, () => console.log(`Restaurant Service running on port ${PORT}`));
    })
    .catch(err => console.error('MongoDB connection error:', err));
