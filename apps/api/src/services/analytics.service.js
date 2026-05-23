import { startOfDay } from "date-fns";
import mongoose from "mongoose";
import { Analytics } from "../models/Analytics.js";
import { GeneratedSlip } from "../models/GeneratedSlip.js";

export async function incrementAnalytics(companyId, { product, customer, template, metric = "slipsGenerated" }) {
  const date = startOfDay(new Date());
  const update = {
    $inc: { [metric]: 1 },
    $setOnInsert: { company: companyId, date }
  };

  await Analytics.findOneAndUpdate({ company: companyId, date }, update, { upsert: true, new: true });

  const doc = await Analytics.findOne({ company: companyId, date });
  const bump = (field, id) => {
    if (!id) return;
    const existing = doc[field].find((item) => item[field.replace("Usage", "")]?.toString() === id.toString());
    if (existing) existing.count += 1;
    else doc[field].push({ [field.replace("Usage", "")]: id, count: 1 });
  };

  bump("productUsage", product);
  bump("customerUsage", customer);
  bump("templateUsage", template);
  await doc.save();
}

export async function dashboardMetrics(companyId) {
  const companyObjectId = new mongoose.Types.ObjectId(companyId);
  const [slipStats, recent, analytics] = await Promise.all([
    GeneratedSlip.aggregate([
      { $match: { company: companyObjectId } },
      {
        $group: {
          _id: null,
          totalSlips: { $sum: 1 },
          totalPrints: { $sum: "$printedCount" },
          totalExports: { $sum: "$exportedCount" },
          todaySlips: {
            $sum: {
              $cond: [{ $gte: ["$createdAt", startOfDay(new Date())] }, 1, 0]
            }
          }
        }
      }
    ]),
    GeneratedSlip.find({ company: companyId })
      .sort("-createdAt")
      .limit(8)
      .populate("product customer template", "name sku"),
    Analytics.find({ company: companyId }).sort("date").limit(30)
  ]);

  return {
    totals: slipStats[0] || { totalSlips: 0, totalPrints: 0, totalExports: 0, todaySlips: 0 },
    recent,
    trend: analytics
  };
}
