const router = require("express").Router();
const UrlController = require("../controllers/url.controller");
const { authenticate, optionalAuth } = require("../middleware/auth.middleware");
const { apiLimiter } = require("../middleware/rateLimit.middleware");
const {
  validate,
  createUrlSchema,
  updateUrlSchema,
  bulkMilestoneSchema,
  bulkHealthCheckSchema,
} = require("../utils/validators");

// Create short URL — works for guests too, but auth unlocks custom codes + analytics
router.post(
  "/",
  apiLimiter,
  optionalAuth,
  validate(createUrlSchema),
  UrlController.create,
);

// List all URLs for the authenticated user
router.get("/", authenticate, UrlController.list);

// Check all active links, or the supplied short_codes, in one request
router.post(
  "/health-check",
  apiLimiter,
  authenticate,
  validate(bulkHealthCheckSchema),
  UrlController.bulkHealthCheck,
);

router.patch(
  "/milestones",
  authenticate,
  validate(bulkMilestoneSchema),
  UrlController.updateMilestones,
);

// Check the destination and persist its health state (owner only)
router.post(
  "/:code/health-check",
  apiLimiter,
  authenticate,
  UrlController.healthCheck,
);

// Update persisted link metadata (owner only)
router.patch(
  "/:code",
  authenticate,
  validate(updateUrlSchema),
  UrlController.update,
);

// Delete a URL (owner only)
router.delete("/:code", authenticate, UrlController.delete);

module.exports = router;
