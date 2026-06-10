# Smart Cafeteria Management System

A full-stack cafeteria management system with React, Node.js, Express, MongoDB, and Tailwind CSS.

## Live Demo

**Hosted on Netlify:** https://stunning-dragon-2ea029.netlify.app

**Backend API:** https://smart-cafe-order-backend.onrender.com

- **Admin:** admin@smartcafe.com / admin123
- **User:** john@example.com / user123

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

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@smartcafe.com | admin123 |
| User | john@example.com | user123 |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| GET | `/api/products` | Get all products |
| POST | `/api/cart/add` | Add to cart |
| POST | `/api/orders` | Create order |
| GET | `/api/admin/dashboard` | Dashboard stats |
| GET | `/api/reports/sales` | Sales report |

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
