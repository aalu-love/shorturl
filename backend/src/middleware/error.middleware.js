const logger = require("../config/logger");

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = statusCode < 500 ? err.message : "Internal server error";

  if (statusCode >= 500) {
    logger.error("Unhandled error", {
      error: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === "development" &&
      statusCode >= 500 && { stack: err.stack }),
  });
};

const notFound = (req, res) => {
  res
    .status(404)
    .json({
      success: false,
      error: `Route ${req.method} ${req.path} not found`,
    });
};

module.exports = { errorHandler, notFound };
