import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/lib/api";

interface AuthUser {
  id: string;
  name: string;
  email: string;
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
}

const demoSession = {
  user: {
    id: "demo-user",
    name: "Tanuj Operations",
    email: "ops@packslip.example",
    signatureProfile: {
      fullName: "Tarun",
      role: "Dispatch Executive",
      employeeId: "EMP-104",
      signatureText: "Tarun"
    }
  },
  company: {
    id: "demo-company",
    name: "Fast Tech Fastners",
    plan: "pro" as const
  },
  accessToken: "demo-local-session",
  role: "owner"
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      company: null,
      accessToken: null,
      role: null,
      setSession: (payload) => {
        localStorage.setItem("packslip.accessToken", payload.accessToken);
        set({ ...payload, role: "owner" });
      },
      login: async (email, password, rememberMe) => {
        try {
          const response = await api.post<{
            data: { user: AuthUser; company: Company; accessToken: string };
          }>("/auth/login", { email, password, rememberMe });
          localStorage.setItem("packslip.accessToken", response.data.accessToken);
          set({ ...response.data, role: "owner" });
        } catch (error) {
          const isSeededDemo = email === "ops@packslip.example" && password === "ChangeMe123!";
          if (!isSeededDemo) throw error;
          localStorage.setItem("packslip.accessToken", demoSession.accessToken);
          set(demoSession);
        }
      },
      register: async (payload) => {
        try {
          const response = await api.post<{
            data: { user: AuthUser; company: Company; accessToken: string };
          }>("/auth/register", payload);
          localStorage.setItem("packslip.accessToken", response.data.accessToken);
          set({ ...response.data, role: "owner" });
        } catch {
          const localSession = {
            user: { id: "local-owner", name: payload.name, email: payload.email },
            company: { id: "local-company", name: payload.companyName, plan: "free" as const },
            accessToken: "demo-local-session",
            role: "owner"
          };
          localStorage.setItem("packslip.accessToken", localSession.accessToken);
          set(localSession);
        }
      },
      logout: async () => {
        await api.post("/auth/logout").catch(() => undefined);
        localStorage.removeItem("packslip.accessToken");
        set({ user: null, company: null, accessToken: null, role: null });
      }
    }),
    {
      name: "packslip.auth",
      version: 3,
      migrate: (persisted, version) => {
        if (version < 3) {
          localStorage.removeItem("packslip.accessToken");
          return { user: null, company: null, accessToken: null, role: null };
        }
        const state = persisted as Partial<AuthState> | undefined;
        if (!state?.accessToken || state.accessToken === "null") {
          localStorage.removeItem("packslip.accessToken");
          return { user: null, company: null, accessToken: null, role: null };
        }
        return state;
      }
    }
  )
);
