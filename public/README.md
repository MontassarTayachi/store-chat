# Order Management Web Interface

A modern, responsive web interface for managing orders from your store database.

## Features

- 📋 **View All Orders**: Display all orders from the database with complete details
- 🔍 **Filter by Status**: Filter orders by their current status (Pending, Shipped, Delivered, Cancelled)
- ✅ **Accept Orders**: Change order status from Pending to Shipped
- ❌ **Refuse Orders**: Change order status from Pending to Cancelled
- 📊 **Order Details**: View detailed information about each order including items and total amount
- 🎨 **Modern UI**: Beautiful, responsive design that works on desktop and mobile devices
- ⚡ **Real-time Updates**: Automatically refresh order list after accepting or refusing orders

## How to Use

1. **Access the Interface**:
   - Open your browser and navigate to `http://localhost:5000`
   - The order management interface will load automatically

2. **View Orders**:
   - All pending orders are displayed as cards by default
   - Each card shows customer name, order date, total amount, and items

3. **Filter Orders**:
   - Select a status from the "Filter by Status" dropdown
   - Click "Apply Filter" to see orders with that status
   - Click "Refresh" to show all orders again

4. **Manage Pending Orders**:
   - For pending orders, you'll see two action buttons:
     - **✓ Accept**: Change status to "Shipped"
     - **✗ Refuse**: Change status to "Cancelled"
   - A confirmation dialog will appear before making changes

5. **View Order Details**:
   - For non-pending orders, click "View Details" to see full information
   - A modal will display items ordered, quantities, prices, and total amount

## Technical Details

### Files Created

- **public/index.html**: Main HTML structure
- **public/styles.css**: Complete styling with responsive design
- **public/script.js**: JavaScript for API interactions and UI management

### API Endpoints Used

- `GET /api/orders`: Fetch all orders (supports query parameters for filtering)
- `GET /api/orders/:id`: Fetch a specific order by ID
- `PATCH /api/orders/:id`: Update order status

### Technologies

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js, MongoDB
- **Database**: MongoDB with Mongoose ODM

## Order Status Flow

```
Pending ─────→ Shipped ─────→ Delivered
   ↓
Cancelled
```

## Responsive Design

The interface is fully responsive and works great on:
- Desktop computers
- Tablets
- Mobile phones

## Error Handling

- Network errors are caught and displayed to the user
- Validation errors from the server are handled gracefully
- Success/error messages appear temporarily after actions

## Color Scheme

- **Pending**: Yellow/Orange
- **Shipped**: Blue
- **Delivered**: Green
- **Cancelled**: Red

## Notes

- The interface loads all orders on startup
- Orders are automatically refreshed after accepting or refusing
- Confirmation dialogs prevent accidental status changes
- Product names are populated from the database relationships
