const mongoose = require('mongoose');

const reclamationSchema = new mongoose.Schema({
    customer_name: {
        type: String,
        trim: true,
        required: true,
    },
    customer_fb_id: {
        type: String,
        trim: true,
        required: true,
    },
    issue_description: { // the client issue reclamed
        type: String,
        trim: true,
        required: true,
    },
    response: { // the website admin response
        type: String,
        trim: true,
    },
    status: {
        type: String,
        enum: ['Open', 'In Progress', 'Closed'],
        default: 'Open',
    },
    order: { // a reclamation does not have to be related to an order, so it's not required
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
    },
    reclamation_date: {
        type: Date,
        default: Date.now
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
