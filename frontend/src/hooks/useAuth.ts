import { useEffect } from "react";
import { useAuthStore } from "@/store/auth";

export function useAuth() {
  const { user, loading, fetchUser, logout, demoLogin } = useAuthStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return { user, loading, logout, demoLogin, isLeader: user?.role === "leader" || user?.role === "admin" };
}
