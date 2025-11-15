CREATE TABLE products (
    product_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL,
    category VARCHAR(50)
);

CREATE TABLE orders (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    quantity INT,
    customer_name VARCHAR(100),
    phone_number VARCHAR(15),
    shipping_address TEXT,
    customer_fb_id VARCHAR(100),
    order_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'Pending'  -- Pending, Shipped, Delivered, Cancelled
    product_id INT,
    FOREIGN KEY (product_id) REFERENCES Product(product_id)
);

CREATE TABLE deliveries (
    delivery_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT,
    tracking_number VARCHAR(50),
    delivery_status VARCHAR(50) DEFAULT 'Preparing',
    estimated_arrival DATE,
    delivered_date DATE,
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

CREATE TABLE reclamations (
    reclamation_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_fb_id VARCHAR(100),
    issue_description TEXT,
    reclamation_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'Open',  -- Open, In Progress, Resolved, Closed
);