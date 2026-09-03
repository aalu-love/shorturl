# Postman Collection Quick Reference

## Collection Variables (Auto-Managed)

```
{{base_url}}     = http://localhost
{{api_url}}      = http://localhost/api/v1
{{jwt_token}}    = Auto-saved on Register/Login
{{api_key}}      = Auto-saved on Register/Login/Rotate
{{short_code}}   = Auto-saved on Shorten URL
{{user_id}}      = Auto-saved on Register
```

## Authentication Methods

### JWT Bearer Token (Recommended)

```
Authorization: Bearer {{jwt_token}}
```

### API Key Header

```
X-API-Key: {{api_key}}
```

### API Key Query Parameter

```
GET /api/v1/urls?api_key={{api_key}}
```

---

## 30-Second Setup

```
1. Import postman_collection.json
2. Register (Register endpoint) → sends request
3. Shorten URL (creates short_code) → sends request
4. Follow Short URL (uses {{short_code}}) → sends request
5. Done! URLs are created and redirecting
```

---

## Endpoints by Purpose

### Getting Started

- **Health Check** - Verify server is up
- **Register** - Create account (auto-saves credentials)

### URL Operations

- **Shorten URL (Authenticated)** - Create short URL with tracking
- **Shorten URL (Guest)** - Create without auth
- **List My URLs** - See all your URLs
- **Delete URL** - Remove a URL
- **Follow Short URL** - Redirect to original (the hot path)

### Analytics

- **URL Stats** - Per-URL click stats and breakdown
- **Dashboard Summary** - Account-level totals

### Auth Operations

- **Login** - Get fresh token
- **Rotate API Key** - Invalidate old key, issue new
- **Get Current User** (3 variations) - Test each auth method

---

## HTTP Status Codes

| Code | Meaning      | Example                       |
| ---- | ------------ | ----------------------------- |
| 200  | OK           | Analytics read successful     |
| 201  | Created      | URL shortened successfully    |
| 302  | Redirect     | Follow short URL redirect     |
| 400  | Bad Request  | Invalid email format          |
| 401  | Unauthorized | Missing JWT/API key           |
| 403  | Forbidden    | Can't delete other user's URL |
| 404  | Not Found    | Short code doesn't exist      |
| 409  | Conflict     | Email already registered      |
| 429  | Rate Limited | Too many requests             |

---

## Quick Workflows

### Workflow 1: Create & Redirect (45 seconds)

```
1. Register
2. Shorten URL (Authenticated)
3. Follow Short URL [uses auto-saved {{short_code}}]
```

### Workflow 2: Test All Auth Methods (30 seconds)

```
1. Register
2. Get Current User (JWT Auth)
3. Get Current User (API Key Header)
4. Get Current User (API Key Query)
5. Rotate API Key
```

### Workflow 3: Analytics Flow (60 seconds)

```
1. Shorten URL (Authenticated)
2. Follow Short URL [multiple times for clicks]
3. URL Stats (Last 30 Days) [view results]
4. Dashboard Summary
```

### Workflow 4: Error Handling (90 seconds)

```
Run all endpoints in "Error Scenarios & Validation":
- Invalid Email Format
- Weak Password
- Duplicate Email
- Unauthorized (Missing Token)
- Wrong Owner
- Invalid URL
- Rate Limit
```

---

## Important Notes

### Auto-Saved Values

- **Register/Login** → Auto-save `jwt_token` + `api_key` + `user_id`
- **Shorten URL** → Auto-save `short_code`
- **Rotate API Key** → Auto-save new `api_key`
- Always send requests to populate these

### Cache & Performance

- First redirect: ~5ms (cache miss)
- Subsequent redirects: <1ms (cache hit)
- Analytics recorded async (never delays response)

### Rate Limits

- Auth endpoints: 5 req/min per IP
- URL endpoints: 30 req/min per IP
- Redirect endpoint: 500 req/min per IP
- Hit limit → 429 error → wait 60s

### Data Note

- Guest URLs: No tracking, fire-and-forget
- Authenticated URLs: Full analytics tracking
- Soft deletes: Preserves history, marks as inactive
- Base62 codes: Guaranteed unique (no collisions)

---

## Troubleshooting

| Problem               | Solution                             |
| --------------------- | ------------------------------------ |
| `{{jwt_token}}` empty | Run Register first                   |
| Invalid short_code    | Create URL (Shorten endpoint) first  |
| 401 Unauthorized      | Check Bearer token present           |
| 429 Too Many Requests | Wait 60 seconds for rate limit reset |
| Duplicate email       | Use {{$timestamp}} (auto-unique)     |

---

## File Locations

```
postman_collection.json    - Main collection (import this)
POSTMAN_GUIDE.md          - Full documentation (this file)
POSTMAN_QUICK_REF.md      - Quick reference (this file)
```

---

Generated: 2026-03-17
Last Updated: 2026-03-17
