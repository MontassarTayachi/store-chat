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
        const delivery = await Delivery.findById(req.params.id).populate('order_id');
        if (!delivery) {
            return res.status(404).json({ error: 'Delivery not found' });
        }
        res.status(200).json(delivery);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/track/:tracking_number', async (req, res) => {
    try {
        const delivery = await Delivery.findOne({
            tracking_number: req.params.tracking_number
        }).populate('order_id');

        if (!delivery) {
            return res.status(404).json({ error: 'Delivery not found' });
        }
        res.status(200).json(delivery);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { order_id, tracking_number, delivery_status, estimated_arrival } = req.body;

        if (!order_id) {
            return res.status(400).json({ error: 'Missing required field: order_id' });
        }

        // Verify order exists
        const order = await Order.findById(order_id);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const newDelivery = new Delivery({
            order_id,
            tracking_number,
            delivery_status: delivery_status || 'Preparing',
            estimated_arrival
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
        const { delivery_status, estimated_arrival, delivered_date } = req.body;

        const delivery = await Delivery.findByIdAndUpdate(
            req.params.id,
            {
                delivery_status,
                estimated_arrival,
                delivered_date,
                updatedAt: Date.now()
            },
            { new: true, runValidators: true }
        ).populate('order_id');

        if (!delivery) {
            return res.status(404).json({ error: 'Delivery not found' });
        }

        // If delivery is marked as delivered, update order status
        if (delivery_status === 'Delivered' && delivery.order_id) {
            await Order.findByIdAndUpdate(delivery.order_id, { status: 'Delivered' });
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
