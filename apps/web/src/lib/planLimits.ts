import type { BillingSubscription } from "./types";

export type Plan = BillingSubscription["plan"];

export const planLimits = {
  free: {
    users: 1,
    customers: 25,
    products: 25,
    customTemplates: 3,
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
    users: 10,
    customers: 500,
    products: 500,
    customTemplates: 25,
    slipsPerMonth: 2000,
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
    users: null,
    customers: null,
    products: null,
    customTemplates: null,
    slipsPerMonth: null,
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
