# API Reference

**Base URL:** `http://localhost:3001/api/v1`

---

## Authentication

Vanguard Graph uses JWT Bearer tokens. Generate a token via your backend secret:

```
Authorization: Bearer <jwt-token>
```

**Example token generation (dev):**
```bash
node -e "
const jwt = require('jsonwebtoken');
const token = jwt.sign(
  { id: 'admin', role: 'admin' },
  process.env.JWT_SECRET
);
console.log(token);
"
```

**Public routes** (no auth required):
- `GET /api/v1/health`

---

## Rate Limiting

- **Limit:** 100 requests per 15 minutes per IP
- **Headers:** `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`
- **429 response:**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests, please try again later"
  }
}
```

---

## Response Formats

### Success
```json
{
  "success": true,
  "data": { ... }
}
```

### Paginated Success
```json
{
  "success": true,
  "data": [ ... ],
  "total": 42,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```

### Error
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable description",
    "details": []  // present on validation errors
  }
}
```

---

## Common Error Codes

| Status | Code | When |
|--------|------|------|
| 400 | `VALIDATION_ERROR` | Invalid request body or query params |
| 401 | `UNAUTHORIZED` | Missing or invalid JWT |
| 404 | `NOT_FOUND` | Resource not found |
| 409 | `CONFLICT` | Duplicate unique field (e.g., email) |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests |
| 500 | `INTERNAL_ERROR` | Unexpected server error |

---

## Merchants

---

### POST `/api/v1/merchants`
> Onboard a new merchant. Returns the created merchant record.

**Request Body:**
```json
{
  "name": "Rajesh Kumar Traders",
  "email": "rajesh.kumar@example.com",
  "phone": "9876543210",
  "deviceFingerprint": "D-773",
  "ipAddress": "192.168.1.10",
  "bankAccountNumber": "123456789012",
  "bankAccountIfsc": "HDFC0001234"
}
```

| Field | Type | Rules |
|-------|------|-------|
| name | string | Required, max 200 chars |
| email | string | Required, valid email format |
| phone | string | Required, exactly 10 digits |
| deviceFingerprint | string | Required, device identifier |
| ipAddress | string | Required, valid IPv4 address |
| bankAccountNumber | string | Required |
| bankAccountIfsc | string | Required, must match `^[A-Z]{4}0[A-Z0-9]{6}$` |

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": "cmqy36abc0001j3d5xyz7890",
    "name": "Rajesh Kumar Traders",
    "email": "rajesh.kumar@example.com",
    "phone": "9876543210",
    "deviceFingerprint": "D-773",
    "ipAddress": "192.168.1.10",
    "bankAccountNumber": "123456789012",
    "bankAccountIfsc": "HDFC0001234",
    "status": "pending",
    "riskScore": 0,
    "riskLevel": "low",
    "createdAt": "2026-06-29T04:05:37.000Z",
    "updatedAt": "2026-06-29T04:05:37.000Z"
  }
}
```

**Response 409 — Duplicate email:**
```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "A merchant with this email already exists"
  }
}
```

**Response 400 — Validation errors:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": [
      { "field": "email", "message": "Invalid email format" },
      { "field": "phone", "message": "Phone must be exactly 10 digits" }
    ]
  }
}
```

---

### GET `/api/v1/merchants`
> List merchants with optional filters and pagination.

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 20 | Items per page (max 100) |
| status | string | — | Filter: `pending`, `approved`, `under_review`, `blocked` |
| riskLevel | string | — | Filter: `low`, `medium`, `high` |
| search | string | — | Search name, email, or phone (partial match) |

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "cmqy36abc0001j3d5xyz7890",
      "name": "Rajesh Kumar Traders",
      "email": "rajesh.kumar@example.com",
      "phone": "9876543210",
      "deviceFingerprint": "D-773",
      "ipAddress": "192.168.1.10",
      "bankAccountNumber": "123456789012",
      "bankAccountIfsc": "HDFC0001234",
      "status": "pending",
      "riskScore": 0,
      "riskLevel": "low",
      "createdAt": "2026-06-29T04:05:37.000Z",
      "updatedAt": "2026-06-29T04:05:37.000Z"
    }
  ],
  "total": 20,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

---

### GET `/api/v1/merchants/:id`
> Get a single merchant by its CUID.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "cmqy36abc0001j3d5xyz7890",
    "name": "Rajesh Kumar Traders",
    "email": "rajesh.kumar@example.com",
    "phone": "9876543210",
    "deviceFingerprint": "D-773",
    "ipAddress": "192.168.1.10",
    "bankAccountNumber": "123456789012",
    "bankAccountIfsc": "HDFC0001234",
    "status": "pending",
    "riskScore": 0,
    "riskLevel": "low",
    "createdAt": "2026-06-29T04:05:37.000Z",
    "updatedAt": "2026-06-29T04:05:37.000Z"
  }
}
```

**Response 404:**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Merchant not found"
  }
}
```

---

### PATCH `/api/v1/merchants/:id`
> Update one or more merchant fields. Only included fields are changed.

**Request Body:**
```json
{
  "status": "approved",
  "riskScore": 85,
  "riskLevel": "high"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "cmqy36abc0001j3d5xyz7890",
    "name": "Rajesh Kumar Traders",
    "status": "approved",
    "riskScore": 85,
    "riskLevel": "high",
    "updatedAt": "2026-06-29T04:41:37.000Z"
  }
}
```

---

### POST `/api/v1/merchants/:id/payout-change`
> Trigger a payout change event. This initiates a Render Workflow that re-evaluates risk with the new bank account details.

**Request Body:**
```json
{
  "newBankAccountNumber": "999988887777",
  "newBankAccountIfsc": "SBIN0001234",
  "reason": "Updating banking details for faster settlements"
}
```

| Field | Type | Rules |
|-------|------|-------|
| newBankAccountNumber | string | Required |
| newBankAccountIfsc | string | Required, valid IFSC format |
| reason | string | Required, max 500 chars |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "cmqy36abc0001j3d5xyz7890",
    "bankAccountNumber": "999988887777",
    "bankAccountIfsc": "SBIN0001234",
    "updatedAt": "2026-06-29T04:41:51.000Z"
  }
}
```

---

## Alerts

---

### GET `/api/v1/alerts`
> List alerts with filters and pagination.

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 20 | Items per page (max 100) |
| merchantId | string | — | Filter by merchant CUID |
| riskLevel | string | — | `low`, `medium`, `high` |
| status | string | — | `open`, `under_review`, `resolved`, `escalated` |
| dateFrom | string (ISO) | — | Filter alerts created after this datetime |
| dateTo | string (ISO) | — | Filter alerts created before this datetime |

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "cmqy3aj60014j3d5xyzabcd1",
      "merchantId": "cmqy36abc0001j3d5xyz7890",
      "riskScore": 92,
      "riskLevel": "high",
      "status": "open",
      "summary": "Shared device D-773 detected across 5 merchants. Bank account overlaps with known fraud patterns.",
      "investigationId": null,
      "createdAt": "2026-06-29T04:05:44.000Z",
      "updatedAt": "2026-06-29T04:05:44.000Z",
      "merchant": {
        "name": "Rajesh Kumar Traders",
        "email": "rajesh.kumar@example.com"
      }
    }
  ],
  "total": 10,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

---

### GET `/api/v1/alerts/:id`
> Get a single alert by CUID.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "cmqy3aj60014j3d5xyzabcd1",
    "merchantId": "cmqy36abc0001j3d5xyz7890",
    "riskScore": 92,
    "riskLevel": "high",
    "status": "open",
    "summary": "Shared device D-773 detected across 5 merchants.",
    "investigationId": null,
    "createdAt": "2026-06-29T04:05:44.000Z",
    "updatedAt": "2026-06-29T04:05:44.000Z",
    "merchant": {
      "name": "Rajesh Kumar Traders",
      "email": "rajesh.kumar@example.com"
    }
  }
}
```

---

### PATCH `/api/v1/alerts/:id/status`
> Update alert status. Used by fraud analysts to track investigation progress.

**Request Body:**
```json
{
  "status": "under_review",
  "note": "Investigating shared device pattern across 5 merchants"
}
```

| Field | Type | Rules |
|-------|------|-------|
| status | string | Required. One of: `open`, `under_review`, `resolved`, `escalated` |
| note | string | Optional, max 500 chars |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "cmqy3aj60014j3d5xyzabcd1",
    "status": "under_review",
    "updatedAt": "2026-06-29T04:40:14.000Z"
  }
}
```

---

## Health

---

### GET `/api/v1/health`
> Public endpoint. Returns connection status of all infrastructure dependencies.

**Response 200 (all healthy):**
```json
{
  "status": "ok",
  "postgres": "connected",
  "redis": "connected",
  "timestamp": "2026-06-29T04:41:01.000Z"
}
```

**Response 503 (degraded):**
```json
{
  "status": "degraded",
  "postgres": "connected",
  "redis": "disconnected",
  "timestamp": "2026-06-29T04:06:00.000Z"
}
```
