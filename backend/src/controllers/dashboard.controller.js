const AnalyticsModel = require("../models/analytics.model");
const UrlModel = require("../models/url.model");
const UrlService = require("../services/url.service");

const DashboardController = {
  async getOverview(req, res, next) {
    try {
      const limit = Math.min(
        Math.max(parseInt(req.query.limit, 10) || 5, 1),
        100,
      );
      const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);
      const userId = req.user.id;

      const [urlIds, urls] = await Promise.all([
        UrlModel.findIdsByUserId(userId),
        UrlService.getUserUrls(userId, { limit, offset }),
      ]);
      const stats = await AnalyticsModel.getDashboardStats(urlIds, urls.total);

      res.json({
        success: true,
        data: {
          ...stats,
          ...urls,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  async getRecentClicks(req, res, next) {
    try {
      const limit = Math.min(
        Math.max(parseInt(req.query.limit, 10) || 5, 1),
        20,
      );
      const urlIds = await UrlModel.findIdsByUserId(req.user.id);
      const clicks = await AnalyticsModel.getRecentClicks(urlIds, limit);
      const baseUrl = process.env.BASE_URL || "http://localhost:3000";

      res.json({
        success: true,
        data: clicks.map((click) => ({
          ...click,
          short_url: `${baseUrl}/${click.short_code}`,
          device: /tablet/i.test(click.user_agent || "")
            ? "Tablet"
            : /mobile|android|iphone/i.test(click.user_agent || "")
              ? "Mobile"
              : "Desktop",
          location: click.country || "Unknown",
          referer: click.referer || "Direct",
        })),
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = DashboardController;
