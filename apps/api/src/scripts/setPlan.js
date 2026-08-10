import mongoose from "mongoose";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { Company } from "../models/Company.js";

async function setPlan() {
  const email = process.argv[2];
  const targetPlan = (process.argv[3] || "pro").toLowerCase();

  if (!email) {
    console.error("Usage: node src/scripts/setPlan.js <email> [free|pro|enterprise]");
    process.exit(1);
  }

  if (!["free", "pro", "enterprise"].includes(targetPlan)) {
    console.error("Invalid plan. Valid options: free, pro, enterprise");
    process.exit(1);
  }

  try {
    console.log(`Connecting to MongoDB...`);
    await mongoose.connect(env.mongoUri);

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      console.error(`User with email "${email}" not found.`);
      process.exit(1);
    }

    const companyId = user.currentCompany || user.memberships?.[0]?.company;
    if (!companyId) {
      console.error(`No company associated with user "${email}".`);
      process.exit(1);
    }

    const company = await Company.findById(companyId);
    if (!company) {
      console.error(`Company not found for ID "${companyId}".`);
      process.exit(1);
    }

    company.plan = targetPlan;
    if (!company.billing) company.billing = {};
    company.billing.plan = targetPlan;
    company.billing.subscriptionStatus = "active";
    company.billing.paymentStatus = "paid";
    company.billing.cancelAtPeriodEnd = false;

    await company.save();

    console.log(`SUCCESS! Account upgraded successfully:`);
    console.log(`- User Email: ${user.email}`);
    console.log(`- User Name:  ${user.name}`);
    console.log(`- Company:    ${company.name}`);
    console.log(`- New Plan:   ${targetPlan.toUpperCase()}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Error setting plan:", err);
    process.exit(1);
  }
}

setPlan();
