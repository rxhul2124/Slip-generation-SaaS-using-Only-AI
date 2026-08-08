import type { Customer, GeneratedSlip, Product, SlipTemplate } from "./types";

export const sampleProducts: Product[] = [
  {
    _id: "p-hex-bolt-m8",
    name: "Hex Head Bolt M8 x 40mm Stainless 304",
    partNumber: "HEX-M8-40-SS",
    category: "Fasteners",
    quantityUnit: "NOS",
    barcode: "890123456789",
    notes: "High tensile stainless steel hex head bolt.",
    weight: { value: 0.018, unit: "KG" }
  },
  {
    _id: "p-nyloc-nut-m8",
    name: "Nyloc Lock Nut M8 Galvanized Class 8",
    partNumber: "NYL-M8-GALV",
    category: "Lock Nuts",
    quantityUnit: "NOS",
    barcode: "890123456790",
    notes: "Self-locking nylon insert nut for high vibration assemblies.",
    weight: { value: 0.009, unit: "KG" }
  },
  {
    _id: "p-washer-flat-m8",
    name: "Flat Washer M8 Form A Plain Steel",
    partNumber: "WSH-M8-PLN",
    category: "Washers",
    quantityUnit: "KG",
    barcode: "890123456791",
    notes: "Heavy duty flat washer for load distribution.",
    weight: { value: 1.0, unit: "KG" }
  }
];

export const sampleCustomers: Customer[] = [
  {
    _id: "c-haridwar-auto",
    name: "Haridwar Auto Components Ltd",
    contactPerson: "Rajesh Sharma",
    email: "dispatch@haridwarauto.example",
    phone: "+91 98765 43210",
    shippingAddress: { city: "Haridwar", state: "Uttarakhand" }
  },
  {
    _id: "c-pune-industrial",
    name: "Pune Precision Engineering",
    contactPerson: "Anish Kulkarni",
    email: "purchasing@puneeng.example",
    phone: "+91 98123 45678",
    shippingAddress: { city: "Pune", state: "Maharashtra" }
  }
];

export const sampleTemplates: SlipTemplate[] = [
  {
    _id: "t-small-neon",
    name: "Cyberpunk Neon Tag (Small)",
    format: "custom",
    renderer: "industrial",
    units: "mm",
    width: 62,
    height: 38,
    orientation: "landscape",
    pageSize: "custom",
    thermalMode: true,
    margins: { top: 2, right: 2, bottom: 2, left: 2 },
    padding: 2,
    spacing: 3,
    fontSize: 7,
    borderThickness: 0.5,
    bleed: 0,
    cropMarks: true,
    snapGrid: 1,
    elements: [
      {
        id: "header-bg",
        type: "text",
        label: "Header Bar",
        value: "FAST TECH FASTENERS",
        x: 2,
        y: 2,
        width: 58,
        height: 6,
        zIndex: 1,
        style: { fontSize: 8, fontWeight: 800, highlight: true, backgroundColor: "#0f172a", color: "#10b981", alignment: "center" }
      },
      {
        id: "product-title",
        type: "field",
        label: "Product Name",
        field: "product.name",
        x: 2,
        y: 9,
        width: 58,
        height: 8,
        zIndex: 2,
        style: { fontSize: 9, fontWeight: 800, color: "#000000" }
      },
      {
        id: "qty-pill",
        type: "field",
        label: "Quantity",
        field: "quantity",
        x: 2,
        y: 18,
        width: 28,
        height: 7,
        zIndex: 3,
        style: { fontSize: 8, fontWeight: 700, highlight: true, backgroundColor: "#ecfdf5", color: "#047857", alignment: "center" }
      },
      {
        id: "weight-pill",
        type: "field",
        label: "Weight",
        field: "displayWeight.value",
        x: 32,
        y: 18,
        width: 28,
        height: 7,
        zIndex: 4,
        style: { fontSize: 8, fontWeight: 700, highlight: true, backgroundColor: "#f0fdf4", color: "#15803d", alignment: "center" }
      },
      {
        id: "serial-bc",
        type: "barcode",
        label: "Serial Barcode",
        field: "serialNumber",
        x: 2,
        y: 26,
        width: 42,
        height: 10,
        zIndex: 5
      },
      {
        id: "qr-tag",
        type: "qr",
        label: "QR Code",
        field: "orderReference",
        x: 46,
        y: 26,
        width: 14,
        height: 10,
        zIndex: 6
      }
    ]
  },
  {
    _id: "t-medium-luxury",
    name: "Executive Gold Manifest (Medium)",
    format: "custom",
    renderer: "industrial",
    units: "mm",
    width: 90,
    height: 52,
    orientation: "landscape",
    pageSize: "custom",
    thermalMode: true,
    margins: { top: 3, right: 3, bottom: 3, left: 3 },
    padding: 3,
    spacing: 4,
    fontSize: 8,
    borderThickness: 0.5,
    bleed: 0,
    cropMarks: true,
    snapGrid: 1,
    elements: [
      {
        id: "brand-banner",
        type: "text",
        label: "Company Banner",
        value: "FAST TECH FASTENERS · DISPATCH MANIFEST",
        x: 3,
        y: 3,
        width: 84,
        height: 8,
        zIndex: 1,
        style: { fontSize: 10, fontWeight: 800, highlight: true, backgroundColor: "#1e1b4b", color: "#fbbf24", alignment: "center" }
      },
      {
        id: "customer-badge",
        type: "field",
        label: "Destination Customer",
        field: "customer.name",
        x: 3,
        y: 12,
        width: 54,
        height: 9,
        zIndex: 2,
        style: { fontSize: 9, fontWeight: 700, color: "#1e293b" }
      },
      {
        id: "serial-badge",
        type: "field",
        label: "Serial Number",
        field: "serialNumber",
        x: 59,
        y: 12,
        width: 28,
        height: 9,
        zIndex: 3,
        style: { fontSize: 8, fontWeight: 800, highlight: true, backgroundColor: "#fef3c7", color: "#92400e", alignment: "center" }
      },
      {
        id: "product-box",
        type: "field",
        label: "Product Name",
        field: "product.name",
        x: 3,
        y: 22,
        width: 84,
        height: 10,
        zIndex: 4,
        style: { fontSize: 10, fontWeight: 800, color: "#0f172a" }
      },
      {
        id: "barcode-main",
        type: "barcode",
        label: "Barcode",
        field: "serialNumber",
        x: 3,
        y: 33,
        width: 50,
        height: 16,
        zIndex: 5
      },
      {
        id: "qr-sec",
        type: "qr",
        label: "Security QR",
        field: "orderReference",
        x: 55,
        y: 33,
        width: 16,
        height: 16,
        zIndex: 6
      },
      {
        id: "signature-box",
        type: "text",
        label: "Inspector Stamp",
        value: "APPROVED SLIP",
        x: 73,
        y: 33,
        width: 14,
        height: 16,
        zIndex: 7,
        style: { fontSize: 6, fontWeight: 800, highlight: true, backgroundColor: "#ecfdf5", color: "#047857", alignment: "center" }
      }
    ]
  },
  {
    _id: "t-small-template",
    name: "Small Template (Classic)",
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
    name: "Medium Template (Classic)",
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
    companyName: "Fast Tech Fasteners",
    quantity: 300,
    quantityUnit: "NOS",
    displayWeight: { value: 5.4, unit: "KG" },
    destination: "Haridwar Dispatch",
    notes: "Check count before dispatch.",
    barcodeValue: sampleProducts[0].barcode,
    status: "generated",
    printedCount: 1,
    exportedCount: 0,
    createdAt: new Date().toISOString()
  }
];
