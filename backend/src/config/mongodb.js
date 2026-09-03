const mongoose = require("mongoose");
const logger = require("./logger");

/**
 * Connect to MongoDB using Mongoose
 * @returns {Promise<typeof mongoose>} Mongoose instance
 */
async function connectMongoDB() {
  // Prevent multiple connection attempts
  if (mongoose.connection.readyState === 1) {
    logger.info("✅ MongoDB already connected");
    return mongoose;
  }

  const mongoUrl = process.env.MONGODB_URL || "mongodb://localhost:27017";
  const dbName = process.env.MONGODB_DB || "url_shortener";
  const mongoUser = process.env.MONGODB_USER;
  const mongoPassword = process.env.MONGODB_PASSWORD;

  try {
    await mongoose.connect(mongoUrl, {
      dbName,
      maxPoolSize: 20,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: "majority",
      ...(mongoUser && mongoPassword
        ? {
            user: mongoUser,
            pass: mongoPassword,
          }
        : {}),
    });

    logger.info("✅ Connected to MongoDB", { url: mongoUrl, db: dbName });

    return mongoose;
  } catch (err) {
    logger.error("❌ Failed to connect to MongoDB", { error: err.message });
    throw err;
  }
}

/**
 * Get Mongoose instance
 * @returns {typeof mongoose} Mongoose instance
 */
function getConnection() {
  if (mongoose.connection.readyState !== 1) {
    throw new Error("MongoDB not connected. Call connectMongoDB() first.");
  }
  return mongoose;
}

/**
 * Close MongoDB connection
 */
async function closeConnection() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    logger.info("✅ MongoDB connection closed");
  }
}

module.exports = {
  connectMongoDB,
  getConnection,
  closeConnection,
  mongoose,
};
