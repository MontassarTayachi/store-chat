require('dotenv').config();
const mongoose = require('mongoose');

const productsData = require('./data/Products.json');
const ordersData = require('./data/Orders.json');
const deliveriesData = require('./data/Deliveries.json');

const ReferenceGenerator = require('./models/ReferenceGenerator.js');

mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB connected successfully!')).catch(err => {
    console.error('MongoDB connection error:', err);
    throw err;
});

function getRandomInt(min, max, inclusive = true) {
    return Math.floor(Math.random() * (max - min + (inclusive ? 1 : 0))) + min;
}

function selectRandomElements(array, elementsCount, allowDuplicates = false) {
    if (elementsCount > array.length && allowDuplicates == false) throw new Error('selectRandomElements: operation impossible');
    const arr = [...array];
    const result = [];
    for (let i = 0; i < elementsCount; i++) {
        const randomIndex = getRandomInt(0, arr.length, false);
        result.push(arr[randomIndex]);
        if (allowDuplicates == false) {
            arr.splice(randomIndex, 1);
        }
    }
    return result;
}

async function resetReferenceGenerator() {
    await ReferenceGenerator.deleteMany({});
}

async function clearCollection(endpoint) {
    let response = await fetch(`${process.env.LOCAL_SERVER_URL}/api/${endpoint}`);
    const items = await response.json();
    response = await Promise.all(items.map(item => {
        return fetch(`${process.env.LOCAL_SERVER_URL}/api/${endpoint}/${item._id}`, { method: 'DELETE' });
    }));
    const deletedItems = await Promise.all(response.map(item => item.json()));
}

async function insertIntoCollection(endpoint, data) {
    const response = await Promise.all(data.map(item => {
        return fetch(`${process.env.LOCAL_SERVER_URL}/api/${endpoint}`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(item),
        });
    }));
    const insertedData = await Promise.all(response.map(item => item.json()));
    return insertedData;
}

async function main() {
    console.log('deleting existing data ...');
    await resetReferenceGenerator();
    await clearCollection('products');
    await clearCollection('orders');
    await clearCollection('deliveries');
    console.log('existing data deleted successfully');

    console.log('inserting products data ...');
    const products = await insertIntoCollection('products', productsData);
    console.log('products data inserted successfully');

    ordersData.forEach(order => {
        const randomProducts = selectRandomElements(products, order.items.length, false);
        order.items.forEach((item, itemIndex) => item.product_id = randomProducts[itemIndex]._id);
    })
    console.log('inserting orders data ...');
    const orders = await insertIntoCollection('orders', ordersData);
    console.log('orders data inserted successfully');

    deliveriesData.forEach(delivery => {
        const randomOrderIndex = getRandomInt(0, orders.length, false);
        delivery.order_id = orders[randomOrderIndex];
    })
    console.log('inserting deliveries data ...');
    const deliveries = await insertIntoCollection('deliveries', deliveriesData);
    console.log('deliveries data inserted successfully');

    await mongoose.disconnect();
}

main();
