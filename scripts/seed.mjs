import mongoose from "mongoose";
import { connectDatabase } from "../apps/api/src/config/db.js";
import { User } from "../apps/api/src/models/User.js";
import { Company } from "../apps/api/src/models/Company.js";
import { Settings } from "../apps/api/src/models/Settings.js";
import { Billing } from "../apps/api/src/models/Billing.js";
import { Customer } from "../apps/api/src/models/Customer.js";
import { SlipTemplate } from "../apps/api/src/models/SlipTemplate.js";
import { GeneratedSlip } from "../apps/api/src/models/GeneratedSlip.js";
import { defaultSlipTemplates } from "../apps/api/src/services/auth.service.js";

await connectDatabase();

await Promise.all([
  User.deleteMany({ email: /slipora\.example$/ }),
  Company.deleteMany({ slug: /^slipora-(industrial-demo|free-demo|pro-demo|enterprise-demo)/ })
]);

async function createWorkspace({ name, email, companyName, slugPrefix, plan, withSampleData = false }) {
const user = new User({
  name,
  email,
  signatureProfile: {
    fullName: "Tarun",
    role: "Dispatch Executive",
    employeeId: "EMP-104",
    signatureText: "Tarun"
  },
  emailVerifiedAt: new Date()
});
await user.setPassword("ChangeMe123!");

const company = await Company.create({
  name: companyName,
  slug: `${slugPrefix}-${Date.now()}`,
  owner: user._id,
  plan,
  onboarding: {
    workspaceCreated: true,
    logoUploaded: false,
    productsAdded: withSampleData,
    customersAdded: withSampleData,
    defaultSlipSizeSelected: true,
    printerConfigured: false
  }
});

user.currentCompany = company._id;
user.memberships = [{ company: company._id, role: "owner", status: "active" }];
await user.save();

await Promise.all([
  Settings.create({ company: company._id }),
  Billing.create({ company: company._id, plan, provider: "manual" }),
  SlipTemplate.insertMany(defaultSlipTemplates(company._id, user._id))
]);

if (!withSampleData) return { user, company };

const customers = await Customer.insertMany([
  {
    company: company._id,
    name: "SANDHAR HARIDWAR",
    contactPerson: "Stores Team",
    email: "stores@sandharharidwar.example",
    phone: "+91 98765 00011",
    taxNumber: "05SANDH1234F1Z5",
    shippingAddress: { line1: "Plot 18, Industrial Area", city: "Haridwar", state: "UK", country: "India", postalCode: "249403" },
    shippingInstructions: "Use compact industrial slips and keep batch tags visible.",
    products: [
      {
        name: "Adapter RH 14 Hex",
        partName: "ADAPTER RH 14 HEX",
        partNumber: "S-09B-02020",
        sku: "S-09B-02020",
        dimensions: { length: 29.5, width: 25.5, height: 17, unit: "mm" },
        weight: { value: 0.018, unit: "KG" },
        quantityDefault: 300,
        quantityUnit: "NOS",
        barcode: "8901000005018",
        qrReference: "S-09B-02020",
        notes: "Default dispatch part for Sandhar Haridwar."
      },
      {
        name: "Industrial Washer",
        partName: "INDUSTRIAL WASHER",
        partNumber: "WASHER 18X32X3.0",
        sku: "WASH-18-32-30",
        dimensions: { length: 18, width: 32, height: 3, unit: "mm" },
        weight: { value: 0.011, unit: "KG" },
        quantityDefault: 250,
        quantityUnit: "NOS",
        barcode: "8901000007128",
        qrReference: "WASH-18-32-30"
      }
    ],
    favorite: true,
    createdBy: user._id
  },
  {
    company: company._id,
    name: "SAPL Components",
    contactPerson: "Meera Shah",
    email: "stores@saplcomponents.example",
    phone: "+91 98765 00022",
    taxNumber: "29SAPLC9876L1Z3",
    shippingAddress: { line1: "Peenya Industrial Area", city: "Bengaluru", state: "KA", country: "India", postalCode: "560058" },
    products: [
      {
        name: "QC Sleeve Set",
        partName: "QC SLEEVE SET",
        partNumber: "SLV-QC-42X38-SET",
        sku: "SLV-QC-42-38",
        dimensions: { length: 42, width: 38, height: 12, unit: "mm" },
        weight: { value: 0.075, unit: "KG" },
        quantityDefault: 12,
        quantityUnit: "SET",
        barcode: "8901000009139",
        qrReference: "SLV-QC-42-38"
      }
    ],
    createdBy: user._id
  }
]);

const templates = await SlipTemplate.find({ company: company._id }).sort({ createdAt: 1 });
const template = templates[0];
const product = customers[0].products[0];

await GeneratedSlip.create({
  company: company._id,
  serialNumber: "SLIP-2026-000001",
  slipType: "packing",
  orderReference: "SO-98241",
  product: product._id,
  productSnapshot: product.toObject(),
  customer: customers[0]._id,
  template: template._id,
  companyName: company.name,
  quantity: 100,
  quantityUnit: "NOS",
  displayWeight: { value: 1.8, unit: "KG" },
  notes: "Check count before dispatch.",
  destination: "Haridwar Dispatch",
  barcodeValue: product.barcode,
  qrPayload: { slip: "SLIP-2026-000001", tracking: "SO-98241", slipType: "packing" },
  contentSnapshot: {
    company: { _id: company._id, name: company.name },
    product: product.toObject(),
    customer: customers[0].toObject(),
    template: template.toObject(),
    generatedDate: new Date()
  },
  signature: { fullName: "Tarun", role: "Dispatch Executive", employeeId: "EMP-104", text: "Tarun", mode: "text" },
  generatedBy: user._id,
  status: "printed",
  printedCount: 2,
  exportedCount: 1
});
return { user, company };
}

await createWorkspace({ name: "Free Tier Owner", email: "free@slipora.example", companyName: "Free Tier Workspace", slugPrefix: "slipora-free-demo", plan: "free" });
await createWorkspace({ name: "Pro Tier Owner", email: "pro@slipora.example", companyName: "Pro Tier Workspace", slugPrefix: "slipora-pro-demo", plan: "pro", withSampleData: true });
await createWorkspace({ name: "Enterprise Owner", email: "enterprise@slipora.example", companyName: "Enterprise Workspace", slugPrefix: "slipora-enterprise-demo", plan: "enterprise" });
await createWorkspace({ name: "Tanuj Operations", email: "ops@slipora.example", companyName: "Fast Tech Fastners", slugPrefix: "slipora-industrial-demo", plan: "pro", withSampleData: true });

console.log("Slipora seed complete");
console.log("Free: free@slipora.example / ChangeMe123!");
console.log("Pro: pro@slipora.example / ChangeMe123!");
console.log("Enterprise: enterprise@slipora.example / ChangeMe123!");

await mongoose.disconnect();
