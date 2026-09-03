const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/user.model");
const RefreshTokenModel = require("../models/refreshToken.model");
const { cacheGet, cacheSet, cacheDel, KEYS } = require("../config/redis");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const REFRESH_TOKEN_EXPIRES_DAYS =
  parseInt(process.env.REFRESH_TOKEN_EXPIRES_DAYS, 10) || 30;
const API_KEY_CACHE_TTL = 3600; // 1 hour — API key lookups cached

const AuthService = {
  hashToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
  },

  async issueRefreshToken(userId, { ipAddress = null, userAgent = null } = {}) {
    const token = crypto.randomBytes(48).toString("hex");
    const tokenHash = AuthService.hashToken(token);
    const expiresAt = new Date(
      Date.now() + REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
    );

    await RefreshTokenModel.create({
      userId,
      tokenHash,
      expiresAt,
      ipAddress,
      userAgent,
    });

    return { token, expiresAt };
  },

  async register({ email, password, name }, meta = {}) {
    const existing = await UserModel.findByEmail(email);
    if (existing) {
      const err = new Error("Email already registered");
      err.statusCode = 409;
      throw err;
    }

    const user = await UserModel.create({ email, password, name });
    const accessToken = AuthService.signToken(user.id);
    const refreshTokenData = await AuthService.issueRefreshToken(user.id, meta);

    return {
      user,
      access_token: accessToken,
      refresh_token: refreshTokenData.token,
    };
  },

  async login({ email, password }, meta = {}) {
    const user = await UserModel.findByEmail(email);
    if (!user) {
      const err = new Error("Invalid credentials");
      err.statusCode = 401;
      throw err;
    }

    if (!user.is_active) {
      const err = new Error("Account is deactivated");
      err.statusCode = 403;
      throw err;
    }

    const valid = await UserModel.verifyPassword(password, user.password_hash);
    if (!valid) {
      const err = new Error("Invalid credentials");
      err.statusCode = 401;
      throw err;
    }

    const accessToken = AuthService.signToken(user.id);
    const refreshTokenData = await AuthService.issueRefreshToken(user.id, meta);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        api_key: user.api_key,
        role: user.role_name,
        is_active: user.is_active,
      },
      access_token: accessToken,
      refresh_token: refreshTokenData.token,
    };
  },

  async refreshToken(refreshToken) {
    const tokenHash = AuthService.hashToken(refreshToken);
    const savedToken = await RefreshTokenModel.findByHash(tokenHash);

    if (!savedToken || savedToken.revoked) {
      const err = new Error("Invalid refresh token");
      err.statusCode = 401;
      throw err;
    }

    if (new Date(savedToken.expires_at) < new Date()) {
      const err = new Error("Refresh token expired");
      err.statusCode = 401;
      throw err;
    }

    const user = await UserModel.findById(savedToken.user_id);
    if (!user || !user.is_active) {
      const err = new Error("Invalid refresh token");
      err.statusCode = 401;
      throw err;
    }

    await RefreshTokenModel.revokeById(savedToken.id);

    const accessToken = AuthService.signToken(user.id);
    const refreshTokenData = await AuthService.issueRefreshToken(user.id);

    return {
      access_token: accessToken,
      refresh_token: refreshTokenData.token,
    };
  },

  async rotateApiKey(userId) {
    // Evict old API key from cache before rotating
    const user = await UserModel.findById(userId);
    if (user?.api_key) {
      await cacheDel(KEYS.apiKey(user.api_key));
    }
    return UserModel.rotateApiKey(userId);
  },

  /**
   * Resolve an API key to a user, with Redis caching.
   * Cache TTL: 1 hour — avoids DB hit on every API request.
   */
  async resolveApiKey(apiKey) {
    const cacheKey = KEYS.apiKey(apiKey);
    const cached = await cacheGet(cacheKey);
    if (cached) return JSON.parse(cached);

    const user = await UserModel.findByApiKey(apiKey);
    if (user) {
      await cacheSet(cacheKey, JSON.stringify(user), API_KEY_CACHE_TTL);
    }
    return user;
  },

  signToken(userId) {
    return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  },

  verifyToken(token) {
    return jwt.verify(token, JWT_SECRET);
  },
};

module.exports = AuthService;
