import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, MessageSquare } from "lucide-react";
import ReflectionForm from "./ReflectionForm";
import type { RubricCriteria, RubricLevel } from "@/types";

const LEVEL_BADGE_COLORS: Record<number, string> = {
  1: "bg-red-100 text-red-800 border-red-200",
  2: "bg-amber-100 text-amber-800 border-amber-200",
  3: "bg-blue-100 text-blue-800 border-blue-200",
  4: "bg-emerald-100 text-emerald-800 border-emerald-200",
};

export interface ActionStepFeedback {
  id: number;
  rubricTitle: string;
  criteria: RubricCriteria[];
  ratings: Record<number, number>;
  overallNotes: string;
  leaderName: string;
  createdAt: string;
  reflections: Array<{ id: number; text: string; submittedAt: string }>;
}

interface Props {
  feedback: ActionStepFeedback;
}

export default function ActionStepCard({ feedback }: Props) {
  const [expanded, setExpanded] = useState(false);

  function getLevelForRating(criterion: RubricCriteria, rating: number): RubricLevel | undefined {
    return criterion.levels_json.find((l) => l.level === rating);
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{feedback.rubricTitle}</CardTitle>
            <p className="mt-1 text-xs text-gray-500">
              By {feedback.leaderName} on {new Date(feedback.createdAt).toLocaleDateString()}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)}>
            <MessageSquare className="mr-1.5 h-4 w-4" />
            Reflect
            {expanded ? (
              <ChevronUp className="ml-1 h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="ml-1 h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {feedback.criteria.map((criterion) => {
          const rating = feedback.ratings[criterion.id];
          const level = getLevelForRating(criterion, rating);
          return (
            <div
              key={criterion.id}
              className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50/50 p-3"
            >
              <Badge
                className={cn(
                  "mt-0.5 shrink-0 border font-bold",
                  LEVEL_BADGE_COLORS[rating] ?? "bg-gray-100 text-gray-600"
                )}
              >
                {rating}
              </Badge>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900">{criterion.title}</p>
                {level && (
                  <p className="text-xs text-gray-500">
                    {level.label} &mdash; {level.desc}
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {feedback.overallNotes && (
          <div className="rounded-lg border border-indigo-100 bg-indigo-50/50 p-3">
            <p className="text-xs font-medium text-indigo-700">Overall Notes</p>
            <p className="mt-1 text-sm text-gray-700">{feedback.overallNotes}</p>
          </div>
        )}

        {expanded && (
          <div className="mt-4 border-t border-gray-200 pt-4">
            <ReflectionForm
              feedbackId={feedback.id}
              existingReflections={feedback.reflections}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
