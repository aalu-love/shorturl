const ProfileModel = require("../models/profile.model");

const ProfileController = {
  async get(req, res, next) {
    try {
      const profile = await ProfileModel.findByUserId(req.user.id);
      if (!profile) {
        return res
          .status(404)
          .json({ success: false, error: "Profile not found" });
      }
      res.json({ success: true, data: profile });
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const profile = await ProfileModel.update(req.user.id, req.body);
      if (!profile) {
        return res
          .status(404)
          .json({ success: false, error: "Profile not found" });
      }
      res.json({ success: true, data: profile });
    } catch (err) {
      if (err.code === "23505") {
        err.statusCode = 409;
        err.message = "Email address is already in use";
      }
      next(err);
    }
  },

  async changePassword(req, res, next) {
    try {
      await ProfileModel.changePassword(
        req.user.id,
        req.body.current_password,
        req.body.new_password,
      );
      res.json({ success: true, data: null, message: "Password updated" });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = ProfileController;
