import { Product } from "../models/Product.js";
import { Customer } from "../models/Customer.js";
import { SlipTemplate } from "../models/SlipTemplate.js";
import { GeneratedSlip } from "../models/GeneratedSlip.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const globalSearch = asyncHandler(async (req, res) => {
  const search = req.query.q || "";
  const rx = { $regex: search, $options: "i" };
  const [products, customers, templates, slips] = await Promise.all([
    Product.find({ company: req.companyId, $or: [{ name: rx }, { sku: rx }, { barcode: rx }] }).limit(8),
    Customer.find({ company: req.companyId, $or: [{ name: rx }, { email: rx }, { phone: rx }] }).limit(8),
    SlipTemplate.find({ company: req.companyId, name: rx }).limit(8),
    GeneratedSlip.find({ company: req.companyId, $or: [{ serialNumber: rx }, { orderReference: rx }] }).limit(8)
  ]);

  res.json({
    status: "success",
    data: { products, customers, templates, slips }
  });
});
