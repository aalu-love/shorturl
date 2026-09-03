const logger = require("../config/logger");
const AuthService = require("../services/auth.service");

const AuthController = {
  async register(req, res, next) {
    try {
      const { user, access_token, refresh_token } = await AuthService.register(
        req.body,
        {
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"],
        },
      );
      res.status(201).json({
        success: true,
        data: { user, access_token, refresh_token },
      });
    } catch (err) {
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const { user, access_token, refresh_token } = await AuthService.login(
        req.body,
        {
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"],
        },
      );
      res.json({
        success: true,
        data: { user, access_token, refresh_token },
      });
    } catch (err) {
      next(err);
    }
  },

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const { access_token, refresh_token: newRefreshToken } =
        await AuthService.refreshToken(refreshToken);
      res.json({
        success: true,
        data: { access_token, refresh_token: newRefreshToken },
      });
    } catch (err) {
      next(err);
    }
  },

  async me(req, res, next) {
    try {
      const UserModel = require("../models/user.model");
      const user = await UserModel.findById(req.user.id);
      if (!user)
        return res
          .status(404)
          .json({ success: false, error: "User not found" });
      res.json({ success: true, data: { user } });
    } catch (err) {
      next(err);
    }
  },

  async rotateApiKey(req, res, next) {
    try {
      const result = await AuthService.rotateApiKey(req.user.id);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  // Development-only method to list all users (remove in production)
  async listUsers(req, res, next) {
    try {
      const UserModel = require("../models/user.model");
      const users = await UserModel.findAll();
      res.json({ success: true, data: { users } });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = AuthController;
