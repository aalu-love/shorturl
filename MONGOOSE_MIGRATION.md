# Mongoose Migration Guide

## Changes Made

### 1. Dependency Updates (`package.json`)

- ✅ Replaced `mongodb` with `mongoose` (^7.7.0)
- Mongoose provides a cleaner ODM layer over MongoDB

### 2. MongoDB Configuration (`src/config/mongodb.js`)

**Before:** Raw MongoDB driver with manual connection management
**After:** Mongoose-based connection with automatic pooling

**Key improvements:**

- Simpler connection API: `mongoose.connect()`
- Built-in connection state tracking: `mongoose.connection.readyState`
- Automatic index management
- Connection pooling handled by Mongoose

### 3. Schema Definition (`src/config/schemas.js`) — NEW FILE

Defines Mongoose schema for click events:

```javascript
const clickEventSchema = new mongoose.Schema(
  {
    url_id: String,
    short_code: String,
    ip_address: String,
    user_agent: String,
    referer: String,
    country: String,
  },
  { timestamps: { createdAt: "created_at" } },
);
```

**Indexes:**

- `short_code` + `created_at` for analytics queries
- `url_id` + `created_at` for user dashboards
- TTL index: auto-deletes records after 90 days

### 4. Analytics Model (`src/models/analytics.model.js`)

**Before:** Raw MongoDB collection queries
**After:** Mongoose model methods

```javascript
// Before
const db = getDatabase();
const collection = db.collection("click_events");
await collection.insertOne({...});

// After
const { ClickEvent } = require("../config/schemas");
await ClickEvent.create({...});
```

**Benefits:**

- Type safety with schema validation
- Cleaner aggregation pipeline API
- Built-in error handling
- Middleware support for hooks

### 5. Startup Configuration (`src/index.js`)

- Already updated to import and call MongoDB functions
- Graceful shutdown properly closes Mongoose connection
- `MONGODB_URL` required in environment variables

## API Compatibility

✅ **No breaking changes** — Same API endpoints, same response format

- `POST /api/v1/analytics/dashboard`
- `GET /api/v1/analytics/urls/:code?days=30`

## Installation & Running

```bash
# Install updated dependencies
npm install

# Start with MongoDB
docker-compose up

# Mongoose automatically creates indexes on first run
```

## Environment Variables

```env
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB=url_shortener
```

For MongoDB Atlas:

```env
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/url_shortener?retryWrites=true
```

## Performance Characteristics

| Operation          | Driver                   | Mongoose            |
| ------------------ | ------------------------ | ------------------- |
| Insert             | `.insertOne()`           | `Model.create()`    |
| Aggregate          | `.aggregate().toArray()` | `Model.aggregate()` |
| Schema Validation  | Manual                   | Built-in ✅         |
| Connection Pooling | Manual config            | Automatic ✅        |
| Index Management   | Manual                   | Automatic ✅        |

## Troubleshooting

**Error: "MongoDB not connected"**

- Ensure `connectMongoDB()` is called before operations
- Check that MongoDB is running: `docker-compose up mongodb`

**Error: "Failed to parse URI"**

- Validate `MONGODB_URL` format
- Test with: `mongosh --uri "mongodb://..."`

**Indexes not created**

- Mongoose creates indexes on schema definition
- Check MongoDB logs: `docker-compose logs mongodb`

## Next Steps

1. ✅ Use Mongoose models for other collections (future schema needs)
2. ✅ Add validation middleware for data quality
3. ✅ Implement soft deletes on analytics (if needed)
4. ✅ Add bulk operations for batch analytics recording
