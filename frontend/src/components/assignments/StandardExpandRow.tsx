import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { AssignmentGroup, StudentScore, Assignment } from "@/types";

interface StandardExpandRowProps {
  studentId: number;
  groups: AssignmentGroup[];
  scores: Record<number, StudentScore>;
  assignments: Assignment[];
}

interface StandardSummary {
  groupId: number;
  groupName: string;
  standardCode: string | null;
  assignmentCount: number;
  avgScore: number | null;
  avgPct: number;
}

function getBarColor(pct: number): string {
  if (pct >= 80) return "bg-emerald-500";
  if (pct >= 60) return "bg-amber-500";
  return "bg-red-500";
}

function getBarBg(pct: number): string {
  if (pct >= 80) return "bg-emerald-100";
  if (pct >= 60) return "bg-amber-100";
  return "bg-red-100";
}

export function StandardExpandRow({
  studentId,
  groups,
  scores,
  assignments,
}: StandardExpandRowProps) {
  const summaries = useMemo<StandardSummary[]>(() => {
    const assignmentMap = new Map(assignments.map((a) => [a.id, a]));

    return groups.map((group) => {
      const groupAssignmentIds = group.items.map((item) => item.assignment_id);
      const validScores: { score: number; maxScore: number }[] = [];

      for (const aId of groupAssignmentIds) {
        const scoreRecord = scores[aId];
        const assignment = assignmentMap.get(aId);
        if (!scoreRecord || !assignment) continue;

        const value = scoreRecord.override_score ?? scoreRecord.score;
        if (value !== null && value !== undefined) {
          validScores.push({ score: value, maxScore: assignment.max_score });
        }
      }

      let avgPct = 0;
      let avgScore: number | null = null;
      if (validScores.length > 0) {
        const totalPct = validScores.reduce(
          (sum, s) => sum + (s.maxScore > 0 ? (s.score / s.maxScore) * 100 : 0),
          0
        );
        avgPct = totalPct / validScores.length;
        avgScore = Math.round(avgPct * 10) / 10;
      }

      // Derive a standard code from the group name (first token before space/dash)
      const standardCode = group.name.match(/^[A-Z0-9]+[\.\-]?[A-Z0-9]*/i)?.[0] ?? null;

      return {
        groupId: group.id,
        groupName: group.name,
        standardCode,
        assignmentCount: groupAssignmentIds.length,
        avgScore,
        avgPct,
      };
    });
  }, [groups, scores, assignments, studentId]);

  if (groups.length === 0) {
    return (
      <div className="px-6 py-3 bg-gray-50 text-sm text-gray-500 italic border-t border-gray-100">
        No standard groups configured for this section.
      </div>
    );
  }

  return (
    <div className="px-4 py-3 bg-gray-50/80 border-t border-gray-100">
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
        Standards Performance
      </div>
      <div className="space-y-1.5">
        {summaries.map((summary) => (
          <div
            key={summary.groupId}
            className="flex items-center gap-3 text-sm"
          >
            {/* Standard code badge */}
            <div className="flex-shrink-0 w-20">
              <span className="inline-block px-1.5 py-0.5 rounded text-xs font-mono font-semibold bg-gray-200 text-gray-700">
                {summary.standardCode ?? "GRP"}
              </span>
            </div>

            {/* Standard name */}
            <div className="flex-shrink-0 w-48 truncate text-gray-700 text-xs" title={summary.groupName}>
              {summary.groupName}
            </div>

            {/* Assignment count */}
            <div className="flex-shrink-0 w-14 text-xs text-gray-500">
              {summary.assignmentCount} asgn{summary.assignmentCount !== 1 ? "s" : ""}
            </div>

            {/* Bar chart */}
            <div className="flex-1 flex items-center gap-2">
              <div
                className={cn(
                  "h-5 rounded-full flex-1 overflow-hidden",
                  summary.avgScore !== null ? getBarBg(summary.avgPct) : "bg-gray-100"
                )}
              >
                {summary.avgScore !== null && (
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500 ease-out",
                      getBarColor(summary.avgPct)
                    )}
                    style={{ width: `${Math.min(100, Math.max(2, summary.avgPct))}%` }}
                  />
                )}
              </div>
              <span
                className={cn(
                  "flex-shrink-0 w-12 text-right text-xs font-semibold tabular-nums",
                  summary.avgScore !== null
                    ? summary.avgPct >= 80
                      ? "text-emerald-700"
                      : summary.avgPct >= 60
                        ? "text-amber-700"
                        : "text-red-700"
                    : "text-gray-400"
                )}
              >
                {summary.avgScore !== null ? `${summary.avgPct.toFixed(0)}%` : "—"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
