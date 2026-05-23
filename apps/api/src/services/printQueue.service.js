import { PrintJob } from "../models/PrintJob.js";

export function queuePrintJob(companyId, userId, payload) {
  return PrintJob.create({
    company: companyId,
    queuedBy: userId,
    slips: payload.slips,
    printer: payload.printer,
    format: payload.format,
    copies: payload.copies || 1,
    status: "queued"
  });
}

export function listPrintJobs(companyId) {
  return PrintJob.find({ company: companyId }).sort("-createdAt").populate("slips", "serialNumber status");
}
