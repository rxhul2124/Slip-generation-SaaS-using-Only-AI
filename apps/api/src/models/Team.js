import mongoose from "mongoose";

const teamInviteSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    role: { type: String, enum: ["admin", "manager", "staff"], default: "staff" },
    tokenHash: { type: String, required: true, select: false },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    acceptedAt: Date,
    expiresAt: { type: Date, required: true }
  },
  { timestamps: true }
);

teamInviteSchema.index({ company: 1, email: 1, acceptedAt: 1 });

export const TeamInvite = mongoose.model("TeamInvite", teamInviteSchema);
