import { motion } from "framer-motion";
import {
  BarChart3,
  Boxes,
  Check,
  ChevronDown,
  Code2,
  FileCheck2,
  Layers3,
  Menu,
  Moon,
  PackageCheck,
  Printer,
  ShieldCheck,
  Sun,
  X
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/stores/uiStore";

const features = [
  { title: "Company and product books", body: "Keep customer destinations, part numbers, quantities, and reusable product data ready for every slip.", icon: Boxes },
  { title: "Bordered template builder", body: "Design thermal and paper slips with drag, resize, bold text, barcode, QR, logo, and live print preview controls.", icon: Code2 },
  { title: "Print-ready generation", body: "Generate slips from validated records, preview the page layout, and send clean output to the browser print flow.", icon: Printer },
  { title: "Bulk CSV workflows", body: "Pro workspaces can generate larger batches from CSV with the same validation rules used by manual slips.", icon: Layers3 },
  { title: "Reports and backups", body: "Track generation activity, preserve workspace data, and restore important operational records when needed.", icon: BarChart3 },
  { title: "Plan-aware access", body: "Free, Pro, and Enterprise workspaces get clear limits for users, sessions, templates, and advanced tools.", icon: ShieldCheck }
];

const templates = [
  { title: "Small thermal slip", meta: "62 x 38 mm", bars: ["w-24", "w-full", "w-32"] },
  { title: "Medium packing slip", meta: "A wider bordered layout", bars: ["w-32", "w-28", "w-full"] },
  { title: "Custom page fit", meta: "Set slips per row", bars: ["w-20", "w-full", "w-24"] }
];

const plans = [
  { name: "Free", price: "Free", label: "50 slips/month", features: ["1 user", "1 active session", "2 companies", "10 products", "2 custom templates", "Browser printing"] },
  { name: "Pro", price: "Rs 699/mo", label: "Most popular", featured: true, features: ["5 users", "3 active sessions", "Bulk CSV", "Presets", "Reports", "Backups", "Logo import"] },
  { name: "Enterprise", price: "Custom", label: "For larger teams", features: ["Users by contract", "Enterprise session policy", "Audit logs", "Priority support", "Dedicated restore help", "Custom rollout"] }
];

const faqs = [
  ["What is included in Free?", "Free includes 50 slips per month, 1 user, 1 active login session, 2 companies, 10 products, 2 custom templates, and browser printing."],
  ["Can I create my own template?", "Yes. The builder supports bordered slip layouts with fields, QR, barcode, logo, live print preview, and page-fit controls."],
  ["What does Pro unlock?", "Pro unlocks bulk CSV generation, presets, reports, backups, logo import, 5 users, and 3 active sessions."],
  ["What is different in Enterprise?", "Enterprise is for larger teams that need contract-based users, audit logs, priority support, and stricter operational controls."]
];

const footerGroups = [
  {
    title: "Product",
    href: "/product",
    links: [
      ["Features", "/features"],
      ["Templates", "/templates-info"],
      ["Pricing", "/pricing"]
    ]
  },
  {
    title: "Resources",
    href: "/resources",
    links: [
      ["Documentation", "/documentation"],
      ["API Reference", "/api-reference"],
      ["Support", "/support"]
    ]
  },
  {
    title: "Company",
    href: "/company",
    links: [
      ["About", "/about"],
      ["Careers", "/careers"],
      ["Privacy", "/privacy"]
    ]
  }
];

function ProductPreview() {
  return (
    <div className="mx-auto w-full max-w-[1040px] rounded-xl border border-slate-900/10 bg-white p-3 shadow-[0_24px_80px_rgba(15,23,42,0.16)] dark:border-white/10 dark:bg-[#14171f]">
      <div className="flex items-center gap-1.5 border-b border-slate-900/10 pb-3 dark:border-white/10">
        <span className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-white/30" />
        <span className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-white/30" />
        <span className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-white/30" />
        <span className="ml-3 text-xs font-semibold text-muted-foreground">Slipora workspace</span>
      </div>
      <div className="grid gap-3 p-3 md:grid-cols-[0.9fr_1.4fr]">
        <div className="rounded-lg border border-slate-900/10 bg-[#f7f9fc] p-4 dark:border-white/10 dark:bg-[#0b0e14]">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0051d5]">Builder</div>
              <div className="mt-1 text-xl font-black tracking-tight">Small thermal</div>
            </div>
            <PackageCheck className="h-7 w-7 text-[#0051d5]" />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2">
            {["Product", "Quantity", "Barcode", "QR Code", "Customer", "Date"].map((item) => (
              <div key={item} className="rounded-md border border-slate-900/10 bg-white px-3 py-2 text-sm font-semibold dark:border-white/10 dark:bg-[#14171f]">
                + {item}
              </div>
            ))}
          </div>
          <div className="mt-4 overflow-hidden rounded-md border border-slate-900/10 dark:border-white/10">
            <img src="/landing-hero.png" alt="Slipora dashboard preview" className="h-28 w-full object-cover object-top opacity-90" />
          </div>
        </div>
        <div className="rounded-lg border border-slate-900/10 bg-[linear-gradient(rgba(15,23,42,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.06)_1px,transparent_1px)] bg-[size:18px_18px] p-6 dark:border-white/10 dark:bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)]">
          <div className="mx-auto max-w-[520px] border-2 border-slate-950 bg-white font-mono text-slate-950 shadow-xl">
            <div className="border-b-2 border-slate-950 px-4 py-3 text-center text-2xl font-black">Packing Slip</div>
            {[
              ["COMPANY", "{Company name}"],
              ["PART", "{Part name}"],
              ["QTY", "{Quantity}"],
              ["CUSTOMER", "{Customer}"]
            ].map(([label, value]) => (
              <div key={label} className="grid grid-cols-[130px_1fr] border-b-2 border-slate-950 last:border-b-0">
                <div className="border-r-2 border-slate-950 px-3 py-3 text-sm font-black">{label}</div>
                <div className="px-3 py-3 text-sm font-bold">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TemplateMock({ bars }: { bars: string[] }) {
  return (
    <div className="space-y-3 rounded-lg border border-slate-900/10 bg-white p-4 dark:border-white/10 dark:bg-[#14171f]">
      {bars.map((bar, index) => (
        <div key={index} className={cn("h-3 rounded bg-slate-200 dark:bg-white/10", bar)} />
      ))}
      <div className="grid grid-cols-[0.7fr_1.3fr] overflow-hidden rounded border border-slate-900/15 dark:border-white/10">
        <div className="border-r border-slate-900/15 bg-slate-100 p-3 dark:border-white/10 dark:bg-white/5" />
        <div className="bg-white p-3 dark:bg-[#10141c]" />
      </div>
    </div>
  );
}

export function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(-1);
  const { darkMode, toggleDarkMode } = useUiStore();
  const nav = [
    ["Features", "#features"],
    ["Templates", "#templates"],
    ["Pricing", "#pricing"],
    ["FAQ", "#faq"]
  ];

  return (
    <main className="min-h-screen bg-[#f7f9fc] text-[#191c1e] dark:bg-[#0b0e14] dark:text-[#eff1f4]">
      <header className="sticky top-0 z-50 border-b border-slate-900/10 bg-white/86 backdrop-blur-xl dark:border-white/10 dark:bg-[#0b0e14]/92">
        <div className="mx-auto flex h-14 max-w-[1280px] items-center gap-4 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 text-sm font-black tracking-tight">
            Slipora
            <span className="hidden rounded bg-[#e6eefc] px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#0051d5] dark:bg-[#102344] dark:text-[#83b2ff] sm:inline">Slip Ops</span>
          </Link>
          <nav className="ml-auto hidden items-center gap-5 text-xs font-semibold md:flex">
            {nav.map(([label, href]) => (
              <a key={href} href={href} className="text-muted-foreground transition hover:text-foreground">
                {label}
              </a>
            ))}
            <Button variant="ghost" size="icon" onClick={toggleDarkMode} aria-label="Toggle dark mode">
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild size="sm" className="bg-[#0051d5] text-white hover:bg-[#003ea8]">
              <Link to="/register">Start free</Link>
            </Button>
          </nav>
          <Button className="ml-auto md:hidden" variant="ghost" size="icon" onClick={() => setMobileOpen((value) => !value)} aria-label="Open menu">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
        {mobileOpen ? (
          <div className="border-t border-slate-900/10 bg-white px-4 py-4 dark:border-white/10 dark:bg-[#0b0e14] md:hidden">
            <div className="grid gap-3 text-sm font-semibold">
              {nav.map(([label, href]) => (
                <a key={href} href={href} onClick={() => setMobileOpen(false)}>
                  {label}
                </a>
              ))}
              <Link to="/login">Login</Link>
              <Link to="/register">Start free</Link>
            </div>
          </div>
        ) : null}
      </header>

      <section className="border-b border-slate-900/10 bg-[linear-gradient(rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.04)_1px,transparent_1px)] bg-[size:32px_32px] dark:border-white/10 dark:bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)]">
        <div className="mx-auto max-w-[1280px] px-4 py-16 text-center sm:px-6 sm:py-20">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white px-3 py-1 text-xs font-semibold text-muted-foreground dark:border-white/10 dark:bg-[#14171f]">
              <FileCheck2 className="h-3.5 w-3.5 text-[#0051d5]" />
              Built for packing slip teams, not generic documents
            </div>
            <h1 className="mx-auto mt-6 max-w-4xl text-5xl font-black leading-[1.02] tracking-tight sm:text-6xl">
              Design, validate, and print packing slips from one workspace.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
              Slipora keeps products, customers, templates, print previews, and plan controls in one clean workflow so daily slip generation feels predictable.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Button asChild className="bg-[#0051d5] text-white hover:bg-[#003ea8]">
                <Link to="/register">Start free</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/login">Open workspace</Link>
              </Button>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, duration: 0.45 }} className="mt-14">
            <ProductPreview />
          </motion.div>
        </div>
      </section>

      <section className="border-b bg-white py-8 dark:border-white/10 dark:bg-[#10141c]">
        <div className="mx-auto grid max-w-[980px] gap-4 px-4 text-center sm:px-6 md:grid-cols-3">
          {["Default templates stay available", "User templates stay account-scoped", "Dark mode persists across pages"].map((item) => (
            <div key={item} className="text-sm font-semibold text-muted-foreground">
              {item}
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-black tracking-tight">Operational tools that already exist in the app</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            No imaginary integrations here. These are the core pieces your dashboard, builder, and plan gates support today.
          </p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="rounded-lg border border-slate-900/10 bg-white p-6 shadow-[0_18px_48px_rgba(15,23,42,0.07)] dark:border-white/10 dark:bg-[#14171f]">
              <feature.icon className="h-6 w-6 text-[#0051d5]" />
              <h3 className="mt-5 font-bold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{feature.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="templates" className="border-y bg-white py-16 dark:border-white/10 dark:bg-[#10141c]">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-3xl font-black tracking-tight">Templates for the slip sizes you print</h2>
              <p className="mt-3 text-sm text-muted-foreground">Default small and medium templates are included, then each account can create its own custom layouts.</p>
            </div>
            <Button asChild variant="outline">
              <Link to="/templates-info">View templates</Link>
            </Button>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {templates.map((template) => (
              <div key={template.title} className="overflow-hidden rounded-lg border border-slate-900/10 bg-[#f7f9fc] dark:border-white/10 dark:bg-[#0b0e14]">
                <TemplateMock bars={template.bars} />
                <div className="border-t border-slate-900/10 p-4 dark:border-white/10">
                  <div className="text-sm font-bold">{template.title}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{template.meta}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[980px] px-4 py-16 text-center sm:px-6">
        <h2 className="text-3xl font-black tracking-tight">From data to printed page</h2>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {[
            ["Add records", "Create companies, customers, products, and reusable template presets."],
            ["Build the layout", "Place fields into a bordered slip and check the live print preview."],
            ["Generate slips", "Create one slip or a Pro CSV batch, then print from the browser."]
          ].map(([step, body], index) => (
            <div key={step}>
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-lg border border-slate-900/10 bg-white font-black dark:border-white/10 dark:bg-[#14171f]">{index + 1}</div>
              <h3 className="mt-5 font-bold">{step}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="border-y bg-white py-16 dark:border-white/10 dark:bg-[#10141c]">
        <div className="mx-auto max-w-[1080px] px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-3xl font-black tracking-tight">Pricing that matches the dashboard limits</h2>
            <p className="mt-3 text-sm text-muted-foreground">The same Free, Pro, and Enterprise gates are enforced in the app and API.</p>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <div key={plan.name} className={cn("relative rounded-lg border border-slate-900/10 bg-white p-6 dark:border-white/10 dark:bg-[#14171f]", plan.featured && "border-[#0051d5] shadow-[0_0_0_2px_rgba(0,81,213,0.18)]")}>
                {plan.featured ? <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded bg-[#0051d5] px-3 py-1 text-[10px] font-black uppercase text-white">{plan.label}</div> : null}
                <h3 className="text-lg font-bold">{plan.name}</h3>
                <div className="mt-1 text-sm text-muted-foreground">{plan.price}</div>
                <div className="mt-5 space-y-2">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-[#0051d5]" /> {feature}
                    </div>
                  ))}
                </div>
                <Button asChild className="mt-6 w-full" variant={plan.featured ? "default" : "outline"}>
                  <Link to={plan.name === "Enterprise" ? "/pricing" : "/register"}>{plan.name === "Enterprise" ? "Contact sales" : "Get started"}</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-[780px] px-4 py-16 sm:px-6">
        <h2 className="text-center text-3xl font-black tracking-tight">Frequently asked questions</h2>
        <div className="mt-8 space-y-3">
          {faqs.map(([question, answer], index) => {
            const isOpen = openFaq === index;
            return (
              <div key={question} className="rounded-lg border border-slate-900/10 bg-white dark:border-white/10 dark:bg-[#14171f]">
                <button type="button" className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left text-sm font-bold" onClick={() => setOpenFaq(isOpen ? -1 : index)}>
                  {question}
                  <ChevronDown className={cn("h-4 w-4 shrink-0 transition", isOpen && "rotate-180")} />
                </button>
                {isOpen ? <p className="border-t border-slate-900/10 px-4 py-4 text-sm leading-6 text-muted-foreground dark:border-white/10">{answer}</p> : null}
              </div>
            );
          })}
        </div>
      </section>

      <footer className="border-t bg-[#f2f4f7] dark:border-white/10 dark:bg-[#0b0e14]">
        <div className="mx-auto grid max-w-[1280px] gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link to="/" className="font-black">Slipora</Link>
            <p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">Packing slip generation, templates, printing, and workspace controls for operations teams.</p>
          </div>
          {footerGroups.map((group) => (
            <div key={group.title}>
              <Link to={group.href} className="text-[10px] font-black uppercase tracking-[0.16em] text-foreground">{group.title}</Link>
              <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
                {group.links.map(([label, href]) => (
                  <Link key={href} to={href} className="transition hover:text-foreground">
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-900/10 py-4 text-center text-xs text-muted-foreground dark:border-white/10">Copyright 2026 Slipora. All rights reserved.</div>
      </footer>
    </main>
  );
}
