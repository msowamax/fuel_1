# Fuel Ticket Management App

A modern, full-stack application for managing fuel station tickets, built with Next.js 14, Node.js, and MongoDB.

## Features

- **Authentication**: Role-based access (Admin/Employee).
- **Ticket Creation**: Issue tickets with auto-calculated prices and unique IDs.
- **Dashboard**: Real-time daily stats (Tickets, Liters, Revenue).
- **History**: Searchable and filterable ticket records.
- **Reports**: Export all data to CSV for accounting.
- **Responsive UI**: Optimized for tablets and desktop use at gas stations.

## Tech Stack

- **Frontend**: React (Next.js 14 App Router), Tailwind CSS, Lucide Icons.
- **Backend**: Node.js, Express, JWT.
- **Database**: MongoDB (Mongoose ORM).

## Installation

### Prerequisites

- Node.js (v18+)
- MongoDB (Local or Atlas)

### 1. Clone & Setup Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MONGO_URI and JWT_SECRET
```

### 2. Seed Admin User

```bash
node seed.js
```
*Credentials: `admin@fuelstation.com` / `adminpassword123`*

### 3. Setup Frontend

```bash
cd ../frontend
npm install
```

### 4. Running the App

**Backend:**
```bash
cd backend
node server.js
```

**Frontend:**
```bash
cd frontend
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

## API Endpoints

- `POST /api/auth/login`: Login user.
- `POST /api/tickets`: Create a new ticket (Auth required).
- `GET /api/tickets`: Get ticket history (Auth required).
- `GET /api/tickets/stats`: Get dashboard statistics (Auth required).
- `DELETE /api/tickets/:id`: Delete ticket (Admin required).
```
