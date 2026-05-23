import { Counter } from "../models/Counter.js";

export async function nextSerial(companyId, prefix = "SLIP", now = new Date()) {
  const year = now.getFullYear();
  const counter = await Counter.findOneAndUpdate(
    { company: companyId, key: prefix, year },
    { $inc: { sequence: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return `${prefix}-${year}-${String(counter.sequence).padStart(6, "0")}`;
}
