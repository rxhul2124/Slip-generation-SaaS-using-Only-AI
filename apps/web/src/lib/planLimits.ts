import type { BillingSubscription } from "./types";

export type Plan = BillingSubscription["plan"];

export const planLimits = {
  free: {
    sessions: 1,
    users: 1,
    customers: 2,
    products: 10,
    customTemplates: 2,
    slipsPerMonth: 50,
    features: {
      bulk: false,
      presets: false,
      analytics: false,
      backups: false,
      auditLogs: false,
      logoImport: false,
      browserPrint: true
    }
  },
  pro: {
    sessions: 3,
    users: 5,
    customers: Infinity,
    products: Infinity,
    customTemplates: Infinity,
    slipsPerMonth: Infinity,
    features: {
      bulk: true,
      presets: true,
      analytics: true,
      backups: true,
      auditLogs: false,
      logoImport: true,
      browserPrint: true
    }
  },
  enterprise: {
    sessions: Infinity,
    users: Infinity,
    customers: Infinity,
    products: Infinity,
    customTemplates: Infinity,
    slipsPerMonth: Infinity,
    features: {
      bulk: true,
      presets: true,
      analytics: true,
      backups: true,
      auditLogs: true,
      logoImport: true,
      browserPrint: true
    }
  }
} as const;

export function limitsFor(plan?: Plan | string | null) {
  return planLimits[(plan as Plan) || "free"] || planLimits.free;
}

export function hasFeature(plan: Plan | string | null | undefined, feature: keyof typeof planLimits.free.features) {
  return Boolean(limitsFor(plan).features[feature]);
}
