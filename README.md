# Restaurant Management System Using Chatbot

This project is a beginner-friendly MERN stack restaurant management system with a restaurant chatbot, user authentication, food menu, cart flow, order tracking, and admin dashboard.

## Project structure

```bash
Restaurant_Management_System/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   ├── index.html
│   └── package.json
├── package.json
├── README.md
└── .gitignore
```

## Prerequisites

- Node.js 18+
- npm
- MongoDB running locally or MongoDB Atlas

## Setup MongoDB

### Local MongoDB

1. Install MongoDB Community Edition.
2. Start MongoDB using the default service or the CLI.
3. Confirm the database is accessible at `mongodb://127.0.0.1:27017`.

### MongoDB Atlas

1. Create a MongoDB Atlas cluster.
2. Copy the connection string.
3. Set it in `backend/.env`.

## Installation

From the project root, run:

```bash
npm install
npm --prefix backend install
npm --prefix frontend install
```

You can also use:

```bash
npm run install:all
```

Create the backend environment file:

```bash
copy backend\.env.example backend\.env
```

Then update `backend/.env` with your own values:

```env
MONGO_URI=mongodb://127.0.0.1:27017/restaurant_management_system
JWT_SECRET=replace_with_a_long_random_secret
PORT=5000
CLIENT_URL=http://localhost:5173
ADMIN_EMAIL=admin@flavornest.com
ADMIN_PASSWORD=Admin@123
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_test_key_secret
```

Add your Razorpay **test-mode** API keys from the Razorpay Dashboard to
`backend/.env` to enable UPI checkout. Keep the key secret on the backend; only
the public key ID is sent to the frontend. UPI orders are created only after the
backend verifies that Razorpay captured the payment. Cash on Delivery does not
require Razorpay keys.

## Run the project

From the project root:

```bash
npm run dev
```

This starts:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

You can also run them separately:

```bash
npm run start:frontend
npm run start:backend
```

## Create the first admin account

Use the secure script below after configuring `.env`:

```bash
npm --prefix backend run admin
```

If no admin exists, the script creates one.

Default admin credentials:
- Email: `admin@flavornest.com`
- Password: `Admin@123`

For production, change the `.env` admin values before creation.

## Features

- User registration and login with JWT and bcrypt-compatible hashing
- Dynamic menu with search, sorting, and category filters
- Shopping cart and checkout flow
- Cash on Delivery and Razorpay UPI checkout with server-side payment verification
- Saved checkout name, phone, and delivery address for future orders
- User dashboard with account details, order summaries, and recent orders
- My Orders page with order history
- Restaurant chatbot using rule-based responses
- Admin dashboard for sales and order status updates

After login, regular users are sent to `/dashboard` and admins are sent to `/admin`.
New accounts created through registration receive the regular user role. To access the
admin dashboard, create the administrator account using the admin setup instructions above.

## Troubleshooting

- If the backend cannot connect to MongoDB, verify `MONGO_URI`.
- If the frontend cannot load, ensure the backend is running on port 5000.
- If login fails, verify the password and JWT secret.
- If the menu is empty, ensure MongoDB is connected and the server has seeded food data.

## Notes

This app uses a local rule-based chatbot so it works without a paid AI API key.

## Local development URLs

- Frontend (Vite): http://localhost:5173
- Backend API: http://localhost:5000
- Health check: http://localhost:5000/api/health
