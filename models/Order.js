const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customer_name: {
        type: String,
        trim: true
    },
    phone_number: {
        type: String,
        trim: true
    },
    shipping_address: {
        type: String,
        trim: true
    },
    customer_fb_id: {
        type: String,
        trim: true
    },
    order_date: {
        type: Date,
        default: Date.now
    },
    // multiple products
    items: [
        {
            ref: {
                type: String,
                required: true
            },
            quantity: {
                type: Number,
                min: 1
            },
            price: {
                type: Number
            }
        }
    ],
    status: {
        type: String,
        enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending'
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

// Virtual field to calculate total_amount from items
orderSchema.virtual('total_amount').get(function() {
    if (!this.items || this.items.length === 0) {
        return 0;
    }
    return this.items.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
    }, 0);
});

// Ensure virtuals are included in JSON serialization
orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Order', orderSchema, 'orders');
