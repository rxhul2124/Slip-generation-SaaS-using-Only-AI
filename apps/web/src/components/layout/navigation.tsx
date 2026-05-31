import {
  BarChart3,
  Building2,
  Gauge,
  History,
  LayoutTemplate,
  Printer
} from "lucide-react";

export const navigation = [
  { label: "Home", to: "/app", icon: Gauge },
  { label: "Companies", to: "/customers", icon: Building2 },
  { label: "Create Slip", to: "/generate", icon: Printer },
  { label: "Slip History", to: "/history", icon: History },
  { label: "Reports", to: "/analytics", icon: BarChart3 },
  { label: "Slip Design", to: "/templates", icon: LayoutTemplate }
];

