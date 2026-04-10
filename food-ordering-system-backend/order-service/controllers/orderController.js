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
        
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Store the file path in the order
        const receiptPath = `/uploads/receipts/${req.file.filename}`;
        order.paymentReceipt = receiptPath;
        await order.save();

        res.json({ 
            message: 'Receipt uploaded successfully',
            receipt: receiptPath,
            order
        });
    } catch (err) {
        next(err);
    }
};
