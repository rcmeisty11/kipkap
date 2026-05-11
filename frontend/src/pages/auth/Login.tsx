import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LogIn, Play } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function Login() {
  const { demoLogin } = useAuth();
  const navigate = useNavigate();

  const handleDemoLogin = async () => {
    try {
      await demoLogin();
      navigate("/dashboard");
    } catch (err) {
      console.error("Demo login failed:", err);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-indigo-50 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-2xl font-bold text-white shadow-lg shadow-indigo-200">
            K
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            KipKap Badge
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Student assessment and growth tracking
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="pb-4">
            <h2 className="text-center text-lg font-semibold text-gray-900">
              Sign in to your account
            </h2>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full gap-2"
              size="lg"
              onClick={() => {
                window.location.href = `${API_URL}/auth/clever`;
              }}
            >
              <LogIn className="h-4 w-4" />
              Sign in with Clever
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-400">or</span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full gap-2"
              size="lg"
              onClick={handleDemoLogin}
            >
              <Play className="h-4 w-4" />
              Demo Login
            </Button>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-gray-400">
          By signing in, you agree to the KipKap Badge Terms of Service.
        </p>
      </div>
    </div>
  );
}
