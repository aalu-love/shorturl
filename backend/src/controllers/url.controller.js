const UrlService = require("../services/url.service");

const UrlController = {
  /**
   * THE REDIRECT — the most performance-critical endpoint.
   * Target: < 10ms response time (from cache).
   */
  async redirect(req, res, next) {
    try {
      const { code } = req.params;

      const url = await UrlService.resolveShortCode(code, {
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        referer: req.get("Referer"),
      });

      if (!url) {
        return res
          .status(404)
          .json({ success: false, error: "Short URL not found or expired" });
      }

      // 301 = permanent redirect (cached by browser — reduces server load)
      // 302 = temporary redirect (every click hits our server — required for analytics)
      // We use 302 so every click is recorded.
      res.redirect(302, url.original_url);
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const {
        original_url,
        domain,
        custom_code,
        expires_at,
        title,
        tags,
        note,
        mobile_url,
        scheduled_from,
        scheduled_until,
        fallback_url,
        og_title,
        og_description,
        og_image,
        milestone_threshold,
      } = req.body;

      // Default expiration: 24 hours from now
      const defaultExpiresAt = new Date();
      defaultExpiresAt.setHours(defaultExpiresAt.getHours() + 24);

      const url = await UrlService.createShortUrl({
        originalUrl: original_url,
        domain,
        customCode: custom_code || "",
        userId: req.user?.id || null,
        expiresAt: expires_at || defaultExpiresAt,
        title: title || null,
        tags,
        note,
        mobileUrl: mobile_url,
        scheduledFrom: scheduled_from,
        scheduledUntil: scheduled_until,
        fallbackUrl: fallback_url,
        ogTitle: og_title,
        ogDescription: og_description,
        ogImage: og_image,
        milestoneThreshold: milestone_threshold,
      });

      res.status(201).json({ success: true, data: url });
    } catch (err) {
      next(err);
    }
  },

  async list(req, res, next) {
    try {
      const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
      const offset = parseInt(req.query.offset, 10) || 0;

      const result = await UrlService.getUserUrls(req.user.id, {
        limit,
        offset,
      });
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  async delete(req, res, next) {
    try {
      await UrlService.deleteShortUrl(req.params.code, req.user.id);
      res.json({ success: true, message: "URL deleted" });
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const updated = await UrlService.updateShortUrl(
        req.params.code,
        req.user.id,
        req.body,
      );
      if (!updated) {
        return res
          .status(404)
          .json({ success: false, error: "URL not found or not owned by you" });
      }
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  },

  async healthCheck(req, res, next) {
    try {
      const updated = await UrlService.checkUrlHealth(
        req.params.code,
        req.user.id,
      );
      if (!updated) {
        return res
          .status(404)
          .json({ success: false, error: "URL not found or not owned by you" });
      }
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  },

  async updateMilestones(req, res, next) {
    try {
      const milestones = await UrlService.updateMilestoneThresholds(
        req.user.id,
        req.body.milestones,
      );
      res.json({ success: true, data: milestones });
    } catch (err) {
      next(err);
    }
  },

  async bulkHealthCheck(req, res, next) {
    try {
      const results = await UrlService.checkUrlsHealth(
        req.user.id,
        req.body.short_codes,
      );
      res.json({ success: true, data: results });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = UrlController;
