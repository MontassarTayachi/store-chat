const API_BASE = '/api';
const ORDERS_API = `${API_BASE}/orders`;

// DOM Elements
const ordersContainer = document.getElementById('ordersContainer');
const loadingSpinner = document.getElementById('loadingSpinner');
const emptyState = document.getElementById('emptyState');
const filterBtn = document.getElementById('filterBtn');
const refreshBtn = document.getElementById('refreshBtn');
const statusFilter = document.getElementById('statusFilter');
const modal = document.getElementById('orderModal');
const closeBtn = document.querySelector('.close');

// Event Listeners
filterBtn.addEventListener('click', applyFilter);
refreshBtn.addEventListener('click', loadOrders);
closeBtn.addEventListener('click', closeModal);
window.addEventListener('click', function(event) {
    if (event.target === modal) {
        closeModal();
    }
});

// Load orders on page load
document.addEventListener('DOMContentLoaded', loadOrders);

async function loadOrders() {
    showLoading(true);
    try {
        const response = await fetch(ORDERS_API);
        if (!response.ok) throw new Error('Failed to fetch orders');

        const orders = await response.json();
        console.log('Fetched orders:', orders);
        displayOrders(orders);
    } catch (error) {
        console.error('Error loading orders:', error);
        showError('Failed to load orders. Please try again.');
    } finally {
        showLoading(false);
    }
}

async function applyFilter() {
    const status = statusFilter.value;
    showLoading(true);
    try {
        let url = ORDERS_API;
        if (status) {
            url += `?status=${status}`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch orders');

        const orders = await response.json();
        displayOrders(orders);
    } catch (error) {
        console.error('Error applying filter:', error);
        showError('Failed to apply filter. Please try again.');
    } finally {
        showLoading(false);
    }
}

function displayOrders(orders) {
    ordersContainer.innerHTML = '';

    if (orders.length === 0) {
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';

    orders.forEach(order => {
        const orderCard = createOrderCard(order);
        ordersContainer.appendChild(orderCard);
    });
}

function createOrderCard(order) {
    const card = document.createElement('div');
    card.className = 'order-card';

    const statusClass = `status-${order.status.toLowerCase()}`;
    const orderDate = new Date(order.order_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    let itemsHTML = '';
    let totalAmount = 0;
    if (order.items && order.items.length > 0) {
        itemsHTML = order.items.map(item => {
            const productName = item.product_id?.name || 'Unknown Product';
            const price = item.price ?? 0;
            totalAmount += price * item.quantity;
            return `<div class="item">
                <strong>${productName}</strong> - Qty: ${item.quantity} × $${price.toFixed(2)}
            </div>`;
        }).join('');
    }

    card.innerHTML = `
        <div class="order-header">
            <div class="order-id">Order #${order._id.substring(0, 8)}</div>
            <span class="status-badge ${statusClass}">${order.status}</span>
        </div>

        <div class="order-info">
            <div class="info-row">
                <span class="info-label">Customer:</span>
                <span class="info-value">${order.customer_name}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Date:</span>
                <span class="info-value">${orderDate}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Total Amount:</span>
                <span class="info-value" style="font-weight: 600; color: #667eea;">$${totalAmount.toFixed(2)}</span>
            </div>
        </div>

        <div class="items-list">
            <h4>📦 Items</h4>
            ${itemsHTML}
        </div>

        <div class="order-actions">
            ${order.status === 'Pending' ? `
                <button class="btn btn-accept" onclick="acceptOrder('${order._id}')">✓ Accept</button>
                <button class="btn btn-refuse" onclick="refuseOrder('${order._id}')">✗ Refuse</button>
            ` : `
                <button class="btn btn-secondary" style="flex: 1;" onclick="showOrderDetails('${order._id}')">View Details</button>
            `}
        </div>
    `;

    return card;
}

async function acceptOrder(orderId) {
    if (!confirm('Are you sure you want to accept this order?')) return;

    try {
        const response = await fetch(`${ORDERS_API}/${orderId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'Shipped' })
        });

        if (!response.ok) throw new Error('Failed to accept order');

        showSuccess('Order accepted successfully!');
        loadOrders();
    } catch (error) {
        console.error('Error accepting order:', error);
        showError('Failed to accept order. Please try again.');
    }
}

async function refuseOrder(orderId) {
    if (!confirm('Are you sure you want to refuse this order?')) return;

    try {
        const response = await fetch(`${ORDERS_API}/${orderId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'Cancelled' })
        });

        if (!response.ok) throw new Error('Failed to refuse order');

        showSuccess('Order refused successfully!');
        loadOrders();
    } catch (error) {
        console.error('Error refusing order:', error);
        showError('Failed to refuse order. Please try again.');
    }
}

async function showOrderDetails(orderId) {
    try {
        const response = await fetch(`${ORDERS_API}/${orderId}`);
        if (!response.ok) throw new Error('Failed to fetch order details');

        const order = await response.json();
        const modalBody = document.getElementById('modalBody');

        const orderDate = new Date(order.order_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        let itemsHTML = '';
        let totalAmount = 0;
        if (order.items && order.items.length > 0) {
            itemsHTML = order.items.map(item => {
                const productName = item.product_id?.name || 'Unknown Product';
                const price = item.price ?? 0;
                totalAmount += item.quantity * price;
                return `<tr>
                    <td>${productName}</td>
                    <td>${item.quantity}</td>
                    <td>$${price.toFixed(2)}</td>
                    <td>$${(item.quantity * price).toFixed(2)}</td>
                </tr>`;
            }).join('');
        }

        modalBody.innerHTML = `
            <div style="margin-bottom: 20px;">
                <p><strong>Order ID:</strong> ${order._id}</p>
                <p><strong>Customer:</strong> ${order.customer_name}</p>
                <p><strong>Status:</strong> <span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span></p>
                <p><strong>Order Date:</strong> ${orderDate}</p>
            </div>

            <div style="margin-bottom: 20px;">
                <h3>Items</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="border-bottom: 2px solid #e0e0e0;">
                            <th style="text-align: left; padding: 8px;">Product</th>
                            <th style="text-align: center; padding: 8px;">Qty</th>
                            <th style="text-align: right; padding: 8px;">Price</th>
                            <th style="text-align: right; padding: 8px;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHTML}
                    </tbody>
                </table>
            </div>

            <div style="text-align: right; padding-top: 15px; border-top: 2px solid #e0e0e0;">
                <p style="font-size: 1.2em;"><strong>Total Amount: $${totalAmount.toFixed(2)}</strong></p>
            </div>
        `;

        modal.style.display = 'block';
    } catch (error) {
        console.error('Error fetching order details:', error);
        showError('Failed to load order details.');
    }
}

function closeModal() {
    modal.style.display = 'none';
}

function showLoading(show) {
    loadingSpinner.style.display = show ? 'flex' : 'none';
}

function showSuccess(message) {
    const successMsg = document.createElement('div');
    successMsg.className = 'success-message';
    successMsg.textContent = message;
    successMsg.style.display = 'block';

    ordersContainer.parentElement.insertBefore(successMsg, ordersContainer);

    setTimeout(() => successMsg.remove(), 3000);
}

function showError(message) {
    const errorMsg = document.createElement('div');
    errorMsg.className = 'error-message';
    errorMsg.textContent = message;
    errorMsg.style.display = 'block';

    ordersContainer.parentElement.insertBefore(errorMsg, ordersContainer);

    setTimeout(() => errorMsg.remove(), 3000);
}
