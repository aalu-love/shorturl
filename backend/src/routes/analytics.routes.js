const router = require("express").Router();
const AnalyticsController = require("../controllers/analytics.controller");
const { authenticate } = require("../middleware/auth.middleware");

// Dashboard summary (total URLs, total clicks)
router.get("/dashboard", authenticate, AnalyticsController.getDashboard);
router.get("/", authenticate, AnalyticsController.getOverview);

// Per-URL stats with daily breakdown, top referers, top countries
router.get("/urls/:code", authenticate, AnalyticsController.getUrlStats);

module.exports = router;
