const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));


// Logging middleware
app.use((req, res, next) => {
    console.log(`[API Gateway] ${req.method} ${req.originalUrl}`);
    next();
});

// Helper for Proxy Middleware Options
const createOptions = (target, resource) => ({
    target,
    changeOrigin: true,
    pathFilter: `/api/${resource}`, // Do not mount with Express, instead filter internally
    pathRewrite: {
        [`^/api/${resource}`]: `/${resource}`
    },
    logger: console,
    on: {
        proxyReq: (proxyReq, req, res) => {
            console.log(`[Proxy] ${req.method} ${req.originalUrl} -> ${target}${proxyReq.path}`);
        },
        error: (err, req, res) => {
            console.error(`[Proxy Error] -> ${target}`, err.message);
        }
    }
});

// Proxy routes - using app.use globally but relying on pathFilter to segregate traffic
app.use(createProxyMiddleware(createOptions('http://localhost:3001', 'users')));
app.use(createProxyMiddleware(createOptions('http://localhost:3002', 'categories')));
app.use(createProxyMiddleware(createOptions('http://localhost:3002', 'restaurants')));

// Explicitly map /uploads (static path) directly through, bypassing the /api path filter
app.use('/uploads', createProxyMiddleware({
    target: 'http://localhost:3002',
    changeOrigin: true,
    logger: console
}));

app.use(createProxyMiddleware(createOptions('http://localhost:3002', 'menu')));
app.use(createProxyMiddleware(createOptions('http://localhost:3003', 'orders')));
app.use(createProxyMiddleware(createOptions('http://localhost:3004', 'payments')));

// Enable json parsing for Gateway-specific default routes
app.use(express.json());

// Default route
app.get('/', (req, res) => {
    res.send('API Gateway is running. Use /api/... to access microservices.');
});

// Generic error handler
app.use((err, req, res, next) => {
    console.error('[API Gateway Error]:', err);
    res.status(500).json({ error: 'Gateway Error' });
});

app.listen(PORT, () => {
    console.log(`API Gateway is running on port ${PORT}`);
});
