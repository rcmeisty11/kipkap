import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Send } from "lucide-react";
import api from "@/lib/api";
import type { RubricCriteria } from "@/types";

const LEVEL_COLORS: Record<number, string> = {
  1: "border-red-300 bg-red-50 text-red-800 hover:bg-red-100",
  2: "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100",
  3: "border-blue-300 bg-blue-50 text-blue-800 hover:bg-blue-100",
  4: "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100",
};

const LEVEL_SELECTED: Record<number, string> = {
  1: "border-red-500 bg-red-500 text-white ring-2 ring-red-300",
  2: "border-amber-500 bg-amber-500 text-white ring-2 ring-amber-300",
  3: "border-blue-500 bg-blue-500 text-white ring-2 ring-blue-300",
  4: "border-emerald-500 bg-emerald-500 text-white ring-2 ring-emerald-300",
};

interface Props {
  rubricId: number;
  teacherId: number;
  criteria: RubricCriteria[];
  onSubmitted?: () => void;
}

export default function FeedbackForm({ rubricId, teacherId, criteria, onSubmitted }: Props) {
  const [ratings, setRatings] = useState<Record<number, number>>({});
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function setRating(criterionId: number, level: number) {
    setRatings((prev) => ({ ...prev, [criterionId]: level }));
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await api.post("/leader/feedback", {
        rubric_id: rubricId,
        teacher_id: teacherId,
        criteria_ratings_json: ratings,
        overall_notes: notes,
      });
      onSubmitted?.();
    } catch {
      // Prototype: still call onSubmitted
      onSubmitted?.();
    } finally {
      setSubmitting(false);
    }
  }

  const allRated = criteria.every((c) => ratings[c.id] !== undefined);

  return (
    <div className="space-y-4">
      {criteria.map((criterion) => (
        <Card key={criterion.id}>
          <CardContent className="p-5">
            <div className="mb-3">
              <h3 className="font-semibold text-gray-900">{criterion.title}</h3>
              {criterion.description && (
                <p className="mt-0.5 text-sm text-gray-500">{criterion.description}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {criterion.levels_json.map((level) => {
                const selected = ratings[criterion.id] === level.level;
                return (
                  <button
                    key={level.level}
                    onClick={() => setRating(criterion.id, level.level)}
                    className={cn(
                      "rounded-lg border px-3 py-2 text-left transition-all",
                      selected ? LEVEL_SELECTED[level.level] : LEVEL_COLORS[level.level]
                    )}
                  >
                    <div className="text-xs font-bold">Level {level.level}</div>
                    <div className={cn("text-sm font-medium", selected && "text-white")}>
                      {level.label}
                    </div>
                    <div
                      className={cn(
                        "mt-1 text-xs leading-snug",
                        selected ? "text-white/90" : "text-gray-500"
                      )}
                    >
                      {level.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardContent className="p-5">
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Overall Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any overall observations, strengths, or next steps..."
            rows={4}
            className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={submitting || !allRated}>
          <Send className="mr-2 h-4 w-4" /> {submitting ? "Submitting..." : "Submit Feedback"}
        </Button>
      </div>
    </div>
  );
}
