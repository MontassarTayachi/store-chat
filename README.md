# Magasin Tayachi - E-commerce API

A complete Node.js/Express API for managing products, orders, and deliveries using MongoDB.

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create a `.env` file in the root directory:
```
MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/magasin_tayachi?retryWrites=true&w=majority
PORT=5000
```

Replace `username`, `password`, and `cluster0` with your MongoDB Atlas credentials.

### 3. Start the Server
```bash
npm start
```

The server will run on `http://localhost:5000`

---

## API Endpoints

### Products

**GET** `/api/products` - Get all products
```bash
curl http://localhost:5000/api/products
```

**GET** `/api/products/:id` - Get product by ID
```bash
curl http://localhost:5000/api/products/[product_id]
```

**POST** `/api/products` - Create a new product
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop",
    "description": "High-performance laptop",
    "price": 999.99,
    "stock": 50,
    "category": "Electronics"
  }'
```

**PUT** `/api/products/:id` - Update a product
```bash
curl -X PUT http://localhost:5000/api/products/[product_id] \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Laptop",
    "price": 899.99,
    "stock": 45
  }'
```

**DELETE** `/api/products/:id` - Delete a product
```bash
curl -X DELETE http://localhost:5000/api/products/[product_id]
```

---

### Orders

**GET** `/api/orders` - Get all orders
```bash
curl http://localhost:5000/api/orders
```

**GET** `/api/orders/:id` - Get order by ID
```bash
curl http://localhost:5000/api/orders/[order_id]
```

**POST** `/api/orders` - Create a new order
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "John Doe",
    "items": [
      {
        "product_id": "[product_id]",
        "quantity": 2,
        "price": 999.99
      }
    ],
    "status": "Pending"
  }'
```

**PUT** `/api/orders/:id` - Update an order
```bash
curl -X PUT http://localhost:5000/api/orders/[order_id] \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Shipped"
  }'
```

**DELETE** `/api/orders/:id` - Delete an order
```bash
curl -X DELETE http://localhost:5000/api/orders/[order_id]
```

---

### Deliveries

**GET** `/api/deliveries` - Get all deliveries
```bash
curl http://localhost:5000/api/deliveries
```

**GET** `/api/deliveries/:id` - Get delivery by ID
```bash
curl http://localhost:5000/api/deliveries/[delivery_id]
```

**GET** `/api/deliveries/track/:tracking_number` - Track delivery by tracking number
```bash
curl http://localhost:5000/api/deliveries/track/TRACK123456
```

**POST** `/api/deliveries` - Create a new delivery
```bash
curl -X POST http://localhost:5000/api/deliveries \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "[order_id]",
    "tracking_number": "TRACK123456",
    "delivery_status": "Preparing",
    "estimated_arrival": "2025-11-20T10:00:00Z"
  }'
```

**PUT** `/api/deliveries/:id` - Update delivery status
```bash
curl -X PUT http://localhost:5000/api/deliveries/[delivery_id] \
  -H "Content-Type: application/json" \
  -d '{
    "delivery_status": "Delivered",
    "delivered_date": "2025-11-15T14:30:00Z"
  }'
```

**DELETE** `/api/deliveries/:id` - Delete a delivery
```bash
curl -X DELETE http://localhost:5000/api/deliveries/[delivery_id]
```

---

## Project Structure

```
magasin_tayachi/
├── models/
│   ├── Product.js       # Product schema
│   ├── Orders.js        # Orders schema
│   └── Delivery.js      # Delivery schema
├── routes/
│   ├── productRoutes.js # Product endpoints
│   ├── orderRoutes.js   # Order endpoints
│   └── deliveryRoutes.js # Delivery endpoints
├── server.js            # Main server file
├── package.json         # Dependencies
├── .env                 # Environment variables
└── database.sql         # SQL schema reference
```

## Database Collections

### Product
- `_id`: ObjectId (auto-generated)
- `name`: String (required)
- `description`: String
- `price`: Number (required)
- `stock`: Number (required)
- `category`: String
- `createdAt`: Date
- `updatedAt`: Date

### Orders
- `_id`: ObjectId (auto-generated)
- `customer_name`: String (required)
- `order_date`: Date
- `status`: String (Pending, Shipped, Delivered, Cancelled)
- `items`: Array of items with product_id, quantity, price
- `total_amount`: Number
- `createdAt`: Date
- `updatedAt`: Date

### Delivery
- `_id`: ObjectId (auto-generated)
- `order_id`: ObjectId (reference to Orders)
- `tracking_number`: String (unique)
- `delivery_status`: String (Preparing, Shipped, In Transit, Out for Delivery, Delivered)
- `estimated_arrival`: Date
- `delivered_date`: Date
- `createdAt`: Date
- `updatedAt`: Date

---

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad request
- `404`: Not found
- `500`: Server error

---

## Features

✅ Full CRUD operations for all collections
✅ MongoDB Atlas integration
✅ RESTful API design
✅ Error handling and validation
✅ Automatic timestamps (createdAt, updatedAt)
✅ Relationship support (Delivery → Orders → Products)
✅ Tracking number support for deliveries
✅ Automatic order status update when delivery is completed
✅ CORS enabled for cross-origin requests
