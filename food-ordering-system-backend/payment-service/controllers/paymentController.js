const Payment = require('../models/Payment');

exports.processPayment = async (req, res, next) => {
    try {
        const { orderId, amount } = req.body;
        if (!orderId || amount === undefined) {
             return res.status(400).json({ error: 'OrderId and amount are required' });
        }

        // Mocking payment processing
        const status = Math.random() > 0.1 ? 'Success' : 'Failed'; 
        
        const payment = new Payment({ orderId, amount, status });
        await payment.save();
        
        res.status(201).json(payment);
    } catch (err) {
        next(err);
    }
};

exports.getPaymentByOrder = async (req, res, next) => {
    try {
        const { orderId } = req.params;
        const payments = await Payment.find({ orderId });
        res.json(payments);
    } catch (err) {
        next(err);
    }
};
