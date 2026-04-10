const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    restaurantId: { type: String, required: true },
    items: [{
        menuId: String,
        name: String,
        price: Number,
        quantity: Number
    }],
    totalAmount: { type: Number, required: true },
    location: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Confirmed', 'Preparing', 'Delivered', 'Cancelled'], default: 'Pending' },
    paymentReceipt: { type: String, default: null } // File path or URL of uploaded receipt
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
