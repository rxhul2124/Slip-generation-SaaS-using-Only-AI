import {
  BarChart3,
  Building2,
  Cloud,
  CreditCard,
  FileSignature,
  Gauge,
  History,
  ImageIcon,
  LayoutTemplate,
  Printer,
  Settings,
  Shield,
  User,
  Key,
  Bell,
  Moon,
  Package,
} from "lucide-react";
import type { SearchItem } from "./searchEngine";
import type { Customer, Product, SlipTemplate } from "./types";

// ── Static: navigation pages ──
export const pageItems: SearchItem[] = [
  {
    id: "page-home",
    title: "Home",
    subtitle: "Dashboard overview",
    category: "page",
    icon: Gauge,
    path: "/app",
    keywords: ["dashboard", "overview", "home", "main"],
  },
  {
    id: "page-companies",
    title: "Companies",
    subtitle: "Manage your company clients",
    category: "page",
    icon: Building2,
    path: "/customers",
    keywords: ["companies", "customers", "clients", "buyers"],
  },
  {
    id: "page-generate",
    title: "Create Slip",
    subtitle: "Generate a new packing slip",
    category: "page",
    icon: Printer,
    path: "/generate",
    keywords: ["create", "generate", "new", "slip", "packing"],
  },
  {
    id: "page-history",
    title: "Slip History",
    subtitle: "View past generated slips",
    category: "page",
    icon: History,
    path: "/history",
    keywords: ["history", "past", "slips", "previous", "records", "log"],
  },
  {
    id: "page-reports",
    title: "Reports",
    subtitle: "Analytics and statistics",
    category: "page",
    icon: BarChart3,
    path: "/analytics",
    keywords: ["reports", "analytics", "statistics", "charts", "graphs", "data"],
  },
  {
    id: "page-templates",
    title: "Slip Design",
    subtitle: "Manage slip templates",
    category: "page",
    icon: LayoutTemplate,
    path: "/templates",
    keywords: ["design", "templates", "layout", "slip design"],
  },
  {
    id: "page-profile",
    title: "Profile",
    subtitle: "Your personal settings",
    category: "page",
    icon: User,
    path: "/profile",
    keywords: ["profile", "account", "personal", "me", "user"],
  },
  {
    id: "page-settings",
    title: "Settings",
    subtitle: "Workspace configuration",
    category: "page",
    icon: Settings,
    path: "/settings",
    keywords: ["settings", "configuration", "preferences", "workspace"],
  },
];

// ── Static: settings options ──
export const settingItems: SearchItem[] = [
  {
    id: "setting-company-profile",
    title: "Company Profile",
    subtitle: "Branding and company identity",
    category: "setting",
    icon: Building2,
    path: "/settings",
    keywords: ["company", "profile", "branding", "identity", "logo", "name", "gst", "tax"],
  },
  {
    id: "setting-subscription",
    title: "Subscription",
    subtitle: "Plan and billing status",
    category: "setting",
    icon: CreditCard,
    path: "/settings",
    keywords: ["subscription", "plan", "billing", "payment", "pro", "free", "pricing"],
  },
  {
    id: "setting-printer-defaults",
    title: "Printer Defaults",
    subtitle: "Thermal vendor, paper, DPI, copies",
    category: "setting",
    icon: Printer,
    path: "/settings",
    keywords: ["printer", "thermal", "zebra", "tsc", "brother", "dpi", "paper", "print", "copies"],
  },
  {
    id: "setting-template-defaults",
    title: "Template Defaults",
    subtitle: "Default slip size and grid settings",
    category: "setting",
    icon: ImageIcon,
    path: "/settings",
    keywords: ["template", "defaults", "size", "grid", "border", "snap"],
  },
  {
    id: "setting-signature",
    title: "Signature Profile",
    subtitle: "Auto-fill signature on slips",
    category: "setting",
    icon: FileSignature,
    path: "/settings",
    keywords: ["signature", "sign", "employee", "role", "designation"],
  },
  {
    id: "setting-cloud-backups",
    title: "Cloud Backups",
    subtitle: "Automatic backup schedule",
    category: "setting",
    icon: Cloud,
    path: "/settings",
    keywords: ["backup", "cloud", "export", "restore", "auto backup", "daily", "weekly"],
  },
  {
    id: "setting-dark-mode",
    title: "Dark Mode",
    subtitle: "Toggle dark/light theme",
    category: "setting",
    icon: Moon,
    path: "/settings",
    keywords: ["dark", "light", "theme", "mode", "appearance", "color"],
  },
  {
    id: "setting-security",
    title: "Security & Password",
    subtitle: "Change password and 2FA settings",
    category: "setting",
    icon: Shield,
    path: "/profile",
    keywords: ["security", "password", "two-factor", "2fa", "authentication", "change password"],
  },
  {
    id: "setting-notifications",
    title: "Notifications",
    subtitle: "Manage notification preferences",
    category: "setting",
    icon: Bell,
    path: "/profile",
    keywords: ["notifications", "alerts", "email", "push", "notify"],
  },
  {
    id: "setting-api-keys",
    title: "API Keys",
    subtitle: "Manage programmatic access (Coming Soon)",
    category: "setting",
    icon: Key,
    path: "/profile",
    keywords: ["api", "keys", "token", "integration", "programmatic", "developer"],
  },
];

// ── Dynamic: build search items from app data ──

export function buildCustomerItems(customers: Customer[]): SearchItem[] {
  return customers.map((c) => ({
    id: `company-${c._id}`,
    title: c.name,
    subtitle: c.contactPerson
      ? `${c.contactPerson}${c.shippingAddress?.city ? ` · ${c.shippingAddress.city}` : ""}`
      : c.shippingAddress?.city || undefined,
    category: "company" as const,
    icon: Building2,
    path: "/customers",
    keywords: [
      c.name,
      c.contactPerson || "",
      c.email || "",
      c.phone || "",
      c.taxNumber || "",
      c.shippingAddress?.city || "",
      c.shippingAddress?.state || "",
    ].filter(Boolean),
  }));
}

export function buildProductItems(customers: Customer[]): SearchItem[] {
  const items: SearchItem[] = [];
  const seen = new Set<string>();

  for (const customer of customers) {
    for (const product of customer.products || []) {
      if (seen.has(product._id)) continue;
      seen.add(product._id);

      items.push({
        id: `product-${product._id}`,
        title: product.name || product.partName || "Product",
        subtitle: `${product.partNumber || product.sku || ""} · ${customer.name}`,
        category: "product",
        icon: Package,
        path: "/customers",
        keywords: [
          product.name || "",
          product.partName || "",
          product.partNumber || "",
          product.sku || "",
          product.barcode || "",
          customer.name,
        ].filter(Boolean),
      });
    }
  }

  return items;
}

export function buildTemplateItems(templates: SlipTemplate[]): SearchItem[] {
  return templates.map((t) => ({
    id: `template-${t._id}`,
    title: t.name,
    subtitle: `${t.width}×${t.height}${t.units || "mm"} · ${t.orientation || "landscape"}`,
    category: "template" as const,
    icon: LayoutTemplate,
    path: `/templates`,
    keywords: [
      t.name,
      t.format || "",
      t.renderer || "",
      t.orientation || "",
      `${t.width}x${t.height}`,
    ].filter(Boolean),
  }));
}
