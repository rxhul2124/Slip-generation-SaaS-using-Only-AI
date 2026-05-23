import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, unique: true },
    branding: {
      primaryColor: { type: String, default: "#0f766e" },
      accentColor: { type: String, default: "#f59e0b" },
      showLogo: { type: Boolean, default: true }
    },
    printerDefaults: {
      printerName: String,
      labelDpi: { type: Number, default: 203 },
      paperSize: { type: String, default: "4x6" },
      silentPrint: { type: Boolean, default: false },
      thermalVendor: { type: String, enum: ["zebra", "tsc", "brother", "generic"], default: "generic" },
      calibration: {
        xOffset: { type: Number, default: 0 },
        yOffset: { type: Number, default: 0 },
        scale: { type: Number, default: 1 }
      }
    },
    templateDefaults: {
      defaultTemplate: { type: mongoose.Schema.Types.ObjectId, ref: "SlipTemplate" },
      defaultSlipSize: { type: String, default: "4x6" }
    },
    locale: {
      timezone: { type: String, default: "Asia/Calcutta" },
      language: { type: String, default: "en" },
      dateFormat: { type: String, default: "dd MMM yyyy" }
    },
    backup: {
      autoBackup: { type: Boolean, default: true },
      frequency: { type: String, enum: ["daily", "weekly", "monthly"], default: "daily" },
      lastBackupAt: Date
    }
  },
  { timestamps: true }
);

export const Settings = mongoose.model("Settings", settingsSchema);
