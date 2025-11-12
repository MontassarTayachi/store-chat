const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Orders',
    required: true
  },
  tracking_number: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  delivery_status: {
    type: String,
    enum: ['Preparing', 'Shipped', 'In Transit', 'Out for Delivery', 'Delivered'],
    default: 'Preparing'
  },
  estimated_arrival: {
    type: Date
  },
  delivered_date: {
    type: Date
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
