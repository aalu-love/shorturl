const router = require("express").Router();
const NotificationController = require("../controllers/notification.controller");
const { authenticate } = require("../middleware/auth.middleware");
const {
  validate,
  notificationPreferencesSchema,
} = require("../utils/validators");

router.use(authenticate);
router.get("/", NotificationController.list);
router.get("/preferences", NotificationController.getPreferences);
router.patch(
  "/preferences",
  validate(notificationPreferencesSchema),
  NotificationController.updatePreferences,
);
router.patch("/read-all", NotificationController.markAllRead);
router.patch("/:id/read", NotificationController.markRead);
router.delete("/:id", NotificationController.dismiss);

module.exports = router;
