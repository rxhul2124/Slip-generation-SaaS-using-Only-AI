import { Product } from "../models/Product.js";
import { TenantRepository } from "../repositories/base.repository.js";
import { crudController } from "./crud.factory.js";
import { parseCsv } from "../utils/csv.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const repo = new TenantRepository(Product, ["name", "sku", "barcode", "category", "tags"], [
  "category",
  "packagingType",
  "favorite",
  "fragile",
  "hazardous"
]);

export const products = crudController(repo, "Product");

export const importProducts = asyncHandler(async (req, res) => {
  const rows = parseCsv(req.file.buffer);
  const docs = rows.map((row) => ({
    company: req.companyId,
    name: row.name || row.Product || row.product,
    sku: row.sku || row.SKU,
    barcode: row.barcode,
    category: row.category,
    packagingType: row.packagingType || row["Packaging Type"],
    quantityDefault: Number(row.quantityDefault || row.Quantity || 1),
    createdBy: req.user._id,
    updatedBy: req.user._id
  }));
  const inserted = await Product.insertMany(docs, { ordered: false });
  res.status(201).json({ status: "success", data: inserted, meta: { count: inserted.length } });
});
