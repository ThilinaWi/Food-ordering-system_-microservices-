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

exports.updatePaymentStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        if (!status) {
            return res.status(400).json({ error: 'Status is required' });
        }
        
        const payment = await Payment.findByIdAndUpdate(id, { status }, { new: true });
        if (!payment) return res.status(404).json({ error: 'Payment not found' });
        
        res.json({ message: 'Payment status updated successfully', payment });
    } catch (err) {
        next(err);
    }
};

exports.deletePayment = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const payment = await Payment.findByIdAndDelete(id);
        if (!payment) return res.status(404).json({ error: 'Payment not found' });
        
        res.json({ message: 'Payment deleted successfully' });
    } catch (err) {
        next(err);
    }
};
