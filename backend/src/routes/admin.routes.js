const router = require("express").Router();
const AdminController = require("../controllers/admin.controller");
const { authenticate } = require("../middleware/auth.middleware");
const {
  validate,
  adminInviteSchema,
  adminUserUpdateSchema,
} = require("../utils/validators");
const UserModel = require("../models/user.model");

const requireAdmin = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.user.id);
    const role = String(user?.role_name || user?.role || "").toLowerCase();
    if (role !== "admin")
      return res
        .status(403)
        .json({ success: false, error: "Admin access required" });
    next();
  } catch (error) {
    next(error);
  }
};

router.use(authenticate, requireAdmin);
router.get("/health", AdminController.health);
router.get("/domains", AdminController.listDomains);
router.post("/domains/:id/verify", AdminController.verifyDomain);
router.delete("/domains/:id", AdminController.removeDomain);
router.get("/analytics", AdminController.analytics);
router.post("/announcements", AdminController.announce);
router.get("/overview", AdminController.overview);
router.get("/links", AdminController.listLinks);
router.patch("/links/:id/moderation", AdminController.moderateLink);
router.get("/audit-logs", AdminController.auditLogs);
router.get("/users", AdminController.listUsers);
router.post("/users", validate(adminInviteSchema), AdminController.invite);
router.patch(
  "/users/:id",
  validate(adminUserUpdateSchema),
  AdminController.updateUser,
);
router.delete("/users/:id", AdminController.removeUser);

module.exports = router;
