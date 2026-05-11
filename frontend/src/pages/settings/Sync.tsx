import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { RefreshCw, CheckCircle2, Clock, Loader2 } from "lucide-react";

interface SyncStep {
  label: string;
  entity: string;
  count: number;
}

const SYNC_STEPS: SyncStep[] = [
  { label: "Syncing districts...", entity: "Districts", count: 1 },
  { label: "Syncing schools...", entity: "Schools", count: 3 },
  { label: "Syncing teachers...", entity: "Teachers", count: 12 },
  { label: "Syncing sections...", entity: "Sections", count: 28 },
  { label: "Syncing students...", entity: "Students", count: 342 },
];

interface SyncResult {
  entity: string;
  created: number;
  updated: number;
  unchanged: number;
}

const MOCK_RESULTS: SyncResult[] = [
  { entity: "Districts", created: 0, updated: 1, unchanged: 0 },
  { entity: "Schools", created: 0, updated: 0, unchanged: 3 },
  { entity: "Teachers", created: 1, updated: 2, unchanged: 9 },
  { entity: "Sections", created: 3, updated: 5, unchanged: 20 },
  { entity: "Students", created: 12, updated: 18, unchanged: 312 },
];

export default function SyncPage() {
  const [syncing, setSyncing] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [syncComplete, setSyncComplete] = useState(false);
  const [lastSync] = useState("2026-05-08T14:32:00Z");

  function startSync() {
    setSyncing(true);
    setSyncComplete(false);
    setCurrentStep(0);

    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      if (step >= SYNC_STEPS.length) {
        clearInterval(interval);
        setTimeout(() => {
          setSyncing(false);
          setSyncComplete(true);
          setCurrentStep(SYNC_STEPS.length);
        }, 600);
      } else {
        setCurrentStep(step);
      }
    }, 800);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-indigo-50 p-2">
          <RefreshCw className="h-6 w-6 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sync Management</h1>
          <p className="text-sm text-gray-500">
            Sync roster data from Clever into KipKap Badge
          </p>
        </div>
      </div>

      {/* Last sync + button */}
      <Card>
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-700">Last Sync</p>
              <p className="text-sm text-gray-500">
                {new Date(lastSync).toLocaleDateString()} at{" "}
                {new Date(lastSync).toLocaleTimeString()}
              </p>
            </div>
          </div>
          <Button onClick={startSync} disabled={syncing}>
            {syncing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            {syncing ? "Syncing..." : "Sync from Clever"}
          </Button>
        </CardContent>
      </Card>

      {/* Sync progress */}
      {(syncing || syncComplete) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {syncing ? "Sync Progress" : "Sync Complete"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {SYNC_STEPS.map((step, i) => {
                const isComplete = i < currentStep;
                const isActive = i === currentStep && syncing;
                const isPending = i > currentStep;
                return (
                  <div
                    key={step.entity}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border p-3 transition-all",
                      isComplete && "border-emerald-200 bg-emerald-50",
                      isActive && "border-indigo-200 bg-indigo-50",
                      isPending && "border-gray-100 bg-gray-50 opacity-50"
                    )}
                  >
                    {isComplete && <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />}
                    {isActive && <Loader2 className="h-5 w-5 shrink-0 animate-spin text-indigo-600" />}
                    {isPending && <div className="h-5 w-5 shrink-0 rounded-full border-2 border-gray-300" />}
                    <span
                      className={cn(
                        "flex-1 text-sm font-medium",
                        isComplete && "text-emerald-700",
                        isActive && "text-indigo-700",
                        isPending && "text-gray-400"
                      )}
                    >
                      {isActive ? step.label : `${step.entity}`}
                    </span>
                    {isComplete && (
                      <Badge variant="secondary" className="text-xs">
                        {step.count} synced
                      </Badge>
                    )}
                  </div>
                );
              })}

              {syncComplete && (
                <div className="mt-2 flex items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-100 p-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-800">
                    Sync completed successfully!
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results table */}
      {syncComplete && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sync Results Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Entity</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Created</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Updated</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Unchanged</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_RESULTS.map((r) => (
                    <tr key={r.entity} className="border-b border-gray-100">
                      <td className="px-4 py-3 font-medium text-gray-900">{r.entity}</td>
                      <td className="px-4 py-3">
                        {r.created > 0 ? (
                          <Badge className="bg-emerald-100 text-emerald-800">+{r.created}</Badge>
                        ) : (
                          <span className="text-gray-400">0</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {r.updated > 0 ? (
                          <Badge className="bg-blue-100 text-blue-800">{r.updated}</Badge>
                        ) : (
                          <span className="text-gray-400">0</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{r.unchanged}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {r.created + r.updated + r.unchanged}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
