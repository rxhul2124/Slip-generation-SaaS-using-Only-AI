import type { AuditLog, Backup, Customer, GeneratedSlip, Preset, PrintJob, Product, SlipTemplate } from "./types";

const generatedAt = "2026-05-08T06:30:00.000Z";

const sandharProducts: Product[] = [
  {
    _id: "cp-sandhar-adapter-rh",
    name: "Adapter RH 14 Hex",
    partName: "ADAPTER RH 14 HEX",
    partNumber: "S-09B-02020",
    sku: "S-09B-02020",
    barcode: "8901000005018",
    qrReference: "S-09B-02020",
    dimensions: { length: 29.5, width: 25.5, height: 17, unit: "mm" },
    weight: { value: 0.018, unit: "KG" },
    quantityDefault: 300,
    quantityUnit: "NOS",
    preferredTemplateId: "t-small-template",
    notes: "Default dispatch part for Sandhar Haridwar.",
    favorite: true
  },
  {
    _id: "cp-sandhar-washer",
    name: "Industrial Washer",
    partName: "INDUSTRIAL WASHER",
    partNumber: "WASHER 18X32X3.0",
    sku: "WASH-18-32-30",
    barcode: "8901000007128",
    qrReference: "WASH-18-32-30",
    dimensions: { length: 18, width: 32, height: 3, unit: "mm" },
    weight: { value: 0.011, unit: "KG" },
    quantityDefault: 250,
    quantityUnit: "NOS",
    preferredTemplateId: "t-small-template"
  }
];

const saplProducts: Product[] = [
  {
    _id: "cp-sapl-ke-bush",
    name: "SAPL KE Bush",
    partName: "SAPL KE BUSH",
    partNumber: "KE BUSH 29.50X25.50X17.0",
    sku: "KE-BUSH-2950-2550-170",
    barcode: "8901000008842",
    qrReference: "KE-BUSH-2950-2550-170",
    dimensions: { length: 29.5, width: 25.5, height: 17, unit: "mm" },
    weight: { value: 0.0565, unit: "KG" },
    quantityDefault: 100,
    quantityUnit: "NOS",
    preferredTemplateId: "t-medium-template"
  },
  {
    _id: "cp-sapl-qc-sleeve",
    name: "QC Sleeve Set",
    partName: "QC SLEEVE SET",
    partNumber: "SLV-QC-42X38-SET",
    sku: "SLV-QC-42-38",
    barcode: "8901000009139",
    qrReference: "SLV-QC-42-38",
    dimensions: { length: 42, width: 38, height: 12, unit: "mm" },
    weight: { value: 0.075, unit: "KG" },
    quantityDefault: 12,
    quantityUnit: "SET",
    preferredTemplateId: "t-medium-template"
  }
];

const neoProducts: Product[] = [
  {
    _id: "cp-neo-bracket",
    name: "Packing Bracket",
    partName: "PACKING BRACKET",
    partNumber: "BRK-NEO-102",
    sku: "BRK-NEO-102",
    barcode: "8901000007129",
    qrReference: "BRK-NEO-102",
    dimensions: { length: 48, width: 24, height: 8, unit: "mm" },
    weight: { value: 0.032, unit: "KG" },
    quantityDefault: 150,
    quantityUnit: "NOS",
    preferredTemplateId: "t-small-template"
  }
];

export const sampleCustomers: Customer[] = [
  {
    _id: "c-sandhar-haridwar",
    name: "SANDHAR HARIDWAR",
    contactPerson: "Stores Team",
    email: "stores@sandharharidwar.example",
    phone: "+91 98765 00011",
    taxNumber: "05SANDH1234F1Z5",
    shippingAddress: { line1: "Plot 18, Industrial Area", city: "Haridwar", state: "UK", country: "India", postalCode: "249403" },
    shippingInstructions: "Use compact industrial slips and keep batch tags visible.",
    products: sandharProducts,
    favorite: true
  },
  {
    _id: "c-sapl",
    name: "SAPL Components",
    contactPerson: "Meera Shah",
    email: "stores@saplcomponents.example",
    phone: "+91 98765 00022",
    taxNumber: "29SAPLC9876L1Z3",
    shippingAddress: { line1: "Peenya Industrial Area", city: "Bengaluru", state: "KA", country: "India", postalCode: "560058" },
    products: saplProducts
  },
  {
    _id: "c-neo-works",
    name: "Neo Works Warehouse",
    contactPerson: "Arjun Rao",
    email: "warehouse@neoworks.example",
    phone: "+91 98765 00033",
    taxNumber: "24NEOWR7788Q1Z9",
    shippingAddress: { line1: "Sector 6 Logistics Park", city: "Ahmedabad", state: "GJ", country: "India", postalCode: "382421" },
    products: neoProducts
  }
];

export const sampleProducts: Product[] = sampleCustomers.flatMap((customer) =>
  (customer.products || []).map((product) => ({
    ...product,
    assignedCustomerIds: [customer._id]
  }))
);

export const sampleTemplates: SlipTemplate[] = [
  {
    _id: "t-small-template",
    name: "Small Template",
    format: "custom",
    renderer: "industrial",
    units: "mm",
    width: 62,
    height: 38,
    orientation: "landscape",
    pageSize: "custom",
    thermalMode: true,
    margins: { top: 3, right: 3, bottom: 3, left: 3 },
    padding: 2,
    spacing: 3,
    fontSize: 7,
    borderThickness: 0.5,
    bleed: 0,
    cropMarks: true,
    snapGrid: 1,
    elements: []
  },
  {
    _id: "t-medium-template",
    name: "Medium Template",
    format: "custom",
    renderer: "industrial",
    units: "mm",
    width: 90,
    height: 52,
    orientation: "landscape",
    pageSize: "custom",
    thermalMode: true,
    margins: { top: 3, right: 3, bottom: 3, left: 3 },
    padding: 2,
    spacing: 4,
    fontSize: 9,
    borderThickness: 0.5,
    bleed: 0,
    cropMarks: true,
    snapGrid: 1,
    elements: []
  }
];

export const sampleTemplate: SlipTemplate = sampleTemplates[0];

export const sampleSlips: GeneratedSlip[] = [
  {
    _id: "s-1",
    serialNumber: "SLIP-2026-000001",
    slipType: "packing",
    orderReference: "SO-98241",
    product: sampleProducts[0],
    customer: sampleCustomers[0],
    template: sampleTemplate,
    companyName: "Fast Tech Fastners",
    quantity: 300,
    quantityUnit: "NOS",
    displayWeight: { value: 5.4, unit: "KG" },
    destination: "Haridwar Dispatch",
    notes: "Check count before dispatch.",
    barcodeValue: sampleProducts[0].barcode,
    qrPayload: { slip: "SLIP-2026-000001", tracking: "SO-98241" },
    signature: {
      fullName: "Tarun",
      role: "Dispatch Executive",
      employeeId: "EMP-104",
      text: "Tarun",
      mode: "text"
    },
    printSettings: { slipsPerPage: 18, cutGuides: true, thermalSafe: true },
    status: "printed",
    printedCount: 2,
    exportedCount: 1,
    createdAt: generatedAt
  }
];

export const samplePresets: Preset[] = [
  {
    _id: "preset-fast-tech",
    name: "Fast Tech Packing Slip",
    description: "Compact bordered industrial slip with customer-filtered products and signature auto-fill.",
    template: sampleTemplate,
    customer: sampleCustomers[0],
    product: sampleProducts[0],
    printSettings: { paper: "a4", slipsPerPage: 10, dpi: 203, copies: 1, cutGuides: true },
    tags: ["industrial", "thermal"],
    createdAt: generatedAt
  },
  {
    _id: "preset-qc",
    name: "QC Inspection Slip",
    description: "QC-focused slip type with batch and inspection notes visible.",
    template: sampleTemplate,
    customer: sampleCustomers[1],
    product: sampleProducts[3],
    printSettings: { paper: "a4", slipsPerPage: 12, dpi: 300, copies: 1, cutGuides: true },
    tags: ["qc", "a4"],
    createdAt: generatedAt
  }
];

export const samplePrintJobs: PrintJob[] = [
  {
    _id: "job-industrial-1",
    slips: sampleSlips.map(({ _id, serialNumber, status }) => ({ _id, serialNumber, status })),
    status: "completed",
    printer: "Zebra ZD421 - Dispatch Bay 1",
    format: "thermal",
    copies: 1,
    createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 17).toISOString()
  },
  {
    _id: "job-bulk-pdf",
    slips: sampleSlips.map(({ _id, serialNumber, status }) => ({ _id, serialNumber, status })),
    status: "ready",
    printer: "Bulk PDF Renderer",
    format: "pdf",
    copies: 1,
    createdAt: new Date(Date.now() - 1000 * 60 * 6).toISOString()
  }
];

export const sampleBackups: Backup[] = [
  {
    _id: "backup-auto-1",
    type: "automatic",
    status: "completed",
    sizeBytes: 428_392,
    checksum: "9c1c8c3a7de4f11a8d98",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 4 + 8000).toISOString()
  },
  {
    _id: "backup-export-1",
    type: "export",
    status: "completed",
    sizeBytes: 812_904,
    checksum: "f351c3ce88794043b912",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 28 + 9000).toISOString()
  }
];

export const sampleAuditLogs: AuditLog[] = [
  {
    _id: "audit-login",
    action: "auth.login",
    resource: "session",
    user: { name: "Tarun", email: "ops@slipora.example" },
    ip: "192.168.1.42",
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString()
  },
  {
    _id: "audit-slip",
    action: "slip.generate",
    resource: "slip",
    resourceId: "SLIP-2026-000001",
    user: { name: "Tarun", email: "dispatch@slipora.example" },
    ip: "192.168.1.44",
    metadata: { quantity: 100, quantityUnit: "NOS", printer: "Zebra ZD421" },
    createdAt: new Date(Date.now() - 1000 * 60 * 34).toISOString()
  },
  {
    _id: "audit-template",
    action: "template.update",
    resource: "template",
    resourceId: "Industrial Bordered Slip",
    user: { name: "Print Admin", email: "print@slipora.example" },
    ip: "192.168.1.43",
    createdAt: new Date(Date.now() - 1000 * 60 * 22).toISOString()
  }
];
