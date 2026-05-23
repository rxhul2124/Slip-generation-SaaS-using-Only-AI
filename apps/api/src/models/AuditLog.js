import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ip: String,
    userAgent: String,
    action: { type: String, required: true },
    resource: { type: String, required: true },
    resourceId: String,
    metadata: mongoose.Schema.Types.Mixed
  },
  { timestamps: true }
);

auditLogSchema.index({ company: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, resource: 1 });

export const AuditLog = mongoose.model("AuditLog", auditLogSchema);
