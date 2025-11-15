const mongoose = require('mongoose');

const reclamationSchema = new mongoose.Schema({
    customer_fb_id: {
        type: String,
        trim: true
    },
    order_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    issue_description: {
        type: String,
        trim: true
    },
    reclamation_date: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
        default: 'Open'
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

module.exports = mongoose.model('Reclamation', reclamationSchema, 'reclamations');
