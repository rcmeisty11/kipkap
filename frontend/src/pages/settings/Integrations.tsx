import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Settings, Eye, EyeOff, CheckCircle2, XCircle, Loader2, Copy, Check } from "lucide-react";

export default function IntegrationsPage() {
  // Clever state
  const [cleverClientId, setCleverClientId] = useState("a1b2c3d4e5f6g7h8i9j0");
  const [cleverSecret, setCleverSecret] = useState("sk_live_xxxxxxxxxxxxxxxxxxxx");
  const [showCleverSecret, setShowCleverSecret] = useState(false);
  const [cleverTesting, setCleverTesting] = useState(false);
  const [cleverStatus, setCleverStatus] = useState<"idle" | "success" | "error">("idle");
  const [cleverSaving, setCleverSaving] = useState(false);
  const redirectUri = `${window.location.origin}/auth/callback`;
  const [copied, setCopied] = useState(false);

  // Illuminate state
  const [illApiKey, setIllApiKey] = useState("ill_key_xxxxxxxxxxxxxxxx");
  const [showIllKey, setShowIllKey] = useState(false);
  const [illBaseUrl, setIllBaseUrl] = useState("https://district.illuminateed.com/api/v2");
  const [illTesting, setIllTesting] = useState(false);
  const [illStatus, setIllStatus] = useState<"idle" | "success" | "error">("idle");
  const [illSaving, setIllSaving] = useState(false);

  function testClever() {
    setCleverTesting(true);
    setCleverStatus("idle");
    setTimeout(() => {
      setCleverTesting(false);
      setCleverStatus("success");
    }, 1200);
  }

  function saveClever() {
    setCleverSaving(true);
    setTimeout(() => setCleverSaving(false), 800);
  }

  function testIlluminate() {
    setIllTesting(true);
    setIllStatus("idle");
    setTimeout(() => {
      setIllTesting(false);
      setIllStatus("success");
    }, 1200);
  }

  function saveIlluminate() {
    setIllSaving(true);
    setTimeout(() => setIllSaving(false), 800);
  }

  function copyRedirect() {
    navigator.clipboard.writeText(redirectUri);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-indigo-50 p-2">
          <Settings className="h-6 w-6 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
          <p className="text-sm text-gray-500">
            Configure connections to Clever and Illuminate
          </p>
        </div>
      </div>

      {/* Clever */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Clever</CardTitle>
            {cleverStatus === "success" && (
              <Badge className="bg-emerald-100 text-emerald-800">Connected</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Client ID</label>
            <Input
              value={cleverClientId}
              onChange={(e) => setCleverClientId(e.target.value)}
              placeholder="Clever Client ID"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Client Secret</label>
            <div className="relative">
              <Input
                type={showCleverSecret ? "text" : "password"}
                value={cleverSecret}
                onChange={(e) => setCleverSecret(e.target.value)}
                placeholder="Clever Client Secret"
                className="pr-10"
              />
              <button
                onClick={() => setShowCleverSecret(!showCleverSecret)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showCleverSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Redirect URI</label>
            <div className="flex items-center gap-2">
              <Input value={redirectUri} readOnly className="bg-gray-50 text-gray-600" />
              <Button variant="outline" size="icon" onClick={copyRedirect}>
                {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="mt-1 text-xs text-gray-400">
              Add this URI to your Clever application settings
            </p>
          </div>

          {cleverStatus === "success" && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <span className="text-sm text-emerald-700">Connection successful</span>
            </div>
          )}
          {cleverStatus === "error" && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
              <XCircle className="h-5 w-5 text-red-600" />
              <span className="text-sm text-red-700">Connection failed. Check your credentials.</span>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={testClever} disabled={cleverTesting}>
              {cleverTesting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Test Connection
            </Button>
            <Button onClick={saveClever} disabled={cleverSaving}>
              {cleverSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Illuminate */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Illuminate DnA</CardTitle>
            {illStatus === "success" && (
              <Badge className="bg-emerald-100 text-emerald-800">Connected</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">API Key</label>
            <div className="relative">
              <Input
                type={showIllKey ? "text" : "password"}
                value={illApiKey}
                onChange={(e) => setIllApiKey(e.target.value)}
                placeholder="Illuminate API Key"
                className="pr-10"
              />
              <button
                onClick={() => setShowIllKey(!showIllKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showIllKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Base URL</label>
            <Input
              value={illBaseUrl}
              onChange={(e) => setIllBaseUrl(e.target.value)}
              placeholder="https://your-district.illuminateed.com/api/v2"
            />
          </div>

          {illStatus === "success" && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <span className="text-sm text-emerald-700">Connection successful</span>
            </div>
          )}
          {illStatus === "error" && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
              <XCircle className="h-5 w-5 text-red-600" />
              <span className="text-sm text-red-700">Connection failed. Check your API key and URL.</span>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={testIlluminate} disabled={illTesting}>
              {illTesting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Test Connection
            </Button>
            <Button onClick={saveIlluminate} disabled={illSaving}>
              {illSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
