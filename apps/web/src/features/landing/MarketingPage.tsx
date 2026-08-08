import { ArrowLeft, BookOpen, BriefcaseBusiness, Check, Code2, FileText, LifeBuoy, Lock, PackageCheck, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const pricing: Array<{ name: string; price: string; features: string[] }> = [
  { name: "Free", price: "Free", features: ["50 slips/month", "1 user", "1 active session", "2 companies", "10 products", "2 custom templates"] },
  { name: "Pro", price: "₹699/mo", features: ["5 users", "3 active sessions", "Bulk CSV", "Presets", "Reports", "Backups", "Logo import"] },
  { name: "Enterprise", price: "Custom", features: ["Users by contract", "Enterprise session policy", "Audit logs", "Priority support", "Dedicated restore help"] }
];

const pages = {
  product: {
    eyebrow: "Product",
    title: "A workspace for packing slip operations",
    intro: "Slipora brings company records, product data, slip templates, generation history, printing, and plan controls into one focused workspace.",
    icon: PackageCheck,
    sections: [
      ["Template-first workflow", "Start from default small and medium templates, then create account-scoped layouts for your own slip formats."],
      ["Validated slip generation", "Use saved companies and products so part names, quantities, and destinations stay consistent before printing."],
      ["Operational controls", "Plans define users, sessions, templates, CSV generation, backups, reports, and audit visibility."]
    ]
  },
  features: {
    eyebrow: "Product",
    title: "Features available in the app",
    intro: "The app focuses on real packing slip workflows: building templates, managing records, generating slips, printing, and keeping access under control.",
    icon: Check,
    sections: [
      ["Template builder", "Bordered layouts, draggable fields, resize handles, bold text, barcode, QR, logo import on paid plans, and live print preview."],
      ["Slip generation", "Manual generation for daily work and Pro bulk CSV generation for larger batches."],
      ["Workspace management", "Customers, products, presets, reports, backups, team access, billing, and Enterprise audit logs."]
    ]
  },
  templates: {
    eyebrow: "Templates",
    title: "Default templates plus private custom layouts",
    intro: "Every workspace gets the default small and medium slip templates. Custom templates belong only to the account that created them.",
    icon: FileText,
    sections: [
      ["Small default", "A compact thermal slip for label-style packing output."],
      ["Medium default", "A wider bordered packing slip layout for more readable printed slips."],
      ["Custom builder", "Set paper size, place fields, preview the printed page, and choose slip fit by row when designing a new layout."]
    ]
  },
  pricing: {
    eyebrow: "Pricing",
    title: "Plans that match the dashboard",
    intro: "The public pricing, billing page, and backend authorization use the same Free, Pro, and Enterprise limits.",
    icon: ShieldCheck,
    sections: []
  },
  resources: {
    eyebrow: "Resources",
    title: "Guides for running Slipora",
    intro: "Use these resources to understand the workflow, plan limits, print setup, and how to keep data clean while generating slips.",
    icon: BookOpen,
    sections: [
      ["Getting started", "Create companies and products, choose a template, generate a slip, then print through the browser."],
      ["Plan setup", "Use Free for trial usage, Pro for active teams, and Enterprise for audit-heavy operations."],
      ["Data hygiene", "Keep products and customer records organized so slip generation stays fast and predictable."]
    ]
  },
  documentation: {
    eyebrow: "Resources",
    title: "Documentation",
    intro: "A practical guide to the current app areas and how they work together.",
    icon: BookOpen,
    sections: [
      ["Dashboard", "Shows live workspace totals from your account instead of dummy seed data."],
      ["Templates", "Default templates are shared; custom templates are saved only for the current account."],
      ["Authorization", "Free, Pro, and Enterprise plans control feature access in both UI and backend routes."]
    ]
  },
  apiReference: {
    eyebrow: "Resources",
    title: "API reference",
    intro: "The app uses protected API routes for auth, companies, products, templates, slips, reporting, backups, billing, and team controls.",
    icon: Code2,
    sections: [
      ["Authentication", "Login sessions are plan-aware: Free allows 1 active session, Pro allows 3, and Enterprise follows its user policy."],
      ["Workspace data", "Companies, products, templates, and slips are scoped to the authenticated account."],
      ["Feature gates", "Paid endpoints enforce the same limits shown in the dashboard."]
    ]
  },
  support: {
    eyebrow: "Resources",
    title: "Support",
    intro: "Support is focused on setup issues, print layout problems, template questions, billing, and data recovery.",
    icon: LifeBuoy,
    sections: [
      ["Print layout help", "Use the template preview and page-fit controls to tune how many slips appear in one row."],
      ["Billing help", "Check the Billing page for plan details and upgrade paths."],
      ["Workspace recovery", "Backups are available on Pro and Enterprise plans."]
    ]
  },
  company: {
    eyebrow: "Company",
    title: "Built for focused operations teams",
    intro: "Slipora is designed around repeatable packing slip work instead of broad document generation.",
    icon: BriefcaseBusiness,
    sections: [
      ["Focused scope", "The product stays close to companies, products, slips, templates, and printing."],
      ["Clear limits", "Plan restrictions are visible before a user hits a blocked workflow."],
      ["Practical design", "The interface favors dense, readable operational screens over marketing-heavy decoration."]
    ]
  },
  about: {
    eyebrow: "Company",
    title: "About Slipora",
    intro: "Slipora helps small and growing teams move from messy manual slip creation to a more consistent printed workflow.",
    icon: PackageCheck,
    sections: [
      ["Why it exists", "Packing slip work often lives in spreadsheets, screenshots, and repeated typing. Slipora centralizes that routine."],
      ["Who it serves", "Teams that need company-wise products, repeatable slip formats, and faster browser-based printing."],
      ["What stays simple", "Default templates, scoped custom templates, clear print previews, and direct plan limits."]
    ]
  },
  careers: {
    eyebrow: "Company",
    title: "Careers",
    intro: "There are no open roles listed right now, but this page is ready for future hiring updates.",
    icon: BriefcaseBusiness,
    sections: [
      ["Product mindset", "We care about practical tools for real operational work."],
      ["Design mindset", "Interfaces should be clear, fast to scan, and respectful of repeated daily use."],
      ["Engineering mindset", "Reliability and account isolation matter more than flashy complexity."]
    ]
  },
  privacy: {
    eyebrow: "Company",
    title: "Privacy",
    intro: "Workspace data should stay scoped to the account that owns it, including custom templates and generated records.",
    icon: Lock,
    sections: [
      ["Account separation", "User-created templates and operational records are kept within the current account scope."],
      ["Session control", "Active login sessions follow the subscription tier to reduce uncontrolled access."],
      ["Data controls", "Backups and audit logs are plan-aware features for teams that need stronger governance."]
    ]
  }
};

export type MarketingPageKey = keyof typeof pages;

export function MarketingPage({ page }: { page: MarketingPageKey }) {
  const content = pages[page];
  const Icon = content.icon;

  return (
    <main className="min-h-screen bg-[#f7f9fc] text-[#191c1e] dark:bg-[#0b0e14] dark:text-[#eff1f4]">
      <header className="border-b border-slate-900/10 bg-white/86 backdrop-blur-xl dark:border-white/10 dark:bg-[#0b0e14]/92">
        <div className="mx-auto flex h-14 max-w-[1180px] items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 text-sm font-black">
            <ArrowLeft className="h-4 w-4" />
            Slipora
          </Link>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild size="sm" className="bg-[#0051d5] text-white hover:bg-[#003ea8]">
              <Link to="/register">Start free</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-[1180px] px-4 py-14 sm:px-6 sm:py-20">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#0051d5] dark:border-white/10 dark:bg-[#14171f]">
            <Icon className="h-3.5 w-3.5" />
            {content.eyebrow}
          </div>
          <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl">{content.title}</h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">{content.intro}</p>
        </div>

        {page === "pricing" ? (
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {pricing.map((plan) => (
              <Card key={plan.name} className="border-slate-900/10 bg-white dark:border-white/10 dark:bg-[#14171f]">
                <CardContent className="p-6">
                  <h2 className="text-lg font-black">{plan.name}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{plan.price}</p>
                  <div className="mt-5 space-y-2">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-[#0051d5]" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {content.sections.map(([title, body]) => (
              <Card key={title} className="border-slate-900/10 bg-white dark:border-white/10 dark:bg-[#14171f]">
                <CardContent className="p-6">
                  <h2 className="font-black">{title}</h2>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
