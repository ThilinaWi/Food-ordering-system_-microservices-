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
    paths: {
        '/payments': {
            post: { summary: 'Process payment', requestBody: { content: { 'application/json': { schema: { type: 'object' } } } }, responses: { '201': { description: 'Created' } } }
        },
        '/payments/{orderId}': {
            get: { summary: 'Get payment by order', parameters: [{ in: 'path', name: 'orderId', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Success' } } }
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
