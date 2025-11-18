require('dotenv').config();
const mongoose = require('mongoose');

const Product = require('./models/Product');
const Order = require('./models/Order');
const Delivery = require('./models/Delivery');
const Reclamation = require('./models/Reclamation');

const productsData = require('./data/Products.json');
const ordersData = require('./data/Orders.json');
const deliveryData = require('./data/Delivery.json');

const DATABASE_URL = process.env.DATABASE_URL;

async function insertData() {
    try {
        // Connect to MongoDB
        await mongoose.connect(DATABASE_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        // Clear existing data (optional - comment out if you don't want to clear)
        await Product.deleteMany({});
        await Order.deleteMany({});
        await Delivery.deleteMany({});
        await Reclamation.deleteMany({});
        console.log('Cleared existing data');

        // Insert Products
        const insertedProducts = await Product.insertMany(productsData);
        console.log(`Inserted ${insertedProducts.length} products`);

        // No need for product ID mapping anymore since we're using ref (string) directly
        // Insert Orders with items referencing product reference strings
        const processedOrders = ordersData.map(order => ({
            ...order,
            items: order.items?.map(item => ({
                ref: item.ref, // Use product reference directly
                quantity: item.quantity,
                price: item.price
            })) || []
        }));

        const insertedOrders = await Order.insertMany(processedOrders);
        console.log(`Inserted ${insertedOrders.length} orders`);

        // Create a mapping of placeholder order IDs to actual MongoDB ObjectIds
        const orderIdMap = {};
        insertedOrders.forEach((order, index) => {
            orderIdMap[`ORDER_ID_${index + 1}`] = order._id;
        });

        // Insert Deliveries with order references (actual ObjectIds)
        const processedDeliveries = deliveryData.map(delivery => ({
            ...delivery,
            order_id: orderIdMap[delivery.order_id] // Replace placeholder with actual ObjectId
        }));

        const insertedDeliveries = await Delivery.insertMany(processedDeliveries);
        console.log(`Inserted ${insertedDeliveries.length} deliveries`);

        console.log('\n✨ Database seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error inserting data:', error.message);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
    }
}

insertData();
