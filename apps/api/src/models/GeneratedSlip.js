import mongoose from "mongoose";

const generatedSlipSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    serialNumber: { type: String, required: true },
    slipType: { type: String, enum: ["packing", "dispatch", "delivery", "warehouse", "qc"], default: "packing" },
    orderReference: String,
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    productSnapshot: mongoose.Schema.Types.Mixed,
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    template: { type: mongoose.Schema.Types.ObjectId, ref: "SlipTemplate", required: true },
    companyName: String,
    quantity: { type: Number, required: true, min: 1 },
    quantityUnit: { type: String, enum: ["NOS", "PCS", "BOX", "KG", "SET"], default: "NOS" },
    displayWeight: {
      value: Number,
      unit: { type: String, enum: ["KG", "G", "TON", "LB"], default: "KG" }
    },
    notes: String,
    destination: String,
    qrPayload: mongoose.Schema.Types.Mixed,
    barcodeValue: String,
    signature: {
      fullName: String,
      role: String,
      employeeId: String,
      text: String,
      imageDataUrl: String,
      padDataUrl: String,
      mode: { type: String, enum: ["text", "image", "pad"], default: "text" }
    },
    contentSnapshot: mongoose.Schema.Types.Mixed,
    printSettings: mongoose.Schema.Types.Mixed,
    status: { type: String, enum: ["draft", "generated", "queued", "printed", "exported", "void"], default: "generated" },
    printedCount: { type: Number, default: 0 },
    exportedCount: { type: Number, default: 0 },
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    lastPrintedAt: Date,
    lastExportedAt: Date
  },
  { timestamps: true }
);

generatedSlipSchema.index({ company: 1, serialNumber: 1 }, { unique: true });
generatedSlipSchema.index({ company: 1, createdAt: -1 });
generatedSlipSchema.index({ company: 1, serialNumber: "text", orderReference: "text", destination: "text" });

export const GeneratedSlip = mongoose.model("GeneratedSlip", generatedSlipSchema);
