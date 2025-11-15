require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const reclamationRoutes = require('./routes/reclamationRoutes');

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// MongoDB Connection
const MONGODB_URI = process.env.DATABASE_URL;
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB connected successfully!');
}).catch(err => {
    console.error('MongoDB connection error:', err);
    throw err; // Stop the application if DB connection fails
});

// Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/reclamations', reclamationRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
