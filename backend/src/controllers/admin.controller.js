const AdminModel = require("../models/admin.model");

const AdminController = {
  async listDomains(req, res, next) {
    try {
      res.json({ success: true, data: await AdminModel.listDomains() });
    } catch (err) {
      next(err);
    }
  },

  async verifyDomain(req, res, next) {
    try {
      const domain = await AdminModel.verifyDomain(req.params.id, req.user.id);
      if (!domain)
        return res
          .status(404)
          .json({ success: false, error: "Domain not found" });
      res.json({ success: true, data: domain });
    } catch (err) {
      next(err);
    }
  },

  async removeDomain(req, res, next) {
    try {
      const domain = await AdminModel.removeDomain(req.params.id, req.user.id);
      if (!domain)
        return res
          .status(404)
          .json({ success: false, error: "Domain not found" });
      res.json({ success: true, data: null, message: "Domain removed" });
    } catch (err) {
      next(err);
    }
  },

  async analytics(req, res, next) {
    try {
      const days = Math.min(
        Math.max(parseInt(req.query.days, 10) || 30, 1),
        90,
      );
      const domain = req.query.domain || undefined;
      const userId = req.query.user_id || undefined;
      res.json({
        success: true,
        data: {
          period_days: days,
          ...(await AdminModel.getWorkspaceAnalytics({ days, domain, userId })),
        },
      });
    } catch (err) {
      next(err);
    }
  },

  async announce(req, res, next) {
    try {
      res.status(201).json({
        success: true,
        data: await AdminModel.createAnnouncement(req.user.id, req.body),
      });
    } catch (err) {
      next(err);
    }
  },

  async health(req, res, next) {
    try {
      const data = await AdminModel.systemHealth();
      res.json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  async listLinks(req, res, next) {
    try {
      const limit = Math.min(
        Math.max(parseInt(req.query.limit, 10) || 20, 1),
        100,
      );
      const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);
      const data = await AdminModel.listLinks({
        search: req.query.search,
        status: req.query.status,
        limit,
        offset,
      });
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async moderateLink(req, res, next) {
    try {
      const isActive = req.body.action === "restore";
      if (!["archive", "restore"].includes(req.body.action)) {
        return res
          .status(400)
          .json({ success: false, error: "Action must be archive or restore" });
      }
      const link = await AdminModel.moderateLink(
        req.params.id,
        isActive,
        req.user.id,
      );
      if (!link)
        return res
          .status(404)
          .json({ success: false, error: "Link not found" });
      res.json({ success: true, data: link });
    } catch (err) {
      next(err);
    }
  },

  async auditLogs(req, res, next) {
    try {
      const limit = Math.min(
        Math.max(parseInt(req.query.limit, 10) || 50, 1),
        100,
      );
      const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);
      res.json({
        success: true,
        data: await AdminModel.listAuditLogs({ limit, offset }),
      });
    } catch (err) {
      next(err);
    }
  },

  async overview(req, res, next) {
    try {
      res.json({ success: true, data: await AdminModel.overview() });
    } catch (err) {
      next(err);
    }
  },

  async listUsers(req, res, next) {
    try {
      const limit = Math.min(
        Math.max(parseInt(req.query.limit, 10) || 100, 1),
        100,
      );
      const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);
      const users = await AdminModel.listUsers({
        search: req.query.search,
        limit,
        offset,
      });
      res.json({ success: true, data: { users, limit, offset } });
    } catch (err) {
      next(err);
    }
  },

  async invite(req, res, next) {
    try {
      const user = await AdminModel.createInvitation(req.body);
      res.status(201).json({ success: true, data: user });
    } catch (err) {
      if (err.code === "23505") {
        err.statusCode = 409;
        err.message = "Email address is already in use";
      }
      next(err);
    }
  },

  async updateUser(req, res, next) {
    try {
      const user = await AdminModel.updateUser(req.params.id, req.body);
      if (!user)
        return res
          .status(404)
          .json({ success: false, error: "User not found" });
      res.json({ success: true, data: user });
    } catch (err) {
      if (err.code === "23505") {
        err.statusCode = 409;
        err.message = "Email address is already in use";
      }
      next(err);
    }
  },

  async removeUser(req, res, next) {
    try {
      const user = await AdminModel.deactivateUser(req.params.id);
      if (!user)
        return res
          .status(404)
          .json({ success: false, error: "User not found" });
      res.json({ success: true, data: null, message: "User suspended" });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = AdminController;
