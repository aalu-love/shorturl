const router = require("express").Router();
const AuthController = require("../controllers/auth.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { authLimiter } = require("../middleware/rateLimit.middleware");
const {
  validate,
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} = require("../utils/validators");

router.post(
  "/register",
  authLimiter,
  validate(registerSchema),
  AuthController.register,
);
router.post("/login", authLimiter, validate(loginSchema), AuthController.login);
router.post(
  "/refresh",
  authLimiter,
  validate(refreshTokenSchema),
  AuthController.refresh,
);
router.get("/me", authenticate, AuthController.me);
router.post("/api-key/rotate", authenticate, AuthController.rotateApiKey);

// Development-only route to list all users (remove in production)
if (process.env.NODE_ENV === "development") {
  router.get("/users", AuthController.listUsers);
}

module.exports = router;
