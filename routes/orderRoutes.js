const express = require('express');

const Order = require('../models/Order.js');
const Product = require('../models/Product.js');
const ReferenceGenerator = require('../models/ReferenceGenerator.js');
const { getFilter, sendWebhook } = require('../utils/utils.js');

const router = express.Router();

router.get('/', (req, res) => {
    const filter = getFilter(req.query);
    Order.find(filter)
        .populate('items.product_id')
        .then(orders => res.status(200).json(orders))
        .catch(err => res.status(500).json({ error: err.message }));
});

router.get('/:id', (req, res) => {
    Order.findById(req.params.id)
        .populate('items.product_id')
        .then(order => {
            if (!order) return res.status(404).json({ error: 'Order not found' });
            res.status(200).json(order);
        })
        .catch(err => res.status(500).json({ error: err.message }));
});

async function validateProductsExistance(req, res, next) {
    if (!req.body.items) return next();
    const productIds = req.body.items.map(item => item.product_id);
    try {
        const count = await Product.countDocuments({ _id: { $in: productIds } });
        if (count !== productIds.length) {
            return res.status(400).json({ error: 'One or more product_id values do not reference existing products.' });
        }
        next();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

router.post('/', validateProductsExistance, async (req, res) => {
    try {
        const referenceValue = await ReferenceGenerator.getNextReference('Order');
        const reference = `ORD-${referenceValue}`;
        const newOrder = new Order({ ...req.body, reference });
        const savedOrder = await newOrder.save();
        res.status(201).json(savedOrder);
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
});

router.put('/:id', validateProductsExistance, async (req, res) => {
    let order = null;
    try {
        const updates = { ...req.body, updatedAt: Date.now() };
        const options = { new: true, runValidators: true };
        order = await Order.findByIdAndUpdate(req.params.id, updates, options);
        if (!order) return res.status(404).json({ error: 'Order not found' });
        res.status(200).json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

    if (req.body.status) {
        await sendWebhook({
            event: 'order_status_changed',
            order,
        });

        // send a request for itself to create a new delivery
        await fetch('http://localhost:5000/deliveries', { // TODO: make the link not hardcoded
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                order_id: order._id
            })
        })
    }
});

router.delete('/:id', (req, res) => {
    Order.findByIdAndDelete(req.params.id)
        .then(order => {
            if (!order) return res.status(404).json({ error: 'Order not found' });
            res.status(200).json({ message: 'Order deleted successfully', order });
        })
        .catch(err => res.status(500).json({ error: err.message }));
});

module.exports = router;
