import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AssignmentGrid } from "@/components/assignments/AssignmentGrid";
import { useUIStore } from "@/store/ui";
import { useSections } from "@/hooks/useStudents";
import { useCreateAssignment } from "@/hooks/useAssignments";
import type { Assignment, Section, Standard } from "@/types";

// Demo sections for when the API is unavailable
const DEMO_SECTIONS: Section[] = [
  { id: 1, clever_id: "sec1", school_id: 1, teacher_id: 1, name: "4th Grade Math — Period 1", subject: "Math", grade: "4", sis_id: null, synced_at: "" },
  { id: 2, clever_id: "sec2", school_id: 1, teacher_id: 1, name: "4th Grade Math — Period 3", subject: "Math", grade: "4", sis_id: null, synced_at: "" },
  { id: 3, clever_id: "sec3", school_id: 1, teacher_id: 1, name: "4th Grade ELA — Period 2", subject: "ELA", grade: "4", sis_id: null, synced_at: "" },
];

const MOCK_STANDARDS: Standard[] = [
  { id: 1, code: "NBT.4", description: "Multi-digit Arithmetic", subject: "Math", grade_level: "4", framework: "CCSS" },
  { id: 2, code: "RL.3.1", description: "Ask and answer questions", subject: "ELA", grade_level: "3", framework: "CCSS" },
  { id: 3, code: "RL.3.2", description: "Recount stories and determine central message", subject: "ELA", grade_level: "3", framework: "CCSS" },
  { id: 4, code: "W.3.4", description: "Produce writing for task, purpose, and audience", subject: "ELA", grade_level: "3", framework: "CCSS" },
  { id: 5, code: "OA.2", description: "Problem Solving with Operations", subject: "Math", grade_level: "4", framework: "CCSS" },
];

export function AssignmentsPage() {
  const navigate = useNavigate();
  const { selectedSectionId, setSelectedSection } = useUIStore();
  const { data: apiSections } = useSections();
  const createAssignment = useCreateAssignment();

  const sections = apiSections?.length ? apiSections : DEMO_SECTIONS;

  // Auto-select the first section if none is chosen
  React.useEffect(() => {
    if (!selectedSectionId && sections.length > 0) {
      setSelectedSection(sections[0].id);
    }
  }, [selectedSectionId, sections, setSelectedSection]);

  // Pending assignment for mock mode
  const [pendingAssignment, setPendingAssignment] = useState<Assignment | null>(null);

  // New assignment dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTab, setDialogTab] = useState<"create" | "import">("create");
  const [newTitle, setNewTitle] = useState("");
  const [newMaxScore, setNewMaxScore] = useState("100");
  const [newDueDate, setNewDueDate] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newStandardId, setNewStandardId] = useState<string>("");

  const currentSection = selectedSectionId !== "all"
    ? sections.find((s) => s.id === selectedSectionId)
    : null;

  const handleCreateAssignment = () => {
    if (!newTitle.trim() || !selectedSectionId || selectedSectionId === "all") return;

    const assignmentData = {
      title: newTitle.trim(),
      max_score: parseInt(newMaxScore) || 100,
      due_date: newDueDate || undefined,
      subject: newSubject || undefined,
      section_id: selectedSectionId,
      standard_id: newStandardId ? parseInt(newStandardId) : undefined,
    };

    // Always create a mock assignment for immediate UI feedback
    const mockAssignment: Assignment = {
      id: Date.now(),
      title: assignmentData.title,
      subject: assignmentData.subject ?? null,
      max_score: assignmentData.max_score,
      due_date: assignmentData.due_date ?? null,
      standard_id: assignmentData.standard_id ?? null,
      notes: null,
      illuminate_id: null,
      section_id: assignmentData.section_id,
      teacher_id: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setPendingAssignment(mockAssignment);

    // Also try the API (will succeed if backend is running)
    createAssignment.mutate(assignmentData, {
      onSuccess: () => {},
      onError: () => {},
    });

    setDialogOpen(false);
    setNewTitle("");
    setNewMaxScore("100");
    setNewDueDate("");
    setNewSubject("");
    setNewStandardId("");
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Page header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white flex-shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-900">Assignments</h1>

          {/* Section selector */}
          <Select
            value={selectedSectionId === "all" ? "all" : selectedSectionId?.toString() ?? ""}
            onValueChange={(val) =>
              setSelectedSection(val === "all" ? "all" : parseInt(val))
            }
          >
            <SelectTrigger className="w-72 h-9 text-sm">
              <SelectValue placeholder="Select a section..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sections</SelectItem>
              {sections.map((section) => (
                <SelectItem key={section.id} value={section.id.toString()}>
                  {section.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {currentSection?.subject && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {currentSection.subject}
              {currentSection.grade ? ` / Grade ${currentSection.grade}` : ""}
            </span>
          )}
        </div>

        {/* New Assignment button */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              New Assignment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Assignment</DialogTitle>
              <DialogDescription>
                Create a new assignment or import from Illuminate.
              </DialogDescription>
            </DialogHeader>

            <Tabs
              value={dialogTab}
              onValueChange={(v) => setDialogTab(v as "create" | "import")}
            >
              <TabsList className="w-full">
                <TabsTrigger value="create" className="flex-1">
                  Create My Own
                </TabsTrigger>
                <TabsTrigger value="import" className="flex-1">
                  Import from Illuminate
                </TabsTrigger>
              </TabsList>

              <TabsContent value="create">
                <div className="space-y-4 py-2">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="e.g. Unit 4 Quiz"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      autoFocus
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">
                        Max Score
                      </label>
                      <Input
                        type="number"
                        min="1"
                        value={newMaxScore}
                        onChange={(e) => setNewMaxScore(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">
                        Due Date
                      </label>
                      <Input
                        type="date"
                        value={newDueDate}
                        onChange={(e) => setNewDueDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">
                      Subject
                    </label>
                    <Input
                      placeholder="e.g. Math, ELA"
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">
                      Standard (optional)
                    </label>
                    <Select
                      value={newStandardId}
                      onValueChange={setNewStandardId}
                    >
                      <SelectTrigger className="w-full h-9 text-sm">
                        <SelectValue placeholder="Select a standard..." />
                      </SelectTrigger>
                      <SelectContent>
                        {MOCK_STANDARDS.map((std) => (
                          <SelectItem key={std.id} value={std.id.toString()}>
                            <span className="font-mono text-xs mr-2">
                              {std.code}
                            </span>
                            {std.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DialogFooter className="mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateAssignment}
                    disabled={
                      !newTitle.trim() ||
                      createAssignment.isPending ||
                      selectedSectionId === "all"
                    }
                  >
                    {createAssignment.isPending ? "Creating..." : "Create"}
                  </Button>
                </DialogFooter>
              </TabsContent>

              <TabsContent value="import">
                <div className="py-8 text-center space-y-4">
                  <BookOpen className="h-12 w-12 mx-auto text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Import from Illuminate
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Import assignments and scores directly from Renaissance
                      Illuminate assessments.
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      setDialogOpen(false);
                      navigate("/assignments/import");
                    }}
                  >
                    Go to Import Wizard
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      {/* Grid area */}
      {selectedSectionId ? (
        <AssignmentGrid
          sectionId={selectedSectionId}
          pendingNewAssignment={pendingAssignment}
          onPendingConsumed={() => setPendingAssignment(null)}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
          Select a section to view assignments.
        </div>
      )}
    </div>
  );
}
