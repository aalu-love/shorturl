const AnalyticsModel = require("../models/analytics.model");
const UrlModel = require("../models/url.model");

const AnalyticsController = {
  async getUrlStats(req, res, next) {
    try {
      const { code } = req.params;
      const days = Math.min(parseInt(req.query.days, 10) || 30, 365);

      // Verify ownership
      const url = await UrlModel.findByCode(code);
      if (!url) {
        return res.status(404).json({ success: false, error: "URL not found" });
      }
      if (url.user_id && String(url.user_id) !== String(req.user.id)) {
        return res.status(403).json({ success: false, error: "Access denied" });
      }

      const stats = await AnalyticsModel.getUrlStats(code, { days });
      res.json({
        success: true,
        data: { short_code: code, period_days: days, ...stats },
      });
    } catch (err) {
      next(err);
    }
  },

  async getDashboard(req, res, next) {
    try {
      const urlIds = await UrlModel.findIdsByUserId(req.user.id);
      const stats = await AnalyticsModel.getDashboardStats(
        urlIds,
        urlIds.length,
      );
      res.json({ success: true, data: stats });
    } catch (err) {
      next(err);
    }
  },

  async getOverview(req, res, next) {
    try {
      const days = Math.min(
        Math.max(parseInt(req.query.days, 10) || 30, 1),
        90,
      );
      const urls = await UrlModel.findAnalyticsUrlsByUserId(req.user.id);
      const data = await AnalyticsModel.getOverview(urls, { days });
      res.json({ success: true, data: { period_days: days, ...data } });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = AnalyticsController;
