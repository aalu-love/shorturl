const dns = require("node:dns").promises;
const DomainModel = require("../models/domain.model");

const DomainController = {
  async list(req, res, next) {
    try {
      res.json({
        success: true,
        data: await DomainModel.findByUserId(req.user.id),
      });
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const domain = await DomainModel.create(req.user.id, req.body.domain);
      res.status(201).json({ success: true, data: domain });
    } catch (err) {
      if (err.code === "23505") {
        err.statusCode = 409;
        err.message = "Domain is already connected to an account";
      }
      next(err);
    }
  },

  async verify(req, res, next) {
    try {
      const domain = await DomainModel.findOwnedById(
        req.params.id,
        req.user.id,
      );
      if (!domain) {
        return res
          .status(404)
          .json({ success: false, error: "Domain not found" });
      }

      let status = "error";
      try {
        const addresses = await dns.resolve4(domain.domain);
        status = addresses.length > 0 ? "active" : "error";
      } catch {
        status = "error";
      }

      const updated = await DomainModel.updateVerification(
        domain.id,
        req.user.id,
        status,
        status === "active",
      );
      res.json({
        success: true,
        data: { ...updated, links_count: domain.links_count },
        message:
          status === "active"
            ? "Domain verified"
            : "DNS configuration not found",
      });
    } catch (err) {
      next(err);
    }
  },

  async remove(req, res, next) {
    try {
      const removed = await DomainModel.remove(req.params.id, req.user.id);
      if (!removed) {
        return res
          .status(404)
          .json({ success: false, error: "Domain not found" });
      }
      res.json({ success: true, data: null, message: "Domain removed" });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = DomainController;
