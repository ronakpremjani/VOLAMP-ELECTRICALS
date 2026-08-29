# Volamp Electricals OMS

A full-stack Order Management System (OMS) custom-built for Volamp Electricals. This platform handles customers, product catalogs, order workflows, payment ledgers, and real-time dashboard analytics.

## 🏗️ Architecture

The project is structured as a monorepo containing two separate applications:

- **/frontend**: A Single Page Application (SPA) built with React and Vite.
- **/backend**: A REST API built with Node.js, Express, Prisma ORM, and PostgreSQL.

### Tech Stack
- **Frontend**: React 19, Vite, React Router, TailwindCSS/Custom CSS, Axios, Socket.IO Client, Lucide React (Icons).
- **Backend**: Node.js, Express 5, Prisma 7, PostgreSQL (Supabase), Socket.IO, JWT Auth, Bcrypt.

---

## 🚀 Local Development Setup

### 1. Prerequisites
- Node.js (v20+ recommended)
- A PostgreSQL database (e.g., local Postgres or Supabase)

### 2. Backend Setup
\\\ash
cd backend
npm install
\\\

Create a \.env\ file in the \ackend\ directory:
\\\env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://user:password@localhost:5432/volamp"
CLIENT_URL=http://localhost:5173
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
\\\

Initialize the database schema and generate the Prisma Client:
\\\ash
npm run prisma:push
npm run prisma:generate
\\\
*(Optional)* Seed the database with mock data: \
pm run seed\

Start the backend development server:
\\\ash
npm run dev
\\\

### 3. Frontend Setup
Open a new terminal window:
\\\ash
cd frontend
npm install
\\\

Create a \.env\ file in the \rontend\ directory:
\\\env
VITE_API_URL=http://localhost:5000/api
\\\

Start the frontend Vite development server:
\\\ash
npm run dev
\\\
The application will be available at [http://localhost:5173](http://localhost:5173).

---

## ☁️ Production Deployment

### Backend (Render / Railway / Heroku)
The backend is a standard Node.js Express server.
- **Root Directory**: \ackend\
- **Build Command**: \
pm run build\
- **Start Command**: \
pm start\
- **Environment Variables**: \DATABASE_URL\, \DIRECT_URL\, \JWT_SECRET\, \NODE_ENV=production\

### Frontend (Vercel)
The frontend is a static React SPA.
- **Root Directory**: \rontend\
- **Framework Preset**: Vite
- **Build Command**: \
pm run build\
- **Output Directory**: \dist\
- **Environment Variables**: \VITE_API_URL=https://your-backend-domain.com/api\
- *Note: A \ercel.json\ file is included in the frontend directory to handle React Router history fallback (prevents 404s on direct URL visits).*

---

## 🔒 Security & CORS
In production, the backend is configured to exclusively accept API and Socket.IO requests from the configured frontend origins (e.g., \http://localhost:5173\ and \https://volamp-electricals.vercel.app\).
