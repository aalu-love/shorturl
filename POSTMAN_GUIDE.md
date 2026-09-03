# Postman Collection Guide

A comprehensive test suite for the URL Shortener API with instant credential management and detailed assertions.

## Quick Start

### 1. Import Collection

- Open Postman
- Click **Import** → **Choose Files**
- Select `postman_collection.json`
- Click **Import**

### 2. Run Setup Workflow

1. Go to **Authentication** folder
2. Click **Register** → **Send**
   - ✓ Auto-saves JWT token and API key to collection variables
   - Email is auto-generated with timestamp to avoid duplicates
3. Go to **URL Shortening** folder
4. Click **Shorten URL (Authenticated)** → **Send**
   - ✓ Auto-saves `short_code` to collection variables

### 3. Test Full Flow

- **Redirects** folder → **Follow Short URL** → **Send**
- **Analytics** folder → **URL Stats (Last 30 Days)** → **Send**

Done! You've created a URL, redirected to it, and checked analytics.

---

## Collection Organization

### Health & Connectivity

**Health Check** - Verify server is running

- Returns: `{ status: "ok", uptime, timestamp }`
- No auth required

### Authentication

Complete user lifecycle management with automatic credential saving.

| Endpoint                              | Auth             | Purpose                                  |
| ------------------------------------- | ---------------- | ---------------------------------------- |
| **Register**                          | None             | Create account, auto-saves JWT + API key |
| **Login**                             | None             | Get fresh JWT + API key                  |
| **Get Current User (JWT)**            | Bearer token     | Verify JWT auth method works             |
| **Get Current User (API Key Header)** | X-API-Key header | Verify API Key header auth works         |
| **Get Current User (API Key Query)**  | Query param      | Verify fallback auth works               |
| **Rotate API Key**                    | Bearer token     | Invalidate old key, issue new one        |

**Test Script Notes:**

- Register/Login tests auto-populate collection variables
- Others test that auth methods work identically
- All include response validation

### URL Shortening

Create, manage, and delete short URLs.

| Endpoint                        | Auth | Features                          |
| ------------------------------- | ---- | --------------------------------- |
| **Shorten URL (Authenticated)** | JWT  | Base62 auto-code, pre-warms cache |
| **Shorten URL (Custom Code)**   | JWT  | Custom code + expiration          |
| **Shorten URL (Guest)**         | None | No auth needed, no custom codes   |
| **List My URLs**                | JWT  | Paginated list of user's URLs     |
| **Delete URL**                  | JWT  | Soft-delete, evicts cache         |

**Key Points:**

- Authenticated URLs get analytics tracking
- Guest URLs are fire-and-forget
- Custom codes require auth
- short_codes are Postman collection variables (auto-saved)

### Redirects (Hot Path)

The production-critical redirect flow.

| Endpoint                | Behavior                    |
| ----------------------- | --------------------------- |
| **Follow Short URL**    | Redirect with cache warming |
| **Follow Non-Existent** | Returns 404                 |

**Performance Flow:**

1. Cache hit: <1ms
2. Cache miss: ~5ms (DB query + mutex lock + cache populate)
3. Click recorded async (never delays response)

### Analytics

Real-time statistics powered by read replicas.

| Endpoint                     | Purpose                               |
| ---------------------------- | ------------------------------------- |
| **URL Stats (30 days)**      | Daily breakdown, referrers, countries |
| **URL Stats (Custom Range)** | Change `days` parameter               |
| **Dashboard Summary**        | Account-level totals                  |

**Data Routes:**

- All analytics queries go to **READ REPLICA**
- Never blocks primary (which receives clicks async)
- Includes denormalized click data for fast aggregation

### Error Scenarios & Validation

Real error cases to verify error handling.

| Scenario         | Expected          | Status |
| ---------------- | ----------------- | ------ |
| Invalid email    | Validation error  | 400    |
| Weak password    | Validation error  | 400    |
| Duplicate email  | Conflict          | 409    |
| Missing auth     | Unauthorized      | 401    |
| Non-owner delete | Forbidden         | 403    |
| Rate limit hit   | Too many requests | 429    |

---

## Collection Variables

These are auto-managed by test scripts, but you can also set them manually:

| Variable     | Example                   | Purpose                                       |
| ------------ | ------------------------- | --------------------------------------------- |
| `base_url`   | `http://localhost`        | Base URL for http:// routes                   |
| `api_url`    | `http://localhost/api/v1` | Base URL for API routes                       |
| `jwt_token`  | `eyJhb...`                | JWT token (auto-saved on Register/Login)      |
| `api_key`    | `sk_abc123...`            | API key (auto-saved on Register/Login/Rotate) |
| `short_code` | `abc123`                  | Last created short code (auto-saved)          |
| `user_id`    | `42`                      | Current user ID (auto-saved)                  |

**Setting Variables Manually:**

1. Click collection name
2. Go to **Variables** tab
3. Edit value in "Current value" column
4. **Save** (Ctrl+S)

---

## Authentication Methods

All three authentication methods work on any protected endpoint:

### Method 1: JWT (Recommended)

```bash
Authorization: Bearer {{jwt_token}}
```

**Use for:** Web applications, browser-based clients

### Method 2: API Key Header

```bash
X-API-Key: {{api_key}}
```

**Use for:** Backend services, scripts, tools

### Method 3: API Key Query Parameter

```bash
GET /api/v1/urls?api_key={{api_key}}
```

**Use for:** Webhooks, scenarios where headers can't be set

**Postman Examples:**

- All three methods have corresponding test endpoints
- Run "Get Current User" endpoints to test each method
- All return identical results (proves method equivalence)

---

## Suggested Testing Workflows

### Workflow 1: Setup & Smoke Test

1. **Register** - Creates account
2. **Shorten URL (Authenticated)** - Creates test URL
3. **List My URLs** - Verify it appears
4. **Follow Short URL** - Verify redirect works
5. **URL Stats** - Verify analytics recorded

**Time:** ~2 seconds

### Workflow 2: Auth Methods

1. **Get Current User (JWT)** - Test Bearer token
2. **Get Current User (API Key Header)** - Test X-API-Key
3. **Get Current User (API Key Query)** - Test query param
4. **Rotate API Key** - Invalidate + issue new
5. **Get Current User (API Key Header)** - Verify new key works

**Time:** ~1 second, demonstrates all auth paths

### Workflow 3: Error Handling

Run all endpoints in **Error Scenarios & Validation** folder:

- Invalid email
- Weak password
- Duplicate email
- Unauthorized access
- Rate limit (may require repeated quick requests)

**Time:** ~5 seconds

### Workflow 4: Guest Flow

1. **Shorten URL (Guest - No Auth)** - No user needed
2. **Follow Short URL** - Works for anyone
3. **Try analytics (should fail)** - Guest URLs have no analytics

**Time:** ~1 second

---

## Test Assertions

Every endpoint includes comprehensive assertions:

### Health Check Tests

- ✓ Status code is 200
- ✓ Response is valid JSON
- ✓ Server is running (`status: "ok"`)

### Register Tests

- ✓ Status code is 201
- ✓ Response contains user data
- ✓ JWT token is present and valid
- ✓ API key starts with `sk_`
- ✓ Credentials auto-saved to variables

### URL Shortening Tests

- ✓ Status code is 201
- ✓ Response contains short URL data
- ✓ short_code is Base62 encoded
- ✓ short_url is valid and includes short_code
- ✓ short_code auto-saved to variables

### Analytics Tests

- ✓ Status code is 200
- ✓ Analytics response is complete
- ✓ Values are numeric
- ✓ Daily breakdown is array
- ✓ Top referers/countries are arrays

### Error Tests

- ✓ Correct HTTP status codes
- ✓ Error messages are present
- ✓ Response is valid JSON

---

## Common Tasks

### Create 10 Test URLs

```
1. Run "Shorten URL (Authenticated)" 10 times
2. short_code auto-saves with each request
3. Each gets unique ID via Base62 encoding
```

### Simulate Traffic

```
1. Get short_code from "Shorten URL"
2. Run "Follow Short URL" multiple times
3. Each click recorded async (no delay)
4. View real-time stats in "URL Stats"
```

### Test Cache Hit Performance

```
1. Run "Follow Short URL" once (cache miss, ~5ms)
2. Run "Follow Short URL" again (cache hit, <1ms)
3. View response time in Postman (bottom-right)
```

### Rotate Compromised API Key

```
1. Run "Rotate API Key"
2. Old key is immediately evicted from Redis
3. Old key rejected on next API call
4. New key works immediately
```

### Verify Read Replica Works

```
1. Run "Follow Short URL" to create clicklogs
2. Run "URL Stats" to read analytics
3. Both routes work through their dedicated connections
```

---

## Postman Tips & Tricks

### Run Multiple Requests in Sequence

1. Select folder (e.g., **Authentication**)
2. Click folder menu ⋯ → **Run Collection**
3. Click **Run Authentication**
4. Requests run in order, each uses previous results

### Variable Substitution

- `{{variable_name}}` → replaced with variable value
- Variables auto-populate in request URLs and headers
- View variable value: Hover over `{{variable}}`

### Response Inspection

- **Tests** tab → Shows which assertions passed/failed
- **Console** → Shows `console.log()` output from test scripts
- **Body** → Raw JSON response
- **Headers** → Response headers (e.g., redirect URLs)

### Environment Variables (Optional)

- Create environments for different servers (dev, staging, prod)
- Switch environments without editing requests
- Click environment dropdown (top-right)

---

## API Response Format

All endpoints follow consistent response format:

### Success Response (2xx)

```json
{
  "success": true,
  "data": {
    "user": { "id": 123, "email": "user@example.com", ... },
    "token": "eyJhb...",
    ...
  }
}
```

### Error Response (4xx/5xx)

```json
{
  "success": false,
  "error": "Validation failed: invalid email",
  "statusCode": 400
}
```

### Status Codes

- `200 OK` - Successful GET/DELETE
- `201 Created` - Successful POST (creates resource)
- `302 Found` - Redirect response
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing/invalid auth
- `403 Forbidden` - Auth valid but not permitted
- `404 Not Found` - Resource doesn't exist
- `409 Conflict` - Duplicate/uniqueness violation
- `429 Too Many Requests` - Rate limit exceeded

---

## Rate Limiting

Two independent rate limiters protect the API:

| Limiter           | Routes                | Limit                 |
| ----------------- | --------------------- | --------------------- |
| `authLimiter`     | `/register`, `/login` | 5 req/minute per IP   |
| `apiLimiter`      | `/urls` (POST)        | 30 req/minute per IP  |
| `redirectLimiter` | `/:code`              | 500 req/minute per IP |

**Testing rate limits:**

1. Run same endpoint 6 times rapidly
2. 7th request returns 429 Too Many Requests
3. Response includes `Retry-After` header
4. Wait 60 seconds, then requests work again

---

## Troubleshooting

### Issue: `{{jwt_token}}` is empty

**Solution:**

- Run **Register** or **Login** first
- Test script auto-saves token
- Verify test tab shows "Credentials saved"

### Issue: Error "invalid short_code"

**Solution:**

- Run **Shorten URL (Authenticated)** first
- Wait for response before running **Follow Short URL**
- Verify short_code is in URL

### Issue: 401 Unauthorized

**Solution:**

- Run **Register** to get fresh token
- Verify Bearer token is in Authorization header
- Check token hasn't expired (tokens are short-lived)

### Issue: 429 Too Many Requests

**Solution:**

- Wait 60 seconds for rate limit to reset
- Or make requests from different IP if testing infrastructure

### Issue: Duplicate email on Register

**Solution:**

- Email must be unique per user
- Collection uses `{{$timestamp}}` for auto-unique emails
- Click **Register** and email auto-increments

### Issue: JSON validation error in Postman

**Solution:**

- Close and re-open Postman
- Re-import the collection
- Clear browser cache if using web version

---

## Next Steps

1. **Import the collection** (2 min)
2. **Run a full workflow** (1 min)
3. **Explore endpoints** and modify request bodies
4. **Write custom tests** for your use cases
5. **Integrate with CI/CD** pipeline for automated testing

---

## Additional Resources

- [Postman Learning Center](https://learning.postman.com/)
- [Postman Scripting Guide](https://learning.postman.com/docs/writing-scripts/intro-to-scripts/)
- [API Documentation](./README.md)
- [Architecture Decisions](./README.md#architecture-decisions)
