# 🛡️ PhishGuard — Setup & Run Guide

## Project Structure
```
phishguard/
├── backend/              ← Node.js + Express + MongoDB
│   ├── config/db.js      ← MongoDB connection
│   ├── models/
│   │   ├── User.js       ← User schema with bcrypt hashing
│   │   └── Complaint.js  ← Fraud complaint schema
│   ├── middleware/
│   │   ├── auth.js       ← JWT verify + role guards
│   │   └── upload.js     ← Multer file upload (10MB, images/PDF)
│   ├── routes/
│   │   ├── auth.js       ← Register, Login, Logout, Refresh, Reset
│   │   ├── users.js      ← Profile, progress, quiz results
│   │   └── complaints.js ← Submit, list, update complaints
│   └── server.js         ← Express app entry point
└── frontend/
    └── src/
        ├── utils/api.js         ← Axios instance + all API calls
        └── context/AuthContext.jsx ← Global auth state (React Context)
```

---

## Step 1 — Prerequisites

- Node.js v18+ installed
- MongoDB installed locally OR a free MongoDB Atlas cluster
- npm or yarn

---

## Step 2 — Backend Setup

```bash
cd phishguard/backend

# Install all backend dependencies
npm install

# Copy environment file and configure it
cp .env.example .env
```

Open `.env` and set:
```
MONGO_URI=mongodb://localhost:27017/phishguard
JWT_SECRET=any_long_random_string_here_change_this
JWT_REFRESH_SECRET=another_long_random_string_here
```

Start the backend:
```bash
npm run dev       # Development (auto-restart with nodemon)
npm start         # Production
```

You should see:
```
✅ MongoDB Connected: localhost
📦 Database: phishguard
📡 Server running on port 5000
```

---

## Step 3 — Create Admin Account

After the backend is running, register normally then promote via MongoDB Compass:

1. Open MongoDB Compass → connect to `mongodb://localhost:27017`
2. Open `phishguard` → `users` collection
3. Find your user document → Edit → change `role` from `"user"` to `"admin"` → Save

Or via Mongo shell:
```js
db.users.updateOne({ email: "your@email.com" }, { $set: { role: "admin" } })
```

---

## Step 4 — Frontend Setup

```bash
cd phishguard/frontend

# Install frontend dependencies
npm install

# Start React development server
npm start
```

React runs on http://localhost:3000 and proxies API calls to http://localhost:5000.

---

## How Security Works

### Registration
1. User fills name, email, password, confirmPassword
2. Express-validator validates all fields
3. Check if email already exists in MongoDB → 409 if duplicate
4. **bcrypt hashes the password** with 12 salt rounds before saving
5. Plain text password is NEVER stored in the database
6. JWT access token (15min) + refresh token (7 days) are generated
7. Tokens sent in response body AND as httpOnly cookies

### Login
1. User submits email + password
2. User fetched with `select('+password')` (password excluded by default)
3. **bcrypt.compare()** checks entered password against stored hash
4. Failed logins tracked — account locks for 15 min after 5 bad attempts
5. On success: failed counter reset, lastLogin updated, tokens issued

### Route Protection
- Every protected route runs the `protect` middleware
- Middleware extracts JWT from `Authorization: Bearer <token>` header
- JWT verified with `jwt.verify()` using the secret
- User fetched from DB to confirm they still exist and are active
- `adminOnly` middleware additionally checks `user.role === 'admin'`

### Token Security
- Access tokens expire in 15 minutes (short-lived)
- Refresh tokens expire in 7 days (stored in DB, can be revoked)
- On 401 TOKEN_EXPIRED: axios interceptor automatically calls /auth/refresh
- On logout: refresh token cleared from DB (revoked server-side)

---

## API Reference

### Auth
| Method | Endpoint | Body | Auth |
|--------|----------|------|------|
| POST | `/api/auth/register` | name, email, password, confirmPassword | ❌ |
| POST | `/api/auth/login` | email, password | ❌ |
| POST | `/api/auth/logout` | — | ✅ |
| POST | `/api/auth/refresh` | — | Cookie |
| GET | `/api/auth/me` | — | ✅ |
| POST | `/api/auth/forgot-password` | email | ❌ |
| POST | `/api/auth/reset-password/:token` | password | ❌ |

### Users
| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/api/users/profile` | ✅ User |
| PATCH | `/api/users/profile` | ✅ User |
| PATCH | `/api/users/change-password` | ✅ User |
| PATCH | `/api/users/training-progress` | ✅ User |
| POST | `/api/users/quiz-result` | ✅ User |
| GET | `/api/users` | 🔴 Admin |

### Complaints
| Method | Endpoint | Auth |
|--------|----------|------|
| POST | `/api/complaints` | ✅ User |
| GET | `/api/complaints/my` | ✅ User |
| GET | `/api/complaints/:id` | ✅ Owner/Admin |
| GET | `/api/complaints` | 🔴 Admin |
| PATCH | `/api/complaints/:id/status` | 🔴 Admin |

---

## Test in Postman

**Register:**
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "Test@1234",
  "confirmPassword": "Test@1234"
}
```

**Login:**
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Test@1234"
}
```
Copy the `accessToken` from the response, then use it as `Authorization: Bearer <token>` for all protected routes.
