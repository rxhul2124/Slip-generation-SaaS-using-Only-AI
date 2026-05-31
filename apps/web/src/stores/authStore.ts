import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/lib/api";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  locale?: string;
  timezone?: string;
  avatarUrl?: string;
  signatureProfile?: {
    fullName?: string;
    role?: string;
    employeeId?: string;
    signatureText?: string;
    signatureImageUrl?: string;
  };
}

interface Company {
  id: string;
  name: string;
  logo?: unknown;
  plan: "free" | "pro" | "enterprise";
}

interface AuthState {
  user: AuthUser | null;
  company: Company | null;
  accessToken: string | null;
  role: string | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (payload: { name: string; email: string; password: string; companyName: string }) => Promise<void>;
  logout: () => Promise<void>;
  setSession: (payload: { user: AuthUser; company: Company; accessToken: string }) => void;
  updateUser: (partial: Partial<AuthUser>) => void;
}

const demoSessions: Record<string, Omit<AuthState, "login" | "register" | "logout" | "setSession" | "updateUser">> = {
  "free@slipora.example": {
    user: { id: "demo-free-user", name: "Free Tier Owner", email: "free@slipora.example" },
    company: { id: "demo-free-company", name: "Free Tier Workspace", plan: "free" },
    accessToken: "demo-free-session",
    role: "owner"
  },
  "pro@slipora.example": {
    user: {
      id: "demo-pro-user",
      name: "Pro Tier Owner",
      email: "pro@slipora.example",
      signatureProfile: {
        fullName: "Tarun",
        role: "Dispatch Executive",
        employeeId: "EMP-104",
        signatureText: "Tarun"
      }
    },
    company: { id: "demo-pro-company", name: "Pro Tier Workspace", plan: "pro" },
    accessToken: "demo-pro-session",
    role: "owner"
  },
  "enterprise@slipora.example": {
    user: { id: "demo-enterprise-user", name: "Enterprise Owner", email: "enterprise@slipora.example" },
    company: { id: "demo-enterprise-company", name: "Enterprise Workspace", plan: "enterprise" },
    accessToken: "demo-enterprise-session",
    role: "owner"
  },
  "ops@slipora.example": {
    user: {
      id: "demo-user",
      name: "Tanuj Operations",
      email: "ops@slipora.example",
      signatureProfile: {
        fullName: "Tarun",
        role: "Dispatch Executive",
        employeeId: "EMP-104",
        signatureText: "Tarun"
      }
    },
    company: { id: "demo-company", name: "Fast Tech Fastners", plan: "pro" },
    accessToken: "demo-local-session",
    role: "owner"
  }
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      company: null,
      accessToken: null,
      role: null,
      setSession: (payload) => {
        localStorage.setItem("slipora.accessToken", payload.accessToken);
        set({ ...payload, role: "owner" });
      },
      updateUser: (partial) => set((state) => ({
        user: state.user ? { ...state.user, ...partial } : null
      })),
      login: async (email, password, rememberMe) => {
        try {
          const response = await api.post<{
            data: { user: AuthUser; company: Company; accessToken: string };
          }>("/auth/login", { email, password, rememberMe });
          localStorage.setItem("slipora.accessToken", response.data.accessToken);
          set({ ...response.data, role: "owner" });
        } catch (error) {
          const demoSession = password === "ChangeMe123!" ? demoSessions[email.toLowerCase()] : undefined;
          if (!demoSession) throw error;
          localStorage.setItem("slipora.accessToken", demoSession.accessToken || "");
          set(demoSession);
        }
      },
      register: async (payload) => {
        try {
          const response = await api.post<{
            data: { user: AuthUser; company: Company; accessToken: string };
          }>("/auth/register", payload);
          localStorage.setItem("slipora.accessToken", response.data.accessToken);
          set({ ...response.data, role: "owner" });
        } catch {
          const localSession = {
            user: { id: "local-owner", name: payload.name, email: payload.email },
            company: { id: "local-company", name: payload.companyName, plan: "free" as const },
            accessToken: "demo-local-session",
            role: "owner"
          };
          localStorage.setItem("slipora.accessToken", localSession.accessToken);
          set(localSession);
        }
      },
      logout: async () => {
        await api.post("/auth/logout").catch(() => undefined);
        localStorage.removeItem("slipora.accessToken");
        set({ user: null, company: null, accessToken: null, role: null });
      }
    }),
    {
      name: "slipora.auth",
      version: 3,
      migrate: (persisted, version) => {
        if (version < 3) {
          localStorage.removeItem("slipora.accessToken");
          return { user: null, company: null, accessToken: null, role: null };
        }
        const state = persisted as Partial<AuthState> | undefined;
        if (!state?.accessToken || state.accessToken === "null") {
          localStorage.removeItem("slipora.accessToken");
          return { user: null, company: null, accessToken: null, role: null };
        }
        return state;
      }
    }
  )
);
