const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const orderController = require('../controllers/orderController');
const { adminAuth, auth } = require('../middleware/auth');

// Multer setup for receipt uploads
const uploadDir = path.join(__dirname, '../uploads/receipts');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `receipt-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/png', 'image/jpeg', 'application/pdf'];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Only PNG, JPG, and PDF files are allowed'));
        }
        cb(null, true);
    }
});

router.post('/', auth, orderController.createOrder);
router.get('/', adminAuth, orderController.getAllOrders);
router.get('/:userId', auth, orderController.getOrdersByUser);
router.put('/:id/status', adminAuth, orderController.updateOrderStatus);
router.post('/:id/receipt', upload.single('receipt'), orderController.uploadReceipt);

module.exports = router;
