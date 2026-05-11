import React, { useState } from "react";
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  useDroppable,
  useDraggable,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Plus, GripVertical, X, Users } from "lucide-react";
import type { Student, FocusGroup } from "@/types";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const PRESET_COLORS = [
  "#EF4444", // red
  "#F59E0B", // amber
  "#10B981", // emerald
  "#3B82F6", // blue
  "#8B5CF6", // violet
  "#EC4899", // pink
];

interface MockStudent extends Student {
  avg_score: number;
}

const MOCK_STUDENTS: MockStudent[] = [
  { id: 1, clever_id: "c1", school_id: 1, first_name: "Aiden", last_name: "Martinez", grade: "3", sis_id: null, is_ml: true, is_dl: false, synced_at: "", avg_score: 62 },
  { id: 2, clever_id: "c2", school_id: 1, first_name: "Bella", last_name: "Johnson", grade: "3", sis_id: null, is_ml: false, is_dl: false, synced_at: "", avg_score: 85 },
  { id: 3, clever_id: "c3", school_id: 1, first_name: "Carlos", last_name: "Rivera", grade: "3", sis_id: null, is_ml: true, is_dl: true, synced_at: "", avg_score: 54 },
  { id: 4, clever_id: "c4", school_id: 1, first_name: "Diana", last_name: "Chen", grade: "3", sis_id: null, is_ml: false, is_dl: false, synced_at: "", avg_score: 91 },
  { id: 5, clever_id: "c5", school_id: 1, first_name: "Ethan", last_name: "Williams", grade: "3", sis_id: null, is_ml: false, is_dl: true, synced_at: "", avg_score: 58 },
  { id: 6, clever_id: "c6", school_id: 1, first_name: "Fatima", last_name: "Ali", grade: "3", sis_id: null, is_ml: true, is_dl: false, synced_at: "", avg_score: 72 },
  { id: 7, clever_id: "c7", school_id: 1, first_name: "Gabriel", last_name: "Lopez", grade: "3", sis_id: null, is_ml: false, is_dl: false, synced_at: "", avg_score: 88 },
  { id: 8, clever_id: "c8", school_id: 1, first_name: "Hannah", last_name: "Kim", grade: "3", sis_id: null, is_ml: false, is_dl: false, synced_at: "", avg_score: 95 },
];

interface MockFocusGroup {
  id: number;
  name: string;
  color: string;
  member_ids: number[];
}

const INITIAL_GROUPS: MockFocusGroup[] = [
  { id: 1, name: "Tier 1 - Intensive", color: "#EF4444", member_ids: [1, 3, 5] },
  { id: 2, name: "Tier 2 - Strategic", color: "#F59E0B", member_ids: [6] },
  { id: 3, name: "Enrichment", color: "#10B981", member_ids: [4, 8] },
];

// ---------------------------------------------------------------------------
// Draggable student card
// ---------------------------------------------------------------------------

function DraggableStudentCard({
  student,
  isDragOverlay = false,
}: {
  student: MockStudent;
  isDragOverlay?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: `student-${student.id}` });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  const scoreColor =
    student.avg_score >= 80
      ? "bg-green-100 text-green-800"
      : student.avg_score >= 60
      ? "bg-yellow-100 text-yellow-800"
      : "bg-red-100 text-red-800";

  return (
    <div
      ref={isDragOverlay ? undefined : setNodeRef}
      style={isDragOverlay ? undefined : style}
      className={cn(
        "bg-white rounded-lg border border-gray-200 p-3 cursor-grab active:cursor-grabbing select-none transition-shadow",
        isDragging && "opacity-40",
        isDragOverlay && "shadow-lg"
      )}
      {...(isDragOverlay ? {} : attributes)}
      {...(isDragOverlay ? {} : listeners)}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <GripVertical className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {student.first_name} {student.last_name}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              {student.is_ml && (
                <Badge className="text-[10px] px-1.5 py-0 bg-blue-100 text-blue-800 border-blue-200">
                  ML
                </Badge>
              )}
              {student.is_dl && (
                <Badge className="text-[10px] px-1.5 py-0 bg-purple-100 text-purple-800 border-purple-200">
                  DL
                </Badge>
              )}
            </div>
          </div>
        </div>
        <span
          className={cn(
            "text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0",
            scoreColor
          )}
        >
          {student.avg_score}%
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Student card (static, for overlay)
// ---------------------------------------------------------------------------

function StudentCardOverlay({ student }: { student: MockStudent }) {
  return <DraggableStudentCard student={student} isDragOverlay />;
}

// ---------------------------------------------------------------------------
// Droppable zone
// ---------------------------------------------------------------------------

function DroppableZone({
  id,
  children,
  className,
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "transition-colors rounded-lg min-h-[80px]",
        isOver && "bg-indigo-50 ring-2 ring-indigo-300",
        className
      )}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main builder
// ---------------------------------------------------------------------------

export default function FocusGroupBuilder() {
  const [groups, setGroups] = useState<MockFocusGroup[]>(INITIAL_GROUPS);
  const [activeStudentId, setActiveStudentId] = useState<number | null>(null);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupColor, setNewGroupColor] = useState(PRESET_COLORS[0]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // Which students are assigned to any group
  const assignedStudentIds = new Set(groups.flatMap((g) => g.member_ids));
  const unassignedStudents = MOCK_STUDENTS.filter(
    (s) => !assignedStudentIds.has(s.id)
  );
  const activeStudent = MOCK_STUDENTS.find((s) => s.id === activeStudentId);

  function handleDragStart(event: DragStartEvent) {
    const id = parseInt((event.active.id as string).replace("student-", ""));
    setActiveStudentId(id);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveStudentId(null);
    if (!over) return;

    const studentId = parseInt((active.id as string).replace("student-", ""));
    const targetId = over.id as string;

    // Remove student from any current group
    let updatedGroups = groups.map((g) => ({
      ...g,
      member_ids: g.member_ids.filter((id) => id !== studentId),
    }));

    if (targetId === "all-students") {
      // Just remove from all groups (already done above)
      setGroups(updatedGroups);
      return;
    }

    if (targetId.startsWith("focus-group-")) {
      const groupId = parseInt(targetId.replace("focus-group-", ""));
      updatedGroups = updatedGroups.map((g) =>
        g.id === groupId
          ? { ...g, member_ids: [...g.member_ids, studentId] }
          : g
      );
    }

    setGroups(updatedGroups);
  }

  function handleCreateGroup() {
    if (!newGroupName.trim()) return;
    const newId = Math.max(0, ...groups.map((g) => g.id)) + 1;
    setGroups((prev) => [
      ...prev,
      { id: newId, name: newGroupName.trim(), color: newGroupColor, member_ids: [] },
    ]);
    setNewGroupName("");
    setNewGroupColor(PRESET_COLORS[0]);
    setShowNewGroup(false);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 h-full overflow-hidden">
        {/* Left panel: All Students */}
        <div className="w-72 flex-shrink-0 flex flex-col border border-gray-200 rounded-lg bg-white overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-600" />
                <h3 className="text-sm font-bold text-gray-900">
                  All Students
                </h3>
              </div>
              <span className="text-xs text-gray-500 bg-gray-200 rounded-full px-2 py-0.5 font-medium">
                {unassignedStudents.length}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Unassigned students
            </p>
          </div>
          <DroppableZone id="all-students" className="flex-1 overflow-y-auto p-3 space-y-2">
            {unassignedStudents.map((student) => (
              <DraggableStudentCard key={student.id} student={student} />
            ))}
            {unassignedStudents.length === 0 && (
              <div className="flex items-center justify-center h-20 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-xs text-gray-400">All students assigned</p>
              </div>
            )}
          </DroppableZone>
        </div>

        {/* Right panel: Focus group columns */}
        <div className="flex-1 flex gap-4 overflow-x-auto">
          {groups.map((group) => {
            const members = MOCK_STUDENTS.filter((s) =>
              group.member_ids.includes(s.id)
            );
            return (
              <div
                key={group.id}
                className="w-72 flex-shrink-0 flex flex-col border border-gray-200 rounded-lg bg-white overflow-hidden"
              >
                {/* Color-coded header */}
                <div
                  className="h-1.5"
                  style={{ backgroundColor: group.color }}
                />
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-900">
                      {group.name}
                    </h3>
                    <span className="text-xs text-gray-500 bg-gray-200 rounded-full px-2 py-0.5 font-medium">
                      {members.length}
                    </span>
                  </div>
                </div>
                <DroppableZone
                  id={`focus-group-${group.id}`}
                  className="flex-1 overflow-y-auto p-3 space-y-2"
                >
                  {members.map((student) => (
                    <DraggableStudentCard
                      key={student.id}
                      student={student}
                    />
                  ))}
                  {members.length === 0 && (
                    <div className="flex items-center justify-center h-20 border-2 border-dashed border-gray-300 rounded-lg">
                      <p className="text-xs text-gray-400">
                        Drop students here
                      </p>
                    </div>
                  )}
                </DroppableZone>
              </div>
            );
          })}

          {/* New group */}
          <div className="w-72 flex-shrink-0">
            {showNewGroup ? (
              <div className="border border-gray-200 rounded-lg bg-white p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900">
                    New Focus Group
                  </h3>
                  <button
                    onClick={() => setShowNewGroup(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <Input
                  placeholder="Group name"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="text-sm"
                />
                <div>
                  <p className="text-xs text-gray-500 mb-2">Color</p>
                  <div className="flex gap-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setNewGroupColor(color)}
                        className={cn(
                          "w-7 h-7 rounded-full border-2 transition-all",
                          newGroupColor === color
                            ? "border-gray-900 scale-110"
                            : "border-transparent"
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <Button size="sm" onClick={handleCreateGroup} className="w-full">
                  Create Group
                </Button>
              </div>
            ) : (
              <button
                onClick={() => setShowNewGroup(true)}
                className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span className="text-sm font-medium">New Group</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {activeStudent ? <StudentCardOverlay student={activeStudent} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
