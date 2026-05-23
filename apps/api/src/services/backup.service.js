import crypto from "crypto";
import { Backup } from "../models/Backup.js";
import { Product } from "../models/Product.js";
import { Customer } from "../models/Customer.js";
import { SlipTemplate } from "../models/SlipTemplate.js";
import { GeneratedSlip } from "../models/GeneratedSlip.js";
import { Settings } from "../models/Settings.js";

export async function createWorkspaceExport(companyId, userId) {
  const payload = {
    exportedAt: new Date().toISOString(),
    products: await Product.find({ company: companyId }).lean(),
    customers: await Customer.find({ company: companyId }).lean(),
    templates: await SlipTemplate.find({ company: companyId }).lean(),
    slips: await GeneratedSlip.find({ company: companyId }).lean(),
    settings: await Settings.findOne({ company: companyId }).lean()
  };
  const json = JSON.stringify(payload);
  const checksum = crypto.createHash("sha256").update(json).digest("hex");

  return Backup.create({
    company: companyId,
    type: "export",
    status: "completed",
    sizeBytes: Buffer.byteLength(json),
    checksum,
    metadata: payload,
    createdBy: userId,
    completedAt: new Date()
  });
}
