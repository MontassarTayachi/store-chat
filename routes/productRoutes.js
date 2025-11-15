const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

router.get('/', async (req, res) => {
    try {
        const filter = {};
        for (const [key, value] of Object.entries(req.query)) {
            // Ignore parameters with null value or 'null' string
            if (value !== null && value !== 'null' && value !== '') {
                filter[key] = value;
            }
        }

        const products = await Product.find(filter);
        res.status(200).json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { reference, name, description, price, stock, category } = req.body;

        if (!reference || !name || price === undefined || stock === undefined) {
            return res.status(400).json({ error: 'Missing required fields: reference, name, price, stock' });
        }

        const newProduct = new Product({
            reference,
            name,
            description,
            price,
            stock,
            category
        });

        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { reference, name, description, price, stock, category } = req.body;

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            {
                reference,
                name,
                description,
                price,
                stock,
                category,
                updatedAt: Date.now()
            },
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.status(200).json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.status(200).json({ message: 'Product deleted successfully', product });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
