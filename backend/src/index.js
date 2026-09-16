const {
  loadEnvironment,
  validateRequiredEnvVars,
} = require("./config/environment");

// Load environment variables based on --env argument
loadEnvironment();

// Validate required environment variables
const requiredEnvVars = [
  "PORT",
  "NODE_ENV",
  "DB_HOST",
  "DB_PORT",
  "DB_NAME",
  "DB_USER",
  "DB_PASSWORD",
  "REDIS_HOST",
  "REDIS_PORT",
  "JWT_SECRET",
  "MONGODB_URL",
];
validateRequiredEnvVars(requiredEnvVars);

const app = require("./app");
const logger = require("./config/logger");
const { checkConnections } = require("./config/database");
const { checkConnection: checkRedis } = require("./config/redis");
const {
  connectMongoDB,
  closeConnection: closeMongoDB,
} = require("./config/mongodb");

const PORT = parseInt(process.env.PORT, 10);

const start = async () => {
  try {
    // ── Verify all connections before accepting traffic ───────────────────
    logger.info("Connecting to PostgreSQL...");
    await checkConnections();

    logger.info("Connecting to Redis...");
    await checkRedis();

    logger.info("Connecting to MongoDB...");
    await connectMongoDB();

    // ── Start accepting requests ──────────────────────────────────────────
    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`, {
        env: process.env.NODE_ENV,
        port: PORT,
      });
    });

    // ── Graceful shutdown ─────────────────────────────────────────────────
    // On SIGTERM/SIGINT: stop accepting new requests, finish in-flight ones,
    // then close DB/Redis connections cleanly.
    const shutdown = (signal) => {
      logger.info(`${signal} received — shutting down gracefully`);
      server.close(async () => {
        logger.info("HTTP server closed");
        await closeMongoDB();
        process.exit(0);
      });

      // Force exit after 10 seconds if graceful shutdown stalls
      setTimeout(() => {
        logger.error("Forced shutdown after timeout");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (err) {
    logger.error("Failed to start server", {
      error: err.message,
      stack: err.stack,
    });
    process.exit(1);
  }
};

start();
