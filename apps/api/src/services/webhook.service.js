import crypto from "crypto";
import mongoose from "mongoose";
import { Company } from "../models/Company.js";
import { WebhookEvent } from "../models/WebhookEvent.js";
import { BillingHistory } from "../models/BillingHistory.js";
import { AuditLog } from "../models/AuditLog.js";

export const webhookService = {
  /**
   * Verify HMAC SHA256 Webhook Signature
   */
  verifySignature(rawBody, signature, secret) {
    if (!secret || !signature) return false;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");
    return expectedSignature === signature;
  },

  /**
   * Process incoming Razorpay webhook event transactionally & idempotently
   */
  async processEvent(eventPayload, eventId) {
    const id = eventId || eventPayload?.event_id || eventPayload?.payload?.payment?.entity?.id || `evt_${Date.now()}`;
    const eventType = eventPayload?.event || "unknown";

    // 1. Idempotency Check
    const existing = await WebhookEvent.findOne({ eventId: id }).lean();
    if (existing) {
      return { status: "ignored", message: "Duplicate webhook event already processed" };
    }

    // 2. Extract Details
    const subEntity = eventPayload?.payload?.subscription?.entity || {};
    const paymentEntity = eventPayload?.payload?.payment?.entity || {};
    const companyId = subEntity.notes?.companyId || paymentEntity.notes?.companyId;
    const targetPlanKey = subEntity.notes?.planKey || paymentEntity.notes?.planKey || "pro";

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Save WebhookEvent inside transaction
      await WebhookEvent.create([{ eventId: id, eventType, payload: eventPayload }], { session });

      if (companyId && mongoose.Types.ObjectId.isValid(companyId)) {
        const company = await Company.findById(companyId).session(session);
        if (company) {
          const previousPlan = company.billing?.plan || company.plan || "free";
          const now = new Date();
          const periodEnd = subEntity.current_end ? new Date(subEntity.current_end * 1000) : new Date(now.getTime() + 30 * 24 * 3600 * 1000);

          // Update Statuses based on Event Type
          if (["subscription.authenticated", "subscription.activated", "subscription.charged", "payment.captured"].includes(eventType)) {
            company.plan = targetPlanKey;
            company.billing.plan = targetPlanKey;
            company.billing.subscriptionStatus = "active";
            company.billing.paymentStatus = "paid";
            company.billing.razorpaySubscriptionId = subEntity.id || company.billing.razorpaySubscriptionId;
            company.billing.currentPeriodStart = subEntity.current_start ? new Date(subEntity.current_start * 1000) : now;
            company.billing.currentPeriodEnd = periodEnd;
            company.billing.lastPaymentDate = now;
            company.billing.cancelAtPeriodEnd = false;
            await company.save({ session });

            // Record Billing History
            await BillingHistory.create(
              [
                {
                  company: companyId,
                  subscriptionId: subEntity.id || "manual",
                  paymentId: paymentEntity.id || "payment_checkout",
                  previousPlan,
                  newPlan: targetPlanKey,
                  amount: paymentEntity.amount || (targetPlanKey === "enterprise" ? 499900 : 99900),
                  currency: "INR",
                  status: "paid",
                  eventType,
                  webhookEventId: id,
                  source: "razorpay_webhook",
                  subscriptionSnapshot: subEntity
                }
              ],
              { session }
            );

            // Record Audit Log
            await AuditLog.create(
              [
                {
                  company: companyId,
                  user: company.owner,
                  action: "SUBSCRIPTION_UPGRADED",
                  category: "billing",
                  details: { previousPlan, newPlan: targetPlanKey, eventType }
                }
              ],
              { session }
            );
          } else if (["subscription.halted", "payment.failed"].includes(eventType)) {
            company.billing.subscriptionStatus = "paused";
            company.billing.paymentStatus = "overdue";
            await company.save({ session });

            await AuditLog.create(
              [
                {
                  company: companyId,
                  user: company.owner,
                  action: "PAYMENT_FAILED",
                  category: "billing",
                  details: { eventType }
                }
              ],
              { session }
            );
          } else if (["subscription.cancelled", "subscription.expired"].includes(eventType)) {
            company.plan = "free";
            company.billing.plan = "free";
            company.billing.subscriptionStatus = "cancelled";
            company.billing.paymentStatus = "paid";
            await company.save({ session });

            await AuditLog.create(
              [
                {
                  company: companyId,
                  user: company.owner,
                  action: "SUBSCRIPTION_CANCELLED",
                  category: "billing",
                  details: { previousPlan, newPlan: "free", eventType }
                }
              ],
              { session }
            );
          }
        }
      }

      await session.commitTransaction();
      return { status: "ok", message: "Webhook processed successfully" };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
};
