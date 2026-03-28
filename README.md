# Food Ordering System - Microservices

This project is a full-stack food ordering system built with a microservices architecture. It includes a Node.js/Express backend (with API Gateway and four microservices) and a modern React + Vite frontend.

---

## Project Structure

```
food-ordering-system_-microservices-
│
├── food-ordering-system-backend
│   ├── api-gateway         # Entry point for all backend APIs (port 3000)
│   ├── user-service        # User registration, login, profile (port 3001)
│   ├── restaurant-service  # Restaurant & menu management (port 3002)
│   ├── order-service       # Order creation & tracking (port 3003)
│   └── payment-service     # Payment processing (port 3004)
│
└── food-ordering-system-frontend
	└── ...                # React + Vite frontend
```

---

## Prerequisites

- **Node.js** v14 or higher
- **npm** (comes with Node.js)
- **MongoDB** running locally on `mongodb://localhost:27017`

---

## Getting Started

### 1. Start MongoDB
Ensure MongoDB is running locally. You can use Docker or install MongoDB Community Edition.

### 2. Start Backend Services
Open a terminal for each service and run the following commands in each subfolder:

#### API Gateway
```bash
cd food-ordering-system-backend/api-gateway
npm install
npm start
# Runs on http://localhost:3000
```

#### User Service
```bash
cd food-ordering-system-backend/user-service
npm install
npm start
# Runs on http://localhost:3001
```

#### Restaurant Service
```bash
cd food-ordering-system-backend/restaurant-service
npm install
npm start
# Runs on http://localhost:3002
```

#### Order Service
```bash
cd food-ordering-system-backend/order-service
npm install
npm start
# Runs on http://localhost:3003
```

#### Payment Service
```bash
cd food-ordering-system-backend/payment-service
npm install
npm start
# Runs on http://localhost:3004
```

Each service connects to its own MongoDB database. Swagger UI is available at `/api-docs` for each service (e.g., http://localhost:3001/api-docs).

---

### 3. Start the Frontend

In a new terminal:

```bash
cd food-ordering-system-frontend
npm install
npm run dev
# Runs on http://localhost:5173 (default Vite port)
```

---

## Usage

- Access the frontend at [http://localhost:5173](http://localhost:5173)
- The frontend communicates with the backend via the API Gateway (`http://localhost:3000/api/...`).
- Register a user, log in, browse restaurants/menus, add to cart, place orders, and make payments.

---

## API Endpoints (via Gateway)

Example endpoints (all prefixed with `/api`):

- `POST   /api/users/register`      – Register a new user
- `POST   /api/users/login`         – User login
- `GET    /api/restaurants`         – List restaurants
- `POST   /api/restaurants`         – Add a restaurant (admin)
- `POST   /api/menu`                – Add menu item (admin)
- `POST   /api/orders`              – Create order
- `GET    /api/orders`              – Get user orders
- `POST   /api/payments`            – Make payment

You can also use the Swagger UI for each service for direct API testing.

---

## Notes

- Make sure all backend services are running before using the frontend.
- Each service uses its own MongoDB database (see service code for DB names).
- JWT authentication is used for protected routes.
- Admin features are available after registering/logging in as an admin user.

---

## License

MIT