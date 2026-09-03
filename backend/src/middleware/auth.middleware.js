const AuthService = require("../services/auth.service");
const logger = require("../config/logger");

/**
 * Authentication middleware — supports two methods:
 *
 *   1. JWT Bearer token  →  Authorization: Bearer <token>
 *   2. API Key           →  X-API-Key: sk_xxxxxxxx
 *                           OR  ?api_key=sk_xxxxxxxx  (query param)
 *
 * API key is preferred for programmatic/server-to-server use.
 * JWT is preferred for browser/mobile sessions.
 */
const authenticate = async (req, res, next) => {
  try {
    // ── Check for API Key first ──────────────────────────────────────────
    const apiKey = req.headers["x-api-key"] || req.query.api_key;
    if (apiKey) {
      const user = await AuthService.resolveApiKey(apiKey);
      if (!user || !user.is_active) {
        return res
          .status(401)
          .json({ success: false, error: "Invalid API key" });
      }
      req.user = user;
      req.authMethod = "api_key";
      return next();
    }

    // ── Check for JWT Bearer token ───────────────────────────────────────
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      let payload;
      try {
        payload = AuthService.verifyToken(token);
      } catch (err) {
        return res
          .status(401)
          .json({ success: false, error: "Invalid or expired token" });
      }

      const { UserModel } = require("../models/user.model");
      // Minimal user object from token — avoids DB hit on every request
      req.user = { id: payload.sub };
      req.authMethod = "jwt";
      return next();
    }

    return res
      .status(401)
      .json({ success: false, error: "Authentication required" });
  } catch (err) {
    logger.error("Auth middleware error", { error: err.message });
    return res
      .status(500)
      .json({ success: false, error: "Authentication error" });
  }
};

/**
 * Optional auth — attaches user if token present, continues either way.
 * Used for routes that work for both guests and authenticated users.
 */
const optionalAuth = async (req, res, next) => {
  const apiKey = req.headers["x-api-key"] || req.query.api_key;
  const authHeader = req.headers.authorization;

  if (!apiKey && !authHeader) return next(); // No credentials — continue as guest

  return authenticate(req, res, next);
};

module.exports = { authenticate, optionalAuth };
