import type { ApiItem, ApiList, AuditLog, Backup, BillingSubscription, Preset, PrintJob, SearchResults } from "./types";

const API_URL = import.meta.env.VITE_API_URL || "/api/v1";
let csrfToken: string | null = null;

type RequestOptions = RequestInit & { companyId?: string };

async function ensureCsrfToken(headers: Headers) {
  const hasBearer = headers.get("Authorization")?.startsWith("Bearer ");
  if (hasBearer || csrfToken) return;

  const response = await fetch(`${API_URL}/auth/csrf-token`, { credentials: "include" });
  if (response.ok) {
    const body = (await response.json()) as { data?: { csrfToken?: string } };
    csrfToken = body.data?.csrfToken || null;
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = localStorage.getItem("packslip.accessToken");
  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (options.companyId) headers.set("x-company-id", options.companyId);
  if (["POST", "PUT", "PATCH", "DELETE"].includes(options.method || "GET")) {
    await ensureCsrfToken(headers);
    if (csrfToken && !headers.has("Authorization")) headers.set("x-csrf-token", csrfToken);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include"
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || "PackSlip request failed");
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) => request<T>(path, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "POST", body: body instanceof FormData ? body : JSON.stringify(body || {}) }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PATCH", body: JSON.stringify(body || {}) }),
  delete: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: "DELETE" })
};

export const resources = {
  products: {
    list: () => api.get<ApiList<import("./types").Product>>("/products"),
    create: (body: unknown) => api.post<ApiItem<import("./types").Product>>("/products", body)
  },
  customers: {
    list: () => api.get<ApiList<import("./types").Customer>>("/customers"),
    create: (body: unknown) => api.post<ApiItem<import("./types").Customer>>("/customers", body),
    update: (id: string, body: unknown) => api.patch<ApiItem<import("./types").Customer>>(`/customers/${id}`, body),
    delete: (id: string) => api.delete<void>(`/customers/${id}`)
  },
  templates: {
    list: () => api.get<ApiList<import("./types").SlipTemplate>>("/templates"),
    create: (body: unknown) => api.post<ApiItem<import("./types").SlipTemplate>>("/templates", body)
  },
  presets: {
    list: () => api.get<ApiList<Preset>>("/presets"),
    create: (body: unknown) => api.post<ApiItem<Preset>>("/presets", body)
  },
  slips: {
    list: () => api.get<ApiList<import("./types").GeneratedSlip>>("/slips"),
    create: (body: unknown) => api.post<ApiItem<import("./types").GeneratedSlip>>("/slips", body),
    print: (id: string) => api.post<ApiItem<import("./types").GeneratedSlip>>(`/slips/${id}/print`),
    export: (id: string) => api.post<ApiItem<import("./types").GeneratedSlip>>(`/slips/${id}/export`),
    printJobs: () => api.get<ApiItem<PrintJob[]> | ApiList<PrintJob>>("/slips/print-jobs"),
    queuePrint: (body: unknown) => api.post<ApiItem<PrintJob>>("/slips/print-jobs", body)
  },
  search: {
    global: (query: string) => api.get<ApiItem<SearchResults>>(`/search?q=${encodeURIComponent(query)}`)
  },
  audit: {
    list: () => api.get<ApiList<AuditLog>>("/audit-logs")
  },
  backups: {
    list: () => api.get<ApiList<Backup>>("/backups"),
    exportWorkspace: () => api.post<ApiItem<Backup>>("/backups/export")
  },
  billing: {
    get: () =>
      api.get<
        ApiItem<{
          billing: BillingSubscription | null;
          plans: Record<string, { name: string; monthlySlipLimit: number | string | null; price: number | null; features: string[] }>;
        }>
      >("/billing")
  }
};
