import React, { useMemo, useState, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getExpandedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
  type ColumnFiltersState,
  type ExpandedState,
  type Row,
  type FilterFn,
} from "@tanstack/react-table";
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Search,
  Languages,
  Globe2,
  Filter,
  X,
  Plus,
  Layers,
  StickyNote,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScoreCell } from "./ScoreCell";
import { StandardExpandRow } from "./StandardExpandRow";
import api from "@/lib/api";
import { useAssignments, useUpdateScore, useDeleteAssignment } from "@/hooks/useAssignments";
import { useStudents } from "@/hooks/useStudents";
import { useFocusGroups, useCreateFocusGroup } from "@/hooks/useFocusGroups";
import { useUIStore } from "@/store/ui";
import type {
  Student,
  Assignment,
  StudentScore,
  StudentRow,
  FocusGroup,
  AssignmentGroup,
  Standard,
} from "@/types";

// ---------------------------------------------------------------------------
// Mock data for demo / prototype rendering without a backend
// ---------------------------------------------------------------------------

const MOCK_STANDARDS: Standard[] = [
  { id: 1, code: "NBT.4", description: "Multi-digit Arithmetic", subject: "Math", grade_level: "4", framework: "CCSS" },
  { id: 2, code: "RL.3.1", description: "Ask and answer questions", subject: "ELA", grade_level: "3", framework: "CCSS" },
  { id: 3, code: "RL.3.2", description: "Recount stories", subject: "ELA", grade_level: "3", framework: "CCSS" },
  { id: 4, code: "W.3.4", description: "Produce writing for task", subject: "ELA", grade_level: "3", framework: "CCSS" },
  { id: 5, code: "OA.2", description: "Problem Solving with Operations", subject: "Math", grade_level: "4", framework: "CCSS" },
];

const MOCK_STUDENTS: Student[] = [
  { id: 1, clever_id: "s1", school_id: 1, first_name: "Maria", last_name: "Garcia", grade: "4", sis_id: null, is_ml: true, is_dl: false, synced_at: "" },
  { id: 2, clever_id: "s2", school_id: 1, first_name: "James", last_name: "Wilson", grade: "4", sis_id: null, is_ml: false, is_dl: false, synced_at: "" },
  { id: 3, clever_id: "s3", school_id: 1, first_name: "Anh", last_name: "Nguyen", grade: "4", sis_id: null, is_ml: true, is_dl: true, synced_at: "" },
  { id: 4, clever_id: "s4", school_id: 1, first_name: "Destiny", last_name: "Johnson", grade: "4", sis_id: null, is_ml: false, is_dl: false, synced_at: "" },
  { id: 5, clever_id: "s5", school_id: 1, first_name: "Omar", last_name: "Al-Rashid", grade: "4", sis_id: null, is_ml: true, is_dl: true, synced_at: "" },
];

const MOCK_STUDENTS_SEC2: Student[] = [
  { id: 6, clever_id: "s6", school_id: 1, first_name: "Lily", last_name: "Chen", grade: "4", sis_id: null, is_ml: true, is_dl: false, synced_at: "" },
  { id: 7, clever_id: "s7", school_id: 1, first_name: "Marcus", last_name: "Brown", grade: "4", sis_id: null, is_ml: false, is_dl: true, synced_at: "" },
  { id: 8, clever_id: "s8", school_id: 1, first_name: "Sofia", last_name: "Rodriguez", grade: "4", sis_id: null, is_ml: false, is_dl: false, synced_at: "" },
];

const MOCK_STUDENTS_SEC3: Student[] = [
  { id: 9, clever_id: "s9", school_id: 1, first_name: "Ethan", last_name: "Kim", grade: "4", sis_id: null, is_ml: false, is_dl: false, synced_at: "" },
  { id: 10, clever_id: "s10", school_id: 1, first_name: "Amara", last_name: "Okafor", grade: "4", sis_id: null, is_ml: true, is_dl: false, synced_at: "" },
];

const MOCK_SECTION_MAP: Record<number, { students: Student[]; name: string }> = {
  1: { students: MOCK_STUDENTS, name: "4th Grade Math — Period 1" },
  2: { students: MOCK_STUDENTS_SEC2, name: "4th Grade Math — Period 3" },
  3: { students: MOCK_STUDENTS_SEC3, name: "4th Grade ELA — Period 2" },
};

const MOCK_ASSIGNMENTS: Assignment[] = [
  { id: 101, title: "Unit 3 Quiz", subject: "Math", max_score: 20, due_date: "2026-05-01", standard_id: 1, notes: "Covers NBT.4 standards only. Retake offered 5/5.", illuminate_id: null, section_id: 1, teacher_id: 1, created_at: "", updated_at: "" },
  { id: 102, title: "Fractions HW", subject: "Math", max_score: 10, due_date: "2026-05-01", standard_id: 1, notes: null, illuminate_id: null, section_id: 1, teacher_id: 1, created_at: "", updated_at: "" },
  { id: 103, title: "Reading Response", subject: "ELA", max_score: 25, due_date: "2026-05-05", standard_id: 2, notes: "Partner work allowed for ML students", illuminate_id: null, section_id: 1, teacher_id: 1, created_at: "", updated_at: "" },
  { id: 104, title: "Benchmark #2", subject: "Math", max_score: 50, due_date: "2026-05-08", standard_id: 5, notes: "District benchmark — do not modify scores", illuminate_id: null, section_id: 1, teacher_id: 1, created_at: "", updated_at: "" },
];

const MOCK_SCORES: StudentScore[] = [
  { id: 1, assignment_id: 101, student_id: 1, score: 18, override_score: null, notes: null, edited_by_teacher_id: null, created_at: "", updated_at: "" },
  { id: 2, assignment_id: 101, student_id: 2, score: 14, override_score: null, notes: null, edited_by_teacher_id: null, created_at: "", updated_at: "" },
  { id: 3, assignment_id: 101, student_id: 3, score: 11, override_score: 13, notes: "Retake", edited_by_teacher_id: 1, created_at: "", updated_at: "" },
  { id: 4, assignment_id: 101, student_id: 4, score: 19, override_score: null, notes: null, edited_by_teacher_id: null, created_at: "", updated_at: "" },
  { id: 5, assignment_id: 101, student_id: 5, score: 9, override_score: null, notes: null, edited_by_teacher_id: null, created_at: "", updated_at: "" },
  { id: 6, assignment_id: 102, student_id: 1, score: 9, override_score: null, notes: null, edited_by_teacher_id: null, created_at: "", updated_at: "" },
  { id: 7, assignment_id: 102, student_id: 2, score: 7, override_score: null, notes: null, edited_by_teacher_id: null, created_at: "", updated_at: "" },
  { id: 8, assignment_id: 102, student_id: 3, score: 5, override_score: null, notes: null, edited_by_teacher_id: null, created_at: "", updated_at: "" },
  { id: 9, assignment_id: 102, student_id: 4, score: 10, override_score: null, notes: null, edited_by_teacher_id: null, created_at: "", updated_at: "" },
  { id: 10, assignment_id: 102, student_id: 5, score: 3, override_score: null, notes: "Absent — partial", edited_by_teacher_id: null, created_at: "", updated_at: "" },
  { id: 11, assignment_id: 103, student_id: 1, score: 22, override_score: null, notes: null, edited_by_teacher_id: null, created_at: "", updated_at: "" },
  { id: 12, assignment_id: 103, student_id: 2, score: 18, override_score: null, notes: null, edited_by_teacher_id: null, created_at: "", updated_at: "" },
  { id: 13, assignment_id: 103, student_id: 3, score: null, override_score: null, notes: "Missing", edited_by_teacher_id: null, created_at: "", updated_at: "" },
  { id: 14, assignment_id: 103, student_id: 4, score: 24, override_score: null, notes: null, edited_by_teacher_id: null, created_at: "", updated_at: "" },
  { id: 15, assignment_id: 103, student_id: 5, score: 15, override_score: null, notes: null, edited_by_teacher_id: null, created_at: "", updated_at: "" },
  { id: 16, assignment_id: 104, student_id: 1, score: 42, override_score: null, notes: null, edited_by_teacher_id: null, created_at: "", updated_at: "" },
  { id: 17, assignment_id: 104, student_id: 2, score: 35, override_score: null, notes: null, edited_by_teacher_id: null, created_at: "", updated_at: "" },
  { id: 18, assignment_id: 104, student_id: 3, score: 28, override_score: null, notes: null, edited_by_teacher_id: null, created_at: "", updated_at: "" },
  { id: 19, assignment_id: 104, student_id: 4, score: 47, override_score: null, notes: null, edited_by_teacher_id: null, created_at: "", updated_at: "" },
  { id: 20, assignment_id: 104, student_id: 5, score: 22, override_score: 26, notes: "Accommodation", edited_by_teacher_id: 1, created_at: "", updated_at: "" },
];

const MOCK_FOCUS_GROUPS: FocusGroup[] = [
  { id: 1, name: "Tier 2 Math", section_id: 1, teacher_id: 1, color: "#6366f1", created_at: "", member_ids: [1, 5] },
  { id: 2, name: "ELL Support", section_id: 1, teacher_id: 1, color: "#f59e0b", created_at: "", member_ids: [1, 3, 5] },
];

const MOCK_GROUPS: AssignmentGroup[] = [
  {
    id: 1, name: "NBT.4 Multi-digit Arithmetic", standard_id: 1, section_id: 1, teacher_id: 1, position: 0,
    items: [
      { id: 1, group_id: 1, assignment_id: 101, position: 0 },
      { id: 2, group_id: 1, assignment_id: 102, position: 1 },
    ],
  },
  {
    id: 2, name: "RL.3 Character Analysis", standard_id: 2, section_id: 1, teacher_id: 1, position: 1,
    items: [{ id: 3, group_id: 2, assignment_id: 103, position: 0 }],
  },
  {
    id: 3, name: "OA.2 Problem Solving", standard_id: 3, section_id: 1, teacher_id: 1, position: 2,
    items: [{ id: 4, group_id: 3, assignment_id: 104, position: 0 }],
  },
];

const GROUP_COLOR_PRESETS = [
  "#6366f1", "#f59e0b", "#10b981", "#ef4444",
  "#8b5cf6", "#ec4899", "#06b6d4", "#f97316",
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildScoreMap(scores: StudentScore[]): Record<number, Record<number, StudentScore>> {
  const map: Record<number, Record<number, StudentScore>> = {};
  for (const s of scores) {
    if (!map[s.student_id]) map[s.student_id] = {};
    map[s.student_id][s.assignment_id] = s;
  }
  return map;
}

function buildStudentRows(
  students: Student[],
  scoresByStudent: Record<number, Record<number, StudentScore>>,
  focusGroups: FocusGroup[],
  sectionName?: string
): StudentRow[] {
  return students.map((student) => {
    const groups = focusGroups
      .filter((g) => g.member_ids.includes(student.id))
      .map((g) => g.name);
    return {
      student,
      scores: scoresByStudent[student.id] ?? {},
      focusGroups: groups,
      sectionName,
    };
  });
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "No Date";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Custom filter for ML/DL
const booleanFilter: FilterFn<StudentRow> = (row, columnId, filterValue) => {
  if (filterValue === undefined || filterValue === null) return true;
  const student = row.original.student;
  if (columnId === "is_ml") return student.is_ml === filterValue;
  if (columnId === "is_dl") return student.is_dl === filterValue;
  return true;
};

// Focus group filter
const focusGroupFilter: FilterFn<StudentRow> = (row, _columnId, filterValue: string[]) => {
  if (!filterValue || filterValue.length === 0) return true;
  return filterValue.some((name) => row.original.focusGroups.includes(name));
};

const columnHelper = createColumnHelper<StudentRow>();

// ---------------------------------------------------------------------------
// Grouping helpers
// ---------------------------------------------------------------------------

interface ColumnGroup {
  label: string;
  colSpan: number;
  colorClass: string;
}

function computeColumnGroups(
  assignments: Assignment[],
  groupBy: "none" | "date" | "standard",
  standards: Standard[]
): ColumnGroup[] {
  if (groupBy === "none") return [];

  if (groupBy === "date") {
    const dateMap = new Map<string, number>();
    for (const a of assignments) {
      const key = a.due_date ?? "no-date";
      dateMap.set(key, (dateMap.get(key) ?? 0) + 1);
    }
    return Array.from(dateMap.entries()).map(([date, count]) => ({
      label: date === "no-date" ? "No Date" : formatDate(date),
      colSpan: count,
      colorClass: "bg-blue-50 text-blue-700 border-b-2 border-blue-200",
    }));
  }

  // groupBy === "standard"
  const stdMap = new Map<number | "none", number>();
  for (const a of assignments) {
    const key = a.standard_id ?? "none";
    stdMap.set(key, (stdMap.get(key) ?? 0) + 1);
  }
  return Array.from(stdMap.entries()).map(([stdId, count]) => {
    if (stdId === "none") {
      return { label: "Ungrouped", colSpan: count, colorClass: "bg-gray-100 text-gray-600 border-b-2 border-gray-300" };
    }
    const std = standards.find((s) => s.id === stdId);
    return {
      label: std?.code ?? `Standard ${stdId}`,
      colSpan: count,
      colorClass: "bg-violet-50 text-violet-700 border-b-2 border-violet-200",
    };
  });
}

function sortAssignmentsByGroup(
  assignments: Assignment[],
  groupBy: "none" | "date" | "standard"
): Assignment[] {
  if (groupBy === "none") return assignments;
  if (groupBy === "date") {
    return [...assignments].sort((a, b) => {
      const da = a.due_date ?? "9999";
      const db = b.due_date ?? "9999";
      return da.localeCompare(db);
    });
  }
  // standard
  return [...assignments].sort((a, b) => {
    const sa = a.standard_id ?? 99999;
    const sb = b.standard_id ?? 99999;
    return sa - sb;
  });
}

// ---------------------------------------------------------------------------
// Summary helpers
// ---------------------------------------------------------------------------

interface AssignmentSummary {
  assignmentId: number;
  avg: number | null;
  passPct: number | null;
  groupStats: { groupId: number; groupName: string; color: string; avg: number | null; passPct: number | null }[];
}

function computeSummaries(
  assignments: Assignment[],
  rows: StudentRow[],
  focusGroups: FocusGroup[]
): AssignmentSummary[] {
  return assignments.map((assignment) => {
    const allValues: number[] = [];
    for (const row of rows) {
      const s = row.scores[assignment.id];
      if (s) {
        const v = s.override_score ?? s.score;
        if (v !== null) allValues.push(v);
      }
    }
    const avg = allValues.length > 0 ? allValues.reduce((a, b) => a + b, 0) / allValues.length : null;
    const passThreshold = assignment.max_score * 0.7;
    const passCount = allValues.filter((v) => v >= passThreshold).length;
    const passPct = allValues.length > 0 ? (passCount / allValues.length) * 100 : null;

    const groupStats = focusGroups.map((fg) => {
      const memberValues: number[] = [];
      for (const row of rows) {
        if (!fg.member_ids.includes(row.student.id)) continue;
        const s = row.scores[assignment.id];
        if (s) {
          const v = s.override_score ?? s.score;
          if (v !== null) memberValues.push(v);
        }
      }
      const gAvg = memberValues.length > 0 ? memberValues.reduce((a, b) => a + b, 0) / memberValues.length : null;
      const gPassCount = memberValues.filter((v) => v >= passThreshold).length;
      const gPassPct = memberValues.length > 0 ? (gPassCount / memberValues.length) * 100 : null;
      return { groupId: fg.id, groupName: fg.name, color: fg.color, avg: gAvg, passPct: gPassPct };
    });

    return { assignmentId: assignment.id, avg, passPct, groupStats };
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface AssignmentGridProps {
  sectionId: number | "all" | null;
  pendingNewAssignment?: Assignment | null;
  onPendingConsumed?: () => void;
}

export function AssignmentGrid({ sectionId, pendingNewAssignment, onPendingConsumed }: AssignmentGridProps) {
  const { groupBy, setGroupBy } = useUIStore();
  const isAllSections = sectionId === "all";
  const numericSectionId = isAllSections ? null : sectionId;

  // Data fetching — falls back to mock data when hooks return empty
  const { data: apiStudents } = useStudents(numericSectionId);
  const { data: apiAssignments } = useAssignments(numericSectionId);
  const { data: apiFocusGroups } = useFocusGroups(numericSectionId);
  const updateScore = useUpdateScore();
  const createFocusGroup = useCreateFocusGroup();

  const useMock = !sectionId || (!apiStudents?.length && !apiAssignments?.length);

  // Build students — in "all" mode, combine all mock sections
  const students = useMemo(() => {
    if (!useMock) return apiStudents ?? [];
    if (isAllSections) {
      return Object.values(MOCK_SECTION_MAP).flatMap((s) => s.students);
    }
    return MOCK_SECTION_MAP[numericSectionId ?? 1]?.students ?? MOCK_STUDENTS;
  }, [useMock, isAllSections, numericSectionId, apiStudents]);

  const [localAssignments, setLocalAssignments] = useState(MOCK_ASSIGNMENTS);
  const assignments = useMock ? localAssignments : apiAssignments ?? [];
  const [localFocusGroups, setLocalFocusGroups] = useState(MOCK_FOCUS_GROUPS);
  const focusGroups = useMock ? localFocusGroups : apiFocusGroups ?? [];
  const allScores = useMock ? MOCK_SCORES : [];
  const assignmentGroups = MOCK_GROUPS;

  // Local score state for optimistic updates in mock mode
  const [localScores, setLocalScores] = useState<StudentScore[]>(MOCK_SCORES);
  const effectiveScores = useMock ? localScores : allScores;

  const scoresByStudent = useMemo(
    () => buildScoreMap(effectiveScores),
    [effectiveScores]
  );

  const rows = useMemo(() => {
    if (isAllSections && useMock) {
      return Object.entries(MOCK_SECTION_MAP).flatMap(([, sec]) =>
        buildStudentRows(sec.students, scoresByStudent, focusGroups, sec.name)
      );
    }
    const secName = numericSectionId ? MOCK_SECTION_MAP[numericSectionId]?.name : undefined;
    return buildStudentRows(students, scoresByStudent, focusGroups, useMock ? secName : undefined);
  }, [students, scoresByStudent, focusGroups, isAllSections, useMock, numericSectionId]);

  // Sort assignments by grouping
  const sortedAssignments = useMemo(
    () => sortAssignmentsByGroup(assignments, groupBy),
    [assignments, groupBy]
  );

  // Compute column groups for header
  const columnGroups = useMemo(
    () => computeColumnGroups(sortedAssignments, groupBy, MOCK_STANDARDS),
    [sortedAssignments, groupBy]
  );

  // Summary data
  const summaryData = useMemo(
    () => computeSummaries(sortedAssignments, rows, focusGroups),
    [sortedAssignments, rows, focusGroups]
  );

  // Table state
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [expanded, setExpanded] = useState<ExpandedState>({});

  // Filter toggles
  const [mlFilter, setMlFilter] = useState(false);
  const [dlFilter, setDlFilter] = useState(false);
  const [focusGroupFilters, setFocusGroupFilters] = useState<string[]>([]);
  const [showFocusGroupMenu, setShowFocusGroupMenu] = useState(false);

  // Notes row toggle
  const [showNotes, setShowNotes] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editingNoteText, setEditingNoteText] = useState("");

  // New group form state
  const [showNewGroupForm, setShowNewGroupForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupColor, setNewGroupColor] = useState("#6366f1");

  // Sync toggle state into column filters
  React.useEffect(() => {
    setColumnFilters((prev) => {
      const without = prev.filter(
        (f) => f.id !== "is_ml" && f.id !== "is_dl" && f.id !== "focus_groups"
      );
      const next = [...without];
      if (mlFilter) next.push({ id: "is_ml", value: true });
      if (dlFilter) next.push({ id: "is_dl", value: true });
      if (focusGroupFilters.length > 0)
        next.push({ id: "focus_groups", value: focusGroupFilters });
      return next;
    });
  }, [mlFilter, dlFilter, focusGroupFilters]);

  // Handle score save
  const handleScoreSave = useCallback(
    (assignmentId: number, studentId: number, newScore: number | null, notes: string | null) => {
      if (useMock) {
        setLocalScores((prev) => {
          const idx = prev.findIndex(
            (s) => s.assignment_id === assignmentId && s.student_id === studentId
          );
          if (idx >= 0) {
            const updated = [...prev];
            updated[idx] = { ...updated[idx], override_score: newScore, notes };
            return updated;
          }
          return [
            ...prev,
            {
              id: Date.now(),
              assignment_id: assignmentId,
              student_id: studentId,
              score: newScore,
              override_score: null,
              notes,
              edited_by_teacher_id: null,
              created_at: "",
              updated_at: "",
            },
          ];
        });
      } else {
        updateScore.mutate({
          assignmentId,
          studentId,
          override_score: newScore,
          notes,
        });
      }
    },
    [useMock, updateScore]
  );

  // Handle creating a new focus group
  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return;
    if (useMock) {
      const newGroup: FocusGroup = {
        id: Date.now(),
        name: newGroupName.trim(),
        section_id: numericSectionId ?? 1,
        teacher_id: 1,
        color: newGroupColor,
        created_at: "",
        member_ids: [],
      };
      setLocalFocusGroups((prev) => [...prev, newGroup]);
    } else if (numericSectionId) {
      createFocusGroup.mutate({
        name: newGroupName.trim(),
        section_id: numericSectionId,
        color: newGroupColor,
      });
    }
    setNewGroupName("");
    setNewGroupColor("#6366f1");
    setShowNewGroupForm(false);
  };

  // Handle saving an assignment note
  const handleNoteSave = useCallback(
    (assignmentId: number, noteText: string) => {
      if (useMock) {
        setLocalAssignments((prev) =>
          prev.map((a) =>
            a.id === assignmentId ? { ...a, notes: noteText || null } : a
          )
        );
      } else {
        // In real mode, PUT /assignments/{id} with updated notes
        api.put(`/assignments/${assignmentId}`, { notes: noteText || null }).catch(() => {});
      }
      setEditingNoteId(null);
      setEditingNoteText("");
    },
    [useMock]
  );

  // Consume pending new assignment from parent
  React.useEffect(() => {
    if (pendingNewAssignment) {
      if (useMock) {
        setLocalAssignments((prev) => [...prev, pendingNewAssignment]);
      }
      onPendingConsumed?.();
    }
  }, [pendingNewAssignment, useMock, onPendingConsumed]);

  // Delete assignment handler
  const deleteAssignmentMutation = useDeleteAssignment();
  const handleDeleteAssignment = useCallback(
    (assignmentId: number) => {
      if (useMock) {
        setLocalAssignments((prev) => prev.filter((a) => a.id !== assignmentId));
        setLocalScores((prev) => prev.filter((s) => s.assignment_id !== assignmentId));
      } else {
        deleteAssignmentMutation.mutate(assignmentId);
      }
    },
    [useMock, deleteAssignmentMutation]
  );

  // Build columns
  const fixedColumnCount = isAllSections ? 6 : 5; // expand, name, [section], ML, DL, groups

  const columns = useMemo(() => {
    const cols = [
      // Expand control
      columnHelper.display({
        id: "expand",
        size: 36,
        header: () => null,
        cell: ({ row }) => (
          <button
            onClick={() => row.toggleExpanded()}
            className="p-1 rounded hover:bg-gray-200 transition-colors text-gray-500"
            aria-label={row.getIsExpanded() ? "Collapse row" : "Expand row"}
          >
            {row.getIsExpanded() ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        ),
      }),

      // Student name — sticky
      columnHelper.accessor((row) => `${row.student.last_name}, ${row.student.first_name}`, {
        id: "student_name",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 font-semibold text-left w-full hover:text-indigo-700 transition-colors"
            onClick={() => column.toggleSorting()}
          >
            Student
            {column.getIsSorted() === "asc" ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : column.getIsSorted() === "desc" ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 opacity-0 group-hover:opacity-30" />
            )}
          </button>
        ),
        cell: (info) => (
          <span className="font-medium text-gray-900 whitespace-nowrap">
            {info.getValue()}
          </span>
        ),
        size: 200,
        enableSorting: true,
        filterFn: "includesString",
      }),

      // Section column (only in "All Sections" mode)
      ...(isAllSections
        ? [
            columnHelper.accessor((row) => row.sectionName ?? "", {
              id: "section_name",
              header: ({ column }) => (
                <button
                  className="flex items-center gap-1 font-semibold text-left w-full hover:text-indigo-700 transition-colors text-xs"
                  onClick={() => column.toggleSorting()}
                >
                  Section
                  {column.getIsSorted() === "asc" ? (
                    <ChevronUp className="h-3.5 w-3.5" />
                  ) : column.getIsSorted() === "desc" ? (
                    <ChevronDown className="h-3.5 w-3.5" />
                  ) : null}
                </button>
              ),
              cell: (info) => (
                <span className="text-xs text-gray-600 whitespace-nowrap">
                  {info.getValue()}
                </span>
              ),
              size: 180,
              enableSorting: true,
            }),
          ]
        : []),

      // ML badge
      columnHelper.accessor((row) => row.student.is_ml, {
        id: "is_ml",
        header: () => (
          <span className="text-xs font-semibold text-gray-500 uppercase">ML</span>
        ),
        cell: (info) =>
          info.getValue() ? (
            <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-[10px] px-1.5 py-0">
              ML
            </Badge>
          ) : null,
        size: 48,
        filterFn: booleanFilter,
        enableSorting: false,
      }),

      // DL badge
      columnHelper.accessor((row) => row.student.is_dl, {
        id: "is_dl",
        header: () => (
          <span className="text-xs font-semibold text-gray-500 uppercase">DL</span>
        ),
        cell: (info) =>
          info.getValue() ? (
            <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-[10px] px-1.5 py-0">
              DL
            </Badge>
          ) : null,
        size: 48,
        filterFn: booleanFilter,
        enableSorting: false,
      }),

      // Focus group chips
      columnHelper.accessor((row) => row.focusGroups, {
        id: "focus_groups",
        header: () => (
          <span className="text-xs font-semibold text-gray-500 uppercase">Groups</span>
        ),
        cell: (info) => {
          const groups = info.getValue();
          if (!groups.length) return null;
          const focusGroupColors = new Map(
            focusGroups.map((g) => [g.name, g.color])
          );
          return (
            <div className="flex flex-wrap gap-0.5">
              {groups.map((name) => (
                <span
                  key={name}
                  className="inline-block px-1.5 py-0 text-[10px] font-medium rounded-full text-white whitespace-nowrap"
                  style={{ backgroundColor: focusGroupColors.get(name) ?? "#6b7280" }}
                  title={name}
                >
                  {name.length > 12 ? name.slice(0, 11) + "\u2026" : name}
                </span>
              ))}
            </div>
          );
        },
        size: 160,
        filterFn: focusGroupFilter,
        enableSorting: false,
      }),

      // One column per assignment (sorted by group)
      ...sortedAssignments.map((assignment) => {
        const standard = MOCK_STANDARDS.find((s) => s.id === assignment.standard_id);
        return columnHelper.display({
          id: `asgn_${assignment.id}`,
          header: ({ column }) => (
            <div className="flex flex-col items-center w-full text-center">
              <button
                className="flex flex-col items-center w-full hover:text-indigo-700 transition-colors"
                onClick={() => column.toggleSorting()}
              >
                <span className="text-xs font-semibold leading-tight truncate max-w-[80px]" title={assignment.title}>
                  {assignment.title}
                </span>
                <span className="text-[10px] text-gray-400 font-normal">
                  /{assignment.max_score}
                </span>
                {standard && (
                  <Badge className="mt-0.5 bg-gray-100 text-gray-600 border-gray-200 text-[9px] px-1 py-0 font-mono">
                    {standard.code}
                  </Badge>
                )}
              </button>
              <div className="flex items-center gap-1 mt-0.5">
                {assignment.notes && (
                  <span title="Has notes">
                    <StickyNote className="h-3 w-3 text-amber-500" />
                  </span>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Delete "${assignment.title}"?`)) {
                      handleDeleteAssignment(assignment.id);
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-100 text-gray-400 hover:text-red-600 transition-all"
                  title="Delete assignment"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ),
          cell: ({ row }) => {
            const scoreRecord = row.original.scores[assignment.id];
            return (
              <ScoreCell
                score={scoreRecord?.score ?? null}
                overrideScore={scoreRecord?.override_score ?? null}
                maxScore={assignment.max_score}
                notes={scoreRecord?.notes ?? null}
                onSave={(newScore, notes) =>
                  handleScoreSave(assignment.id, row.original.student.id, newScore, notes)
                }
              />
            );
          },
          size: 88,
          enableSorting: true,
          sortingFn: (rowA: Row<StudentRow>, rowB: Row<StudentRow>) => {
            const scoreA = rowA.original.scores[assignment.id];
            const scoreB = rowB.original.scores[assignment.id];
            const valA = scoreA?.override_score ?? scoreA?.score ?? -1;
            const valB = scoreB?.override_score ?? scoreB?.score ?? -1;
            return valA - valB;
          },
        });
      }),
    ];
    return cols;
  }, [sortedAssignments, focusGroups, handleScoreSave, handleDeleteAssignment, isAllSections]);

  // Table instance
  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting, columnFilters, globalFilter, expanded },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    globalFilterFn: (row, _columnId, filterValue: string) => {
      const name = `${row.original.student.first_name} ${row.original.student.last_name}`;
      return name.toLowerCase().includes(filterValue.toLowerCase());
    },
    getRowCanExpand: () => true,
  });

  const activeFilterCount =
    (mlFilter ? 1 : 0) + (dlFilter ? 1 : 0) + focusGroupFilters.length;

  // Compute sticky column widths for summary rows
  const stickyColWidths = useMemo(() => {
    const widths: number[] = [];
    for (let i = 0; i < fixedColumnCount; i++) {
      const col = table.getAllColumns()[i];
      widths.push(col?.getSize() ?? 0);
    }
    return widths;
  }, [table, fixedColumnCount]);

  const totalFixedWidth = stickyColWidths.reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col h-full">
      {/* ---- Toolbar ---- */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 bg-white flex-shrink-0 flex-wrap">
        {/* Search */}
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search students..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
          {globalFilter && (
            <button
              onClick={() => setGlobalFilter("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="h-6 w-px bg-gray-200" />

        {/* ML toggle */}
        <Button
          variant={mlFilter ? "default" : "outline"}
          size="sm"
          onClick={() => setMlFilter((prev) => !prev)}
          className={cn("gap-1.5 text-xs", mlFilter && "bg-blue-600 hover:bg-blue-700")}
        >
          <Languages className="h-3.5 w-3.5" />
          ML
        </Button>

        {/* DL toggle */}
        <Button
          variant={dlFilter ? "default" : "outline"}
          size="sm"
          onClick={() => setDlFilter((prev) => !prev)}
          className={cn("gap-1.5 text-xs", dlFilter && "bg-purple-600 hover:bg-purple-700")}
        >
          <Globe2 className="h-3.5 w-3.5" />
          DL
        </Button>

        {/* Focus group dropdown */}
        <div className="relative">
          <Button
            variant={focusGroupFilters.length > 0 ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFocusGroupMenu((prev) => !prev)}
            className={cn(
              "gap-1.5 text-xs",
              focusGroupFilters.length > 0 && "bg-indigo-600 hover:bg-indigo-700"
            )}
          >
            <Filter className="h-3.5 w-3.5" />
            Groups
            {focusGroupFilters.length > 0 && (
              <span className="ml-1 bg-white/20 rounded-full px-1.5 text-[10px]">
                {focusGroupFilters.length}
              </span>
            )}
          </Button>
          {showFocusGroupMenu && (
            <div className="absolute top-full left-0 mt-1 z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[180px]">
              {focusGroups.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500">No groups</div>
              ) : (
                focusGroups.map((group) => {
                  const active = focusGroupFilters.includes(group.name);
                  return (
                    <button
                      key={group.id}
                      className={cn(
                        "flex items-center gap-2 w-full px-3 py-1.5 text-sm text-left hover:bg-gray-50 transition-colors",
                        active && "bg-indigo-50"
                      )}
                      onClick={() => {
                        setFocusGroupFilters((prev) =>
                          active
                            ? prev.filter((n) => n !== group.name)
                            : [...prev, group.name]
                        );
                      }}
                    >
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0 border-2"
                        style={{
                          backgroundColor: active ? group.color : "transparent",
                          borderColor: group.color,
                        }}
                      />
                      <span className="truncate">{group.name}</span>
                    </button>
                  );
                })
              )}
              {focusGroupFilters.length > 0 && (
                <>
                  <div className="border-t border-gray-100 my-1" />
                  <button
                    className="w-full px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 text-left"
                    onClick={() => setFocusGroupFilters([])}
                  >
                    Clear all
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* New Group button */}
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowNewGroupForm((prev) => !prev)}
            className="gap-1.5 text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            New Group
          </Button>
          {showNewGroupForm && (
            <div className="absolute top-full left-0 mt-1 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-3 min-w-[240px]">
              <div className="space-y-3">
                <Input
                  placeholder="Group name..."
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="h-8 text-sm"
                  autoFocus
                />
                <div className="flex gap-1.5">
                  {GROUP_COLOR_PRESETS.map((color) => (
                    <button
                      key={color}
                      className={cn(
                        "w-6 h-6 rounded-full border-2 transition-transform",
                        newGroupColor === color
                          ? "border-gray-800 scale-110"
                          : "border-transparent hover:scale-105"
                      )}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewGroupColor(color)}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 h-7 text-xs"
                    onClick={handleCreateGroup}
                    disabled={!newGroupName.trim()}
                  >
                    Create
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => {
                      setShowNewGroupForm(false);
                      setNewGroupName("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-gray-200" />

        {/* Group by dropdown */}
        <div className="flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5 text-gray-400" />
          <Select value={groupBy} onValueChange={(v) => setGroupBy(v as "none" | "date" | "standard")}>
            <SelectTrigger className="w-36 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Grouping</SelectItem>
              <SelectItem value="date">Group by Date</SelectItem>
              <SelectItem value="standard">Group by Standard</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Notes toggle */}
        <Button
          variant={showNotes ? "default" : "outline"}
          size="sm"
          onClick={() => setShowNotes((prev) => !prev)}
          className={cn("gap-1.5 text-xs", showNotes && "bg-amber-600 hover:bg-amber-700")}
        >
          <StickyNote className="h-3.5 w-3.5" />
          Notes
        </Button>

        {/* Active filter count */}
        {activeFilterCount > 0 && (
          <button
            onClick={() => {
              setMlFilter(false);
              setDlFilter(false);
              setFocusGroupFilters([]);
              setGlobalFilter("");
            }}
            className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 ml-1"
          >
            <X className="h-3 w-3" />
            Clear filters
          </button>
        )}

        {/* Row count */}
        <div className="ml-auto text-xs text-gray-500 tabular-nums">
          {table.getFilteredRowModel().rows.length} of {rows.length} students
        </div>
      </div>

      {/* ---- Close menus on outside click ---- */}
      {(showFocusGroupMenu || showNewGroupForm) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowFocusGroupMenu(false);
            setShowNewGroupForm(false);
          }}
        />
      )}

      {/* ---- Grid ---- */}
      <div className="flex-1 overflow-auto relative">
        <table className="w-full border-collapse text-sm">
          {/* Sticky header */}
          <thead className="sticky top-0 z-20 bg-gray-50 border-b-2 border-gray-200">
            {/* Group header row (when grouping is active) */}
            {columnGroups.length > 0 && (
              <tr>
                {/* Fixed columns span */}
                <th
                  colSpan={fixedColumnCount}
                  className="h-7 px-2 text-left text-xs font-semibold text-gray-500 bg-gray-50 sticky left-0 z-30 border-r border-gray-200"
                >
                  {groupBy === "date" ? "Date" : "Standard"}
                </th>
                {/* Group spans */}
                {columnGroups.map((group, i) => (
                  <th
                    key={i}
                    colSpan={group.colSpan}
                    className={cn(
                      "h-7 px-2 text-center text-xs font-semibold border-r border-gray-200 last:border-r-0",
                      group.colorClass
                    )}
                  >
                    {group.label}
                  </th>
                ))}
              </tr>
            )}

            {/* Normal column headers */}
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header, idx) => {
                  const isSticky = idx <= 1;
                  const stickyLeft = idx === 0 ? 0 : idx === 1 ? 36 : undefined;
                  return (
                    <th
                      key={header.id}
                      className={cn(
                        "h-10 px-2 text-left text-xs font-semibold text-gray-600 border-r border-gray-200 last:border-r-0 group whitespace-nowrap",
                        isSticky && "sticky bg-gray-50 z-30",
                        idx === 1 && "shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)]"
                      )}
                      style={{
                        width: header.getSize(),
                        minWidth: header.getSize(),
                        ...(isSticky ? { left: stickyLeft } : {}),
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          {/* Summary rows */}
          <tbody className="border-b-2 border-gray-300">
            {/* All Students summary */}
            <tr className="bg-gray-100 font-semibold text-xs">
              <td
                colSpan={fixedColumnCount}
                className="px-2 h-8 text-gray-700 sticky left-0 z-10 bg-gray-100 border-r border-gray-200"
              >
                All Students
              </td>
              {sortedAssignments.map((a) => {
                const stats = summaryData.find((s) => s.assignmentId === a.id);
                return (
                  <td key={a.id} className="px-1 h-8 text-center border-r border-gray-200 last:border-r-0" style={{ width: 88, minWidth: 88 }}>
                    <div className={cn(
                      "text-[11px] font-bold",
                      stats?.passPct != null && stats.passPct >= 70 ? "text-green-700" : stats?.passPct != null && stats.passPct >= 50 ? "text-amber-700" : "text-red-700"
                    )}>
                      {stats?.passPct != null ? `${stats.passPct.toFixed(0)}% pass` : "—"}
                    </div>
                    <div className="text-[10px] text-gray-500">
                      {stats?.avg != null ? `avg ${stats.avg.toFixed(1)}` : "—"}
                    </div>
                  </td>
                );
              })}
            </tr>
            {/* Per-group summary rows */}
            {focusGroups.map((fg) => (
              <tr key={fg.id} className="text-xs" style={{ backgroundColor: `${fg.color}10` }}>
                <td
                  colSpan={fixedColumnCount}
                  className="px-2 h-7 sticky left-0 z-10 border-r border-gray-200"
                  style={{ backgroundColor: `${fg.color}10` }}
                >
                  <span
                    className="inline-block w-2 h-2 rounded-full mr-1.5"
                    style={{ backgroundColor: fg.color }}
                  />
                  <span className="font-medium text-gray-700">{fg.name}</span>
                </td>
                {sortedAssignments.map((a) => {
                  const stats = summaryData.find((s) => s.assignmentId === a.id);
                  const gs = stats?.groupStats.find((g) => g.groupId === fg.id);
                  return (
                    <td key={a.id} className="px-1 h-7 text-center border-r border-gray-200 last:border-r-0" style={{ width: 88, minWidth: 88 }}>
                      <span className={cn(
                        "font-medium",
                        gs?.passPct != null && gs.passPct >= 70 ? "text-green-700" : gs?.passPct != null && gs.passPct >= 50 ? "text-amber-700" : "text-red-700"
                      )}>
                        {gs?.passPct != null ? `${gs.passPct.toFixed(0)}%` : "—"}
                      </span>
                      <span className="text-gray-400 ml-1">
                        {gs?.avg != null ? `(${gs.avg.toFixed(1)})` : ""}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
            {/* Assignment notes row */}
            {showNotes && (
              <tr className="bg-amber-50/60 text-xs">
                <td
                  colSpan={fixedColumnCount}
                  className="px-2 h-8 sticky left-0 z-10 bg-amber-50/60 border-r border-gray-200"
                >
                  <div className="flex items-center gap-1.5 text-amber-700 font-medium">
                    <StickyNote className="h-3 w-3" />
                    Notes
                  </div>
                </td>
                {sortedAssignments.map((a) => (
                  <td
                    key={a.id}
                    className="px-1 border-r border-gray-200 last:border-r-0 align-top"
                    style={{ width: 88, minWidth: 88 }}
                  >
                    {editingNoteId === a.id ? (
                      <textarea
                        className="w-full min-h-[48px] max-h-[120px] text-[11px] p-1 border border-amber-300 rounded bg-white resize-y focus:outline-none focus:ring-1 focus:ring-amber-400"
                        value={editingNoteText}
                        onChange={(e) => setEditingNoteText(e.target.value)}
                        onBlur={() => handleNoteSave(a.id, editingNoteText)}
                        onKeyDown={(e) => {
                          if (e.key === "Escape") {
                            setEditingNoteId(null);
                            setEditingNoteText("");
                          }
                        }}
                        autoFocus
                      />
                    ) : (
                      <button
                        className={cn(
                          "w-full text-left text-[11px] p-1 rounded hover:bg-amber-100 transition-colors min-h-[28px]",
                          a.notes ? "text-gray-700" : "text-gray-400 italic"
                        )}
                        onClick={() => {
                          setEditingNoteId(a.id);
                          setEditingNoteText(a.notes ?? "");
                        }}
                        title={a.notes ?? "Click to add a note"}
                      >
                        {a.notes ? (
                          <span className="line-clamp-3">{a.notes}</span>
                        ) : (
                          "Add note..."
                        )}
                      </button>
                    )}
                  </td>
                ))}
              </tr>
            )}
          </tbody>

          {/* Data rows */}
          <tbody>
            {table.getRowModel().rows.map((row, rowIdx) => (
              <React.Fragment key={row.id}>
                <tr
                  className={cn(
                    "h-10 group/row transition-colors",
                    rowIdx % 2 === 0 ? "bg-white" : "bg-gray-50/50",
                    "hover:bg-indigo-50/40",
                    row.getIsExpanded() && "bg-indigo-50/30"
                  )}
                >
                  {row.getVisibleCells().map((cell, cellIdx) => {
                    const isSticky = cellIdx <= 1;
                    const stickyLeft = cellIdx === 0 ? 0 : cellIdx === 1 ? 36 : undefined;
                    return (
                      <td
                        key={cell.id}
                        className={cn(
                          "h-10 px-2 border-r border-gray-100 last:border-r-0",
                          isSticky && "sticky z-10",
                          isSticky && (rowIdx % 2 === 0 ? "bg-white" : "bg-gray-50/50"),
                          isSticky && "group-hover/row:bg-indigo-50/40",
                          cellIdx === 1 && "shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]",
                          row.getIsExpanded() && isSticky && "bg-indigo-50/30"
                        )}
                        style={{
                          width: cell.column.getSize(),
                          minWidth: cell.column.getSize(),
                          ...(isSticky ? { left: stickyLeft } : {}),
                        }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    );
                  })}
                </tr>

                {/* Expanded sub-row */}
                {row.getIsExpanded() && (
                  <tr>
                    <td
                      colSpan={row.getVisibleCells().length}
                      className="p-0"
                    >
                      <StandardExpandRow
                        studentId={row.original.student.id}
                        groups={assignmentGroups}
                        scores={row.original.scores}
                        assignments={sortedAssignments}
                      />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}

            {table.getRowModel().rows.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="h-32 text-center text-sm text-gray-500"
                >
                  {globalFilter || activeFilterCount > 0
                    ? "No students match the current filters."
                    : "No students found for this section."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
