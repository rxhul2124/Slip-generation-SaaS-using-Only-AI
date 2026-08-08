import crypto from "crypto";
import { addDays } from "date-fns";
import { nanoid } from "nanoid";
import { User } from "../models/User.js";
import { Company } from "../models/Company.js";
import { Settings } from "../models/Settings.js";
import { Billing } from "../models/Billing.js";
import { SlipTemplate } from "../models/SlipTemplate.js";
import { RefreshToken } from "../models/RefreshToken.js";
import { AuditLog } from "../models/AuditLog.js";
import { AppError } from "../utils/AppError.js";
import { hashToken, randomToken, signAccessToken, signRefreshToken } from "../utils/tokens.js";
import { sendMail } from "../utils/mailer.js";
import { limitsFor } from "../config/planLimits.js";

function slugify(value) {
  const base = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${base}-${nanoid(6)}`;
}

async function enforceSessionLimit(userId, companyId, companyPlan) {
  let limit = limitsFor(companyPlan).sessions;
  if (companyPlan === "enterprise") {
    limit = await User.countDocuments({ "memberships.company": companyId, "memberships.status": { $in: ["active", "invited"] } });
  }
  if (limit === Infinity) return;

  const active = await RefreshToken.find({ user: userId, company: companyId, revokedAt: null, expiresAt: { $gt: new Date() } }).sort({ createdAt: -1 });
  const overflow = active.slice(Math.max(limit - 1, 0));
  if (overflow.length) {
    await RefreshToken.updateMany({ _id: { $in: overflow.map((token) => token._id) } }, { revokedAt: new Date() });
  }
}

async function issueTokens(user, companyId, req, rememberMe = false, companyPlan = "free") {
  await enforceSessionLimit(user._id, companyId, companyPlan);
  const refreshId = crypto.randomUUID();
  const refreshToken = signRefreshToken(user, refreshId);

  await RefreshToken.create({
    user: user._id,
    company: companyId,
    tokenHash: hashToken(refreshToken),
    ip: req.ip,
    userAgent: req.get("user-agent"),
    rememberMe,
    expiresAt: addDays(new Date(), rememberMe ? 30 : 7)
  });

  return {
    accessToken: signAccessToken(user, companyId),
    refreshToken
  };
}

export function defaultSlipTemplates(companyId, userId) {
  const base = {
    company: companyId,
    renderer: "industrial",
    format: "custom",
    units: "mm",
    orientation: "landscape",
    pageSize: "custom",
    thermalMode: true,
    margins: { top: 3, right: 3, bottom: 3, left: 3 },
    padding: 2,
    borderThickness: 0.5,
    cropMarks: true,
    snapGrid: 1,
    createdBy: userId,
    updatedBy: userId
  };

  return [
    {
      ...base,
      name: "Cyberpunk Neon Tag (Small)",
      description: "Vibrant high-contrast dark header tag with barcode & QR code (62x38mm).",
      width: 62,
      height: 38,
      spacing: 3,
      fontSize: 7,
      renderer: "canvas",
      elements: [
        { id: "header-bg", type: "text", label: "Header Bar", content: "FAST TECH FASTENERS", x: 2, y: 2, width: 58, height: 6, zIndex: 1, style: { fontSize: 8, fontWeight: 800, highlight: true, backgroundColor: "#0f172a", color: "#10b981", alignment: "center" } },
        { id: "product-title", type: "field", label: "Product Name", field: "product.name", x: 2, y: 9, width: 58, height: 8, zIndex: 2, style: { fontSize: 9, fontWeight: 800, color: "#000000" } },
        { id: "qty-pill", type: "field", label: "Quantity", field: "quantity", x: 2, y: 18, width: 28, height: 7, zIndex: 3, style: { fontSize: 8, fontWeight: 700, highlight: true, backgroundColor: "#ecfdf5", color: "#047857", alignment: "center" } },
        { id: "weight-pill", type: "field", label: "Weight", field: "displayWeight.value", x: 32, y: 18, width: 28, height: 7, zIndex: 4, style: { fontSize: 8, fontWeight: 700, highlight: true, backgroundColor: "#f0fdf4", color: "#15803d", alignment: "center" } },
        { id: "serial-bc", type: "barcode", label: "Serial Barcode", field: "serialNumber", x: 2, y: 26, width: 42, height: 10, zIndex: 5 },
        { id: "qr-tag", type: "qr", label: "QR Code", field: "orderReference", x: 46, y: 26, width: 14, height: 10, zIndex: 6 }
      ]
    },
    {
      ...base,
      name: "Executive Gold Manifest (Medium)",
      description: "Luxury dual-tone dispatch pass with customer badge, barcode, and inspector stamp (90x52mm).",
      width: 90,
      height: 52,
      spacing: 4,
      fontSize: 9,
      renderer: "canvas",
      elements: [
        { id: "brand-banner", type: "text", label: "Company Banner", content: "FAST TECH FASTENERS · DISPATCH MANIFEST", x: 3, y: 3, width: 84, height: 8, zIndex: 1, style: { fontSize: 10, fontWeight: 800, highlight: true, backgroundColor: "#1e1b4b", color: "#fbbf24", alignment: "center" } },
        { id: "customer-badge", type: "field", label: "Destination Customer", field: "customer.name", x: 3, y: 12, width: 54, height: 9, zIndex: 2, style: { fontSize: 9, fontWeight: 700, color: "#1e293b" } },
        { id: "serial-badge", type: "field", label: "Serial Number", field: "serialNumber", x: 59, y: 12, width: 28, height: 9, zIndex: 3, style: { fontSize: 8, fontWeight: 800, highlight: true, backgroundColor: "#fef3c7", color: "#92400e", alignment: "center" } },
        { id: "product-box", type: "field", label: "Product Name", field: "product.name", x: 3, y: 22, width: 84, height: 10, zIndex: 4, style: { fontSize: 10, fontWeight: 800, color: "#0f172a" } },
        { id: "barcode-main", type: "barcode", label: "Barcode", field: "serialNumber", x: 3, y: 33, width: 50, height: 16, zIndex: 5 },
        { id: "qr-sec", type: "qr", label: "Security QR", field: "orderReference", x: 55, y: 33, width: 16, height: 16, zIndex: 6 },
        { id: "signature-box", type: "text", label: "Inspector Stamp", content: "APPROVED SLIP", x: 73, y: 33, width: 14, height: 16, zIndex: 7, style: { fontSize: 6, fontWeight: 800, highlight: true, backgroundColor: "#ecfdf5", color: "#047857", alignment: "center" } }
      ]
    },
    {
      ...base,
      name: "Small Template",
      description: "Compact industrial layout for three slips per row on A4.",
      width: 62,
      height: 38,
      spacing: 3,
      fontSize: 7,
      elements: []
    },
    {
      ...base,
      name: "Medium Template",
      description: "Larger industrial layout for two slips per row on A4.",
      width: 90,
      height: 52,
      spacing: 4,
      fontSize: 9,
      elements: []
    }
  ];
}

export async function register(payload, req) {
  const existing = await User.findOne({ email: payload.email.toLowerCase() });
  if (existing) throw new AppError("Email is already registered", 409);

  const user = new User({
    name: payload.name,
    email: payload.email,
    timezone: "Asia/Calcutta"
  });
  await user.setPassword(payload.password);

  const company = await Company.create({
    name: payload.companyName,
    slug: slugify(payload.companyName),
    owner: user._id
  });

  user.currentCompany = company._id;
  user.memberships = [{ company: company._id, role: "owner", status: "active" }];

  const verificationToken = randomToken();
  user.verificationTokenHash = hashToken(verificationToken);
  await user.save();

  await Promise.all([
    Settings.create({ company: company._id }),
    Billing.create({ company: company._id, plan: "free", provider: "manual" }),
    SlipTemplate.insertMany(defaultSlipTemplates(company._id, user._id)),
    AuditLog.create({
      company: company._id,
      user: user._id,
      ip: req.ip,
      userAgent: req.get("user-agent"),
      action: "auth.register",
      resource: "user",
      resourceId: user._id.toString()
    }),
    sendMail({
      to: user.email,
      subject: "Verify your Slipora email",
      text: `Verify your email with this token: ${verificationToken}`
    })
  ]);

  const tokens = await issueTokens(user, company._id, req, payload.rememberMe, company.plan);
  return { user, company, tokens, verificationToken };
}

export async function login({ email, password, rememberMe }, req) {
  const user = await User.findOne({ email: email.toLowerCase() }).select("+passwordHash");
  if (!user) throw new AppError("Invalid email or password", 401);

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    throw new AppError("Account temporarily locked. Try again later.", 423);
  }

  const ok = await user.comparePassword(password);
  if (!ok) {
    user.failedLoginAttempts += 1;
    if (user.failedLoginAttempts >= 6) {
      user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
    }
    await user.save();
    throw new AppError("Invalid email or password", 401);
  }

  user.failedLoginAttempts = 0;
  user.lockedUntil = undefined;
  user.lastLoginAt = new Date();
  await user.save();

  const companyId = user.currentCompany || user.memberships.find((item) => item.status === "active")?.company;
  const company = await Company.findById(companyId);
  const tokens = await issueTokens(user, companyId, req, rememberMe, company?.plan);

  await AuditLog.create({
    company: companyId,
    user: user._id,
    ip: req.ip,
    userAgent: req.get("user-agent"),
    action: "auth.login",
    resource: "session"
  });

  return { user, company, tokens };
}

export async function refresh(refreshToken, req) {
  const tokenHash = hashToken(refreshToken);
  const stored = await RefreshToken.findOne({ tokenHash, revokedAt: null }).populate("user");
  if (!stored || stored.expiresAt < new Date()) throw new AppError("Refresh token expired", 401);

  const company = await Company.findById(stored.company);
  const tokens = await issueTokens(stored.user, stored.company, req, stored.rememberMe, company?.plan);
  stored.revokedAt = new Date();
  await stored.save();

  return { user: stored.user, tokens, companyId: stored.company };
}

export async function logout(refreshToken) {
  if (refreshToken) {
    await RefreshToken.findOneAndUpdate({ tokenHash: hashToken(refreshToken) }, { revokedAt: new Date() });
  }
}

export async function forgotPassword(email) {
  const user = await User.findOne({ email: email.toLowerCase() }).select("+resetPasswordTokenHash");
  if (!user) return;

  const token = randomToken();
  user.resetPasswordTokenHash = hashToken(token);
  user.resetPasswordExpiresAt = new Date(Date.now() + 30 * 60 * 1000);
  await user.save();

  await sendMail({
    to: user.email,
    subject: "Reset your Slipora password",
    text: `Reset token: ${token}`
  });
}

export async function resetPassword(token, password) {
  const user = await User.findOne({
    resetPasswordTokenHash: hashToken(token),
    resetPasswordExpiresAt: { $gt: new Date() }
  }).select("+passwordHash +resetPasswordTokenHash");

  if (!user) throw new AppError("Reset token is invalid or expired", 400);
  await user.setPassword(password);
  user.resetPasswordTokenHash = undefined;
  user.resetPasswordExpiresAt = undefined;
  await user.save();
  await RefreshToken.updateMany({ user: user._id }, { revokedAt: new Date() });
}

export async function verifyEmail(token) {
  const user = await User.findOne({ verificationTokenHash: hashToken(token) }).select("+verificationTokenHash");
  if (!user) throw new AppError("Verification token is invalid", 400);

  user.emailVerifiedAt = new Date();
  user.verificationTokenHash = undefined;
  await user.save();
  return user;
}

export function serializeUser(user, company) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    locale: user.locale || "en",
    timezone: user.timezone || "Asia/Calcutta",
    emailVerifiedAt: user.emailVerifiedAt,
    memberships: user.memberships,
    currentCompany: company
  };
}
