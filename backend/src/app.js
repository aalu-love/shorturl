const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");
const morgan = require("morgan");

const authRoutes = require("./routes/auth.routes");
const urlRoutes = require("./routes/url.routes");
const analyticsRoutes = require("./routes/analytics.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const notificationRoutes = require("./routes/notification.routes");
const domainRoutes = require("./routes/domain.routes");
const settingsRoutes = require("./routes/settings.routes");
const profileRoutes = require("./routes/profile.routes");
const adminRoutes = require("./routes/admin.routes");
const UrlController = require("./controllers/url.controller");
const { redirectLimiter } = require("./middleware/rateLimit.middleware");
const { errorHandler, notFound } = require("./middleware/error.middleware");
const logger = require("./config/logger");

const app = express();

console.log("Starting URL Shortener API..."); // Initial log to indicate startup

// ── Security & Compression ─────────────────────────────────────────────────
app.set("trust proxy", 1); // Required behind nginx to get real client IP
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = (
        process.env.CORS_ORIGIN ?? "http://localhost:4173"
      )
        .split(",")
        .map((originValue) => originValue.trim());

      if (
        !origin ||
        allowedOrigins.includes("*") ||
        allowedOrigins.includes(origin)
      ) {
        callback(null, true);
      } else {
        callback(
          new Error("CORS policy does not allow access from this origin"),
        );
      }
    },
    credentials: true,
  }),
);
app.use(compression());

// ── Request logging ────────────────────────────────────────────────────────
app.use(
  morgan("combined", {
    stream: { write: (msg) => logger.info(msg.trim()) },
    skip: (req) => req.path === "/health", // Don't log health checks
  }),
);

// ── Body parsing ───────────────────────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// ── Health check ───────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// ── API Routes ─────────────────────────────────────────────────────────────
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/urls", urlRoutes);
app.use("/api/v1/analytics", analyticsRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/domains", domainRoutes);
app.use("/api/v1/settings", settingsRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/admin", adminRoutes);

// Add a route to add some basic info into mongoDB to verify the connection is working
app.get("/api/v1/test-mongodb", async (req, res) => {
  try {
    const mongoose = require("./config/mongodb").getConnection();
    const TestSchema = new mongoose.Schema({ name: String });
    const TestModel = mongoose.model("Test", TestSchema);

    const testDoc = new TestModel({ name: "MongoDB connection successful!" });
    await testDoc.save();

    res.json({ message: "Test document saved to MongoDB", id: testDoc._id });
  } catch (err) {
    logger.error("MongoDB test failed", { error: err.message });
    res.status(500).json({ error: "MongoDB connection failed" });
  }
});

// ── THE HOT PATH — short code redirect ─────────────────────────────────────
// Kept at root level for shortest possible URL: yourdomain.com/abc1234
// This MUST come after /api routes so API paths are not intercepted.
app.get("/:code", redirectLimiter, UrlController.redirect);

// ── Error handling ─────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
