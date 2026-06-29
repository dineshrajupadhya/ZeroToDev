# Contactless Restaurant Food Ordering System

A full-stack web application for contactless restaurant ordering. Customers can scan QR codes at tables, browse menus, place orders digitally, and track their order status in real-time.

## Tech Stack

- **Frontend:** React.js, Tailwind CSS, React Router v6
- **Backend:** Node.js, Express.js
- **Database:** SQLite (via better-sqlite3)
- **API Testing:** Postman

## Features

### Customer
- Browse menu with category filters and search
- Add items to cart with special instructions
- Place orders (Dine-In / Takeaway)
- Real-time order tracking with status updates
- QR code table scanning to auto-select table
- Order history and cancellation

### Admin
- Dashboard with sales statistics
- Product management (CRUD)
- Order management with status updates
- Table management with QR code generation
- User management and role assignment

### QR Code Ordering
- Admin generates unique QR codes per table
- Customers scan QR with phone camera
- Automatically sets table number for dine-in orders
- No physical menus needed

## Project Structure

```
Contactless-Restaurant-Ordering/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route handlers
│   ├── middleware/       # Auth & error handling
│   ├── routes/          # API routes
│   ├── utils/           # Seed script
│   ├── server.js        # Entry point
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── context/     # React Context (Auth, Cart)
│   │   ├── pages/       # Page components
│   │   │   ├── auth/    # Login, Signup
│   │   │   ├── customer/# Home, Menu, Cart, Orders
│   │   │   └── admin/   # Dashboard, Products, Orders, Tables, Users
│   │   ├── services/    # API service
│   │   └── App.js
│   └── package.json
└── README.md
```

## Setup & Installation

### Prerequisites
- Node.js (v16 or higher)
- npm

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
npm run seed    # Populate database with sample data
npm start       # Start server on port 5000
```

### Frontend Setup

```bash
cd frontend
npm install
npm start       # Start dev server on port 3000
```

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@cafe.com | admin123 |
| Customer | user@cafe.com | user123 |

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |
| PUT | /api/auth/profile | Update profile |

### Products
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/products | Public | List products |
| GET | /api/products/:id | Public | Get product |
| POST | /api/products | Admin | Create product |
| PUT | /api/products/:id | Admin | Update product |
| DELETE | /api/products/:id | Admin | Delete product |

### Cart
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/cart | User | Get cart |
| POST | /api/cart/add | User | Add to cart |
| PUT | /api/cart/:itemId | User | Update quantity |
| DELETE | /api/cart/:itemId | User | Remove item |
| DELETE | /api/cart/clear/all | User | Clear cart |

### Orders
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/orders | User | Create order |
| GET | /api/orders/my-orders | User | My orders |
| GET | /api/orders/:id | User | Get order |
| GET | /api/orders/admin/all | Admin | All orders |
| PUT | /api/orders/:id/status | Admin | Update status |
| PUT | /api/orders/:id/cancel | User | Cancel order |

### QR / Tables
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/qr/tables | Public | List tables |
| GET | /api/qr/tables/:tableNumber | Public | Get table |
| POST | /api/qr/table/generate | Admin | Generate QR |
| PUT | /api/qr/tables/:id/status | Admin | Update status |

## Database Schema

- **users** - User accounts (customer/admin)
- **categories** - Food categories
- **products** - Menu items
- **cart_items** - Shopping cart per user
- **orders** - Customer orders with status tracking
- **order_items** - Items within each order
- **tables** - Restaurant tables with QR codes
- **payments** - Payment records

## License

MIT
