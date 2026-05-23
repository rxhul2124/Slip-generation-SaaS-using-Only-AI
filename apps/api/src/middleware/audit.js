import { AuditLog } from "../models/AuditLog.js";

export function audit(action, resource) {
  return async (req, _res, next) => {
    req.audit = async (metadata = {}, resourceId) => {
      await AuditLog.create({
        company: req.companyId,
        user: req.user?._id,
        ip: req.ip,
        userAgent: req.get("user-agent"),
        action,
        resource,
        resourceId,
        metadata
      });
    };
    next();
  };
}
