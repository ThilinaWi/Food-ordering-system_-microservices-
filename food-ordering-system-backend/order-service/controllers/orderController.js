const Order = require('../models/Order');

exports.createOrder = async (req, res, next) => {
    try {
        const { userId, restaurantId, items, totalAmount, location } = req.body;
        if (!userId || !restaurantId || !items || totalAmount === undefined || !location) {
             return res.status(400).json({ error: 'Missing required order fields including location' });
        }

        const order = new Order({ userId, restaurantId, items, totalAmount, location });
        await order.save();
        res.status(201).json(order);
    } catch (err) {
        next(err);
    }
};

exports.getAllOrders = async (req, res, next) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) { next(err); }
};

exports.getOrdersByUser = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const mongoose = require('mongoose');
        
        console.log(`[Order Service backend] GET /orders/${userId}`);

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: 'Invalid userId format' });
        }

        const orders = await Order.find({ userId });
        res.json(orders);
    } catch (err) {
        next(err);
    }
};

exports.updateOrderStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
        if (!order) return res.status(404).json({ error: 'Order not found' });
        
        res.json(order);
    } catch (err) {
        next(err);
    }
};

exports.uploadReceipt = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        console.log('[uploadReceipt] Order ID:', id);
        console.log('[uploadReceipt] File object:', req.file);
        console.log('[uploadReceipt] File path:', req.file?.path);
        console.log('[uploadReceipt] File filename:', req.file?.filename);

        if (!req.file) {
            console.error('[uploadReceipt] No file uploaded');
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const order = await Order.findById(id);
        if (!order) {
            console.error('[uploadReceipt] Order not found:', id);
            return res.status(404).json({ error: 'Order not found' });
        }

        // Store just the filename for the download endpoint
        const filename = req.file.filename;
        order.paymentReceipt = filename;
        await order.save();

        console.log('[uploadReceipt] Receipt saved with filename:', filename);

        res.json({ 
            message: 'Receipt uploaded successfully',
            receipt: filename,
            order
        });
    } catch (err) {
        console.error('[uploadReceipt] Error:', err);
        next(err);
    }
};
