const SettingsModel = require("../models/settings.model");

const SettingsController = {
  async get(req, res, next) {
    try {
      res.json({
        success: true,
        data: await SettingsModel.findByUserId(req.user.id),
      });
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      res.json({
        success: true,
        data: await SettingsModel.update(req.user.id, req.body),
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = SettingsController;
