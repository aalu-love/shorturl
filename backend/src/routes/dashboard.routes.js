const router = require("express").Router();
const DashboardController = require("../controllers/dashboard.controller");
const { authenticate } = require("../middleware/auth.middleware");

router.get("/", authenticate, DashboardController.getOverview);
router.get("/recent-clicks", authenticate, DashboardController.getRecentClicks);

module.exports = router;
