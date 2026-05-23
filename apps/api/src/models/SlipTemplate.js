import mongoose from "mongoose";

const elementSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    type: {
      type: String,
      enum: ["text", "field", "barcode", "qr", "logo", "line", "box", "icon"],
      required: true
    },
    label: String,
    field: String,
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    rotate: { type: Number, default: 0 },
    zIndex: { type: Number, default: 1 },
    locked: { type: Boolean, default: false },
    style: mongoose.Schema.Types.Mixed,
    value: mongoose.Schema.Types.Mixed
  },
  { _id: false }
);

const templateSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: String,
    format: { type: String, enum: ["2x4", "4x6", "a4", "letter", "custom"], default: "4x6" },
    renderer: { type: String, enum: ["template", "industrial"], default: "template" },
    units: { type: String, enum: ["mm", "cm", "in", "px"], default: "mm" },
    width: { type: Number, required: true, default: 101.6 },
    height: { type: Number, required: true, default: 152.4 },
    orientation: { type: String, enum: ["portrait", "landscape"], default: "portrait" },
    pageSize: { type: String, enum: ["label", "a4", "letter", "custom"], default: "label" },
    thermalMode: { type: Boolean, default: true },
    margins: {
      top: { type: Number, default: 3 },
      right: { type: Number, default: 3 },
      bottom: { type: Number, default: 3 },
      left: { type: Number, default: 3 }
    },
    padding: { type: Number, default: 4 },
    spacing: { type: Number, default: 2 },
    fontSize: { type: Number, default: 10 },
    borderThickness: { type: Number, default: 0.3 },
    bleed: { type: Number, default: 0 },
    cropMarks: { type: Boolean, default: false },
    snapGrid: { type: Number, default: 2 },
    elements: [elementSchema],
    favorite: { type: Boolean, default: false },
    archivedAt: Date,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

templateSchema.index({ company: 1, name: 1 }, { unique: true });

export const SlipTemplate = mongoose.model("SlipTemplate", templateSchema);
