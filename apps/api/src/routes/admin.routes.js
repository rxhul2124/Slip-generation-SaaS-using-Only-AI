import { Router } from "express";
import { User } from "../models/User.js";
import { Company } from "../models/Company.js";

export const adminRouter = Router();

adminRouter.get("/set-plan", async (req, res) => {
  try {
    const email = String(req.query.email || "").toLowerCase().trim();
    const plan = String(req.query.plan || "pro").toLowerCase().trim();
    const key = String(req.query.key || "");

    const expectedKey = process.env.ADMIN_SECRET || "slipora2026admin";
    if (key !== expectedKey) {
      return res.status(401).json({ status: "error", message: "Invalid key. Provide ?key=slipora2026admin" });
    }

    if (!email) {
      return res.status(400).json({ status: "error", message: "email parameter required. Example: ?email=user@domain.com&plan=pro" });
    }

    if (!["free", "pro", "enterprise"].includes(plan)) {
      return res.status(400).json({ status: "error", message: "Invalid plan. Choose free, pro, or enterprise." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ status: "error", message: `User with email '${email}' not found.` });
    }

    const companyId = user.currentCompany || user.memberships?.[0]?.company;
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ status: "error", message: "Company record not found for this user." });
    }

    company.plan = plan;
    if (!company.billing) company.billing = {};
    company.billing.plan = plan;
    company.billing.subscriptionStatus = "active";
    company.billing.paymentStatus = "paid";
    company.billing.cancelAtPeriodEnd = false;

    await company.save();

    return res.json({
      status: "success",
      message: `Account ${email} successfully upgraded to ${plan.toUpperCase()} plan!`,
      data: {
        email: user.email,
        userName: user.name,
        companyName: company.name,
        plan: company.plan,
        subscriptionStatus: company.billing.subscriptionStatus
      }
    });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
});
