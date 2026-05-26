import { lazy, Suspense, useEffect, type ReactNode } from "react";
import { Navigate, RouterProvider, createBrowserRouter } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { useUiStore } from "@/stores/uiStore";

const ActivityPage = lazy(() => import("@/features/activity/ActivityPage").then((module) => ({ default: module.ActivityPage })));
const AnalyticsPage = lazy(() => import("@/features/analytics/AnalyticsPage").then((module) => ({ default: module.AnalyticsPage })));
const AuditLogsPage = lazy(() => import("@/features/audit/AuditLogsPage").then((module) => ({ default: module.AuditLogsPage })));
const BackupsPage = lazy(() => import("@/features/backups/BackupsPage").then((module) => ({ default: module.BackupsPage })));
const BillingPage = lazy(() => import("@/features/billing/BillingPage").then((module) => ({ default: module.BillingPage })));
const BulkGenerationPage = lazy(() => import("@/features/bulk/BulkGenerationPage").then((module) => ({ default: module.BulkGenerationPage })));
const CustomersPage = lazy(() => import("@/features/customers/CustomersPage").then((module) => ({ default: module.CustomersPage })));
const ForgotPasswordPage = lazy(() => import("@/features/auth/ForgotPasswordPage").then((module) => ({ default: module.ForgotPasswordPage })));
const GenerateSlipPage = lazy(() => import("@/features/slips/GenerateSlipPage").then((module) => ({ default: module.GenerateSlipPage })));
const LandingPage = lazy(() => import("@/features/landing/LandingPage").then((module) => ({ default: module.LandingPage })));
const LoginPage = lazy(() => import("@/features/auth/LoginPage").then((module) => ({ default: module.LoginPage })));
const MarketingPage = lazy(() => import("@/features/landing/MarketingPage").then((module) => ({ default: module.MarketingPage })));
const OnboardingPage = lazy(() => import("@/features/onboarding/OnboardingPage").then((module) => ({ default: module.OnboardingPage })));
const OverviewPage = lazy(() => import("@/features/dashboard/OverviewPage").then((module) => ({ default: module.OverviewPage })));
const PresetsPage = lazy(() => import("@/features/presets/PresetsPage").then((module) => ({ default: module.PresetsPage })));
const PrintQueuePage = lazy(() => import("@/features/print/PrintQueuePage").then((module) => ({ default: module.PrintQueuePage })));
const RegisterPage = lazy(() => import("@/features/auth/RegisterPage").then((module) => ({ default: module.RegisterPage })));
const SearchPage = lazy(() => import("@/features/search/SearchPage").then((module) => ({ default: module.SearchPage })));
const SettingsPage = lazy(() => import("@/features/settings/SettingsPage").then((module) => ({ default: module.SettingsPage })));
const SlipHistoryPage = lazy(() => import("@/features/slips/SlipHistoryPage").then((module) => ({ default: module.SlipHistoryPage })));
const TeamPage = lazy(() => import("@/features/team/TeamPage").then((module) => ({ default: module.TeamPage })));
const TemplateBuilderPage = lazy(() => import("@/features/templates/TemplateBuilderPage").then((module) => ({ default: module.TemplateBuilderPage })));
const TemplatesPage = lazy(() => import("@/features/templates/TemplatesPage").then((module) => ({ default: module.TemplatesPage })));

function screen(page: ReactNode) {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-[50vh] place-items-center">
          <div className="rounded-lg border bg-card/80 px-4 py-3 text-sm font-semibold shadow-sm">Loading PackSlip module...</div>
        </div>
      }
    >
      {page}
    </Suspense>
  );
}

const router = createBrowserRouter([
  { path: "/", element: screen(<LandingPage />) },
  { path: "/login", element: screen(<LoginPage />) },
  { path: "/register", element: screen(<RegisterPage />) },
  { path: "/forgot-password", element: screen(<ForgotPasswordPage />) },
  { path: "/product", element: screen(<MarketingPage page="product" />) },
  { path: "/features", element: screen(<MarketingPage page="features" />) },
  { path: "/templates-info", element: screen(<MarketingPage page="templates" />) },
  { path: "/pricing", element: screen(<MarketingPage page="pricing" />) },
  { path: "/resources", element: screen(<MarketingPage page="resources" />) },
  { path: "/documentation", element: screen(<MarketingPage page="documentation" />) },
  { path: "/api-reference", element: screen(<MarketingPage page="apiReference" />) },
  { path: "/support", element: screen(<MarketingPage page="support" />) },
  { path: "/company", element: screen(<MarketingPage page="company" />) },
  { path: "/about", element: screen(<MarketingPage page="about" />) },
  { path: "/careers", element: screen(<MarketingPage page="careers" />) },
  { path: "/privacy", element: screen(<MarketingPage page="privacy" />) },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: "/app", element: screen(<OverviewPage />) },
          { path: "/onboarding", element: screen(<OnboardingPage />) },
          { path: "/products", element: <Navigate to="/customers" replace /> },
          { path: "/customers", element: screen(<CustomersPage />) },
          { path: "/templates", element: screen(<TemplatesPage />) },
          { path: "/templates/builder", element: screen(<TemplateBuilderPage />) },
          { path: "/presets", element: screen(<PresetsPage />) },
          { path: "/generate", element: screen(<GenerateSlipPage />) },
          { path: "/bulk", element: screen(<BulkGenerationPage />) },
          { path: "/history", element: screen(<SlipHistoryPage />) },
          { path: "/analytics", element: screen(<AnalyticsPage />) },
          { path: "/audit-logs", element: screen(<AuditLogsPage />) },
          { path: "/team", element: screen(<TeamPage />) },
          { path: "/billing", element: screen(<BillingPage />) },
          { path: "/settings", element: screen(<SettingsPage />) },
          { path: "/search", element: screen(<SearchPage />) },
          { path: "/print-queue", element: screen(<PrintQueuePage />) },
          { path: "/backups", element: screen(<BackupsPage />) },
          { path: "/activity", element: screen(<ActivityPage />) }
        ]
      }
    ]
  }
]);

export function App() {
  const darkMode = useUiStore((state) => state.darkMode);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return <RouterProvider router={router} />;
}
