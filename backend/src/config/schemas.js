const mongoose = require("mongoose");

/**
 * Click Events Schema — Records each redirect/click on a short URL
 */
const clickEventSchema = new mongoose.Schema(
  {
    url_id: {
      // PostgreSQL short_urls.id is a BIGINT, not a MongoDB ObjectId.
      type: String,
      required: true,
      index: true,
    },
    short_code: {
      type: String,
      required: true,
      index: true,
    },
    ip_address: {
      type: String,
      sparse: true,
    },
    user_agent: {
      type: String,
      sparse: true,
    },
    referer: {
      type: String,
      sparse: true,
    },
    country: {
      type: String,
      sparse: true,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
  },
);

// Compound indexes for efficient querying
clickEventSchema.index(
  { short_code: 1, created_at: -1 },
  { name: "shortcode_date_index" },
);
clickEventSchema.index(
  { url_id: 1, created_at: -1 },
  { name: "url_date_index" },
);

// TTL index: automatically delete documents 90 days after creation
clickEventSchema.index(
  { created_at: 1 },
  { expireAfterSeconds: 7776000, name: "ttl_90_days" },
);

const ClickEvent = mongoose.model(
  "ClickEvent",
  clickEventSchema,
  "click_events",
);

module.exports = {
  ClickEvent,
};
