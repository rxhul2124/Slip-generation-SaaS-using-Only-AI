import { PrintJob } from "../models/PrintJob.js";
import { pagination, sortOption } from "../utils/apiFeatures.js";

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

export async function listPrintJobs(companyId, queryString = {}) {
  const { page, limit, skip } = pagination(queryString);
  const query = { company: companyId };
  
  const [items, total] = await Promise.all([
    PrintJob.find(query).sort(sortOption(queryString.sort)).skip(skip).limit(limit).populate("slips", "serialNumber status"),
    PrintJob.countDocuments(query)
  ]);

  return { items, meta: { page, limit, total, pages: Math.ceil(total / limit) } };
}
