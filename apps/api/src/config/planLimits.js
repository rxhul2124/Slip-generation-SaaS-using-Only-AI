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
};

export function limitsFor(plan = "free") {
  return planLimits[plan] || planLimits.free;
}
