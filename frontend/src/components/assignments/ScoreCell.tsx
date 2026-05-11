import React, { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

interface ScoreCellProps {
  score: number | null;
  overrideScore: number | null;
  maxScore: number;
  notes: string | null;
  onSave: (score: number | null, notes: string | null) => void;
}

function getScoreColor(value: number, maxScore: number): string {
  if (maxScore <= 0) return "text-gray-500";
  const pct = (value / maxScore) * 100;
  if (pct >= 80) return "text-emerald-700 bg-emerald-50";
  if (pct >= 60) return "text-amber-700 bg-amber-50";
  return "text-red-700 bg-red-50";
}

function getScoreRingColor(value: number, maxScore: number): string {
  if (maxScore <= 0) return "ring-gray-300";
  const pct = (value / maxScore) * 100;
  if (pct >= 80) return "ring-emerald-400";
  if (pct >= 60) return "ring-amber-400";
  return "ring-red-400";
}

export function ScoreCell({
  score,
  overrideScore,
  maxScore,
  notes,
  onSave,
}: ScoreCellProps) {
  const displayValue = overrideScore ?? score;
  const hasOverride =
    overrideScore !== null &&
    overrideScore !== undefined &&
    overrideScore !== score;

  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const handleClick = useCallback(() => {
    setInputValue(displayValue !== null ? String(displayValue) : "");
    setEditing(true);
  }, [displayValue]);

  const commit = useCallback(() => {
    setEditing(false);
    const trimmed = inputValue.trim();
    if (trimmed === "") {
      if (displayValue !== null) {
        onSave(null, notes);
      }
      return;
    }
    const parsed = parseFloat(trimmed);
    if (isNaN(parsed)) return;
    if (parsed !== displayValue) {
      onSave(parsed, notes);
    }
  }, [inputValue, displayValue, notes, onSave]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        commit();
      } else if (e.key === "Escape") {
        setEditing(false);
      } else if (e.key === "Tab") {
        commit();
      }
    },
    [commit]
  );

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        inputMode="decimal"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        className="w-full h-7 px-1.5 text-sm text-center border border-indigo-400 rounded bg-white outline-none ring-2 ring-indigo-200 font-medium tabular-nums"
        aria-label="Edit score"
      />
    );
  }

  if (displayValue === null || displayValue === undefined) {
    return (
      <button
        onClick={handleClick}
        className="w-full h-7 flex items-center justify-center text-gray-400 text-sm hover:bg-gray-100 rounded cursor-text transition-colors"
        title="Click to enter score"
        aria-label="Empty score, click to edit"
      >
        &mdash;
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        "relative w-full h-7 flex items-center justify-center text-sm font-medium rounded cursor-text transition-all hover:ring-2",
        getScoreColor(displayValue, maxScore),
        `hover:${getScoreRingColor(displayValue, maxScore)}`
      )}
      title={
        hasOverride
          ? `Original: ${score ?? "—"} | Override: ${overrideScore}${notes ? ` | ${notes}` : ""}`
          : notes
            ? `Notes: ${notes}`
            : `${displayValue} / ${maxScore}`
      }
      aria-label={`Score ${displayValue} out of ${maxScore}${hasOverride ? ", overridden" : ""}`}
    >
      <span className="tabular-nums">{displayValue}</span>
      {hasOverride && (
        <span
          className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full bg-orange-400 ring-1 ring-white"
          aria-label="Score has been overridden"
        />
      )}
    </button>
  );
}
