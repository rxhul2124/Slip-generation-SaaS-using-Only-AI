import mongoose from "mongoose";

const counterSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
    key: { type: String, required: true },
    year: { type: Number, required: true },
    sequence: { type: Number, default: 0 }
  },
  { timestamps: true }
);

counterSchema.index({ company: 1, key: 1, year: 1 }, { unique: true });

export const Counter = mongoose.model("Counter", counterSchema);
