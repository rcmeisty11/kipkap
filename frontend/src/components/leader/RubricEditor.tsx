import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Plus, ChevronUp, ChevronDown, Trash2, Save } from "lucide-react";
import api from "@/lib/api";
import type { RubricLevel } from "@/types";

interface CriterionDraft {
  id: string;
  title: string;
  description: string;
  levels: RubricLevel[];
}

const DEFAULT_LEVELS: RubricLevel[] = [
  { level: 1, label: "Beginning", desc: "" },
  { level: 2, label: "Developing", desc: "" },
  { level: 3, label: "Proficient", desc: "" },
  { level: 4, label: "Distinguished", desc: "" },
];

function makeCriterion(): CriterionDraft {
  return {
    id: crypto.randomUUID(),
    title: "",
    description: "",
    levels: DEFAULT_LEVELS.map((l) => ({ ...l })),
  };
}

interface Props {
  onSaved?: () => void;
}

export default function RubricEditor({ onSaved }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [criteria, setCriteria] = useState<CriterionDraft[]>([makeCriterion()]);
  const [saving, setSaving] = useState(false);

  function updateCriterion(id: string, patch: Partial<CriterionDraft>) {
    setCriteria((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  function updateLevel(criterionId: string, levelIdx: number, patch: Partial<RubricLevel>) {
    setCriteria((prev) =>
      prev.map((c) => {
        if (c.id !== criterionId) return c;
        const levels = c.levels.map((l, i) => (i === levelIdx ? { ...l, ...patch } : l));
        return { ...c, levels };
      })
    );
  }

  function moveUp(idx: number) {
    if (idx === 0) return;
    setCriteria((prev) => {
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  }

  function moveDown(idx: number) {
    setCriteria((prev) => {
      if (idx >= prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next;
    });
  }

  function removeCriterion(id: string) {
    setCriteria((prev) => prev.filter((c) => c.id !== id));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await api.post("/leader/rubrics", {
        title,
        description,
        criteria: criteria.map((c, i) => ({
          title: c.title,
          description: c.description,
          levels_json: c.levels,
          position: i,
        })),
      });
      onSaved?.();
    } catch {
      // In prototype mode, just call onSaved anyway
      onSaved?.();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Title & description */}
      <Card>
        <CardContent className="space-y-4 p-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Rubric Title
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Classroom Observation Rubric"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe the purpose of this rubric..."
              rows={3}
              className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Criteria */}
      {criteria.map((criterion, idx) => (
        <Card key={criterion.id}>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-base">Criterion {idx + 1}</CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => moveUp(idx)}
                disabled={idx === 0}
                className="h-8 w-8"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => moveDown(idx)}
                disabled={idx === criteria.length - 1}
                className="h-8 w-8"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeCriterion(criterion.id)}
                disabled={criteria.length <= 1}
                className="h-8 w-8 text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Title</label>
                <Input
                  value={criterion.title}
                  onChange={(e) => updateCriterion(criterion.id, { title: e.target.value })}
                  placeholder="e.g. Student Engagement"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Description
                </label>
                <Input
                  value={criterion.description}
                  onChange={(e) =>
                    updateCriterion(criterion.id, { description: e.target.value })
                  }
                  placeholder="What does this criterion measure?"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {criterion.levels.map((level, li) => (
                <div
                  key={level.level}
                  className={cn(
                    "rounded-lg border p-3",
                    li === 0 && "border-red-200 bg-red-50/50",
                    li === 1 && "border-amber-200 bg-amber-50/50",
                    li === 2 && "border-blue-200 bg-blue-50/50",
                    li === 3 && "border-emerald-200 bg-emerald-50/50"
                  )}
                >
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Level {level.level}
                  </div>
                  <Input
                    value={level.label}
                    onChange={(e) =>
                      updateLevel(criterion.id, li, { label: e.target.value })
                    }
                    placeholder="Label"
                    className="mb-2 h-8 text-sm"
                  />
                  <textarea
                    value={level.desc}
                    onChange={(e) =>
                      updateLevel(criterion.id, li, { desc: e.target.value })
                    }
                    placeholder="Describe this level..."
                    rows={3}
                    className="flex w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-1"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => setCriteria((prev) => [...prev, makeCriterion()])}>
          <Plus className="mr-2 h-4 w-4" /> Add Criterion
        </Button>
        <Button onClick={handleSave} disabled={saving || !title.trim()}>
          <Save className="mr-2 h-4 w-4" /> {saving ? "Saving..." : "Save Rubric"}
        </Button>
      </div>
    </div>
  );
}
