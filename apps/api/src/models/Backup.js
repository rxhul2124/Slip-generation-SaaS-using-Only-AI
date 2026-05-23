import mongoose from "mongoose";

const backupSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    type: { type: String, enum: ["manual", "automatic", "import", "export"], default: "manual" },
    status: { type: String, enum: ["queued", "running", "completed", "failed"], default: "queued" },
    url: String,
    sizeBytes: Number,
    checksum: String,
    metadata: mongoose.Schema.Types.Mixed,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    completedAt: Date
  },
  { timestamps: true }
);

backupSchema.index({ company: 1, createdAt: -1 });

export const Backup = mongoose.model("Backup", backupSchema);
