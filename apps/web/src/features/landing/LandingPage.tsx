import { motion } from "framer-motion";
import {
  BarChart3,
  Check,
  ChevronRight,
  Menu,
  Moon,
  PackageCheck,
  Printer,
  QrCode,
  Smartphone,
  Sparkles,
  Sun,
  X
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const features = [
  { title: "Easy Slip Creation", body: "Company, product, quantity, print.", icon: PackageCheck },
  { title: "Thermal Printing", body: "Compact layouts for shop floors.", icon: Printer },
  { title: "Company-Wise Products", body: "Each company keeps its own parts.", icon: Check },
  { title: "QR & Barcode Support", body: "Codes stay with every product.", icon: QrCode },
  { title: "Bulk Printing", body: "Print many slips on A4 sheets.", icon: Sparkles },
  { title: "Reports", body: "Track slips, prints, and activity.", icon: BarChart3 },
  { title: "Mobile Friendly", body: "Works well on phones and tablets.", icon: Smartphone },
  { title: "Dark Mode", body: "Comfortable in every shift.", icon: Moon }
];

const plans = [
  { name: "Free", price: "$0", features: ["50 slips / month", "Small template", "PDF download"] },
  { name: "Pro", price: "$19", features: ["Unlimited slips", "Small + medium templates", "Reports and bulk print"], featured: true },
  { name: "Enterprise", price: "Custom", features: ["Team controls", "Priority support", "Factory rollout help"] }
];

const faqs = [
  ["Does it support thermal printers?", "Yes. The built-in templates are print-friendly and compact."],
  ["Can I use it on mobile?", "Yes. The main workflow is responsive for phones, tablets, and desktops."],
  ["Can I export PDFs?", "Yes. Slips can be prepared for PDF download and printing."],
  ["Does dark mode work?", "Yes. The app and landing page include dark mode."],
  ["Can I print multiple slips at once?", "Yes. A4 layouts can hold multiple bordered slips."]
];

function MiniSlip() {
  return (
    <div className="mx-auto w-[220px] border-2 border-black bg-white font-mono text-black shadow-2xl">
      {["Packing Slip", "FAST TECH FASTNERS", "DATE : 16-05-2026", "PART NAME : ADAPTER RH 14 HEX", "PART NO. : S-09B-02020", "QTY : 300 NOS (5.400 KG)", "SANDHAR HARIDWAR"].map((row) => (
        <div key={row} className="border-b-2 border-black px-2 py-1 text-center text-[11px] font-black last:border-b-0">
          {row}
        </div>
      ))}
    </div>
  );
}

export function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const nav = [
    ["Features", "#features"],
    ["Pricing", "#pricing"],
    ["FAQ", "#faq"]
  ];

  return (
    <main className={cn("min-h-screen scroll-smooth bg-[#f4fbfc] text-slate-950", dark && "dark bg-[#061316] text-white")}>
      <header className="sticky top-0 z-50 border-b border-white/20 bg-white/72 backdrop-blur-xl dark:bg-slate-950/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 font-black">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-cyan-600 text-white">
              <PackageCheck className="h-5 w-5" />
            </span>
            PackSlip
          </Link>
          <nav className="ml-auto hidden items-center gap-6 text-sm font-semibold md:flex">
            {nav.map(([label, href]) => (
              <a key={href} href={href} className="text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">
                {label}
              </a>
            ))}
            <Link to="/login">Login</Link>
            <Button asChild>
              <Link to="/register">Signup</Link>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setDark((value) => !value)} aria-label="Toggle dark mode">
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </nav>
          <Button className="ml-auto md:hidden" variant="ghost" size="icon" onClick={() => setMobileOpen((value) => !value)} aria-label="Open menu">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
        {mobileOpen ? (
          <div className="border-t bg-white/92 px-4 py-4 dark:bg-slate-950/92 md:hidden">
            <div className="grid gap-3 text-sm font-semibold">
              {nav.map(([label, href]) => (
                <a key={href} href={href} onClick={() => setMobileOpen(false)}>
                  {label}
                </a>
              ))}
              <Link to="/login">Login</Link>
              <Link to="/register">Signup</Link>
            </div>
          </div>
        ) : null}
      </header>

      <section className="relative min-h-[82vh] overflow-hidden">
        <img src="/landing-hero.png" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-cyan-950/54 dark:bg-slate-950/66" />
        <div className="relative mx-auto grid min-h-[82vh] max-w-7xl content-center gap-8 px-4 pb-16 pt-20 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }} className="max-w-3xl text-white">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/12 px-3 py-1 text-sm font-semibold backdrop-blur">
              <Sparkles className="h-4 w-4" /> Built for factory teams
            </div>
            <h1 className="text-5xl font-black leading-tight sm:text-6xl lg:text-7xl">Create Packing Slips in Seconds</h1>
            <p className="mt-5 max-w-2xl text-lg text-cyan-50 sm:text-xl">
              A simple, modern slip printing app for companies, products, barcodes, QR codes, PDF downloads, and thermal-friendly layouts.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="default" className="bg-white text-cyan-950 hover:bg-cyan-50">
                <Link to="/register">
                  Get Started <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-white/45 bg-white/10 text-white hover:bg-white/20">
                <Link to="/login">View Demo</Link>
              </Button>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18, duration: 0.55 }} className="grid gap-4 lg:grid-cols-[1fr_280px]">
            <div className="rounded-lg border border-white/25 bg-white/16 p-3 shadow-2xl backdrop-blur-xl">
              <div className="grid gap-3 rounded-md bg-slate-950/72 p-4 text-white sm:grid-cols-3">
                <div className="rounded-md bg-cyan-400/15 p-4">
                  <div className="text-xs text-cyan-100">Companies</div>
                  <div className="mt-2 text-2xl font-black">42</div>
                </div>
                <div className="rounded-md bg-emerald-400/15 p-4">
                  <div className="text-xs text-emerald-100">Slips Today</div>
                  <div className="mt-2 text-2xl font-black">318</div>
                </div>
                <div className="rounded-md bg-white/10 p-4">
                  <div className="text-xs text-cyan-100">Print Time</div>
                  <div className="mt-2 text-2xl font-black">12 sec</div>
                </div>
              </div>
            </div>
            <MiniSlip />
          </motion.div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-black sm:text-4xl">Everything needed for fast packing work</h2>
          <p className="mt-3 text-slate-600 dark:text-slate-300">Simple words, clear screens, and fewer clicks for non-technical teams.</p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <motion.div key={feature.title} whileHover={{ y: -4 }} className="rounded-lg border bg-white/72 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/8">
              <feature.icon className="h-6 w-6 text-cyan-600 dark:text-cyan-300" />
              <h3 className="mt-4 font-black">{feature.title}</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{feature.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-white/70 py-20 dark:bg-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-3xl font-black sm:text-4xl">Product Showcase</h2>
          <div className="mt-10 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-lg border bg-slate-950 p-5 text-white shadow-panel">
              <div className="grid gap-3 sm:grid-cols-3">
                {["Dashboard", "Slip Preview", "Mobile View"].map((label) => (
                  <div key={label} className="rounded-md border border-white/10 bg-white/8 p-4">
                    <div className="text-sm font-bold">{label}</div>
                    <div className="mt-4 h-20 rounded bg-cyan-300/20" />
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-md border border-white/10 bg-white/8 p-4">
                <div className="text-sm font-bold">Drag-and-drop slip design</div>
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <span key={index} className="h-8 rounded bg-white/12" />
                  ))}
                </div>
              </div>
            </div>
            <div className="grid place-items-center rounded-lg border bg-cyan-50 p-8 dark:border-white/10 dark:bg-cyan-950/20">
              <MiniSlip />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <h2 className="text-3xl font-black sm:text-4xl">How It Works</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {["Add Products", "Create Slips", "Print Instantly"].map((step, index) => (
            <div key={step} className="rounded-lg border bg-white/70 p-6 dark:border-white/10 dark:bg-white/8">
              <div className="grid h-10 w-10 place-items-center rounded-md bg-cyan-600 font-black text-white">{index + 1}</div>
              <h3 className="mt-5 text-xl font-black">{step}</h3>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-cyan-950 py-20 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-black sm:text-4xl">Saves time on every dispatch</h2>
            <p className="mt-4 text-cyan-100">Faster packing, better organization, easy printing, mobile access, and a modern interface that workers can learn quickly.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {["Saves Time", "Faster Packing", "Better Organization", "Easy Printing", "Works on Mobile", "Modern Interface"].map((benefit) => (
              <div key={benefit} className="rounded-md border border-white/10 bg-white/8 p-4 font-semibold">
                <Check className="mb-2 h-4 w-4 text-emerald-300" /> {benefit}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <h2 className="text-3xl font-black sm:text-4xl">Trusted by busy teams</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {["PackSlip reduced our packing time by 70%.", "Our staff learned it in one shift.", "The company-wise products removed daily mistakes."].map((quote, index) => (
            <div key={quote} className="rounded-lg border bg-white/70 p-6 shadow-sm dark:border-white/10 dark:bg-white/8">
              <p className="text-lg font-semibold">"{quote}"</p>
              <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">Factory Operations {index + 1}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="bg-white/70 py-20 dark:bg-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-3xl font-black sm:text-4xl">Pricing</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {plans.map((plan) => (
              <div key={plan.name} className={cn("rounded-lg border bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/8", plan.featured && "border-cyan-500 shadow-panel")}>
                <h3 className="text-xl font-black">{plan.name}</h3>
                <div className="mt-4 text-4xl font-black">{plan.price}<span className="text-sm font-semibold text-slate-500"> / month</span></div>
                <div className="mt-5 space-y-2 text-sm">
                  {plan.features.map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-cyan-600" /> {item}
                    </div>
                  ))}
                </div>
                <Button asChild className="mt-6 w-full" variant={plan.featured ? "default" : "outline"}>
                  <Link to="/register">Start Free</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
        <h2 className="text-3xl font-black sm:text-4xl">FAQ</h2>
        <div className="mt-8 divide-y rounded-lg border bg-white/70 dark:border-white/10 dark:bg-white/8">
          {faqs.map(([question, answer]) => (
            <div key={question} className="p-5">
              <h3 className="font-black">{question}</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{answer}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t bg-slate-950 py-10 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 sm:px-6 md:flex-row md:items-center">
          <div className="flex items-center gap-2 font-black">
            <PackageCheck className="h-5 w-5 text-cyan-300" /> PackSlip
          </div>
          <div className="text-sm text-slate-300 md:ml-auto">Create slips faster. Print with confidence.</div>
        </div>
      </footer>
    </main>
  );
}
