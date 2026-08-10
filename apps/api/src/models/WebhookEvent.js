import mongoose from "mongoose";

const webhookEventSchema = new mongoose.Schema(
  {
    eventId: { type: String, required: true, unique: true, index: true },
    eventType: { type: String, required: true },
    source: { type: String, default: "razorpay" },
    payload: { type: mongoose.Schema.Types.Mixed },
    processedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const ttlDays = Number(process.env.WEBHOOK_EVENT_TTL_DAYS) || 180;
webhookEventSchema.index({ processedAt: 1 }, { expireAfterSeconds: ttlDays * 86400 });

export const WebhookEvent = mongoose.model("WebhookEvent", webhookEventSchema);
