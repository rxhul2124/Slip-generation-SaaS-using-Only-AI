import mongoose from "mongoose";

const billingSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, unique: true },
    plan: { type: String, enum: ["free", "pro", "enterprise"], default: "free" },
    status: { type: String, enum: ["trialing", "active", "past_due", "cancelled"], default: "active" },
    provider: { type: String, enum: ["stripe", "razorpay", "manual"], default: "manual" },
    customerId: String,
    subscriptionId: String,
    currentPeriodEndsAt: Date,
    usage: {
      slipsThisMonth: { type: Number, default: 0 },
      storageBytes: { type: Number, default: 0 },
      teamSeats: { type: Number, default: 1 }
    },
    invoices: [
      {
        providerInvoiceId: String,
        amount: Number,
        currency: String,
        status: String,
        hostedUrl: String,
        paidAt: Date
      }
    ]
  },
  { timestamps: true }
);

export const Billing = mongoose.model("Billing", billingSchema);
