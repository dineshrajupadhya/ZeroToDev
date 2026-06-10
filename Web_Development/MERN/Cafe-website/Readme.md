# Smart Cafeteria Management System

A full-stack cafeteria management system with React, Node.js, Express, MongoDB, and Tailwind CSS.

## Live Demo

**Frontend:** https://stunning-dragon-2ea029.netlify.app

**Backend API:** https://smart-cafe-order-backend.onrender.com

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@smartcafe.com | admin123 |
| User | john@example.com | user123 |

## Features

### Customer Features
- User registration and login (JWT authentication)
- Browse menu with categories, search, and filters (vegetarian, spice level, price)
- Add to cart with special instructions
- Apply coupon discounts
- Multiple order types (Dine-in, Takeaway, Delivery)
- Multiple payment methods (Cash, Card, UPI)
- Real-time order tracking with Socket.IO
- Order history and ratings
- AI-powered food recommendations
- QR code ordering
- User profile and preferences

### Admin Features
- Dashboard with analytics (revenue, orders, top products)
- Product management (CRUD, stock updates)
- Order management with status updates
- Stock management with low-stock alerts
- User management (roles, active/inactive)
- Coupon management
- Sales, inventory, customer, and payment reports
- Real-time order notifications

## Tech Stack

- **Frontend:** React 18, Tailwind CSS, React Router, Chart.js, Socket.IO Client
- **Backend:** Node.js, Express, MongoDB, Mongoose, Socket.IO, JWT
- **Services:** Nodemailer (Email), Twilio (SMS), QRCode generation

## Quick Start

### Local Setup

```bash
# Backend
cd backend
npm install
cp .env.example .env  # Add your MongoDB URI
npm run seed
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm start
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |
| PUT | `/api/auth/password` | Update password |
| GET | `/api/products` | Get all products (with filters) |
| GET | `/api/products/:id` | Get single product |
| POST | `/api/products` | Create product (admin) |
| PUT | `/api/products/:id` | Update product (admin) |
| DELETE | `/api/products/:id` | Delete product (admin) |
| PUT | `/api/products/:id/stock` | Update stock (admin) |
| GET | `/api/categories` | Get all categories |
| POST | `/api/categories` | Create category (admin) |
| PUT | `/api/categories/:id` | Update category (admin) |
| DELETE | `/api/categories/:id` | Delete category (admin) |
| GET | `/api/cart` | Get cart |
| POST | `/api/cart/add` | Add to cart |
| PUT | `/api/cart/item/:itemId` | Update cart item |
| DELETE | `/api/cart/item/:itemId` | Remove from cart |
| DELETE | `/api/cart/clear` | Clear cart |
| POST | `/api/cart/coupon` | Apply coupon |
| POST | `/api/orders` | Create order |
| GET | `/api/orders/my-orders` | Get my orders |
| GET | `/api/orders/:id` | Get order |
| PUT | `/api/orders/:id/status` | Update status (admin) |
| PUT | `/api/orders/:id/cancel` | Cancel order |
| PUT | `/api/orders/:id/rate` | Rate order |
| POST | `/api/payments/process` | Process payment |
| GET | `/api/payments` | Get all payments (admin) |
| PUT | `/api/payments/:id/refund` | Refund (admin) |
| GET | `/api/admin/dashboard` | Dashboard stats |
| GET | `/api/admin/users` | Get all users |
| PUT | `/api/admin/users/:id/role` | Update user role |
| PUT | `/api/admin/users/:id/toggle-active` | Toggle user status |
| GET | `/api/admin/orders` | Get all orders |
| GET | `/api/reports/sales` | Sales report |
| GET | `/api/reports/inventory` | Inventory report |
| GET | `/api/reports/customers` | Customer report |
| GET | `/api/reports/payments` | Payment report |
| GET | `/api/recommendations` | Get recommendations |
| POST | `/api/recommendations/track` | Track preference |
| GET | `/api/recommendations/popular` | Popular items |
| GET | `/api/recommendations/trending` | Trending items |
| POST | `/api/qr/table/generate` | Generate table QR (admin) |
| POST | `/api/qr/order/generate` | Generate order QR (admin) |
| GET | `/api/qr/tables` | Get all tables |
| GET | `/api/qr/tables/:tableNumber` | Get table info |

## Project Structure

```
Cafe-website/
├── backend/
│   ├── config/         # Database config
│   ├── controllers/    # Route handlers
│   ├── middleware/      # Auth, error handling
│   ├── models/         # Mongoose models
│   ├── routes/         # API routes
│   ├── services/       # Email, SMS services
│   ├── utils/          # Seed data
│   ├── server.js       # Entry point
│   └── package.json
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/ # Reusable components
│       ├── context/    # React contexts
│       ├── pages/
│       │   ├── auth/   # Login, Signup
│       │   ├── customer/ # Home, Menu, Cart
│       │   └── admin/  # Dashboard, Products
│       ├── services/   # API service
│       ├── App.js
│       └── index.js
└── README.md
```

## License

MIT
