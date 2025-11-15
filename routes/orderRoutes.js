const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');

// GET all orders
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
    
    const orders = await Order.find(filter).populate('items.product_id');
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
    const { 
      customer_name, 
      phone_number, 
      shipping_address, 
      customer_fb_id,
      quantity,
      product_id,
      items, 
      status 
    } = req.body;

    // Support both single product and multiple items
    let total_amount = 0;
    let orderData = {
      customer_name,
      phone_number,
      shipping_address,
      customer_fb_id,
      status: status || 'Pending'
    };

    // Handle multiple items (array)
    if (items && items.length > 0) {
      if (!customer_name) {
        return res.status(400).json({ error: 'Missing required field: customer_name' });
      }

      // Calculate total amount for items
      for (const item of items) {
        const product = await Product.findById(item.product_id);
        if (!product) {
          return res.status(404).json({ error: `Product with ID ${item.product_id} not found` });
        }
        // Use provided price or get from product
        const price = item.price || product.price;
        total_amount += price * item.quantity;
      }
      orderData.items = items;
      orderData.total_amount = total_amount;
    }
    // Handle single product order
    else if (product_id && quantity) {
      if (!customer_name) {
        return res.status(400).json({ error: 'Missing required field: customer_name' });
      }

      const product = await Product.findById(product_id);
      if (!product) {
        return res.status(404).json({ error: `Product with ID ${product_id} not found` });
      }

      total_amount = product.price * quantity;
      orderData.product_id = product_id;
      orderData.quantity = quantity;
      orderData.total_amount = total_amount;
    }
    // No items or product specified
    else {
      return res.status(400).json({ 
        error: 'Missing required fields: either items array or (product_id + quantity)' 
      });
    }

    const newOrder = new Order(orderData);
    const savedOrder = await newOrder.save();
    const populatedOrder = await savedOrder.populate('items.product_id product_id');
    res.status(201).json(populatedOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE an order
router.put('/:id', async (req, res) => {
  try {
    const { 
      customer_name, 
      phone_number, 
      shipping_address, 
      customer_fb_id,
      quantity,
      product_id,
      items, 
      status 
    } = req.body;

    let updateData = { 
      customer_name, 
      phone_number, 
      shipping_address, 
      customer_fb_id,
      status, 
      updatedAt: Date.now() 
    };

    // If items are being updated, recalculate total
    if (items && items.length > 0) {
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
    // If single product is being updated
    else if (product_id && quantity) {
      const product = await Product.findById(product_id);
      if (!product) {
        return res.status(404).json({ error: `Product with ID ${product_id} not found` });
      }
      updateData.product_id = product_id;
      updateData.quantity = quantity;
      updateData.total_amount = product.price * quantity;
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('items.product_id product_id');

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
