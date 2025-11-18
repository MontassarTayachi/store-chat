const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');

router.get('/', async (req, res) => {
  try {
    // Build filter object from query parameters
    const filter = {};
    for (const [key, value] of Object.entries(req.query)) {
      // Ignore parameters with null value or 'null' string
      if (value !== null && value !== 'null' && value !== '') {
        filter[key] = value;
      }
    }

    const orders = await Order.find(filter);
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const {
      customer_name,
      phone_number,
      shipping_address,
      customer_fb_id,
      items,
      status
    } = req.body;

    // Validate required fields
    if (!customer_name || !items || items.length === 0) {
      return res.status(400).json({ 
        error: 'Missing required fields: customer_name, items (non-empty array)' 
      });
    }

    // Validate items and set prices from products if not provided
    for (const item of items) {
      if (!item.ref || item.quantity === undefined) {
        return res.status(400).json({ 
          error: 'Each item must have ref and quantity' 
        });
      }

      const product = await Product.findOne({ reference: item.ref });
      if (!product) {
        return res.status(404).json({ error: `Product with reference ${item.ref} not found` });
      }
      
      // Use provided price or get from product
      if (!item.price) {
        item.price = product.price;
      }
    }

    const newOrder = new Order({
      customer_name,
      phone_number,
      shipping_address,
      customer_fb_id,
      items,
      status: status || 'Pending'
    });

    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const {
      customer_name,
      phone_number,
      shipping_address,
      customer_fb_id,
      items,
      status
    } = req.body;

    let updateData = {
      updatedAt: Date.now()
    };

    // Add fields if provided
    if (customer_name !== undefined) updateData.customer_name = customer_name;
    if (phone_number !== undefined) updateData.phone_number = phone_number;
    if (shipping_address !== undefined) updateData.shipping_address = shipping_address;
    if (customer_fb_id !== undefined) updateData.customer_fb_id = customer_fb_id;
    if (status !== undefined) updateData.status = status;

    // If items are being updated, validate and set prices
    if (items && items.length > 0) {
      for (const item of items) {
        if (!item.ref || item.quantity === undefined) {
          return res.status(400).json({ 
            error: 'Each item must have ref and quantity' 
          });
        }

        const product = await Product.findOne({ reference: item.ref });
        if (!product) {
          return res.status(404).json({ error: `Product with reference ${item.ref} not found` });
        }
      }
      updateData.items = items;
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH an order (partial update, mainly for status updates)
router.patch('/:id', async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const validStatuses = ['Pending', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

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
