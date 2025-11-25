const express = require('express');

const Order = require('../models/Order.js');
const Reclamation = require('../models/Reclamation.js');
const ReferenceGenerator = require('../models/ReferenceGenerator.js');
const { getFilter, sendWebhook } = require('../utils/utils.js');

const router = express.Router();

router.get('/', (req, res) => {
    const filter = getFilter(req.query);
    Reclamation.find(filter)
        .then(reclamations => res.status(200).json(reclamations))
        .catch(err => res.status(500).json({ error: err.message }));
});

router.get('/:id', (req, res) => {
    Reclamation.findById(req.params.id)
        .then(reclamation => {
            if (!reclamation) res.status(404).json({ error: 'Reclamation not found' });
            else res.status(200).json(reclamation);
        })
        .catch(err => res.status(500).json({ error: err.message }));
});

async function validateOrderExistance(req, res, next) {
    if (!req.body.order) return next();
    try {
        const order = await Order.findById(req.body.order);
        if (!order) return res.status(404).json({ error: 'Order not found' });
        next();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

router.post('/', validateOrderExistance, async (req, res) => {
    try {
        const referenceValue = await ReferenceGenerator.getNextReference('Reclamation');
        const reference = `RECL-${referenceValue}`;
        const newReclamation = new Reclamation({ ...req.body, reference });
        newReclamation.addMessage(req.body.message, req.body.sender);
        const savedReclamation = await newReclamation.save();
        if (savedReclamation.order) await savedReclamation.populate('order');
        res.status(201).json(savedReclamation);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/:id/discussion', async (req, res) => {
    let reclamation = null;
    try {
        reclamation = await Reclamation.findById(req.params.id);
        if (!reclamation) return res.status(404).json({ error: 'Reclamation not found' });
        reclamation.addMessage(req.body.message, req.body.sender)
        reclamation = await reclamation.save();
        if (reclamation.order) await reclamation.populate('order');
        res.status(200).json(reclamation);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

    if (req.body.sender === 'Admin') {
        await sendWebhook({
            event: 'reclamation_message_responded',
            reclamation,
        });
    }
})

router.put('/:id', validateOrderExistance, async (req, res) => {
    let reclamation = null;
    try {
        const updates = { ...req.body, updatedAt: Date.now() };
        const options = { new: true, runValidators: true };
        reclamation = await Reclamation.findByIdAndUpdate(req.params.id, updates, options);
        if (!reclamation) return res.status(404).json({ error: 'Reclamation not found' });
        res.status(200).json(reclamation);
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
    if (req.body.status === 'In Progress') {
        await sendWebhook({
            event: 'reclamation_status_changed',
            reclamation,
        });
    }
});

router.delete('/:id', (req, res) => {
    Reclamation.findByIdAndDelete(req.params.id)
        .then(reclamation => {
            if (!reclamation) return res.status(404).json({ error: 'Reclamation not found' });
            res.status(200).json({ message: 'Reclamation deleted successfully', reclamation });
        })
        .catch(err => res.status(500).json({ error: err.message }));
});

module.exports = router;
