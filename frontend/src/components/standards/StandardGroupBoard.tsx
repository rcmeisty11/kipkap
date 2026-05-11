import React, { useState } from "react";
import {
  DndContext,
  closestCorners,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { Plus, GripVertical, X, BookOpen } from "lucide-react";
import type { Assignment, AssignmentGroup, Standard } from "@/types";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_STANDARDS: Standard[] = [
  { id: 1, code: "RL.3.1", description: "Ask and answer questions to demonstrate understanding of a text, referring explicitly to the text as the basis for the answers.", subject: "ELA", grade_level: "3", framework: "CCSS" },
  { id: 2, code: "RL.3.2", description: "Recount stories, including fables, folktales, and myths from diverse cultures; determine the central message, lesson, or moral.", subject: "ELA", grade_level: "3", framework: "CCSS" },
  { id: 3, code: "W.3.4", description: "With guidance and support from adults, produce writing in which the development and organization are appropriate to task and purpose.", subject: "ELA", grade_level: "3", framework: "CCSS" },
];

interface MockAssignment extends Assignment {
  avg_score?: number;
  group_id: number | null;
}

const INITIAL_ASSIGNMENTS: MockAssignment[] = [
  { id: 1, title: "Chapter 3 Comprehension Quiz", subject: "ELA", max_score: 100, due_date: "2026-05-12", illuminate_id: null, section_id: 1, teacher_id: 1, created_at: "", updated_at: "", avg_score: 82, group_id: 1 },
  { id: 2, title: "Text Evidence Practice", subject: "ELA", max_score: 50, due_date: "2026-05-08", illuminate_id: null, section_id: 1, teacher_id: 1, created_at: "", updated_at: "", avg_score: 74, group_id: 1 },
  { id: 3, title: "Central Message Worksheet", subject: "ELA", max_score: 30, due_date: "2026-05-10", illuminate_id: null, section_id: 1, teacher_id: 1, created_at: "", updated_at: "", avg_score: 91, group_id: 2 },
  { id: 4, title: "Fable Analysis Essay", subject: "ELA", max_score: 100, due_date: "2026-05-15", illuminate_id: null, section_id: 1, teacher_id: 1, created_at: "", updated_at: "", avg_score: 68, group_id: 2 },
  { id: 5, title: "Myth Retelling Project", subject: "ELA", max_score: 80, due_date: "2026-05-18", illuminate_id: null, section_id: 1, teacher_id: 1, created_at: "", updated_at: "", avg_score: 77, group_id: 2 },
  { id: 6, title: "Persuasive Paragraph Draft", subject: "Writing", max_score: 50, due_date: "2026-05-14", illuminate_id: null, section_id: 1, teacher_id: 1, created_at: "", updated_at: "", avg_score: 85, group_id: 3 },
  { id: 7, title: "Narrative Writing Prompt", subject: "Writing", max_score: 100, due_date: "2026-05-20", illuminate_id: null, section_id: 1, teacher_id: 1, created_at: "", updated_at: "", avg_score: 72, group_id: 3 },
  { id: 8, title: "Vocabulary Unit 5 Test", subject: "ELA", max_score: 40, due_date: "2026-05-09", illuminate_id: null, section_id: 1, teacher_id: 1, created_at: "", updated_at: "", avg_score: 88, group_id: null },
  { id: 9, title: "Reading Log Week 12", subject: "ELA", max_score: 20, due_date: "2026-05-11", illuminate_id: null, section_id: 1, teacher_id: 1, created_at: "", updated_at: "", avg_score: 95, group_id: null },
];

interface MockGroup {
  id: number;
  name: string;
  standard: Standard;
}

const INITIAL_GROUPS: MockGroup[] = [
  { id: 1, name: "RL.3.1", standard: MOCK_STANDARDS[0] },
  { id: 2, name: "RL.3.2", standard: MOCK_STANDARDS[1] },
  { id: 3, name: "W.3.4", standard: MOCK_STANDARDS[2] },
];

// ---------------------------------------------------------------------------
// Sortable assignment card
// ---------------------------------------------------------------------------

function AssignmentCard({
  assignment,
  isDragOverlay = false,
}: {
  assignment: MockAssignment;
  isDragOverlay?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: assignment.id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const scoreColor =
    (assignment.avg_score ?? 0) >= 80
      ? "bg-green-100 text-green-800"
      : (assignment.avg_score ?? 0) >= 60
      ? "bg-yellow-100 text-yellow-800"
      : "bg-red-100 text-red-800";

  const card = (
    <div
      ref={isDragOverlay ? undefined : setNodeRef}
      style={isDragOverlay ? undefined : style}
      className={cn(
        "bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-2 cursor-grab active:cursor-grabbing select-none",
        isDragging && "opacity-40",
        isDragOverlay && "shadow-lg rotate-2"
      )}
      {...(isDragOverlay ? {} : attributes)}
      {...(isDragOverlay ? {} : listeners)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {assignment.title}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            {assignment.due_date && (
              <span className="text-xs text-gray-500">
                {new Date(assignment.due_date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            )}
            {assignment.subject && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {assignment.subject}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {assignment.avg_score != null && (
            <span
              className={cn(
                "text-xs font-semibold px-2 py-0.5 rounded-full",
                scoreColor
              )}
            >
              {assignment.avg_score}%
            </span>
          )}
          <GripVertical className="h-4 w-4 text-gray-400 flex-shrink-0" />
        </div>
      </div>
    </div>
  );

  return card;
}

// ---------------------------------------------------------------------------
// Droppable column
// ---------------------------------------------------------------------------

function GroupColumn({
  groupId,
  title,
  description,
  assignments,
}: {
  groupId: string;
  title: string;
  description?: string;
  assignments: MockAssignment[];
}) {
  return (
    <div className="flex-shrink-0 w-72 flex flex-col bg-gray-50 border border-gray-200 rounded-lg">
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-gray-900">{title}</h3>
          <span className="text-xs text-gray-500 bg-gray-200 rounded-full px-2 py-0.5 font-medium">
            {assignments.length}
          </span>
        </div>
        {description && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
            {description}
          </p>
        )}
      </div>
      <div className="p-2 flex-1 overflow-y-auto min-h-[120px]">
        <SortableContext
          items={assignments.map((a) => a.id.toString())}
          strategy={verticalListSortingStrategy}
        >
          {assignments.map((a) => (
            <AssignmentCard key={a.id} assignment={a} />
          ))}
          {assignments.length === 0 && (
            <div className="flex items-center justify-center h-20 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-xs text-gray-400">Drop assignments here</p>
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main board
// ---------------------------------------------------------------------------

export default function StandardGroupBoard() {
  const [assignments, setAssignments] =
    useState<MockAssignment[]>(INITIAL_ASSIGNMENTS);
  const [groups, setGroups] = useState<MockGroup[]>(INITIAL_GROUPS);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [newGroupCode, setNewGroupCode] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const ungrouped = assignments.filter((a) => a.group_id === null);
  const activeAssignment = assignments.find(
    (a) => a.id.toString() === activeId
  );

  // Determine which column an assignment belongs to
  function findColumnId(assignmentId: string): string {
    const a = assignments.find((x) => x.id.toString() === assignmentId);
    return a?.group_id != null ? `group-${a.group_id}` : "ungrouped";
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const activeAssignmentId = parseInt(active.id as string);
    const overId = over.id as string;

    // Determine target group
    let targetGroupId: number | null = null;

    if (overId === "ungrouped" || overId.startsWith("ungrouped")) {
      targetGroupId = null;
    } else if (overId.startsWith("group-")) {
      targetGroupId = parseInt(overId.replace("group-", ""));
    } else {
      // Dropped on another assignment - find that assignment's group
      const overAssignment = assignments.find(
        (a) => a.id.toString() === overId
      );
      targetGroupId = overAssignment?.group_id ?? null;
    }

    const currentAssignment = assignments.find(
      (a) => a.id === activeAssignmentId
    );
    if (currentAssignment?.group_id === targetGroupId) return;

    setAssignments((prev) =>
      prev.map((a) =>
        a.id === activeAssignmentId ? { ...a, group_id: targetGroupId } : a
      )
    );

    // Fire API call (fire-and-forget for demo)
    api
      .put("/standards/groups/move-assignment", {
        assignment_id: activeAssignmentId,
        target_group_id: targetGroupId,
      })
      .catch(() => {
        // In demo mode the API won't exist, silently ignore
      });
  }

  function handleAddGroup() {
    if (!newGroupCode.trim()) return;
    const newId = Math.max(0, ...groups.map((g) => g.id)) + 1;
    setGroups((prev) => [
      ...prev,
      {
        id: newId,
        name: newGroupCode.trim(),
        standard: {
          id: newId + 100,
          code: newGroupCode.trim(),
          description: newGroupDesc.trim() || "New standard group",
          subject: null,
          grade_level: null,
          framework: null,
        },
      },
    ]);
    setNewGroupCode("");
    setNewGroupDesc("");
    setShowNewGroup(false);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 pr-4">
        {/* Ungrouped column */}
        <GroupColumn
          groupId="ungrouped"
          title="Ungrouped"
          description="Assignments not yet assigned to a standard"
          assignments={ungrouped}
        />

        {/* Standard group columns */}
        {groups.map((group) => {
          const groupAssignments = assignments.filter(
            (a) => a.group_id === group.id
          );
          return (
            <GroupColumn
              key={group.id}
              groupId={`group-${group.id}`}
              title={group.standard.code}
              description={group.standard.description}
              assignments={groupAssignments}
            />
          );
        })}

        {/* Add group column */}
        <div className="flex-shrink-0 w-72">
          {showNewGroup ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900">
                  New Standard Group
                </h3>
                <button
                  onClick={() => setShowNewGroup(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <Input
                placeholder="Standard code (e.g. RL.3.3)"
                value={newGroupCode}
                onChange={(e) => setNewGroupCode(e.target.value)}
                className="text-sm"
              />
              <Input
                placeholder="Description (optional)"
                value={newGroupDesc}
                onChange={(e) => setNewGroupDesc(e.target.value)}
                className="text-sm"
              />
              <Button size="sm" onClick={handleAddGroup} className="w-full">
                Create Group
              </Button>
            </div>
          ) : (
            <button
              onClick={() => setShowNewGroup(true)}
              className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span className="text-sm font-medium">Add Standard Group</span>
            </button>
          )}
        </div>
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {activeAssignment ? (
          <AssignmentCard assignment={activeAssignment} isDragOverlay />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
