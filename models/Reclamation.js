const mongoose = require('mongoose');

const reclamationSchema = new mongoose.Schema({
    reference: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
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
    discussion: {
        type: [
            {
                message: {
                    type: String,
                    trim: true,
                    required: true,
                },
                sender: {
                    type: String,
                    enum: ['Client', 'Admin'],
                    required: true,
                },
                timestamp: {
                    type: Date,
                    default: Date.now,
                },
            }
        ],
        validate: {
            validator: function (arr) {
                return arr.length >= 1;
            },
            message: 'At least one message is required.'
        }
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

reclamationSchema.methods.addMessage = function(messageText, sender) {
    this.discussion.push({
        message: messageText,
        sender: sender,
        timestamp: Date.now(),
    });
}

reclamationSchema.virtual('needs_answer').get(function() {
    if (this.discussion.length === 0) return true;
    const lastMessage = this.discussion[this.discussion.length - 1];
    return lastMessage.sender === 'Client';
});

reclamationSchema.set('toJSON', { virtuals: true });
reclamationSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Reclamation', reclamationSchema, 'reclamations');
