const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
    reference: {
        type: String,
        unique: true,
        required: true,
        trim: true,
    },
    order_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
    },
    status: {
        type: String,
        enum: ['Preparing', 'Shipped', 'In Transit', 'Out for Delivery', 'Delivered'],
        default: 'Preparing',
        required: true,
    },
    current_location: {
        type: String,
        default: 'Warehouse',
        trim: true,
    },
    shipping_company: {
        type: String,
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Delivery', deliverySchema, 'deliveries');
