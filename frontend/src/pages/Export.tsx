import { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, FileSpreadsheet, Check } from "lucide-react";
import api from "@/lib/api";

interface MockAssignment {
  id: number;
  title: string;
  section: string;
  dueDate: string;
  studentCount: number;
  avgScore: number;
}

const MOCK_ASSIGNMENTS: MockAssignment[] = [
  { id: 1, title: "Reading Comprehension Quiz 1", section: "3A - ELA", dueDate: "2026-04-10", studentCount: 28, avgScore: 76 },
  { id: 2, title: "Vocabulary Unit 3", section: "3A - ELA", dueDate: "2026-04-15", studentCount: 28, avgScore: 81 },
  { id: 3, title: "Writing Sample 1", section: "3A - ELA", dueDate: "2026-04-20", studentCount: 27, avgScore: 79 },
  { id: 4, title: "Reading Comprehension Quiz 1", section: "3B - ELA", dueDate: "2026-04-10", studentCount: 26, avgScore: 74 },
  { id: 5, title: "Fractions Assessment", section: "4A - Math", dueDate: "2026-04-12", studentCount: 30, avgScore: 82 },
  { id: 6, title: "Geometry Quiz", section: "4A - Math", dueDate: "2026-04-18", studentCount: 30, avgScore: 85 },
  { id: 7, title: "Word Problems Set 2", section: "4A - Math", dueDate: "2026-04-25", studentCount: 29, avgScore: 78 },
];

const SECTIONS = ["All Sections", "3A - ELA", "3B - ELA", "4A - Math"];

export default function ExportPage() {
  const [section, setSection] = useState("all");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [exporting, setExporting] = useState(false);

  const filtered = useMemo(() => {
    if (section === "all") return MOCK_ASSIGNMENTS;
    return MOCK_ASSIGNMENTS.filter((a) => a.section === section);
  }, [section]);

  function toggleAssignment(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((a) => a.id)));
    }
  }

  const selected = filtered.filter((a) => selectedIds.has(a.id));
  const totalStudents = selected.reduce((s, a) => s + a.studentCount, 0);
  const totalRows = selected.reduce((s, a) => s + a.studentCount, 0);

  async function handleExport() {
    setExporting(true);
    try {
      const res = await api.get("/export/powerschool", {
        params: { assignment_ids: Array.from(selectedIds).join(",") },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "powerschool_export.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      // Prototype: generate a fake CSV download
      const csvContent = "Student_Number,Last_Name,First_Name,Assignment,Score,Max_Score\n1001,Martinez,Sophia,Reading Quiz 1,68,100\n1002,Nguyen,Liam,Reading Quiz 1,92,100";
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "powerschool_export.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-indigo-50 p-2">
          <FileSpreadsheet className="h-6 w-6 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Export to PowerSchool</h1>
          <p className="text-sm text-gray-500">
            Select assignments to export as a CSV for PowerSchool import
          </p>
        </div>
      </div>

      {/* Section filter */}
      <div className="w-64">
        <Select value={section} onValueChange={(v) => { setSection(v); setSelectedIds(new Set()); }}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by section" />
          </SelectTrigger>
          <SelectContent>
            {SECTIONS.map((s) => (
              <SelectItem key={s} value={s === "All Sections" ? "all" : s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Assignment checklist */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Select Assignments</CardTitle>
            <Button variant="ghost" size="sm" onClick={toggleAll}>
              {selectedIds.size === filtered.length ? "Deselect All" : "Select All"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filtered.map((assignment) => {
              const isSelected = selectedIds.has(assignment.id);
              return (
                <label
                  key={assignment.id}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50"
                >
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-600"
                        : "border-gray-300 bg-white"
                    }`}
                    onClick={(e) => { e.preventDefault(); toggleAssignment(assignment.id); }}
                  >
                    {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{assignment.title}</p>
                    <p className="text-xs text-gray-500">
                      {assignment.section} &middot; Due {new Date(assignment.dueDate).toLocaleDateString()} &middot; {assignment.studentCount} students
                    </p>
                  </div>
                  <Badge variant="secondary">{assignment.avgScore}% avg</Badge>
                </label>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      {selected.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Export Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-2 text-left font-medium text-gray-600">Assignment</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600">Section</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600">Students</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600">Avg Score</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.map((a) => (
                    <tr key={a.id} className="border-b border-gray-100">
                      <td className="px-4 py-2 text-gray-900">{a.title}</td>
                      <td className="px-4 py-2 text-gray-600">{a.section}</td>
                      <td className="px-4 py-2 text-gray-600">{a.studentCount}</td>
                      <td className="px-4 py-2 text-gray-600">{a.avgScore}%</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50">
                    <td className="px-4 py-2 font-medium text-gray-900">
                      {selected.length} assignments
                    </td>
                    <td className="px-4 py-2"></td>
                    <td className="px-4 py-2 font-medium text-gray-900">{totalStudents} total</td>
                    <td className="px-4 py-2 font-medium text-gray-900">
                      {totalRows} rows
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="mt-4 flex justify-end">
              <Button onClick={handleExport} disabled={exporting}>
                <Download className="mr-2 h-4 w-4" />
                {exporting ? "Exporting..." : "Export CSV"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
