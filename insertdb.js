require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const productsData = require('./data/Products.json');
const ordersData = require('./data/Orders.json');
const deliveryData = require('./data/Delivery.json');

const uri = process.env.MONGODB_URI;

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
    await client.db('magasin_tayachi').collection('Product').insertMany(productsData);
    await client.db('magasin_tayachi').collection('Orders').insertMany(ordersData);
    await client.db('magasin_tayachi').collection('Delivery').insertMany(deliveryData);
  } finally {
    await client.close();
  }
}

run().catch(console.dir);