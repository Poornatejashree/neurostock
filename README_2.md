# NeuroStock — Smart Inventory System

A production-grade inventory management system built with React + Node.js + MongoDB Atlas.

---

## Project Structure

```
neurostock/
├── frontend/          ← React (Vite) app
│   └── src/
│       ├── pages/     ← Dashboard, Products, Sales, LowStock, Analytics, Login
│       ├── components/← Layout, ProtectedRoute
│       └── utils/api.js ← All API calls
│
└── backend/           ← Express + MongoDB Atlas
    ├── controllers/   ← analyticsController, authController, productController, saleController
    ├── models/        ← Product, User, Sale
    ├── routes/        ← productRoutes, authRoutes, saleRoutes, analyticsRoutes
    ├── middleware/    ← authMiddleware (JWT protect)
    └── server.js
```

---

## Backend Setup

### 1. Install dependencies
```bash
cd backend
npm install
```

### 2. Configure environment
Copy `.env.example` to `.env` and fill in your values:
```
MONGO_URI=mongodb+srv://...   ← from MongoDB Atlas
JWT_SECRET=some_long_secret_string
PORT=5000
```

### 3. Start the server
```bash
npm start
# Server running on port 5000
# MongoDB Connected
```

---

## Frontend Setup

### 1. Install dependencies
```bash
cd frontend
npm install
```

### 2. Configure environment
Copy `.env.example` to `.env`:
```
VITE_API_URL=http://localhost:5000/api
```

### 3. Start the dev server
```bash
npm run dev
# App running at http://localhost:5173
```

---

## Creating Your First Admin User

Since public signup is disabled, use Postman to create your first admin:

**POST** `http://localhost:5000/api/auth/register`
```json
{
  "name": "Admin User",
  "email": "admin@company.com",
  "password": "yourpassword",
  "role": "admin"
}
```

Then log in at the frontend login page.

> **After creating the first admin, protect the `/api/auth/register` route** by adding the `protect` middleware to it.

---

## API Endpoints (for Postman)

### Auth
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | No | Create user |
| POST | `/api/auth/login` | No | Login → returns JWT |

### Products
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/products` | ✅ | All products |
| POST | `/api/products` | ✅ | Add product |
| PUT | `/api/products/:id` | ✅ | Update product |
| DELETE | `/api/products/:id` | ✅ | Delete product |
| GET | `/api/products/low-stock` | ✅ | Low/out-of-stock items |

### Sales
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/sales` | ✅ | All sales |
| POST | `/api/sales` | ✅ | Record a sale |

### Analytics
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/analytics/summary` | ✅ | Dashboard summary |

**Auth Header format:**
```
Authorization: Bearer <token>
```

---

## Features

- ✅ Dashboard with live stats, charts, low-stock alerts, recent activity
- ✅ Products CRUD (add, edit, delete, search, filter by category)
- ✅ Stock status tracking (In Stock / Low Stock / Out of Stock)
- ✅ Low Stock page with critical vs warning breakdown
- ✅ Sales recording with stock deduction
- ✅ Analytics page — revenue, holding cost, cost analysis
- ✅ JWT authentication with role-based access
- ✅ Notification bell with in-app alerts
- ✅ Collapsible sidebar, dark theme, responsive layout

## Roadmap (Next Steps)
- [ ] Socket.IO for real-time stock alerts
- [ ] Excel import → auto DB insertion
- [ ] Email notifications (Nodemailer)
- [ ] Multi-warehouse location tracking
- [ ] AI demand prediction (Python FastAPI microservice)
- [ ] Barcode/QR scanning
- [ ] Supplier management module
- [ ] PDF/Excel export for reports
