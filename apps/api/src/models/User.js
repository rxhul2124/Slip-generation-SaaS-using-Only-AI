import mongoose from "mongoose";
import bcrypt from "bcrypt";
import validator from "validator";
import { env } from "../config/env.js";

export const ROLES = ["owner", "admin", "manager", "staff"];

const membershipSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
    role: { type: String, enum: ROLES, required: true, default: "staff" },
    status: { type: String, enum: ["active", "invited", "disabled"], default: "active" },
    joinedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, "Invalid email address"]
    },
    passwordHash: { type: String, required: true, select: false },
    avatarUrl: String,
    phone: String,
    signatureProfile: {
      fullName: String,
      role: String,
      employeeId: String,
      signatureText: String,
      signatureImageUrl: String
    },
    locale: { type: String, default: "en" },
    timezone: { type: String, default: "Asia/Calcutta" },
    emailVerifiedAt: Date,
    verificationTokenHash: { type: String, select: false },
    resetPasswordTokenHash: { type: String, select: false },
    resetPasswordExpiresAt: Date,
    lastLoginAt: Date,
    failedLoginAttempts: { type: Number, default: 0 },
    lockedUntil: Date,
    currentCompany: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
    memberships: [membershipSchema]
  },
  { timestamps: true }
);

userSchema.index({ "memberships.company": 1 });

userSchema.methods.setPassword = async function setPassword(password) {
  this.passwordHash = await bcrypt.hash(password, env.bcryptRounds);
};

userSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.methods.roleFor = function roleFor(companyId) {
  const membership = this.memberships.find((item) => item.company.toString() === companyId?.toString());
  return membership?.status === "active" ? membership.role : null;
};

export const User = mongoose.model("User", userSchema);
