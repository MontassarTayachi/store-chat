const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customer_name: {
        type: String,
        trim: true,
        required: true,
    },
    phone_number: {
        type: String,
        trim: true,
        required: true,
    },
    shipping_address: {
        type: String,
        trim: true,
        required: true,
    },
    customer_fb_id: {
        type: String,
        trim: true,
        required: true,
    },
    order_date: {
        type: Date,
        default: Date.now
    },
    // multiple products
    items: [
        {
            product_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
                min: 1,
            },
            price: {
                type: Number,
                required: true,
            }
        }
    ],
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Cancelled'],
        default: 'Pending',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }
});

// Virtual field to calculate total_amount from items
orderSchema.virtual('total_amount').get(() => {
    if (!this.items || this.items.length === 0) return 0;
    return this.items.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
    }, 0);
});

// Ensure virtuals are included in JSON serialization
orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Order', orderSchema, 'orders');
