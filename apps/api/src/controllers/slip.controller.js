import multer from "multer";
import { GeneratedSlip } from "../models/GeneratedSlip.js";
import { TenantRepository } from "../repositories/base.repository.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { parseCsv } from "../utils/csv.js";
import * as slipService from "../services/slip.service.js";
import { queuePrintJob, listPrintJobs } from "../services/printQueue.service.js";

const allowedCsvTypes = new Set(["text/csv", "application/csv", "application/vnd.ms-excel", "text/plain"]);

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    const validType = allowedCsvTypes.has(file.mimetype);
    const validExtension = file.originalname.toLowerCase().endsWith(".csv");
    callback(validType && validExtension ? null : new Error("Invalid CSV upload"), validType && validExtension);
  }
});
const repo = new TenantRepository(GeneratedSlip, ["serialNumber", "orderReference", "destination"], ["status"]);

export const list = asyncHandler(async (req, res) => {
  const result = await repo.list(req.companyId, req.query);
  result.items = result.items.map((item) => {
    const data = item.toObject ? item.toObject() : item;
    return {
      ...data,
      product: data.productSnapshot || data.contentSnapshot?.product || data.product,
      companyName: data.companyName || data.contentSnapshot?.company?.name,
      company: data.contentSnapshot?.company
    };
  });
  res.json({ status: "success", data: result.items, meta: result.meta });
});

export const get = asyncHandler(async (req, res) => {
  const slip = await slipService.findSlip(req.companyId, req.params.id);
  if (!slip) throw new AppError("Slip not found", 404);
  res.json({ status: "success", data: slip });
});

export const create = asyncHandler(async (req, res) => {
  const slip = await slipService.createSlip(req.companyId, req.user._id, req.validated.body);
  await req.audit?.({ serialNumber: slip.serialNumber }, slip._id.toString());
  res.status(201).json({ status: "success", data: slip });
});

export const bulk = asyncHandler(async (req, res) => {
  const slips = await slipService.createBulkSlips(req.companyId, req.user._id, req.validated.body.rows);
  await req.audit?.({ count: slips.length });
  res.status(201).json({ status: "success", data: slips, meta: { count: slips.length } });
});

export const bulkCsv = asyncHandler(async (req, res) => {
  const rows = parseCsv(req.file.buffer).map((row) => ({
    product: row.productId || row.Product,
    customer: row.customerId || row.Customer,
    template: row.templateId || row.Template,
    quantity: Number(row.Quantity || row.quantity || 1),
    orderReference: row.OrderReference || row.orderReference,
    destination: row.Destination || row.destination,
    notes: row.Notes || row.notes
  }));
  const slips = await slipService.createBulkSlips(req.companyId, req.user._id, rows);
  res.status(201).json({ status: "success", data: slips, meta: { count: slips.length } });
});

export const duplicate = asyncHandler(async (req, res) => {
  const source = await GeneratedSlip.findOne({ _id: req.params.id, company: req.companyId });
  if (!source) throw new AppError("Slip not found", 404);
  const copy = await slipService.createSlip(req.companyId, req.user._id, {
    product: source.product.toString(),
    customer: source.customer.toString(),
    template: source.template.toString(),
    slipType: source.slipType,
    quantity: source.quantity,
    quantityUnit: source.quantityUnit,
    displayWeight: source.displayWeight,
    orderReference: source.orderReference,
    destination: source.destination,
    notes: source.notes,
    signature: source.signature,
    printSettings: source.printSettings
  });
  res.status(201).json({ status: "success", data: copy });
});

export const print = asyncHandler(async (req, res) => {
  const slip = await slipService.recordPrint(req.companyId, req.params.id, req.user._id);
  await req.audit?.({ serialNumber: slip.serialNumber }, slip._id.toString());
  res.json({ status: "success", data: slip });
});

export const exportSlip = asyncHandler(async (req, res) => {
  const slip = await slipService.recordExport(req.companyId, req.params.id);
  await req.audit?.({ serialNumber: slip.serialNumber }, slip._id.toString());
  res.json({ status: "success", data: slip });
});

export const queuePrint = asyncHandler(async (req, res) => {
  const job = await queuePrintJob(req.companyId, req.user._id, req.body);
  res.status(201).json({ status: "success", data: job });
});

export const printJobs = asyncHandler(async (req, res) => {
  const result = await listPrintJobs(req.companyId, req.query);
  res.json({ status: "success", data: result.items, meta: result.meta });
});
