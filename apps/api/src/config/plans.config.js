export const PLANS_CONFIG = {
  free: {
    key: "free",
    name: "Free",
    price: 0,
    currency: "INR",
    period: "forever",
    description: "Get started with essential packing slip features",
    limits: {
      monthlySlipLimit: 50,
      templateLimit: 3,
      customerLimit: 25,
      teamMemberLimit: 1,
      storageMB: 100
    },
    features: {
      analytics: false,
      bulkGeneration: false,
      backups: false,
      auditLogs: false,
      customBranding: false,
      prioritySupport: false
    },
    razorpayPlanId: null
  },
  pro: {
    key: "pro",
    name: "Professional",
    price: 699,
    currency: "INR",
    period: "/month",
    description: "For growing businesses needing scale and automation",
    limits: {
      monthlySlipLimit: 2000,
      templateLimit: 25,
      customerLimit: 500,
      teamMemberLimit: 10,
      storageMB: 10240
    },
    features: {
      analytics: true,
      bulkGeneration: true,
      backups: true,
      auditLogs: false,
      customBranding: true,
      prioritySupport: true
    },
    razorpayPlanId: process.env.RAZORPAY_PRO_PLAN_ID || "plan_pro_default"
  },
  enterprise: {
    key: "enterprise",
    name: "Enterprise",
    price: 4999,
    currency: "INR",
    period: "/month",
    description: "For large-scale operations with dedicated controls and SLA",
    limits: {
      monthlySlipLimit: null, // null represents unlimited
      templateLimit: null,
      customerLimit: null,
      teamMemberLimit: null,
      storageMB: null
    },
    features: {
      analytics: true,
      bulkGeneration: true,
      backups: true,
      auditLogs: true,
      customBranding: true,
      prioritySupport: true
    },
    razorpayPlanId: process.env.RAZORPAY_ENTERPRISE_PLAN_ID || "plan_ent_default"
  }
};

export function getPlanConfig(planKey) {
  return PLANS_CONFIG[planKey] || PLANS_CONFIG.free;
}

export function hasFeature(planKey, featureName) {
  const config = getPlanConfig(planKey);
  return Boolean(config.features[featureName]);
}

export function isWithinLimit(planKey, resource, currentCount) {
  const config = getPlanConfig(planKey);
  const limit = config.limits[resource];
  if (limit === null || limit === undefined) return true; // unlimited
  return currentCount < limit;
}
