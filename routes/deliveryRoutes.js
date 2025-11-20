const express = require('express');
const router = express.Router();
const Delivery = require('../models/Delivery.js');
const Order = require('../models/Order.js');

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

        const deliveries = await Delivery.find(filter).populate('order_id');
        res.status(200).json(deliveries);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        // Try to find by reference first, then by MongoDB ID
        let delivery = await Delivery.findOne({ reference: req.params.id }).populate('order_id');
        
        if (!delivery) {
            delivery = await Delivery.findById(req.params.id).populate('order_id');
        }
        
        if (!delivery) {
            return res.status(404).json({ error: 'Delivery not found' });
        }
        res.status(200).json(delivery);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/phone/:phone_number', async (req, res) => {
    try {
        // Find orders by phone number, then find their deliveries
        const orders = await Order.find({
            phone_number: req.params.phone_number
        });

        if (!orders || orders.length === 0) {
            return res.status(404).json({ error: 'No orders found for this phone number' });
        }

        const orderIds = orders.map(order => order._id);
        const deliveries = await Delivery.find({
            order_id: { $in: orderIds }
        }).populate('order_id');

        if (!deliveries || deliveries.length === 0) {
            return res.status(404).json({ error: 'No deliveries found for this phone number' });
        }

        res.status(200).json(deliveries);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { order_id, reference, status, location } = req.body;

        if (!order_id) {
            return res.status(400).json({ error: 'Missing required field: order_id' });
        }

        // Verify order exists
        const order = await Order.findById(order_id);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const newDelivery = new Delivery({
            reference,
            order_id,
            status: status || 'Preparing',
            location: location || 'Warehouse'
        });

        const savedDelivery = await newDelivery.save();
        const populatedDelivery = await savedDelivery.populate('order_id');
        res.status(201).json(populatedDelivery);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { status, location } = req.body;

        const updateData = {
            updatedAt: Date.now()
        };

        if (status !== undefined) updateData.status = status;
        if (location !== undefined) updateData.location = location;

        const delivery = await Delivery.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).populate('order_id');

        if (!delivery) {
            return res.status(404).json({ error: 'Delivery not found' });
        }

        res.status(200).json(delivery);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const delivery = await Delivery.findByIdAndDelete(req.params.id);

        if (!delivery) {
            return res.status(404).json({ error: 'Delivery not found' });
        }

        res.status(200).json({ message: 'Delivery deleted successfully', delivery });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
