import mongoose from "mongoose";

const billingHistorySchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    subscriptionId: String,
    paymentId: String,
    invoiceId: String,
    previousPlan: String,
    newPlan: String,
    amount: { type: Number, required: true }, // in INR paise or rupees
    currency: { type: String, default: "INR" },
    status: { type: String, enum: ["paid", "failed", "refunded", "pending"], required: true },
    eventType: { type: String, required: true },
    webhookEventId: String,
    source: {
      type: String,
      enum: ["razorpay_webhook", "admin", "system", "checkout"],
      default: "razorpay_webhook"
    },
    subscriptionSnapshot: { type: mongoose.Schema.Types.Mixed }
  },
  { timestamps: true }
);

export const BillingHistory = mongoose.model("BillingHistory", billingHistorySchema);
