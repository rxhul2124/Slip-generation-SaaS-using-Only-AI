import mongoose from "mongoose";
import { GeneratedSlip } from "../models/GeneratedSlip.js";
import { Product } from "../models/Product.js";
import { Customer } from "../models/Customer.js";
import { SlipTemplate } from "../models/SlipTemplate.js";
import { User } from "../models/User.js";
import { Company } from "../models/Company.js";
import { AppError } from "../utils/AppError.js";
import { nextSerial } from "./serial.service.js";
import { incrementAnalytics } from "./analytics.service.js";

async function ensureTenantRecord(model, companyId, id, label) {
  const record = await model.findOne({ _id: id, company: companyId });
  if (!record) throw new AppError(`${label} not found`, 404);
  return record;
}

function normalizeWeight(weight) {
  if (typeof weight?.value !== "number") return undefined;
  const unit = String(weight.unit || "KG").toUpperCase();
  return {
    value: weight.value,
    unit: ["KG", "G", "TON", "LB"].includes(unit) ? unit : "KG"
  };
}

function productSnapshot(product) {
  const raw = typeof product?.toObject === "function" ? product.toObject() : product;
  if (!raw) return null;
  return {
    ...raw,
    _id: raw._id?.toString?.() || raw._id,
    name: raw.name || raw.partName || raw.partNumber || "Product",
    sku: raw.sku || raw.partNumber || raw.barcode || raw._id?.toString?.() || raw._id,
    partName: raw.partName || raw.name,
    partNumber: raw.partNumber || raw.sku,
    preferredTemplateId:
      raw.preferredTemplateId ||
      (typeof raw.preferredTemplate === "string" ? raw.preferredTemplate : raw.preferredTemplate?._id?.toString?.())
  };
}

async function ensureCustomerProduct(companyId, customer, productId) {
  const legacyProduct = mongoose.Types.ObjectId.isValid(productId)
    ? await Product.findOne({ _id: productId, company: companyId })
    : null;

  if (legacyProduct) {
    const assignedCustomers = legacyProduct.assignedCustomers?.map((id) => id.toString()) || [];
    if (assignedCustomers.length && !assignedCustomers.includes(customer._id.toString())) {
      throw new AppError("Product does not belong to this customer", 400);
    }
    return legacyProduct;
  }

  const customerProduct =
    customer.products?.find((item) => item._id?.toString() === productId?.toString()) ||
    customer.products?.find((item) => item.sku && item.sku === productId);

  if (!customerProduct) throw new AppError("Product not found for this customer", 404);
  return customerProduct;
}

function calculateDisplayWeight(product, quantity, fallbackWeight) {
  const perPiece = normalizeWeight(product?.weight);
  if (perPiece && Number.isFinite(quantity)) {
    return {
      value: perPiece.value * quantity,
      unit: perPiece.unit
    };
  }
  return normalizeWeight(fallbackWeight);
}

function signatureFor(user, payloadSignature) {
  if (payloadSignature?.fullName || payloadSignature?.text || payloadSignature?.imageDataUrl || payloadSignature?.padDataUrl) {
    return payloadSignature;
  }
  const profile = user?.signatureProfile || {};
  return {
    fullName: profile.fullName || user?.name || "",
    role: profile.role,
    employeeId: profile.employeeId,
    text: profile.signatureText || profile.fullName || user?.name || "",
    imageDataUrl: profile.signatureImageUrl,
    mode: profile.signatureImageUrl ? "image" : "text"
  };
}

export async function createSlip(companyId, userId, payload) {
  const [customer, template, user, company] = await Promise.all([
    ensureTenantRecord(Customer, companyId, payload.customer, "Customer"),
    ensureTenantRecord(SlipTemplate, companyId, payload.template, "Template"),
    User.findById(userId),
    Company.findById(companyId)
  ]);
  const selectedProduct = await ensureCustomerProduct(companyId, customer, payload.product);
  const product = productSnapshot(selectedProduct);
  if (!product?._id) throw new AppError("Product not found for this customer", 404);

  const serialNumber = await nextSerial(companyId, payload.serialPrefix || "SLIP");
  const qrPayload = {
    slip: serialNumber,
    slipType: payload.slipType || "packing",
    product: { id: product._id, sku: product.sku, name: product.name },
    customer: { id: customer._id, name: customer.name },
    tracking: payload.orderReference,
    generatedAt: new Date().toISOString()
  };

  const slip = await GeneratedSlip.create({
    company: companyId,
    serialNumber,
    slipType: payload.slipType || "packing",
    orderReference: payload.orderReference,
    product: product._id,
    productSnapshot: product,
    customer: customer._id,
    template: template._id,
    companyName: company?.name,
    quantity: payload.quantity,
    quantityUnit: payload.quantityUnit || product.quantityUnit || String(product.units || "NOS").toUpperCase(),
    displayWeight: calculateDisplayWeight(product, payload.quantity, payload.displayWeight),
    notes: payload.notes,
    destination: payload.destination || customer.shippingAddress?.city,
    barcodeValue: product.barcode || product.sku,
    qrPayload,
    signature: signatureFor(user, payload.signature),
    printSettings: payload.printSettings,
    generatedBy: userId,
    contentSnapshot: {
      company: company ? { _id: company._id, name: company.name, logo: company.logo } : undefined,
      product,
      customer: customer.toObject(),
      template: template.toObject(),
      signature: signatureFor(user, payload.signature),
      generatedDate: new Date()
    }
  });

  await incrementAnalytics(companyId, {
    product: product._id,
    customer: customer._id,
    template: template._id,
    metric: "slipsGenerated"
  });

  return {
    ...slip.toObject(),
    product,
    customer,
    template,
    company: company ? { _id: company._id, name: company.name, logo: company.logo } : undefined,
    generatedBy: user
  };
}

export async function createBulkSlips(companyId, userId, rows) {
  const slips = [];
  for (const row of rows) {
    slips.push(await createSlip(companyId, userId, row));
  }
  return slips;
}

export async function findSlip(companyId, idOrSerial) {
  const query = mongoose.Types.ObjectId.isValid(idOrSerial)
    ? { _id: idOrSerial, company: companyId }
    : { serialNumber: idOrSerial, company: companyId };
  const slip = await GeneratedSlip.findOne(query).populate("product customer template generatedBy");
  if (!slip) return null;
  const data = slip.toObject();
  return {
    ...data,
    product: data.productSnapshot || data.contentSnapshot?.product || data.product,
    companyName: data.companyName || data.contentSnapshot?.company?.name,
    company: data.contentSnapshot?.company
  };
}

export async function recordPrint(companyId, id, userId) {
  const slip = await GeneratedSlip.findOneAndUpdate(
    { _id: id, company: companyId },
    {
      $inc: { printedCount: 1 },
      $set: { status: "printed", lastPrintedAt: new Date() }
    },
    { new: true }
  );
  if (!slip) throw new AppError("Slip not found", 404);
  await incrementAnalytics(companyId, { metric: "prints" });
  return slip;
}

export async function recordExport(companyId, id) {
  const slip = await GeneratedSlip.findOneAndUpdate(
    { _id: id, company: companyId },
    {
      $inc: { exportedCount: 1 },
      $set: { status: "exported", lastExportedAt: new Date() }
    },
    { new: true }
  );
  if (!slip) throw new AppError("Slip not found", 404);
  await incrementAnalytics(companyId, { metric: "exports" });
  return slip;
}
