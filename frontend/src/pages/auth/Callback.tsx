import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "@/store/auth";
import { Loader2 } from "lucide-react";

export default function Callback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { fetchUser } = useAuthStore();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const token = searchParams.get("token");
    if (token) {
      localStorage.setItem("kipkap_token", token);
      fetchUser().then(() => {
        navigate("/dashboard", { replace: true });
      });
    } else {
      navigate("/auth/login", { replace: true });
    }
  }, [searchParams, fetchUser, navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      <p className="mt-4 text-sm text-gray-500">Signing you in...</p>
    </div>
  );
}
