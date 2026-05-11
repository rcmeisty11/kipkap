import { create } from "zustand";
import type { User } from "@/types";
import api from "@/lib/api";

interface AuthState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  fetchUser: () => Promise<void>;
  logout: () => void;
  demoLogin: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),
  fetchUser: async () => {
    try {
      const token = localStorage.getItem("kipkap_token");
      if (!token) {
        set({ user: null, loading: false });
        return;
      }
      const { data } = await api.get("/auth/me");
      set({ user: data, loading: false });
    } catch {
      localStorage.removeItem("kipkap_token");
      set({ user: null, loading: false });
    }
  },
  logout: () => {
    localStorage.removeItem("kipkap_token");
    set({ user: null });
    window.location.href = "/auth/login";
  },
  demoLogin: async () => {
    const { data } = await api.post("/auth/demo-login");
    localStorage.setItem("kipkap_token", data.token);
    set({ user: data.user, loading: false });
  },
}));
