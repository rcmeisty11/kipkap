import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Users,
  GraduationCap,
  TrendingUp,
  ClipboardList,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import type { RollupTeacher } from "@/types";

const MOCK_DATA: RollupTeacher[] = [
  {
    teacher_id: 1,
    teacher_name: "Maria Santos",
    school_name: "Lincoln Elementary",
    section_count: 3,
    assignment_count: 18,
    avg_score: 82.4,
  },
  {
    teacher_id: 2,
    teacher_name: "James Chen",
    school_name: "Lincoln Elementary",
    section_count: 2,
    assignment_count: 14,
    avg_score: 78.1,
  },
  {
    teacher_id: 3,
    teacher_name: "Aisha Johnson",
    school_name: "Washington Middle",
    section_count: 4,
    assignment_count: 22,
    avg_score: 88.7,
  },
  {
    teacher_id: 4,
    teacher_name: "Robert Kim",
    school_name: "Washington Middle",
    section_count: 3,
    assignment_count: 16,
    avg_score: 74.3,
  },
  {
    teacher_id: 5,
    teacher_name: "Elena Rodriguez",
    school_name: "Jefferson High",
    section_count: 5,
    assignment_count: 28,
    avg_score: 91.2,
  },
  {
    teacher_id: 6,
    teacher_name: "David Patel",
    school_name: "Jefferson High",
    section_count: 2,
    assignment_count: 12,
    avg_score: 85.6,
  },
];

type SortKey = "teacher_name" | "school_name" | "section_count" | "assignment_count" | "avg_score";
type SortDir = "asc" | "desc";

interface Props {
  schoolFilter?: string;
}

export default function RollupDashboard({ schoolFilter }: Props) {
  const navigate = useNavigate();
  const [sortKey, setSortKey] = useState<SortKey>("avg_score");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const filtered = useMemo(() => {
    if (!schoolFilter || schoolFilter === "all") return MOCK_DATA;
    return MOCK_DATA.filter((t) => t.school_name === schoolFilter);
  }, [schoolFilter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDir === "asc"
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });
  }, [filtered, sortKey, sortDir]);

  const totalTeachers = filtered.length;
  const totalStudents = filtered.reduce((s, t) => s + t.section_count * 25, 0);
  const overallAvg =
    filtered.length > 0
      ? (filtered.reduce((s, t) => s + t.avg_score, 0) / filtered.length).toFixed(1)
      : "0";
  const totalAssignments = filtered.reduce((s, t) => s + t.assignment_count, 0);

  const chartData = sorted.map((t) => ({
    name: t.teacher_name.split(" ")[1],
    fullName: t.teacher_name,
    score: t.avg_score,
  }));

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function SortIcon({ column }: { column: SortKey }) {
    if (sortKey !== column) return <ArrowUpDown className="ml-1 h-3.5 w-3.5 text-gray-400" />;
    return sortDir === "asc" ? (
      <ChevronUp className="ml-1 h-3.5 w-3.5 text-indigo-600" />
    ) : (
      <ChevronDown className="ml-1 h-3.5 w-3.5 text-indigo-600" />
    );
  }

  const scoreColor = (score: number) => {
    if (score >= 85) return "bg-emerald-100 text-emerald-800";
    if (score >= 70) return "bg-amber-100 text-amber-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Teachers", value: totalTeachers, icon: Users, color: "text-indigo-600 bg-indigo-50" },
          { label: "Total Students", value: totalStudents, icon: GraduationCap, color: "text-blue-600 bg-blue-50" },
          { label: "Overall Avg Score", value: `${overallAvg}%`, icon: TrendingUp, color: "text-emerald-600 bg-emerald-50" },
          { label: "Total Assignments", value: totalAssignments, icon: ClipboardList, color: "text-violet-600 bg-violet-50" },
        ].map((card) => (
          <Card key={card.label}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className={cn("rounded-lg p-3", card.color)}>
                <card.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bar chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Average Score by Teacher</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 13 }} />
                <Tooltip
                  formatter={(value: number) => [`${value}%`, "Avg Score"]}
                  labelFormatter={(_, payload) =>
                    payload?.[0]?.payload?.fullName ?? ""
                  }
                />
                <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={28}>
                  {chartData.map((entry, idx) => (
                    <Cell
                      key={idx}
                      fill={entry.score >= 85 ? "#4f46e5" : entry.score >= 70 ? "#6366f1" : "#818cf8"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Teacher table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Teacher Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  {([
                    ["teacher_name", "Name"],
                    ["school_name", "School"],
                    ["section_count", "Sections"],
                    ["assignment_count", "Assignments"],
                    ["avg_score", "Avg Score"],
                  ] as [SortKey, string][]).map(([key, label]) => (
                    <th
                      key={key}
                      onClick={() => toggleSort(key)}
                      className="cursor-pointer select-none px-4 py-3 text-left font-medium text-gray-600 hover:text-gray-900"
                    >
                      <span className="inline-flex items-center">
                        {label}
                        <SortIcon column={key} />
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((teacher) => (
                  <tr
                    key={teacher.teacher_id}
                    onClick={() => navigate(`/leader/teachers/${teacher.teacher_id}`)}
                    className="cursor-pointer border-b border-gray-100 transition-colors hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">{teacher.teacher_name}</td>
                    <td className="px-4 py-3 text-gray-600">{teacher.school_name}</td>
                    <td className="px-4 py-3 text-gray-600">{teacher.section_count}</td>
                    <td className="px-4 py-3 text-gray-600">{teacher.assignment_count}</td>
                    <td className="px-4 py-3">
                      <Badge className={cn("font-medium", scoreColor(teacher.avg_score))}>
                        {teacher.avg_score}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
