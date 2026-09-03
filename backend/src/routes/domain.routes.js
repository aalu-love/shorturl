const router = require("express").Router();
const DomainController = require("../controllers/domain.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { validate, createDomainSchema } = require("../utils/validators");

router.use(authenticate);
router.get("/", DomainController.list);
router.post("/", validate(createDomainSchema), DomainController.create);
router.post("/:id/verify", DomainController.verify);
router.delete("/:id", DomainController.remove);

module.exports = router;
