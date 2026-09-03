const router = require("express").Router();
const SettingsController = require("../controllers/settings.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { validate, workspaceSettingsSchema } = require("../utils/validators");

router.use(authenticate);
router.get("/", SettingsController.get);
router.patch("/", validate(workspaceSettingsSchema), SettingsController.update);

module.exports = router;
