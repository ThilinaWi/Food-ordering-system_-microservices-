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
    paths: {
        '/users/register': {
            post: {
                summary: 'Register a new user',
                requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, email: { type: 'string' }, password: { type: 'string' } } } } } },
                responses: { '201': { description: 'Created' } }
            }
        },
        '/users/login': {
            post: {
                summary: 'Login user',
                requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' }, password: { type: 'string' } } } } } },
                responses: { '200': { description: 'Success' } }
            }
        },
        '/users/{id}': {
            get: {
                summary: 'Get user profile by ID',
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
                responses: { '200': { description: 'Success' } }
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
