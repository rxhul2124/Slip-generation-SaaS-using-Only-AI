import { Billing } from "../models/Billing.js";
import { Company } from "../models/Company.js";
import { stripe, razorpay } from "../config/payments.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";
import crypto from "crypto";

export const plans = {
  free: { name: "Free", monthlySlipLimit: 100, price: 0, features: ["Basic slips", "Browser print"] },
  pro: { name: "Pro", monthlySlipLimit: Infinity, price: 49900, features: ["Unlimited slips", "Analytics", "Backups", "Thermal printing"] },
  enterprise: { name: "Enterprise", monthlySlipLimit: Infinity, price: null, features: ["Teams", "API access", "Advanced audit", "Dedicated support"] }
};

export async function getBilling(companyId) {
  return Billing.findOne({ company: companyId });
}

export async function createRazorpayOrder(companyId, planId) {
  if (!plans[planId]) throw new AppError("Unknown plan", 400);
  if (planId === "free" || planId === "enterprise") throw new AppError("This plan does not require payment", 400);
  if (!razorpay) throw new AppError("Razorpay is not configured", 503);

  const plan = plans[planId];
  const amount = plan.price;
  const currency = "INR";

  const options = {
    amount,
    currency,
    receipt: `slipora_${companyId}_${Date.now()}`,
    notes: { companyId, plan: planId }
  };

  const order = await razorpay.orders.create(options);
  return { order, keyId: env.razorpayKeyId };
}

export async function verifyRazorpayPayment(companyId, body) {
  if (!razorpay) throw new AppError("Razorpay is not configured", 503);

  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, plan } = body;
  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !plan) {
    throw new AppError("Missing Razorpay payment details", 400);
  }

  const expectedSignature = crypto
    .createHmac("sha256", env.razorpayKeySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  if (expectedSignature !== razorpaySignature) {
    throw new AppError("Invalid payment signature", 400);
  }

  const planConfig = plans[plan];
  const billing = await Billing.findOneAndUpdate(
    { company: companyId },
    {
      plan,
      provider: "razorpay",
      status: "active",
      subscriptionId: razorpayOrderId,
      currentPeriodEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      $push: {
        invoices: {
          providerInvoiceId: razorpayPaymentId,
          amount: planConfig.price,
          currency: "INR",
          status: "paid",
          paidAt: new Date()
        }
      }
    },
    { new: true, upsert: true }
  );

  await Company.findByIdAndUpdate(companyId, { plan });
  return billing;
}

export async function handleRazorpayWebhook(body) {
  if (!razorpay) throw new AppError("Razorpay is not configured", 503);

  const event = body.event;
  const paymentEntity = body.payload?.payment?.entity;
  if (!paymentEntity) return { received: true };

  if (event === "payment.captured" || event === "payment.authorized") {
    const companyId = paymentEntity.notes?.companyId;
    const plan = paymentEntity.notes?.plan;
    if (!companyId || !plan) return { received: true };

    const planConfig = plans[plan];
    if (!planConfig) return { received: true };

    await Billing.findOneAndUpdate(
      { company: companyId },
      {
        plan,
        provider: "razorpay",
        status: "active",
        subscriptionId: paymentEntity.order_id,
        currentPeriodEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        $push: {
          invoices: {
            providerInvoiceId: paymentEntity.id,
            amount: paymentEntity.amount,
            currency: paymentEntity.currency,
            status: "paid",
            paidAt: new Date()
          }
        }
      },
      { new: true, upsert: true }
    );

    await Company.findByIdAndUpdate(companyId, { plan });
  }

  if (event === "subscription.cancelled" || event === "payment.failed") {
    const companyId = paymentEntity.notes?.companyId;
    if (companyId) {
      await Billing.findOneAndUpdate(
        { company: companyId },
        { status: "past_due" },
        { new: true }
      );
    }
  }

  return { received: true };
}

export async function changePlan(companyId, plan, provider = "manual") {
  if (!plans[plan]) throw new AppError("Unknown plan", 400);
  if (provider === "manual") throw new AppError("Subscription changes must be confirmed by a payment provider", 403);

  if (provider === "stripe" && !stripe) throw new AppError("Stripe is not configured", 503);
  if (provider === "razorpay" && !razorpay) throw new AppError("Razorpay is not configured", 503);

  const billing = await Billing.findOneAndUpdate(
    { company: companyId },
    { plan, provider, status: "active" },
    { new: true, upsert: true }
  );
  await Company.findByIdAndUpdate(companyId, { plan });
  return billing;
}
