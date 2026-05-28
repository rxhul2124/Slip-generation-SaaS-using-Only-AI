import { addDays } from "date-fns";
import { User } from "../models/User.js";
import { TeamInvite } from "../models/Team.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { hashToken, randomToken } from "../utils/tokens.js";
import { sendMail } from "../utils/mailer.js";
import { pagination, sortOption } from "../utils/apiFeatures.js";

export const listMembers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = pagination(req.query);
  const query = { "memberships.company": req.companyId };

  const [users, total] = await Promise.all([
    User.find(query).sort(sortOption(req.query.sort)).skip(skip).limit(limit).select("name email avatarUrl memberships"),
    User.countDocuments(query)
  ]);

  const members = users.map((user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    membership: user.memberships.find((membership) => membership.company.toString() === req.companyId)
  }));
  
  res.json({ status: "success", data: members, meta: { page, limit, total, pages: Math.ceil(total / limit) } });
});

export const invite = asyncHandler(async (req, res) => {
  const token = randomToken();
  const inviteDoc = await TeamInvite.create({
    company: req.companyId,
    email: req.validated.body.email,
    role: req.validated.body.role,
    tokenHash: hashToken(token),
    invitedBy: req.user._id,
    expiresAt: addDays(new Date(), 7)
  });
  await sendMail({
    to: req.validated.body.email,
    subject: "You were invited to Slipora",
    text: `Invite token: ${token}`
  });
  await req.audit?.({ email: req.validated.body.email, role: req.validated.body.role }, inviteDoc._id.toString());
  res.status(201).json({ status: "success", data: inviteDoc });
});

export const updateMember = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.params.userId, "memberships.company": req.companyId });
  if (!user) throw new AppError("Member not found", 404);

  const membership = user.memberships.find((item) => item.company.toString() === req.companyId);
  if (membership.role === "owner") throw new AppError("Owner membership cannot be changed here", 400);
  if (req.validated.body.role) membership.role = req.validated.body.role;
  if (req.validated.body.status) membership.status = req.validated.body.status;
  await user.save();
  await req.audit?.({ userId: user._id, payload: req.validated.body }, user._id.toString());
  res.json({ status: "success", data: user });
});
