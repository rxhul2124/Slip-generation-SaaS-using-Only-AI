import { BillingHistory } from "../models/BillingHistory.js";

export const billingHistoryService = {
  async recordEvent(params, session = null) {
    const doc = new BillingHistory({
      company: params.companyId,
      subscriptionId: params.subscriptionId,
      paymentId: params.paymentId,
      invoiceId: params.invoiceId,
      previousPlan: params.previousPlan,
      newPlan: params.newPlan,
      amount: params.amount || 0,
      currency: params.currency || "INR",
      status: params.status || "paid",
      eventType: params.eventType,
      webhookEventId: params.webhookEventId,
      source: params.source || "razorpay_webhook",
      subscriptionSnapshot: params.subscriptionSnapshot || {}
    });

    if (session) {
      return await doc.save({ session });
    }
    return await doc.save();
  },

  async getHistoryForCompany(companyId, limit = 20) {
    return await BillingHistory.find({ company: companyId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }
};
