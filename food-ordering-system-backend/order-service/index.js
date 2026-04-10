const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const swaggerUi = require('swagger-ui-express');
const orderRoutes = require('./routes/orderRoutes');

dotenv.config();

const app = express();
app.use(express.json());

// Enable CORS for file downloads
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Download receipt endpoint
app.get('/download/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    console.log('[Download] Requested file:', filename);
    
    // Get the uploads directory path
    const uploadsDir = path.join(__dirname, 'uploads', 'receipts');
    const filepath = path.join(uploadsDir, filename);
    
    console.log('[Download] Uploads dir:', uploadsDir);
    console.log('[Download] Full filepath:', filepath);
    
    // Prevent directory traversal attacks - check if resolved path is within uploads/receipts
    const realpath = path.resolve(filepath);
    const realuploads = path.resolve(uploadsDir);
    
    console.log('[Download] Real path:', realpath);
    console.log('[Download] Real uploads:', realuploads);
    
    if (!realpath.startsWith(realuploads)) {
      console.error('[Download] Security check failed - path outside uploads');
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Check if file exists
    if (!fs.existsSync(filepath)) {
      console.error('[Download] File not found:', filepath);
      // List what's in the directory for debugging
      if (fs.existsSync(uploadsDir)) {
        const files = fs.readdirSync(uploadsDir);
        console.log('[Download] Files in receipts directory:', files);
      } else {
        console.error('[Download] Receipts directory does not exist:', uploadsDir);
      }
      return res.status(404).json({ error: 'Receipt file not found', path: filepath });
    }
    
    console.log('[Download] File found, sending:', filepath);
    res.download(filepath, filename);
  } catch (err) {
    console.error('[Download] Error:', err);
    res.status(500).json({ error: 'Failed to download file', message: err.message });
  }
});

// Swagger setup
const swaggerDocument = {
    openapi: '3.0.0',
    info: { title: 'Order Service API', version: '1.0.0' },
    paths: {
        '/orders': {
            post: { summary: 'Create order', requestBody: { content: { 'application/json': { schema: { type: 'object' } } } }, responses: { '201': { description: 'Created' } } }
        },
        '/orders/{userId}': {
            get: { summary: 'Get orders by user', parameters: [{ in: 'path', name: 'userId', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Success' } } }
        },
        '/orders/{id}/status': {
            put: { summary: 'Update order status', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string' } } } } } }, responses: { '200': { description: 'Success' } } }
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
