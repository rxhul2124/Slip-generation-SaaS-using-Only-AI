import { env } from "../config/env.js";
import * as authService from "../services/auth.service.js";
import { authDto } from "../dtos/serializers.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";

const cookieOptions = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: env.isProduction ? "none" : "lax",
  signed: false
};

function setAuthCookies(res, tokens, rememberMe = false) {
  const maxAge = (rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000;
  res.cookie("accessToken", tokens.accessToken, {
    ...cookieOptions,
    maxAge
  });
  res.cookie("refreshToken", tokens.refreshToken, {
    ...cookieOptions,
    maxAge
  });
}

export const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.validated.body, req);
  setAuthCookies(res, result.tokens, req.validated.body.rememberMe);
  res.status(201).json({ status: "success", data: authDto(result) });
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.validated.body, req);
  setAuthCookies(res, result.tokens, req.validated.body.rememberMe);
  res.json({ status: "success", data: authDto(result) });
});

export const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
  const result = await authService.refresh(refreshToken, req);
  setAuthCookies(res, result.tokens);
  res.json({ status: "success", data: { accessToken: result.tokens.accessToken } });
});

export const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
  await authService.logout(refreshToken);
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.status(204).send();
});

export const forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.validated.body.email);
  res.json({ status: "success", message: "If that email exists, reset instructions were sent." });
});

export const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.validated.body.token, req.validated.body.password);
  res.json({ status: "success", message: "Password reset complete." });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  await authService.verifyEmail(req.validated.body.token);
  res.json({ status: "success", message: "Email verified." });
});

export const me = asyncHandler(async (req, res) => {
  res.json({
    status: "success",
    data: {
      user: authService.serializeUser(req.user, null),
      role: req.role,
      companyId: req.companyId
    }
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, email, locale, timezone, avatarUrl } = req.body;
  const user = req.user;

  if (name) user.name = name;
  if (email) {
    if (email.toLowerCase() !== user.email.toLowerCase()) {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) throw new AppError("Email is already registered", 409);
      user.email = email;
    }
  }
  if (locale) user.locale = locale;
  if (timezone) user.timezone = timezone;
  if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;

  await user.save();
  res.json({
    status: "success",
    data: {
      user: authService.serializeUser(user, req.companyId)
    }
  });
});

export const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select("+passwordHash");
  if (!user) throw new AppError("User not found", 404);

  const matches = await user.comparePassword(currentPassword);
  if (!matches) throw new AppError("Incorrect current password", 400);

  if (newPassword.length < 8) {
    throw new AppError("New password must be at least 8 characters long", 400);
  }

  await user.setPassword(newPassword);
  await user.save();
  res.json({ status: "success", message: "Password updated successfully." });
});
