CREATE TABLE Product (
    product_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL,
    category VARCHAR(50)
);

CREATE TABLE Orders (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_name VARCHAR(100),
    order_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'Pending'  -- Pending, Shipped, Delivered, Cancelled
);

CREATE TABLE Delivery (
    delivery_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT,
    tracking_number VARCHAR(50),
    delivery_status VARCHAR(50) DEFAULT 'Preparing',
    estimated_arrival DATE,
    delivered_date DATE,
    FOREIGN KEY (order_id) REFERENCES Orders(order_id)
);