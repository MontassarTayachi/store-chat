const mongoose = require('mongoose');

const WEBHOOK_URL = process.env.WEBHOOK_URL;

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

// Post-save hook to trigger webhook on status changes
orderSchema.post('save', async function(doc) {
    // Check if this is an update by checking if the document has been modified
    if (!this.isNew) {
        // Get the original document from database before this save
        const originalDoc = await this.constructor.findById(this._id);
        
        // Check if status changed
        if (originalDoc && originalDoc.status !== this.status) {
            console.log(`[Webhook] Order ${this._id}: Status changed from ${originalDoc.status} to ${this.status}`);
            
            // Send webhook for status change
            if (WEBHOOK_URL) {
                try {
                    await fetch(WEBHOOK_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            event: 'order_status_changed',
                            order_id: this._id,
                            customer_name: this.customer_name,
                            phone_number: this.phone_number,
                            old_status: originalDoc.status,
                            new_status: this.status,
                            total_amount: this.total_amount,
                            timestamp: new Date()
                        })
                    });
                } catch (err) {
                    console.error('Error sending order status webhook:', err.message);
                }
            }
        }
    }
});

module.exports = mongoose.model('Order', orderSchema, 'orders');
