const API_BASE = '/api';
const ORDERS_API = `${API_BASE}/orders`;
const RECLAMATIONS_API = `${API_BASE}/reclamations`;

// DOM Elements - Orders
const ordersContainer = document.getElementById('ordersContainer');
const loadingSpinner = document.getElementById('loadingSpinner');
const emptyState = document.getElementById('emptyState');
const filterBtn = document.getElementById('filterBtn');
const refreshBtn = document.getElementById('refreshBtn');
const statusFilter = document.getElementById('statusFilter');
const orderModal = document.getElementById('orderModal');

// DOM Elements - Reclamations
const reclamationsContainer = document.getElementById('reclamationsContainer');
const reclamationLoadingSpinner = document.getElementById('reclamationLoadingSpinner');
const reclamationEmptyState = document.getElementById('reclamationEmptyState');
const reclamationFilterBtn = document.getElementById('reclamationFilterBtn');
const reclamationRefreshBtn = document.getElementById('reclamationRefreshBtn');
const reclamationStatusFilter = document.getElementById('reclamationStatusFilter');
const reclamationNeedsAnswerFilter = document.getElementById('reclamationNeedsAnswerFilter');
const reclamationModal = document.getElementById('reclamationModal');

// Event Listeners - Orders
filterBtn.addEventListener('click', applyFilter);
refreshBtn.addEventListener('click', loadOrders);
reclamationFilterBtn.addEventListener('click', applyReclamationFilter);
reclamationRefreshBtn.addEventListener('click', loadReclamations);

// Load data on page load
document.addEventListener('DOMContentLoaded', loadOrders);

// Tab switching
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab
    if (tabName === 'orders') {
        document.getElementById('ordersTab').classList.add('active');
        event.target.classList.add('active');
        loadOrders();
    } else if (tabName === 'reclamations') {
        document.getElementById('reclamationsTab').classList.add('active');
        event.target.classList.add('active');
        loadReclamations();
    }
}

// ==================== ORDERS FUNCTIONS ====================

async function loadOrders() {
    showLoading(true);
    try {
        const response = await fetch(ORDERS_API);
        if (!response.ok) throw new Error('Failed to fetch orders');
        const orders = await response.json();
        displayOrders(orders);
    } catch (error) {
        console.error('Error loading orders:', error);
        showError('Failed to load orders. Please try again.');
    } finally {
        showLoading(false);
    }
}

async function applyFilter() {
    showLoading(true);
    try {
        const url = ORDERS_API + (statusFilter.value ? `?status=${statusFilter.value}` : '');
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
    if (order.items && order.items.length > 0) {
        itemsHTML = order.items.map(item => {
            const productName = item.product_id.name || 'Unknown Product'; // TODO: item.product_id should be item.product, i made a wrong naming in the db schema
            const productReference = item.product_id.reference || 'Unknown Product';
            const price = item.price ?? 0;
            return `<div class="item">
                <strong>${productName} (${productReference})</strong> - Qty: ${item.quantity} × $${price.toFixed(2)}
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
                <span class="info-value" style="font-weight: 600; color: #667eea;">$${order.total_amount.toFixed(2)}</span>
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
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'Accepted' })
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
            method: 'PUT',
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
        if (order.items && order.items.length > 0) {
            itemsHTML = order.items.map(item => {
                const productName = item.product_id.name || 'Unknown Product';
                const productReference = item.product_id.reference || 'Unknown Product';
                const price = item.price ?? 0;
                return `<tr>
                    <td>${productName} (${productReference})</td>
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
                <p style="font-size: 1.2em;"><strong>Total Amount: $${order.total_amount.toFixed(2)}</strong></p>
            </div>
        `;

        modal.style.display = 'block';
    } catch (error) {
        console.error('Error fetching order details:', error);
        showError('Failed to load order details.');
    }
}

function closeModal() {
    orderModal.style.display = 'none';
}

function closeOrderModal() {
    orderModal.style.display = 'none';
}

function closeReclamationModal() {
    reclamationModal.style.display = 'none';
}

// Close modal when clicking outside of it
window.addEventListener('click', (event) => {
    if (event.target === orderModal) closeOrderModal();
    if (event.target === reclamationModal) closeReclamationModal();
});

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

// ==================== RECLAMATIONS FUNCTIONS ====================

async function loadReclamations() {
    showReclamationLoading(true);
    try {
        const response = await fetch(RECLAMATIONS_API);
        if (!response.ok) throw new Error('Failed to fetch reclamations');
        const reclamations = await response.json();
        displayReclamations(reclamations);
    } catch (error) {
        console.error('Error loading reclamations:', error);
        showError('Failed to load reclamations. Please try again.');
    } finally {
        showReclamationLoading(false);
    }
}

async function applyReclamationFilter() {
    showReclamationLoading(true);
    try {
        // Build URL with status filter only (backend query)
        let url = RECLAMATIONS_API;
        if (reclamationStatusFilter.value) {
            url += `?status=${reclamationStatusFilter.value}`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch reclamations');
        let reclamations = await response.json();

        // Client-side filtering for needs_answer (virtual property)
        if (reclamationNeedsAnswerFilter.value !== '') {
            const needsAnswer = reclamationNeedsAnswerFilter.value === 'true';
            reclamations = reclamations.filter(rec => rec.needs_answer === needsAnswer);
        }

        displayReclamations(reclamations);
    } catch (error) {
        console.error('Error applying filter:', error);
        showError('Failed to apply filter. Please try again.');
    } finally {
        showReclamationLoading(false);
    }
}

function displayReclamations(reclamations) {
    reclamationsContainer.innerHTML = '';
    if (reclamations.length === 0) {
        reclamationEmptyState.style.display = 'block';
        return;
    }
    reclamationEmptyState.style.display = 'none';
    reclamations.forEach(reclamation => {
        const reclamationCard = createReclamationCard(reclamation);
        reclamationsContainer.appendChild(reclamationCard);
    });
}

function createReclamationCard(reclamation) {
    const card = document.createElement('div');
    card.className = 'reclamation-card';

    const statusClass = `status-${reclamation.status.toLowerCase().replace(' ', '-')}`;
    const reclamationDate = new Date(reclamation.reclamation_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    // Get the first message from the discussion
    const firstMessage = reclamation.discussion[0].message;

    card.innerHTML = `
        <div class="reclamation-header">
            <div class="reclamation-id">Reclamation #${reclamation.reference || reclamation._id.substring(0, 8)}</div>
            ${(reclamation.status !== 'Closed' && reclamation.needs_answer) ? `<span class="status-badge status-alert">⚠️ Needs Reply</span>` : ''}
            <span class="status-badge ${statusClass}">${reclamation.status}</span>
        </div>

        <div class="reclamation-info">
            <div class="info-row">
                <span class="info-label">Customer:</span>
                <span class="info-value">${reclamation.customer_name}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Date:</span>
                <span class="info-value">${reclamationDate}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Issue:</span>
                <span class="info-value">${firstMessage}</span>
            </div>
            ${reclamation.discussion.length > 1 ? `
            <div class="info-row">
                <span class="info-label">Messages:</span>
                <span class="info-value">${reclamation.discussion.length} messages in thread</span>
            </div>
            ` : ''}
        </div>

        <div class="reclamation-actions">
            ${reclamation.status !== 'Closed' ? `
                <button class="btn btn-primary" onclick="showReclamationDetails('${reclamation._id}')">📝 View & Respond</button>
                <button class="btn btn-secondary" onclick="closeReclamation('${reclamation._id}')">✓ Close</button>
            ` : `
                <button class="btn btn-secondary" style="flex: 1;" onclick="showReclamationDetails('${reclamation._id}')">View Details</button>
            `}
        </div>
    `;

    return card;
}

async function showReclamationDetails(reclamationId) {
    try {
        const response = await fetch(`${RECLAMATIONS_API}/${reclamationId}`);
        if (!response.ok) throw new Error('Failed to fetch reclamation details');

        const reclamation = await response.json();
        const modalBody = document.getElementById('reclamationModalBody');

        const reclamationDate = new Date(reclamation.reclamation_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        let orderInfo = '';
        if (reclamation.order) {
            orderInfo = `
                <div style="margin-bottom: 15px; padding: 10px; background-color: #f5f5f5; border-radius: 5px;">
                    <p><strong>Related Order:</strong> ${reclamation.order._id}</p>
                </div>
            `;
        }

        // Build discussion thread
        let discussionHTML = '';
        if (reclamation.discussion && reclamation.discussion.length > 0) {
            discussionHTML = reclamation.discussion.map(msg => {
                const msgDate = new Date(msg.timestamp).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                const msgClass = msg.sender === 'Admin' ? 'admin-message' : 'client-message';
                return `
                    <div class="discussion-message ${msgClass}">
                        <div class="message-header">
                            <strong>${msg.sender}</strong>
                            <span class="message-time">${msgDate}</span>
                        </div>
                        <div class="message-body">${msg.message}</div>
                    </div>
                `;
            }).join('');
        } else {
            discussionHTML = '<p style="text-align: center; color: #999;">No messages yet</p>';
        }

        modalBody.innerHTML = `
            <div style="margin-bottom: 20px;">
                <p><strong>Reclamation ID:</strong> ${reclamation.reference || reclamation._id}</p>
                <p><strong>Customer:</strong> ${reclamation.customer_name}</p>
                <p><strong>Status:</strong> <span class="status-badge status-${reclamation.status.toLowerCase().replace(' ', '-')}">${reclamation.status}</span></p>
                <p><strong>Reclamation Date:</strong> ${reclamationDate}</p>
            </div>

            ${orderInfo}

            <div style="margin-bottom: 20px;">
                <h3>Discussion Thread</h3>
                <div class="discussion-thread" style="border: 1px solid #ddd; border-radius: 5px; padding: 15px; background-color: #fafafa; max-height: 300px; overflow-y: auto; margin-bottom: 15px;">
                    ${discussionHTML}
                </div>
            </div>

            ${reclamation.status !== 'Closed' ? `
                <div style="margin-bottom: 20px;">
                    <h3>Send Response</h3>
                    <textarea id="responseText" placeholder="Type your response here..." style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-family: Arial, sans-serif; min-height: 100px;"></textarea>
                </div>
            ` : `
                <div style="padding: 10px; background-color: #d1fae5; border-radius: 4px; text-align: center; color: #065f46;">
                    <strong>This reclamation is closed</strong>
                </div>
            `}

            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                <button class="btn btn-secondary" onclick="closeReclamationModal()">Cancel</button>
                ${reclamation.status !== 'Closed' ? `
                    <button class="btn btn-primary" onclick="submitReclamationResponse('${reclamation._id}')">Send Response</button>
                    <button class="btn btn-secondary" onclick="closeReclamation('${reclamation._id}')">Close Reclamation</button>
                ` : ''}
            </div>
        `;

        reclamationModal.style.display = 'block';
    } catch (error) {
        console.error('Error fetching reclamation details:', error);
        showError('Failed to load reclamation details.');
    }
}

async function submitReclamationResponse(reclamationId) {
    const responseText = document.getElementById('responseText').value.trim();

    if (!responseText) {
        showError('Please enter a response before submitting.');
        return;
    }

    try {
        const response = await fetch(`${RECLAMATIONS_API}/${reclamationId}/discussion`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: responseText,
                sender: 'Admin'
            })
        });

        if (!response.ok) throw new Error('Failed to submit response');

        showSuccess('Response sent successfully!');
        closeReclamationModal();
        loadReclamations();
    } catch (error) {
        console.error('Error submitting response:', error);
        showError('Failed to submit response. Please try again.');
    }
}

async function closeReclamation(reclamationId) {
    if (!confirm('Are you sure you want to close this reclamation?')) return;

    try {
        const response = await fetch(`${RECLAMATIONS_API}/${reclamationId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'Closed' })
        });

        if (!response.ok) throw new Error('Failed to close reclamation');

        showSuccess('Reclamation closed successfully!');
        loadReclamations();
    } catch (error) {
        console.error('Error closing reclamation:', error);
        showError('Failed to close reclamation. Please try again.');
    }
}

function showReclamationLoading(show) {
    reclamationLoadingSpinner.style.display = show ? 'flex' : 'none';
}

