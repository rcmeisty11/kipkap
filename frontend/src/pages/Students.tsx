import { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Search, ChevronDown, ChevronRight, Users, Filter } from "lucide-react";

interface MockStudent {
  id: number;
  first_name: string;
  last_name: string;
  grade: string;
  is_ml: boolean;
  is_dl: boolean;
  section: string;
  focusGroups: string[];
  avgScore: number;
  scores: { assignment: string; score: number; max: number }[];
}

const MOCK_STUDENTS: MockStudent[] = [
  {
    id: 1, first_name: "Sophia", last_name: "Martinez", grade: "3", is_ml: true, is_dl: false,
    section: "3A - ELA", focusGroups: ["Below Grade Level"], avgScore: 72,
    scores: [
      { assignment: "Reading Comprehension Quiz 1", score: 68, max: 100 },
      { assignment: "Vocabulary Unit 3", score: 75, max: 100 },
      { assignment: "Writing Sample 1", score: 73, max: 100 },
    ],
  },
  {
    id: 2, first_name: "Liam", last_name: "Nguyen", grade: "3", is_ml: false, is_dl: false,
    section: "3A - ELA", focusGroups: [], avgScore: 91,
    scores: [
      { assignment: "Reading Comprehension Quiz 1", score: 92, max: 100 },
      { assignment: "Vocabulary Unit 3", score: 88, max: 100 },
      { assignment: "Writing Sample 1", score: 93, max: 100 },
    ],
  },
  {
    id: 3, first_name: "Amara", last_name: "Johnson", grade: "3", is_ml: false, is_dl: true,
    section: "3A - ELA", focusGroups: ["Enrichment"], avgScore: 95,
    scores: [
      { assignment: "Reading Comprehension Quiz 1", score: 96, max: 100 },
      { assignment: "Vocabulary Unit 3", score: 93, max: 100 },
      { assignment: "Writing Sample 1", score: 96, max: 100 },
    ],
  },
  {
    id: 4, first_name: "Ethan", last_name: "Kim", grade: "3", is_ml: true, is_dl: false,
    section: "3A - ELA", focusGroups: ["Below Grade Level", "ELL Support"], avgScore: 65,
    scores: [
      { assignment: "Reading Comprehension Quiz 1", score: 60, max: 100 },
      { assignment: "Vocabulary Unit 3", score: 68, max: 100 },
      { assignment: "Writing Sample 1", score: 67, max: 100 },
    ],
  },
  {
    id: 5, first_name: "Olivia", last_name: "Brown", grade: "3", is_ml: false, is_dl: false,
    section: "3B - ELA", focusGroups: [], avgScore: 84,
    scores: [
      { assignment: "Reading Comprehension Quiz 1", score: 82, max: 100 },
      { assignment: "Vocabulary Unit 3", score: 86, max: 100 },
      { assignment: "Writing Sample 1", score: 84, max: 100 },
    ],
  },
  {
    id: 6, first_name: "Noah", last_name: "Davis", grade: "3", is_ml: true, is_dl: false,
    section: "3B - ELA", focusGroups: ["Below Grade Level"], avgScore: 58,
    scores: [
      { assignment: "Reading Comprehension Quiz 1", score: 55, max: 100 },
      { assignment: "Vocabulary Unit 3", score: 62, max: 100 },
      { assignment: "Writing Sample 1", score: 57, max: 100 },
    ],
  },
  {
    id: 7, first_name: "Isabella", last_name: "Garcia", grade: "4", is_ml: false, is_dl: true,
    section: "4A - Math", focusGroups: ["Enrichment"], avgScore: 97,
    scores: [
      { assignment: "Fractions Assessment", score: 98, max: 100 },
      { assignment: "Geometry Quiz", score: 95, max: 100 },
      { assignment: "Word Problems Set 2", score: 98, max: 100 },
    ],
  },
  {
    id: 8, first_name: "Mason", last_name: "Wilson", grade: "4", is_ml: false, is_dl: false,
    section: "4A - Math", focusGroups: [], avgScore: 79,
    scores: [
      { assignment: "Fractions Assessment", score: 76, max: 100 },
      { assignment: "Geometry Quiz", score: 82, max: 100 },
      { assignment: "Word Problems Set 2", score: 79, max: 100 },
    ],
  },
  {
    id: 9, first_name: "Ava", last_name: "Lee", grade: "4", is_ml: true, is_dl: false,
    section: "4A - Math", focusGroups: ["ELL Support"], avgScore: 70,
    scores: [
      { assignment: "Fractions Assessment", score: 68, max: 100 },
      { assignment: "Geometry Quiz", score: 72, max: 100 },
      { assignment: "Word Problems Set 2", score: 70, max: 100 },
    ],
  },
  {
    id: 10, first_name: "Lucas", last_name: "Patel", grade: "4", is_ml: false, is_dl: true,
    section: "4A - Math", focusGroups: ["Enrichment"], avgScore: 93,
    scores: [
      { assignment: "Fractions Assessment", score: 94, max: 100 },
      { assignment: "Geometry Quiz", score: 91, max: 100 },
      { assignment: "Word Problems Set 2", score: 94, max: 100 },
    ],
  },
];

const SECTIONS = ["All Sections", "3A - ELA", "3B - ELA", "4A - Math"];

export default function StudentsPage() {
  const [search, setSearch] = useState("");
  const [section, setSection] = useState("all");
  const [showML, setShowML] = useState(false);
  const [showDL, setShowDL] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    return MOCK_STUDENTS.filter((s) => {
      const matchesSearch =
        !search ||
        `${s.first_name} ${s.last_name}`.toLowerCase().includes(search.toLowerCase());
      const matchesSection = section === "all" || s.section === section;
      const matchesML = !showML || s.is_ml;
      const matchesDL = !showDL || s.is_dl;
      return matchesSearch && matchesSection && matchesML && matchesDL;
    });
  }, [search, section, showML, showDL]);

  const scoreColor = (score: number) => {
    if (score >= 85) return "bg-emerald-100 text-emerald-800";
    if (score >= 70) return "bg-amber-100 text-amber-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-indigo-50 p-2">
          <Users className="h-6 w-6 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-sm text-gray-500">
            View and filter your student roster across sections
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name..."
              className="pl-9"
            />
          </div>
          <div className="w-48">
            <Select value={section} onValueChange={setSection}>
              <SelectTrigger>
                <SelectValue placeholder="Section" />
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
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <Button
              variant={showML ? "default" : "outline"}
              size="sm"
              onClick={() => setShowML(!showML)}
            >
              ML
            </Button>
            <Button
              variant={showDL ? "default" : "outline"}
              size="sm"
              onClick={() => setShowDL(!showDL)}
            >
              DL
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/50">
                  <th className="px-4 py-3 text-left font-medium text-gray-600 w-8"></th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Grade</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">ML</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">DL</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Focus Groups</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Avg Score</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((student) => (
                  <>
                    <tr
                      key={student.id}
                      onClick={() =>
                        setExpandedId(expandedId === student.id ? null : student.id)
                      }
                      className="cursor-pointer border-b border-gray-100 transition-colors hover:bg-gray-50"
                    >
                      <td className="px-4 py-3">
                        {expandedId === student.id ? (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {student.first_name} {student.last_name}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{student.grade}</td>
                      <td className="px-4 py-3">
                        {student.is_ml && (
                          <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                            ML
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {student.is_dl && (
                          <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                            DL
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {student.focusGroups.map((fg) => (
                            <Badge key={fg} variant="secondary" className="text-xs">
                              {fg}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={cn("font-medium", scoreColor(student.avgScore))}>
                          {student.avgScore}%
                        </Badge>
                      </td>
                    </tr>
                    {expandedId === student.id && (
                      <tr key={`${student.id}-detail`} className="border-b border-gray-100">
                        <td colSpan={7} className="bg-gray-50 px-8 py-4">
                          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Assignment Scores
                          </h4>
                          <div className="space-y-1.5">
                            {student.scores.map((s, i) => (
                              <div
                                key={i}
                                className="flex items-center justify-between rounded border border-gray-200 bg-white px-3 py-2"
                              >
                                <span className="text-sm text-gray-700">{s.assignment}</span>
                                <span className="text-sm font-medium text-gray-900">
                                  {s.score}/{s.max}
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                      No students match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
