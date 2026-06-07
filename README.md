# 🔐 Auth Backend — Node.js + Express + MongoDB

Production-grade authentication API with JWT, refresh token rotation, forgot password, and email verification.

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your values
```

### 3. Start the server
```bash
# Development
npm run dev

# Production
npm start
```

---

## 📁 Project Structure

```
src/
├── config/
│   ├── database.js       # MongoDB connection
│   ├── mail.js           # Nodemailer transporter
│   └── env.js            # Zod-validated environment config
│
├── controllers/
│   └── auth.controller.js
│
├── services/
│   ├── auth.service.js   # Business logic
│   └── email.service.js  # Email sending
│
├── models/
│   ├── User.js
│   ├── RefreshToken.js
│   └── PasswordResetToken.js
│
├── routes/
│   └── auth.routes.js
│
├── middlewares/
│   ├── auth.middleware.js       # JWT authentication guard
│   ├── error.middleware.js      # Global error handler
│   ├── validate.middleware.js   # Zod validation middleware
│   └── rateLimiter.middleware.js
│
├── validators/
│   └── auth.validator.js        # Zod schemas
│
├── utils/
│   ├── ApiResponse.js
│   ├── ApiError.js
│   ├── asyncHandler.js
│   ├── generateTokens.js
│   └── emailTemplates.js
│
├── app.js
└── server.js
```

---

## 🔌 API Reference

### Base URL
```
http://localhost:5000/api/v1
```

---

### Auth Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|:---:|-------------|
| POST | `/auth/register` | ❌ | Register a new account |
| POST | `/auth/login` | ❌ | Login with email + password |
| POST | `/auth/refresh-token` | ❌ | Rotate refresh token |
| POST | `/auth/forgot-password` | ❌ | Request password reset email |
| POST | `/auth/reset-password/:token` | ❌ | Reset password with token |
| GET | `/auth/verify-email/:token` | ❌ | Verify email address |
| GET | `/auth/me` | ✅ | Get current user profile |
| POST | `/auth/logout` | ✅ | Logout current device |
| POST | `/auth/logout-all` | ✅ | Logout all devices |
| GET | `/health` | ❌ | Health check |

---

### POST `/auth/register`

**Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecurePass@123"
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "user": { "id": "...", "firstName": "John", "email": "john@example.com" },
    "accessToken": "eyJ..."
  }
}
```

---

### POST `/auth/login`

**Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass@123"
}
```

---

### POST `/auth/forgot-password`

**Body:**
```json
{
  "email": "john@example.com"
}
```

> Always returns 200 to prevent email enumeration.

---

### POST `/auth/reset-password/:token`

**Body:**
```json
{
  "password": "NewSecurePass@456",
  "confirmPassword": "NewSecurePass@456"
}
```

---

### GET `/auth/me` *(Protected)*

**Headers:**
```
Authorization: Bearer <accessToken>
```

---

## 🔒 Security Features

- **bcrypt** password hashing (12 salt rounds)
- **JWT** access tokens (15 min) + **Refresh tokens** (7 days)
- **Refresh token rotation** — old token revoked on every refresh
- **Account lockout** after 5 failed attempts for 15 minutes
- **Cryptographically secure** password reset tokens (SHA-256 hashed)
- **HTTP-only cookies** for token storage
- **Helmet** security headers
- **CORS** whitelist
- **Rate limiting**: 20 req/15min on auth, 5 req/hr on password reset
- **Zod** input validation and sanitization

---

## ⚙️ Environment Variables

| Variable | Description | Required |
|----------|-------------|:---:|
| `MONGODB_URI` | MongoDB connection string | ✅ |
| `JWT_ACCESS_SECRET` | Secret for access tokens (min 32 chars) | ✅ |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens (min 32 chars) | ✅ |
| `SMTP_HOST` | SMTP server host | ✅ |
| `SMTP_USER` | SMTP username | ✅ |
| `SMTP_PASS` | SMTP password or app password | ✅ |
| `CLIENT_URL` | Frontend base URL for email links | ✅ |

---

## 📧 Email Flows

| Event | Email Sent |
|-------|-----------|
| Register | Welcome email + Email verification link |
| Email verify | Confirmation |
| Forgot password | Password reset link (1hr expiry) |
| Password changed | Security alert notification |

---

## 📐 Password Requirements

- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character
