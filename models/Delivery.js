const mongoose = require('mongoose');

const WEBHOOK_URL = process.env.WEBHOOK_URL;

const deliverySchema = new mongoose.Schema({
    order_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    status: {
        type: String,
        enum: ['Preparing', 'Shipped', 'In Transit', 'Out for Delivery', 'Delivered'],
        default: 'Preparing'
    },
    location: {
        type: String,
        default: 'Warehouse',
        trim: true
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

// Post-save hook to trigger webhook on status or location changes
deliverySchema.post('save', async function(doc) {
    // Check if this is an update by checking if the document has been modified
    if (!this.isNew) {
        // Get the original document from database before this save
        const originalDoc = await this.constructor.findById(this._id);
        
        // Check if status changed
        if (originalDoc && originalDoc.status !== this.status) {
            console.log(`[Webhook] Delivery ${this._id}: Status changed from ${originalDoc.status} to ${this.status}`);
            
            // Send webhook for status change
            if (WEBHOOK_URL) {
                try {
                    await fetch(WEBHOOK_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            event: 'delivery_status_changed',
                            delivery_id: this._id,
                            old_status: originalDoc.status,
                            new_status: this.status,
                            timestamp: new Date()
                        })
                    });
                } catch (err) {
                    console.error('Error sending status webhook:', err.message);
                }
            }
        }
        
        // Check if location changed
        if (originalDoc && originalDoc.location !== this.location) {
            console.log(`[Webhook] Delivery ${this._id}: Location changed from ${originalDoc.location} to ${this.location}`);
            
            // Send webhook for location change
            if (WEBHOOK_URL) {
                try {
                    await fetch(WEBHOOK_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            event: 'delivery_location_changed',
                            delivery_id: this._id,
                            old_location: originalDoc.location,
                            new_location: this.location,
                            timestamp: new Date()
                        })
                    });
                } catch (err) {
                    console.error('Error sending location webhook:', err.message);
                }
            }
        }
    }
});

module.exports = mongoose.model('Delivery', deliverySchema, 'deliveries');
