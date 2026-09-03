const router = require("express").Router();
const ProfileController = require("../controllers/profile.controller");
const { authenticate } = require("../middleware/auth.middleware");
const {
  validate,
  updateProfileSchema,
  changePasswordSchema,
} = require("../utils/validators");

router.use(authenticate);
router.get("/", ProfileController.get);
router.patch("/", validate(updateProfileSchema), ProfileController.update);
router.patch(
  "/password",
  validate(changePasswordSchema),
  ProfileController.changePassword,
);

module.exports = router;
