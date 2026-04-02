# Finance Data Processing & Access Control Backend

> A modular, production-structured Node.js/Express.js backend for managing financial records with dynamic permission-based access control, MongoDB aggregation-powered analytics, intelligent financial insights, budget tracking, and immutable audit logging.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Folder Structure](#folder-structure)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Role & Permission System](#role--permission-system)
- [Standout Engineering Features](#standout-engineering-features)
- [Analytics & Insights](#analytics--insights)
- [Key Implementation Details](#key-implementation-details)
- [Design Decisions & Tradeoffs](#design-decisions--tradeoffs)
- [Assumptions](#assumptions)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20+ |
| Framework | Express.js |
| Database | MongoDB with Mongoose ODM |
| Authentication | JWT (jsonwebtoken) + bcrypt |
| Validation | Joi |
| Configuration | dotenv |
| Dev Tooling | nodemon, morgan |

---

## Architecture

The backend follows a strict **4-layer modular architecture** where each layer has a single, clearly defined responsibility.

```
Request
  └─► Router          (defines routes, chains middleware)
        └─► Middleware (authenticate → authorize → validate)
              └─► Controller  (parses req, calls service, sends res)
                    └─► Service     (all business logic & DB queries)
                          └─► Model       (Mongoose schema + indexes + hooks)
```

**Core principles enforced throughout:**

- Controllers never touch the database directly — that is strictly the service layer's job.
- Services never import `req` or `res` — they are framework-agnostic and independently testable.
- All errors are thrown as `new ApiError(statusCode, message, code)` and caught by a single global error handler.
- All responses follow a consistent envelope: `{ success, data, message }` for success and `{ success, error, code }` for errors.

---

## Folder Structure

```
finance-backend/
├── src/
│   ├── config/
│   │   ├── db.js               ← MongoDB connection with retry logic
│   │   ├── env.js              ← Validates required env vars at startup
│   │   ├── constants.js        ← PERMISSIONS object, STATUS enums (no magic strings)
│   │   └── seed.js             ← Seeds default roles and admin user
│   │
│   ├── modules/
│   │   ├── auth/               ← register, login, /me
│   │   ├── users/              ← user management CRUD
│   │   ├── roles/              ← dynamic role + permission management
│   │   ├── records/            ← financial records with soft delete + CSV export + recurring
│   │   ├── analytics/          ← aggregation pipelines, insights, health score
│   │   ├── budgets/            ← category-level budget tracking
│   │   └── audit/              ← immutable audit log trail
│   │       └── [module]/
│   │           ├── *.routes.js
│   │           ├── *.controller.js
│   │           ├── *.service.js
│   │           └── *.model.js
│   │
│   ├── middleware/
│   │   ├── authenticate.js     ← JWT verification + user hydration
│   │   ├── authorize.js        ← Permission-based access control factory
│   │   ├── validate.js         ← Joi schema validation factory
│   │   ├── auditLogger.js      ← Non-blocking audit capture via res.on('finish')
│   │   ├── rateLimiter.js      ← Dependency-free sliding window rate limiter
│   │   ├── requestId.js        ← Injects unique X-Request-Id per request
│   │   └── errorHandler.js     ← Centralized error formatting
│   │
│   ├── validators/
│   │   ├── auth.validator.js
│   │   ├── record.validator.js
│   │   └── budget.validator.js
│   │
│   ├── utils/
│   │   ├── ApiError.js         ← Custom error class (statusCode + code)
│   │   ├── ApiResponse.js      ← Consistent response helpers
│   │   ├── pagination.js       ← Reusable paginate() utility
│   │   └── dateHelpers.js      ← Date range utilities
│   │
│   └── app.js                  ← Express app wiring
│
├── .env
├── package.json
└── README.md
```

---

## Quick Start

### Prerequisites

- Node.js 20+
- MongoDB running locally or a MongoDB Atlas connection URI

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd finance-backend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

### 3. Seed the Database

```bash
npm run seed
```

This creates:
- **3 default roles**: Viewer, Analyst, Admin (with appropriate permissions)
- **1 admin user** for immediate testing:
  - Email: `admin@finance.app`
  - Password: `Admin@1234`

### 4. Start the Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server runs at: `http://localhost:5000`  
Health check: `GET http://localhost:5000/api/health`

---

## Environment Variables

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/finance_db
JWT_SECRET=your_super_secret_key_min_32_chars
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

All required variables are validated at startup via `src/config/env.js`. The server will not start if any required variable is missing.

---

## API Reference

All protected endpoints require:
```
Authorization: Bearer <token>
```

Every request and response also carries a `X-Request-Id` header for end-to-end traceability.

---

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | None | Register new user (Viewer role assigned by default) |
| POST | `/api/auth/login` | None | Authenticate and receive JWT |
| GET | `/api/auth/me` | Token | Get current user profile with role populated |

**Register**
```json
POST /api/auth/register
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "SecurePass@123"
}
```

**Login**
```json
POST /api/auth/login
{
  "email": "admin@finance.app",
  "password": "Admin@1234"
}
```

**Response (both)**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": { "id": "...", "name": "Jane Doe", "email": "...", "role": { "slug": "viewer" } }
  },
  "message": "Login successful"
}
```

---

### Users

> Requires `manage:users` permission — Admin only

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users` | Paginated list — filter by `status`, `role` |
| GET | `/api/users/:id` | Single user with role populated |
| PATCH | `/api/users/:id` | Update user name |
| PATCH | `/api/users/:id/status` | Toggle `active` / `inactive` |
| PATCH | `/api/users/:id/role` | Reassign role |
| DELETE | `/api/users/:id` | Soft delete (sets status to `inactive`) |

---

### Roles

> Requires `manage:roles` permission — Admin only

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/roles` | List all roles |
| POST | `/api/roles` | Create role with name, permissions[], description |
| PATCH | `/api/roles/:id` | Update permissions or description |
| DELETE | `/api/roles/:id` | Delete — blocked for system roles |

**Create a Custom Role**
```json
POST /api/roles
{
  "name": "Accountant",
  "description": "Can manage records and view analytics",
  "permissions": ["read:record", "create:record", "update:record", "read:analytics"]
}
```

---

### Financial Records

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| GET | `/api/records` | `read:record` | Paginated list with filters |
| GET | `/api/records/export/csv` | `read:record` | Export filtered records as a CSV file |
| GET | `/api/records/:id` | `read:record` | Single record |
| POST | `/api/records` | `create:record` | Create record — supports recurring transactions |
| PATCH | `/api/records/:id` | `update:record` | Update record (audit logged) |
| DELETE | `/api/records/:id` | `delete:record` | Soft delete (audit logged) |

**Supported query params on `GET /api/records` and `GET /api/records/export/csv`:**

| Param | Example | Description |
|---|---|---|
| `type` | `type=expense` | Filter by `income` or `expense` |
| `category` | `category=food` | Filter by category |
| `startDate` | `startDate=2024-01-01` | Date range start |
| `endDate` | `endDate=2024-03-31` | Date range end |
| `page` | `page=2` | Page number (default: 1) |
| `limit` | `limit=20` | Results per page (default: 10) |
| `sortBy` | `sortBy=date` | Field to sort by |
| `order` | `order=asc` | Sort direction |

**Create a One-Time Record**
```json
POST /api/records
{
  "amount": 4500,
  "type": "expense",
  "category": "food",
  "date": "2024-03-15",
  "notes": "Monthly groceries"
}
```

**Create a Recurring Record**
```json
POST /api/records
{
  "amount": 12000,
  "type": "expense",
  "category": "rent",
  "date": "2024-03-01",
  "notes": "Monthly rent",
  "recurring": {
    "isRecurring": true,
    "frequency": "monthly"
  }
}
```

The `nextRecurrenceDate` is automatically computed by schema logic — no manual calculation required from the caller.

**CSV Export**

`GET /api/records/export/csv?type=expense&startDate=2024-01-01`

Returns a file download with `Content-Disposition: attachment; filename="records.csv"`. Built natively from Mongoose aggregation output — no external CSV libraries used.

---

### Analytics

> All endpoints require `read:analytics` permission

All computations run as **MongoDB aggregation pipelines**. No data is pulled into Node.js memory for processing.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/analytics/summary` | Total income, total expense, net balance |
| GET | `/api/analytics/by-category` | Category breakdown with totals and percentages |
| GET | `/api/analytics/monthly-trends` | Month-wise income vs expense (last 12 months) |
| GET | `/api/analytics/budget-status` | Live budget utilization per category |
| GET | `/api/analytics/insights` | Three intelligent financial insights |
| GET | `/api/analytics/health` | Dynamic 0–100 Financial Health Score |

**`/api/analytics/summary` response**
```json
{
  "success": true,
  "data": {
    "totalIncome": 85000,
    "totalExpense": 61200,
    "netBalance": 23800,
    "currency": "INR"
  }
}
```

**`/api/analytics/budget-status` response**
```json
{
  "success": true,
  "data": [
    {
      "category": "food",
      "limitAmount": 6000,
      "spent": 5200,
      "percentageUsed": 86.7,
      "status": "warning",
      "remaining": 800
    }
  ]
}
```

Status values: `ok` | `warning` (above alert threshold) | `over_budget`

**`/api/analytics/health` response**
```json
{
  "success": true,
  "data": {
    "score": 73,
    "grade": "Good",
    "impacts": [
      {
        "factor": "Savings Rate",
        "impact": "positive",
        "message": "You saved 28% of your income this month — above the 20% benchmark."
      },
      {
        "factor": "Budget Breaches",
        "impact": "negative",
        "message": "2 categories exceeded their budget limit this month."
      }
    ]
  }
}
```

---

### Budgets

> Requires `manage:budgets` permission — Admin only

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/budgets` | List all budgets |
| POST | `/api/budgets` | Create budget — unique per category + period |
| PATCH | `/api/budgets/:id` | Update `limitAmount` or `alertThreshold` |
| DELETE | `/api/budgets/:id` | Hard delete |

```json
POST /api/budgets
{
  "category": "food",
  "limitAmount": 6000,
  "period": "monthly",
  "alertThreshold": 80
}
```

---

### Audit Logs

> Requires `read:audit` permission — Admin and Analyst

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/audit` | Paginated logs — filter by `userId`, `resource`, `action` |
| GET | `/api/audit/user/:userId` | Full audit trail for a specific user |

---

## Role & Permission System

Roles are stored in MongoDB — not hardcoded. Each role holds an array of permission strings, meaning permissions can be changed at runtime without any code changes.

### Default Roles

| Role | Permissions |
|---|---|
| **Viewer** | `read:record`, `read:analytics` |
| **Analyst** | `read:record`, `read:analytics`, `read:audit` |
| **Admin** | All 9 permissions |

### All Permission Strings

```
read:record      create:record    update:record    delete:record
read:analytics   read:audit
manage:users     manage:roles     manage:budgets
```

### How Authorization Works

The `authorize` middleware is a factory function. Each route declares exactly what it needs:

```js
router.post('/', authenticate, authorize('create:record'), validate(schema), controller.create)
```

At runtime it checks whether the authenticated user's role includes that permission string. If not, a `403 FORBIDDEN` is thrown immediately and the controller is never reached. Because permissions live in the database, an admin can change what an Analyst can do without touching a single line of code.

---

## Standout Engineering Features

These go beyond the core assignment requirements and reflect deliberate engineering thinking.

### 1. Financial Health Score Algorithm

`GET /api/analytics/health` computes a dynamic 0–100 score by evaluating the user's savings rate against the 20% benchmark and counting active budget breaches. It returns a letter grade (`Poor`, `Fair`, `Good`, `Excellent`) and a set of localized positive and negative impact statements explaining exactly why the score is what it is — not just a number.

### 2. Native CSV Export — Zero External Libraries

`GET /api/records/export/csv` manually constructs a CSV payload directly from a Mongoose aggregation result, sets the correct `Content-Type: text/csv` and `Content-Disposition: attachment` headers, and streams it to the client. No `csv-writer`, no `fast-csv` — zero added dependencies.

### 3. Dependency-Free Sliding Window Rate Limiter

A memory-efficient rate limiter built using a JavaScript `Map` with no external packages. It enforces per-IP request limits using a sliding window algorithm and returns standard `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `Retry-After` headers on throttled responses (`429 Too Many Requests`).

### 4. End-to-End Request Traceability

A `requestId` middleware injects a unique UUID into every request as `X-Request-Id`. The same ID is echoed back in the response header, enabling full tracing across server logs, audit records, and client-side debugging without any external tracing infrastructure.

### 5. Recurring Transactions

Records support a `recurring` sub-document with a `frequency` field (`daily`, `weekly`, `monthly`). The `nextRecurrenceDate` is computed automatically inside the Mongoose schema — the caller simply sets `isRecurring: true` and a frequency; the rest is handled by the model.

---

## Analytics & Insights

### Three Intelligent Insights (`GET /api/analytics/insights`)

**1. Unusual Spending Detection**

Compares the current month's spend per category against its 6-month rolling average. Categories where current spending exceeds 150% of the average are flagged with the exact amount and percentage increase.

```json
{
  "type": "unusual_spending",
  "category": "food",
  "currentAmount": 8200,
  "avgAmount": 5100,
  "percentageIncrease": 60.8,
  "message": "Your 'food' spending this month (₹8,200) is 60.8% above your 6-month average (₹5,100)"
}
```

**2. Savings Rate Trend**

Calculates `(income - expense) / income × 100` for each of the last 3 months. A rate that declines every month triggers a warning with the full trend attached.

```json
{
  "type": "savings_decline",
  "trend": [
    { "month": "January", "rate": 32 },
    { "month": "February", "rate": 18 },
    { "month": "March", "rate": 9 }
  ],
  "message": "Your savings rate has dropped from 32% → 18% → 9% over the last 3 months"
}
```

**3. Budget Overspend Projection**

Uses `projectedSpend = currentSpend / (daysElapsed / totalDaysInMonth)` to estimate end-of-month spend and flags categories on track to exceed their budget before the month ends.

```json
{
  "type": "budget_projection",
  "category": "rent",
  "projectedAmount": 7400,
  "budgetLimit": 6000,
  "projectedOverspend": 1400,
  "message": "At current pace, you'll exceed your 'rent' budget by ₹1,400 this month"
}
```

---

## Key Implementation Details

### Soft Delete

Financial records use soft delete (`isDeleted: true`, `deletedAt`, `deletedBy`) instead of physical deletion. A Mongoose `pre('find')` hook automatically appends `{ isDeleted: false }` to every query, so deleted records are completely invisible in normal operations with no manual filtering required. They remain recoverable and retain their full audit history.

### Non-Blocking Audit Logging

Audit logs fire via `res.on('finish')` after the response is already sent to the client — adding zero latency to any API response. Sensitive fields (`password`, `token`) are stripped from payloads before logging. Logs use `timestamps: false` with a manual `createdAt`, making them truly immutable.

### Centralized Error Handling

A single `errorHandler` middleware at the end of the Express chain normalizes all thrown errors: Mongoose validation errors, duplicate key errors (`11000`), invalid ObjectId (`CastError`), and JWT errors are each mapped to the correct HTTP status code and a machine-readable `code` string.

### Dual-Layer Validation

Input is validated at two independent levels. Joi schemas at the middleware layer check request body structure before the controller is ever reached. Mongoose schema validation enforces data integrity at the database level. If the Joi layer is somehow bypassed, the database still rejects invalid data.

### Pagination

A shared `paginate(query, model, page, limit)` utility is used by every list endpoint. It always returns `{ data, pagination: { page, limit, total, totalPages } }` for consistent and predictable client consumption.

---

## Design Decisions & Tradeoffs

| Decision | Rationale |
|---|---|
| **Modular folder structure** | Each module is self-contained. Adding a new feature means adding a new folder — nothing else changes. |
| **Permission strings in middleware, not role names** | `authorize('create:record')` survives role renames and restructuring. Authorization logic is fully decoupled from role definitions. |
| **Soft delete for records, hard delete for budgets** | Financial records are business data that must never disappear — they feed analytics and audit trails. Budgets are configuration and are safe to remove. |
| **Aggregation pipelines over JS processing** | Pushing computation to MongoDB scales with the database, not the Node.js process. A million-record summary runs in one pipeline, not a `.reduce()` in memory. |
| **`res.on('finish')` for audit logging** | Audit logging never adds latency to a user-facing response, and it captures the actual HTTP status code including error responses — which a pre-response hook cannot do. |
| **Custom rate limiter over `express-rate-limit`** | Demonstrates understanding of the sliding window algorithm while avoiding an unnecessary package dependency. |
| **No refresh tokens** | Out of scope for this submission. JWTs expire in 7 days. In production, short-lived access tokens with refresh token rotation would be the correct approach. |
| **No unit/integration tests** | Not included in this submission, but the service layer is intentionally framework-agnostic and designed to be testable in isolation with a mock database. |
| **Insights run on-demand** | Computed live per request. At production scale, these would be pre-computed on a schedule and served from a cache layer. |
| **CommonJS over ESM** | Simpler compatibility with the current Mongoose and Node.js ecosystem. No transpilation or build step required. |
| **Constants file for all permission strings** | Eliminates magic strings across the codebase. All 9 permissions live in one place — a typo in any route causes an immediate, obvious failure. |

---

## Assumptions

1. **Single-tenant system**: All users share the same financial record pool. Multi-tenancy would require organization-scoped records and a tenant identifier on every document.
2. **Currency**: All amounts are in INR (Indian Rupees). No multi-currency conversion is implemented.
3. **New users get Viewer role by default**: Registration intentionally assigns the least-privileged role. An Admin must manually upgrade a user.
4. **MongoDB available locally**: The default `.env` points to `mongodb://localhost:27017/finance_db`. A MongoDB Atlas URI works as a drop-in replacement.
5. **Budget periods are monthly or weekly only**: These cover the two most common budgeting intervals. Daily and yearly periods are not supported.
6. **Insights run on-demand**: Computed live on each request. At scale, pre-computation on a cron schedule with Redis caching would be the production approach.

---

## License

ISC