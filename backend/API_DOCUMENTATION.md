# FoodKing Backend API Documentation

## Base URL
Development: `http://localhost:5000/api`

## Authentication
Admin routes require JWT token in header:



## Endpoints

### Auth
- POST /auth/login - Admin login
- GET /auth/me - Get current admin (protected)

### Menu
- GET /menu - Get all menu items
- GET /menu/:id - Get single item
- POST /menu - Add item (admin)
- PUT /menu/:id - Update item (admin)
- DELETE /menu/:id - Delete item (admin)
- PATCH /menu/:id/toggle-availability - Toggle availability (admin)

### Orders
- POST /orders - Create order
- GET /orders - Get all orders (admin)
- GET /orders/:id - Get order by ID
- GET /orders/customer/:phone - Get customer orders
- GET /orders/stats/dashboard - Dashboard stats (admin)
- PUT /orders/:id/status - Update order status (admin)

### Payment
- GET /payment/key - Get Razorpay key
- POST /payment/create-order - Create Razorpay order
- POST /payment/verify - Verify payment

## Admin Credentials
Email: admin@foodking.com
Password: Admin@123
