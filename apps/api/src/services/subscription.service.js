import Razorpay from "razorpay";
import { Company } from "../models/Company.js";
import { getPlanConfig } from "../config/plans.config.js";

let razorpayInstance = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
}

export const subscriptionService = {
  /**
   * Create Razorpay Subscription or Mock fallback
   */
  async createSubscription(companyId, planKey) {
    const company = await Company.findById(companyId);
    if (!company) {
      const err = new Error("Company not found");
      err.statusCode = 404;
      throw err;
    }

    const planConfig = getPlanConfig(planKey);
    if (planKey === "free" || !planConfig) {
      const err = new Error("Invalid plan selection");
      err.statusCode = 400;
      throw err;
    }

    // Razorpay Integration
    if (razorpayInstance && planConfig.razorpayPlanId && !planConfig.razorpayPlanId.endsWith("_default")) {
      try {
        const subscription = await razorpayInstance.subscriptions.create({
          plan_id: planConfig.razorpayPlanId,
          customer_notify: 1,
          total_count: 12,
          notes: { companyId: companyId.toString(), planKey }
        });

        return {
          subscriptionId: subscription.id,
          keyId: process.env.RAZORPAY_KEY_ID,
          planKey,
          amount: planConfig.price * 100, // paise
          currency: "INR"
        };
      } catch (err) {
        console.error("Razorpay subscription creation error:", err);
      }
    }

    // Dev/Mock Fallback when live keys are not configured
    const mockSubscriptionId = `sub_mock_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    return {
      subscriptionId: mockSubscriptionId,
      keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_mockKey123",
      planKey,
      amount: planConfig.price * 100,
      currency: "INR",
      isMock: true
    };
  },

  /**
   * Cancel subscription at period end
   */
  async cancelSubscription(companyId) {
    const company = await Company.findById(companyId);
    if (!company) {
      const err = new Error("Company not found");
      err.statusCode = 404;
      throw err;
    }

    const subId = company.billing?.razorpaySubscriptionId;
    if (razorpayInstance && subId && !subId.startsWith("sub_mock_")) {
      try {
        await razorpayInstance.subscriptions.cancel(subId, true); // cancel at period end
      } catch (err) {
        console.error("Razorpay subscription cancellation error:", err);
      }
    }

    company.billing.cancelAtPeriodEnd = true;
    await company.save();

    return {
      message: "Subscription will be cancelled at the end of the current billing cycle.",
      cancelAtPeriodEnd: true
    };
  }
};
