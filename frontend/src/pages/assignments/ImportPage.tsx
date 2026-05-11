import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Key,
  ListChecks,
  GitMerge,
  Eye,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Upload,
  Loader2,
} from "lucide-react";
import api from "@/lib/api";

const STEPS = [
  { label: "API Key", icon: Key },
  { label: "Assessment", icon: ListChecks },
  { label: "Map Section", icon: GitMerge },
  { label: "Preview", icon: Eye },
  { label: "Confirm", icon: CheckCircle2 },
];

const MOCK_ASSESSMENTS = [
  { id: "ill_101", title: "Q3 ELA Benchmark", subject: "ELA", grade: "3", studentCount: 54 },
  { id: "ill_102", title: "Q3 Math Benchmark", subject: "Math", grade: "3-4", studentCount: 60 },
  { id: "ill_103", title: "Reading Fluency Check", subject: "ELA", grade: "3", studentCount: 28 },
  { id: "ill_104", title: "Fractions Diagnostic", subject: "Math", grade: "4", studentCount: 30 },
  { id: "ill_105", title: "Writing Proficiency", subject: "ELA", grade: "3-4", studentCount: 56 },
];

const MOCK_SECTIONS = ["3A - ELA", "3B - ELA", "4A - Math"];

export default function ImportPage() {
  const [step, setStep] = useState(0);
  const [apiKey, setApiKey] = useState("");
  const [selectedAssessment, setSelectedAssessment] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [importing, setImporting] = useState(false);
  const [importDone, setImportDone] = useState(false);

  const assessment = MOCK_ASSESSMENTS.find((a) => a.id === selectedAssessment);

  // Mock preview data
  const matchedCount = assessment ? Math.floor(assessment.studentCount * 0.9) : 0;
  const unmatchedCount = assessment ? assessment.studentCount - matchedCount : 0;

  function canAdvance(): boolean {
    if (step === 0) return apiKey.trim().length >= 8;
    if (step === 1) return selectedAssessment !== null;
    if (step === 2) return selectedSection !== "";
    if (step === 3) return true;
    return false;
  }

  async function handleImport() {
    setImporting(true);
    try {
      await api.post("/import/import", {
        illuminate_assessment_id: selectedAssessment,
        section: selectedSection,
      });
    } catch {
      // prototype
    }
    setTimeout(() => {
      setImporting(false);
      setImportDone(true);
    }, 1500);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-indigo-50 p-2">
          <Upload className="h-6 w-6 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Import from Illuminate</h1>
          <p className="text-sm text-gray-500">
            Import assessment scores from Illuminate DnA into KipKap
          </p>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isActive = i === step;
          const isComplete = i < step;
          return (
            <div key={s.label} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                    isComplete && "border-emerald-500 bg-emerald-500 text-white",
                    isActive && "border-indigo-600 bg-indigo-600 text-white",
                    !isActive && !isComplete && "border-gray-300 bg-white text-gray-400"
                  )}
                >
                  {isComplete ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium",
                    isActive ? "text-indigo-600" : isComplete ? "text-emerald-600" : "text-gray-400"
                  )}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "mx-2 h-0.5 flex-1",
                    i < step ? "bg-emerald-500" : "bg-gray-200"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step content */}
      <Card>
        <CardContent className="p-6">
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Enter API Key</h2>
              <p className="text-sm text-gray-500">
                Enter your Illuminate DnA API key to connect and pull assessment data.
              </p>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Illuminate API Key
                </label>
                <Input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your API key..."
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Select Assessment</h2>
              <p className="text-sm text-gray-500">
                Choose the Illuminate assessment to import scores from.
              </p>
              <div className="space-y-2">
                {MOCK_ASSESSMENTS.map((a) => (
                  <label
                    key={a.id}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-gray-50",
                      selectedAssessment === a.id
                        ? "border-indigo-600 bg-indigo-50"
                        : "border-gray-200"
                    )}
                    onClick={() => setSelectedAssessment(a.id)}
                  >
                    <div
                      className={cn(
                        "h-4 w-4 rounded-full border-2",
                        selectedAssessment === a.id
                          ? "border-indigo-600 bg-indigo-600"
                          : "border-gray-300"
                      )}
                    >
                      {selectedAssessment === a.id && (
                        <div className="m-0.5 h-2 w-2 rounded-full bg-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{a.title}</p>
                      <p className="text-xs text-gray-500">
                        {a.subject} &middot; Grade {a.grade} &middot; {a.studentCount} students
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Map to Section</h2>
              <p className="text-sm text-gray-500">
                Select which section this assessment should be imported into.
              </p>
              {assessment && (
                <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-3">
                  <p className="text-sm font-medium text-indigo-900">{assessment.title}</p>
                  <p className="text-xs text-indigo-600">
                    {assessment.subject} &middot; Grade {assessment.grade}
                  </p>
                </div>
              )}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Target Section
                </label>
                <Select value={selectedSection} onValueChange={setSelectedSection}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a section..." />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_SECTIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Preview Import</h2>
              <p className="text-sm text-gray-500">
                Review the import details before confirming.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-gray-200 p-4">
                  <p className="text-sm text-gray-500">Assessment</p>
                  <p className="text-lg font-semibold text-gray-900">{assessment?.title}</p>
                </div>
                <div className="rounded-lg border border-gray-200 p-4">
                  <p className="text-sm text-gray-500">Target Section</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedSection}</p>
                </div>
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-sm text-emerald-600">Students Matched</p>
                  <p className="text-2xl font-bold text-emerald-800">{matchedCount}</p>
                </div>
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm text-amber-600">Unmatched</p>
                  <p className="text-2xl font-bold text-amber-800">{unmatchedCount}</p>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 text-center py-6">
              {importing ? (
                <>
                  <Loader2 className="mx-auto h-10 w-10 animate-spin text-indigo-600" />
                  <p className="text-lg font-semibold text-gray-900">Importing scores...</p>
                  <p className="text-sm text-gray-500">
                    Pulling data from Illuminate and mapping to students.
                  </p>
                </>
              ) : importDone ? (
                <>
                  <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
                  <p className="text-lg font-semibold text-gray-900">Import Complete!</p>
                  <p className="text-sm text-gray-500">
                    Successfully imported {matchedCount} scores for{" "}
                    <span className="font-medium">{assessment?.title}</span> into{" "}
                    <span className="font-medium">{selectedSection}</span>.
                  </p>
                  {unmatchedCount > 0 && (
                    <Badge className="bg-amber-100 text-amber-800">
                      {unmatchedCount} students could not be matched
                    </Badge>
                  )}
                </>
              ) : (
                <>
                  <CheckCircle2 className="mx-auto h-12 w-12 text-indigo-600" />
                  <p className="text-lg font-semibold text-gray-900">Ready to Import</p>
                  <p className="text-sm text-gray-500">Click the button below to start the import.</p>
                  <Button onClick={handleImport} className="mt-2">
                    <Upload className="mr-2 h-4 w-4" /> Start Import
                  </Button>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      {step < 4 && (
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setStep(step - 1)} disabled={step === 0}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button onClick={() => setStep(step + 1)} disabled={!canAdvance()}>
            Next <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
