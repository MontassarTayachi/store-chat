const express = require('express');
const Delivery = require('../models/Delivery.js');
const Order = require('../models/Order.js');
const ReferenceGenerator = require('../models/ReferenceGenerator.js');
const { getFilter, sendWebhook } = require('../utils/utils.js');

const router = express.Router();

router.get('/', (req, res) => {
    const filter = getFilter(req.query);
    Delivery.find(filter)
        .populate('order_id')
        .then(deliveries => res.status(200).json(deliveries))
        .catch(err => res.status(500).json({ error: err.message }));
});

router.get('/:id', (req, res) => {
    Delivery.findById(req.params.id)
        .populate('order_id')
        .then(delivery => {
            if (!delivery) return res.status(404).json({ error: 'Delivery not found' });
            res.status(200).json(delivery);
        })
        .catch(err => res.status(500).json({ error: err.message }));
});

async function validateOrderExistance(req, res, next) {
    if (!req.body.order_id) return next();
    try {
        const order = await Order.findById(req.body.order_id);
        if (!order) return res.status(404).json({ error: 'Order not found' });
        next();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

router.post('/', validateOrderExistance, async (req, res) => {
    try {
        const referenceValue = await ReferenceGenerator.getNextReference('Delivery');
        const reference = `DEL-${referenceValue}`;
        const newDelivery = new Delivery({ ...req.body, reference });
        const savedDelivery = await newDelivery.save();
        await savedDelivery.populate('order_id');
        res.status(201).json(savedDelivery);
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
});

router.put('/:id', async (req, res) => {
    let delivery = null;
    try {
        const updates = { ...req.body, updatedAt: Date.now() };
        const options = { new: true, runValidators: true };
        delivery = await Delivery.findByIdAndUpdate(req.params.id, updates, options).populate('order_id');
        if (!delivery) return res.status(404).json({ error: 'Delivery not found' });
        res.status(200).json(delivery);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
    if (req.body.status) {
        await sendWebhook({
            event: 'delivery_status_changed',
            delivery,
        });
    }
});

router.delete('/:id', (req, res) => {
    Delivery.findByIdAndDelete(req.params.id)
        .then(delivery => {
            if (!delivery) return res.status(404).json({ error: 'Delivery not found' });
            res.status(200).json({ message: 'Delivery deleted successfully', delivery });
        })
        .catch(err => res.status(500).json({ error: err.message }));
});

module.exports = router;
