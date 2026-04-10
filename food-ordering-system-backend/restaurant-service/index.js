const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const path = require('path');
const restaurantRoutes = require('./routes/restaurantRoutes');
const menuRoutes = require('./routes/menuRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

dotenv.config();

const app = express();

// Enable CORS for all origins
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Swagger setup
const swaggerDocument = {
    openapi: '3.0.0',
    info: { title: 'Restaurant/Menu Service API', version: '1.0.0' },
    paths: {
        '/restaurants': {
            post: { summary: 'Add a restaurant', requestBody: { content: { 'application/json': { schema: { type: 'object' } } } }, responses: { '201': { description: 'Created' } } },
            get: { summary: 'Get list of restaurants', responses: { '200': { description: 'Success' } } }
        },
        '/menu': {
            post: { summary: 'Add a menu item', requestBody: { content: { 'application/json': { schema: { type: 'object' } } } }, responses: { '201': { description: 'Created' } } }
        },
        '/menu/{restaurantId}': {
            get: { summary: 'Get menu by restaurant', parameters: [{ in: 'path', name: 'restaurantId', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Success' } } }
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
