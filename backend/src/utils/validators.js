const Joi = require("joi");

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(72).required(),
  name: Joi.string().min(1).max(100).optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().min(64).required(),
});

const createUrlSchema = Joi.object({
  original_url: Joi.string()
    .uri({ scheme: ["http", "https"] })
    .max(2048)
    .required(),
  domain: Joi.string().trim().lowercase().hostname().max(255).optional(),
  custom_code: Joi.string().alphanum().min(4).max(20).optional(),
  expires_at: Joi.date().iso().greater("now").optional(),
  title: Joi.string().max(255).optional(),
  tags: Joi.array().items(Joi.string().max(50)).max(20).optional(),
  note: Joi.string().max(5000).allow("").optional(),
  mobile_url: Joi.string()
    .uri({ scheme: ["http", "https"] })
    .allow("")
    .optional(),
  scheduled_from: Joi.date().iso().optional(),
  scheduled_until: Joi.date()
    .iso()
    .greater(Joi.ref("scheduled_from"))
    .optional(),
  fallback_url: Joi.string()
    .uri({ scheme: ["http", "https"] })
    .allow("")
    .optional(),
  og_title: Joi.string().max(255).allow("").optional(),
  og_description: Joi.string().max(5000).allow("").optional(),
  og_image: Joi.string()
    .uri({ scheme: ["http", "https"] })
    .allow("")
    .optional(),
  pinned: Joi.boolean().optional(),
  milestone_threshold: Joi.number()
    .integer()
    .min(0)
    .max(Number.MAX_SAFE_INTEGER)
    .optional(),
});

const updateUrlSchema = createUrlSchema
  .fork(["original_url"], (schema) => schema.optional())
  .min(1);

const bulkHealthCheckSchema = Joi.object({
  short_codes: Joi.array()
    .items(Joi.string().alphanum().max(20))
    .max(100)
    .optional(),
});

const notificationPreferencesSchema = Joi.object({
  digest_enabled: Joi.boolean().required(),
  health_enabled: Joi.boolean().required(),
  default_threshold: Joi.number()
    .integer()
    .min(0)
    .max(Number.MAX_SAFE_INTEGER)
    .required(),
});

const createDomainSchema = Joi.object({
  domain: Joi.string().trim().lowercase().hostname().max(255).required(),
});

const workspaceSettingsSchema = Joi.object({
  workspace_name: Joi.string().trim().min(1).max(100).optional(),
  default_domain: Joi.string()
    .trim()
    .lowercase()
    .hostname()
    .max(255)
    .optional(),
  require_sso: Joi.boolean().optional(),
  public_analytics: Joi.boolean().optional(),
}).min(1);

const updateProfileSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).optional(),
  email: Joi.string().email().optional(),
  two_factor_enabled: Joi.boolean().optional(),
}).min(1);

const changePasswordSchema = Joi.object({
  current_password: Joi.string().required(),
  new_password: Joi.string().min(8).max(72).required(),
});

const adminInviteSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).required(),
  email: Joi.string().email().required(),
  plan: Joi.string().valid("Free", "Pro", "Business").required(),
});

const adminUserUpdateSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).optional(),
  email: Joi.string().email().optional(),
  plan: Joi.string().valid("Free", "Pro", "Business").optional(),
  status: Joi.string().valid("active", "invited", "suspended").optional(),
}).min(1);

const adminAnnouncementSchema = Joi.object({
  title: Joi.string().trim().min(1).max(255).required(),
  description: Joi.string().trim().min(1).max(5000).required(),
  type: Joi.string()
    .valid("milestone", "health", "digest", "schedule")
    .default("digest"),
});

const bulkMilestoneSchema = Joi.object({
  milestones: Joi.array()
    .items(
      Joi.object({
        short_code: Joi.string().alphanum().max(20).required(),
        milestone_threshold: Joi.number()
          .integer()
          .min(0)
          .max(Number.MAX_SAFE_INTEGER)
          .required(),
      }),
    )
    .min(1)
    .max(100)
    .required(),
});

const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const details = error.details.map((d) => d.message);
    return res
      .status(400)
      .json({ success: false, error: "Validation failed", details });
  }
  req.body = value;
  next();
};

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  createUrlSchema,
  updateUrlSchema,
  bulkHealthCheckSchema,
  notificationPreferencesSchema,
  createDomainSchema,
  workspaceSettingsSchema,
  updateProfileSchema,
  changePasswordSchema,
  adminInviteSchema,
  adminUserUpdateSchema,
  adminAnnouncementSchema,
  bulkMilestoneSchema,
};
