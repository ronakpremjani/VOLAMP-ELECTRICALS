# Volamp Electricals — Order Management System (OMS)

> **Full Stack Developer Intern — 24-Hour Live Project Assessment**  
> Candidate Submission for Volamp Electricals

A full-stack, web-based Order Management System engineered for electrical product distribution (Wires & Cables, Switchgear, Modular Switches, Lighting Products, Conduit & Industrial Accessories).

---

## ⚡ 1. Project Overview & Business Flow

Volamp Electricals deals in diverse electrical goods across residential, commercial, and industrial segments. This system automates the core business pipeline:

```mermaid
graph LR
    A[Customer Profile & GST] --> B[Create Order Basket]
    B --> C[Stock Validation & Deduction]
    C --> D[Real-time Subtotal, 18% GST, Discount]
    D --> E[Order Status Workflow]
    E --> F[Payment Reconciliation]
    F --> G[Tax Invoice Generation]
```

### Complete Workflow Supported
`Customer` → `Select Products` → `Quantity & Stock Check` → `Auto-calculation (Subtotal, Discount, 18% GST, Grand Total)` → `Order Lifecycle Status` → `Payment Collection` → `Printable Tax Invoice`

---

## 🛠️ 2. Technology Stack

- **Frontend**: React 18, Vite, Lucide Icons, Plus Jakarta Sans & JetBrains Mono typography, Modern responsive Design Tokens with custom glassmorphism and print styling.
- **Backend**: Node.js, Express.js (RESTful MVC architecture: Routes, Controllers, Transactions, Business Utils).
- **Database**: SQLite with Prisma ORM (zero-configuration local setup with full relational integrity and transactional safety).
- **Dev Tools**: Concurrently, Nodemon, Morgan logger, Axios.

---

## 📁 3. Project Directory Structure

```text
VOLAMP ELECTRICALS/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema (Customer, Product, Order, OrderItem)
│   │   ├── seed.js                # Seed script with 18 electrical products & 5 customers
│   │   └── dev.db                 # SQLite database file
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js              # Prisma Client initialization
│   │   ├── controllers/
│   │   │   ├── dashboardController.js # Dynamic KPI calculations from DB
│   │   │   ├── customerController.js  # Customer CRUD + computed total orders & value
│   │   │   ├── productController.js   # Product Master CRUD + SKU & stock control
│   │   │   └── orderController.js     # Transactional order creation & status updater
│   │   ├── routes/
│   │   │   ├── dashboardRoutes.js
│   │   │   ├── customerRoutes.js
│   │   │   ├── productRoutes.js
│   │   │   └── orderRoutes.js
│   │   ├── utils/
│   │   │   └── orderCalculations.js  # Central math logic: Subtotal, 18% GST, Balance
│   │   └── server.js                 # Express server entry point
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/               # Sidebar, Header, Metric Cards
│   │   │   ├── dashboard/            # Real-time KPIs & Recent Orders
│   │   │   ├── customers/            # Customer Directory, Add/Edit & Details Modal
│   │   │   ├── products/             # Product Master, SKU & Inventory Stock
│   │   │   └── orders/               # Order Basket, Lifecycle Stepper, Invoice Modal
│   │   ├── services/
│   │   │   └── api.js                # Central Axios client
│   │   ├── styles/
│   │   │   └── index.css             # Electric theme tokens & print stylesheets
│   │   ├── App.jsx                   # Central state orchestrator
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── package.json                      # Root script to run client and server concurrently
└── README.md                         # Project documentation and demo guide
```

---

## 🚀 4. Quick Start & Setup Instructions

### Prerequisites
- Node.js (v18 or higher recommended)
- npm

### Step 1: Install All Dependencies
From the project root:
```bash
npm run install-all
```

### Step 2: Initialize Database
```bash
cd backend
npx prisma generate
npx prisma db push
# To seed dummy electrical test data:
npm run seed
# To wipe/clear all data for a clean slate:
npm run clear-db
cd ..
```
*This populates the database with 18 electrical products (Polycab wires, Havells MCBs, Anchor switches, Philips lights), 5 customers, and 6 sample orders.*

### Step 3: Run the Application
```bash
npm run dev
```
- **Frontend App**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000/api`

---

## 📊 5. Mandatory Features & Implementation Details

### A. Live Dashboard
- **Total Orders**: Total count across all customer orders.
- **Pending / Confirmed / Processing / Dispatched / Delivered / Cancelled**: Status breakdown calculated in real-time.
- **Total Order Value**: Sum of all active (non-cancelled) orders calculated from the database (`SUM(grandTotal)`).
- **Payment Outstanding**: Live breakdown of Amount Received vs. Outstanding Customer Balances.
- **Inventory Health**: Real-time counter of registered customers, total catalog products, and low stock warnings.

### B. Customer Management
- Fields: Customer Name, Company Name, Mobile Number, Email, Address, GST Number, City, State.
- List view displays Name, Company, Mobile, GST, City, Total Orders count, and Total Order Value.
- Search filter by Name, Mobile, GSTIN, Company, or City.
- Add, Edit, Delete, and View Customer Profile with complete historical purchase records.

### C. Product Master Catalog
- Fields: Product Name, Category, Brand, SKU Code, Unit (Reel, Meter, Box, Piece, Pack), Selling Price, Stock.
- Pre-seeded with 18 authentic electrical products.
- Low-stock indicator badges (`<= 10 units`) and Out-of-Stock warnings.
- Instant category and brand filter dropdowns.

### D. Create Order Basket & Calculations
- Select existing customer with company and city details.
- Add/remove multiple product lines with live quantity adjustment.
- **Mathematical Business Logic** (`backend/src/utils/orderCalculations.js`):
  $$\text{Subtotal} = \sum (\text{Quantity} \times \text{Unit Price})$$
  $$\text{Taxable Amount} = \max(0, \text{Subtotal} - \text{Discount})$$
  $$\text{GST Amount} = \text{Taxable Amount} \times 18\%$$
  $$\text{Grand Total} = \text{Taxable Amount} + \text{GST Amount}$$
  $$\text{Balance Due} = \max(0, \text{Grand Total} - \text{Amount Received})$$
- Inventory stock is atomically validated and deducted upon order creation inside a database transaction.

### E. Order Status Workflow
- Workflow transition: `Pending` → `Confirmed` → `Processing` → `Dispatched` → `Delivered`.
- Also supports `Cancelled` (automatically restores inventory stock if cancelled).

### F. Payment Reconciliation
- Statuses: `Pending` (₹0 received), `Partially Paid` (> ₹0 and < Grand Total), `Paid` (>= Grand Total).
- Record payments with instant recalculation of outstanding balance.

### G. Order Details & Official Tax Invoice
- Full order details breakdown modal with timeline progress stepper.
- Printable GST Tax Invoice layout with company branding, authorized signatory, and print shortcut.

### H. Search & Multi-criteria Filtering
- Filter by Order Number, Customer Name/Mobile, Status, Payment State, and Date Ranges.

---

## 📡 6. API Reference

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/dashboard/stats` | Fetches live calculated KPI metrics and recent orders |
| `GET` | `/api/customers` | Lists customers with computed total orders & lifetime value |
| `GET` | `/api/customers/:id` | Single customer profile with detailed order history |
| `POST` | `/api/customers` | Creates a new customer profile |
| `PUT` | `/api/customers/:id` | Updates customer details |
| `DELETE` | `/api/customers/:id` | Deletes customer (prevents deletion if active orders exist) |
| `GET` | `/api/products` | Lists catalog products with search, category & brand filters |
| `POST` | `/api/products` | Adds new product to master catalog (validates unique SKU) |
| `PUT` | `/api/products/:id` | Updates product details and stock |
| `DELETE` | `/api/products/:id` | Deletes product (prevents deletion if referenced in orders) |
| `GET` | `/api/orders` | Lists orders with search & multi-filter options |
| `GET` | `/api/orders/:id` | Retrieves full order details with product line breakdown |
| `POST` | `/api/orders` | Creates order with transactional stock deduction & math validation |
| `PATCH` | `/api/orders/:id/status` | Updates order workflow status (handles stock restoration on cancel) |
| `PATCH` | `/api/orders/:id/payment` | Records incoming payment and recomputes balance |
| `DELETE` | `/api/orders/:id` | Deletes order and returns stock |

---

## 🎓 7. Interview & Code Walkthrough Guide

When presenting during the live review, you can reference the following files:

1. **Where Order Totals are Calculated**:
   - Backend: [`backend/src/utils/orderCalculations.js`](file:///c:/Users/ronak/OneDrive/Desktop/VOLAMP%20ELECTRICALS/backend/src/utils/orderCalculations.js)
   - Frontend Real-time: [`frontend/src/components/orders/CreateOrderModal.jsx`](file:///c:/Users/ronak/OneDrive/Desktop/VOLAMP%20ELECTRICALS/frontend/src/components/orders/CreateOrderModal.jsx)
2. **Order Creation & Database Transaction**:
   - [`backend/src/controllers/orderController.js`](file:///c:/Users/ronak/OneDrive/Desktop/VOLAMP%20ELECTRICALS/backend/src/controllers/orderController.js#L95) (`createOrder` method using `prisma.$transaction`).
3. **Dynamic Dashboard Aggregations**:
   - [`backend/src/controllers/dashboardController.js`](file:///c:/Users/ronak/OneDrive/Desktop/VOLAMP%20ELECTRICALS/backend/src/controllers/dashboardController.js)
4. **Order Status Lifecycle & Stock Reversal**:
   - [`backend/src/controllers/orderController.js`](file:///c:/Users/ronak/OneDrive/Desktop/VOLAMP%20ELECTRICALS/backend/src/controllers/orderController.js#L170) (`updateOrderStatus`).

---

## 🤖 8. AI Usage Disclosure

- **AI Tools Used**: Google DeepMind Antigravity AI Assistant.
- **Role of AI**: Scaffolding the boilerplate structure, writing Prisma schema models, seeding realistic electrical industry product data, and accelerating the CSS design token implementation.
- **Engineering Adaptations**: Custom-designed electrical domain business rules (18% GST calculation, transactional stock checks, cancel-order inventory restoration, balance reconciliation, and printable GST invoice view).

---

## 🔒 9. Known Limitations & Future Enhancements

- **User Authentication**: Currently runs in Store Admin mode; multi-user JWT authentication with role-based access control (Admin, Salesperson, Warehouse Dispatcher) can be added.
- **PDF Export**: Invoices are printable via native browser print stylesheets; server-side PDF generation (e.g. using Puppeteer or PDFKit) can be integrated for automated email attachments.
- **Database Engine**: Uses SQLite for zero-setup local demo review. The Prisma schema is 100% compatible with PostgreSQL and MySQL by changing one line in `schema.prisma`.
