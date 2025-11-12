const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');

// GET all orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().populate('items.product_id');
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET order by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product_id');
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE a new order
router.post('/', async (req, res) => {
  try {
    const { customer_name, items, status } = req.body;

    if (!customer_name || !items || items.length === 0) {
      return res.status(400).json({ error: 'Missing required fields: customer_name, items' });
    }

    // Calculate total amount
    let total_amount = 0;
    for (const item of items) {
      const product = await Product.findById(item.product_id);
      if (!product) {
        return res.status(404).json({ error: `Product with ID ${item.product_id} not found` });
      }
      // Use provided price or get from product
      const price = item.price || product.price;
      total_amount += price * item.quantity;
    }

    const newOrder = new Order({
      customer_name,
      items,
      total_amount,
      status: status || 'Pending'
    });

    const savedOrder = await newOrder.save();
    const populatedOrder = await savedOrder.populate('items.product_id');
    res.status(201).json(populatedOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE an order
router.put('/:id', async (req, res) => {
  try {
    const { customer_name, items, status } = req.body;

    // If items are being updated, recalculate total
    let updateData = { customer_name, status, updatedAt: Date.now() };

    if (items) {
      let total_amount = 0;
      for (const item of items) {
        const product = await Product.findById(item.product_id);
        if (!product) {
          return res.status(404).json({ error: `Product with ID ${item.product_id} not found` });
        }
        const price = item.price || product.price;
        total_amount += price * item.quantity;
      }
      updateData.items = items;
      updateData.total_amount = total_amount;
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('items.product_id');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE an order
router.delete('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.status(200).json({ message: 'Order deleted successfully', order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
