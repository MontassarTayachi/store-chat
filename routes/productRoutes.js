const express = require('express');

const Product = require('../models/Product.js');
const ReferenceGenerator = require('../models/ReferenceGenerator.js')
const { getFilter } = require('../utils/utils.js');

const router = express.Router();

router.get('/', (req, res) => {
    const filter = getFilter(req.query);
    Product.find(filter)
        .then(products => res.status(200).json(products))
        .catch(err => res.status(500).json({ error: err.message }));
});

router.get('/:id', (req, res) => {
    Product.findById(req.params.id)
        .then(product => {
            if (!product) res.status(404).json({ error: 'Product not found' });
            else res.status(200).json(product);
        })
        .catch(err => res.status(500).json({ error: err.message }));
});

router.post('/', async (req, res) => {
    try {
        const referenceValue = await ReferenceGenerator.getNextReference('Product');
        const reference = `PROD-${referenceValue}`;
        const newProduct = new Product({ ...req.body, reference });
        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
});

router.put('/:id', (req, res) => {
    const updates = { ...req.body, updatedAt: Date.now() };
    const options = { new: true, runValidators: true };
    Product.findByIdAndUpdate(req.params.id, updates, options)
        .then(product => {
            if (!product) return res.status(404).json({ error: 'Product not found' });
            res.status(200).json(product);
        })
        .catch(err => res.status(500).json({ error: err.message }));
});

router.delete('/:id', (req, res) => {
    Product.findByIdAndDelete(req.params.id)
        .then(product => {
            if (!product) return res.status(404).json({ error: 'Product not found' });
            res.status(200).json({ message: 'Product deleted successfully', product });
        })
        .catch(err => res.status(500).json({ error: err.message }));
});

module.exports = router;