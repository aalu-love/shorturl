const NotificationModel = require("../models/notification.model");

const NotificationController = {
  async list(req, res, next) {
    try {
      const limit = Math.min(
        Math.max(parseInt(req.query.limit, 10) || 50, 1),
        100,
      );
      const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);
      const [notifications, unread] = await Promise.all([
        NotificationModel.findByUserId(req.user.id, { limit, offset }),
        NotificationModel.countUnread(req.user.id),
      ]);
      res.json({
        success: true,
        data: { notifications, unread, limit, offset },
      });
    } catch (err) {
      next(err);
    }
  },

  async markRead(req, res, next) {
    try {
      const result = await NotificationModel.markRead(
        req.params.id,
        req.user.id,
      );
      if (!result)
        return res
          .status(404)
          .json({ success: false, error: "Notification not found" });
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  async markAllRead(req, res, next) {
    try {
      const updated = await NotificationModel.markAllRead(req.user.id);
      res.json({ success: true, data: { updated } });
    } catch (err) {
      next(err);
    }
  },

  async dismiss(req, res, next) {
    try {
      const result = await NotificationModel.dismiss(
        req.params.id,
        req.user.id,
      );
      if (!result)
        return res
          .status(404)
          .json({ success: false, error: "Notification not found" });
      res.json({ success: true, message: "Notification dismissed" });
    } catch (err) {
      next(err);
    }
  },

  async getPreferences(req, res, next) {
    try {
      res.json({
        success: true,
        data: await NotificationModel.getPreferences(req.user.id),
      });
    } catch (err) {
      next(err);
    }
  },

  async updatePreferences(req, res, next) {
    try {
      const data = await NotificationModel.updatePreferences(
        req.user.id,
        req.body,
      );
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = NotificationController;
