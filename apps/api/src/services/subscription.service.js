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
   * Create Razorpay Subscription or Order fallback for live checkout popup
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

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // 1. Try Razorpay Subscription if plan_id is configured
    if (razorpayInstance && planConfig.razorpayPlanId && planConfig.razorpayPlanId.startsWith("plan_")) {
      try {
        const subscription = await razorpayInstance.subscriptions.create({
          plan_id: planConfig.razorpayPlanId,
          customer_notify: 1,
          total_count: 12,
          notes: { companyId: companyId.toString(), planKey }
        });

        return {
          subscriptionId: subscription.id,
          keyId,
          planKey,
          amount: planConfig.price * 100, // paise
          currency: "INR",
          type: "subscription"
        };
      } catch (err) {
        console.error("Razorpay subscription creation failed, falling back to Order:", err);
      }
    }

    // 2. Try Razorpay Order if keys are present (works without pre-created Plan IDs!)
    if (razorpayInstance && keyId && keySecret) {
      try {
        const order = await razorpayInstance.orders.create({
          amount: planConfig.price * 100, // in paise
          currency: "INR",
          receipt: `rcpt_${companyId.toString().substr(-8)}_${Date.now().toString().substr(-6)}`,
          notes: { companyId: companyId.toString(), planKey }
        });

        return {
          orderId: order.id,
          keyId,
          planKey,
          amount: planConfig.price * 100,
          currency: "INR",
          type: "order"
        };
      } catch (err) {
        console.error("Razorpay order creation failed:", err);
      }
    }

    // 3. Dev/Demo Mock Fallback when keys are missing or invalid
    const mockSubscriptionId = `sub_mock_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    return {
      subscriptionId: mockSubscriptionId,
      keyId: keyId || "rzp_test_mockKey123",
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
        await razorpayInstance.subscriptions.cancel(subId, true);
      } catch (err) {
        console.error("Razorpay subscription cancellation error:", err);
      }
    }

    if (!company.billing) company.billing = {};
    company.billing.cancelAtPeriodEnd = true;
    await company.save();

    return {
      message: "Subscription will be cancelled at the end of the current billing cycle.",
      cancelAtPeriodEnd: true
    };
  }
};
