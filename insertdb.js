require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const productsData = require('./data/Products.json');
const ordersData = require('./data/Orders.json');
const deliveryData = require('./data/Delivery.json');

const uri = process.env.MONGODB_URI || 'mongodb+srv://yassine:yassine@cluster0.jl8x5li.mongodb.net/magasin_tayachi?retryWrites=true&w=majority';

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


async function run() {
  try {
    await client.connect();
    await client.db('magasin_tayachi').collection('products').insertMany(productsData);
    await client.db('magasin_tayachi').collection('orders').insertMany(ordersData);
    await client.db('magasin_tayachi').collection('deliveries').insertMany(deliveryData);
  } finally {
    await client.close();
  }
}

run().catch(console.dir);