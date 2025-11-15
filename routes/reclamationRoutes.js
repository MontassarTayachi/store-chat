const express = require('express');
const router = express.Router();
const Reclamation = require('../models/Reclamation');

// GET all reclamations
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

        const reclamations = await Reclamation.find(filter);
        res.status(200).json(reclamations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET reclamation by ID
router.get('/:id', async (req, res) => {
    try {
        const reclamation = await Reclamation.findById(req.params.id);
        if (!reclamation) {
            return res.status(404).json({ error: 'Reclamation not found' });
        }
        res.status(200).json(reclamation);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CREATE a new reclamation
router.post('/', async (req, res) => {
    try {
        const { customer_fb_id, order_id, issue_description, status } = req.body;

        if (!customer_fb_id || !order_id || !issue_description) {
            return res.status(400).json({ error: 'Missing required fields: customer_fb_id, order_id, issue_description' });
        }

        // Verify order exists
        const Order = require('../models/Order');
        const order = await Order.findById(order_id);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const newReclamation = new Reclamation({
            customer_fb_id,
            order_id,
            issue_description,
            status: status || 'Open'
        });

        const savedReclamation = await newReclamation.save();
        const populatedReclamation = await savedReclamation.populate('order_id');
        res.status(201).json(populatedReclamation);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE a reclamation
router.put('/:id', async (req, res) => {
    try {
        const { customer_fb_id, order_id, issue_description, status } = req.body;

        const updateData = {
            updatedAt: Date.now()
        };

        // Add fields if provided
        if (customer_fb_id !== undefined) updateData.customer_fb_id = customer_fb_id;
        if (issue_description !== undefined) updateData.issue_description = issue_description;
        if (status !== undefined) updateData.status = status;

        // Verify order exists if being updated
        if (order_id !== undefined) {
            const Order = require('../models/Order');
            const order = await Order.findById(order_id);
            if (!order) {
                return res.status(404).json({ error: 'Order not found' });
            }
            updateData.order_id = order_id;
        }

        const reclamation = await Reclamation.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).populate('order_id');

        if (!reclamation) {
            return res.status(404).json({ error: 'Reclamation not found' });
        }

        res.status(200).json(reclamation);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH a reclamation (partial update, mainly for status updates)
router.patch('/:id', async (req, res) => {
    try {
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ error: 'Status is required' });
        }

        const validStatuses = ['Open', 'In Progress', 'Resolved', 'Closed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
        }

        const reclamation = await Reclamation.findByIdAndUpdate(req.params.id, { status, updatedAt: Date.now() }, { new: true, runValidators: true });

        if (!reclamation) {
            return res.status(404).json({ error: 'Reclamation not found' });
        }

        res.status(200).json(reclamation);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE a reclamation
router.delete('/:id', async (req, res) => {
    try {
        const reclamation = await Reclamation.findByIdAndDelete(req.params.id);

        if (!reclamation) {
            return res.status(404).json({ error: 'Reclamation not found' });
        }

        res.status(200).json({ message: 'Reclamation deleted successfully', reclamation });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
