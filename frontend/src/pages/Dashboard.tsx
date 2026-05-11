import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  FileText,
  BarChart3,
  BookOpen,
  GraduationCap,
  School,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

interface TeacherStats {
  totalStudents: number;
  totalAssignments: number;
  avgScore: number;
  totalSections: number;
}

interface LeaderStats {
  totalTeachers: number;
  totalSchools: number;
  avgScore: number;
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${color}`}
        >
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickLinkCard({
  icon: Icon,
  title,
  description,
  to,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  to: string;
}) {
  return (
    <Link to={to}>
      <Card className="group cursor-pointer transition-shadow hover:shadow-md">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">{title}</p>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
          <ArrowRight className="h-4 w-4 text-gray-300 transition-transform group-hover:translate-x-1 group-hover:text-indigo-600" />
        </CardContent>
      </Card>
    </Link>
  );
}

export default function Dashboard() {
  const { user, isLeader } = useAuth();
  const [teacherStats, setTeacherStats] = useState<TeacherStats>({
    totalStudents: 0,
    totalAssignments: 0,
    avgScore: 0,
    totalSections: 0,
  });
  const [leaderStats, setLeaderStats] = useState<LeaderStats>({
    totalTeachers: 0,
    totalSchools: 0,
    avgScore: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        if (isLeader) {
          const { data } = await api.get("/leader/stats");
          setLeaderStats({
            totalTeachers: data.total_teachers ?? 0,
            totalSchools: data.total_schools ?? 0,
            avgScore: data.avg_score ?? 0,
          });
        }
        const { data } = await api.get("/dashboard/stats");
        setTeacherStats({
          totalStudents: data.total_students ?? 0,
          totalAssignments: data.total_assignments ?? 0,
          avgScore: data.avg_score ?? 0,
          totalSections: data.total_sections ?? 0,
        });
      } catch {
        // Stats endpoint may not exist yet; keep defaults
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [isLeader]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back{user ? `, ${user.email.split("@")[0]}` : ""}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Here is an overview of your {isLeader ? "school" : "classroom"} data.
        </p>
      </div>

      {/* Teacher stats */}
      <div>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
          Classroom Overview
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Users}
            label="Total Students"
            value={teacherStats.totalStudents}
            color="bg-blue-50 text-blue-600"
          />
          <StatCard
            icon={FileText}
            label="Total Assignments"
            value={teacherStats.totalAssignments}
            color="bg-emerald-50 text-emerald-600"
          />
          <StatCard
            icon={TrendingUp}
            label="Average Score"
            value={
              teacherStats.avgScore
                ? `${Math.round(teacherStats.avgScore)}%`
                : "--"
            }
            color="bg-amber-50 text-amber-600"
          />
          <StatCard
            icon={GraduationCap}
            label="Sections"
            value={teacherStats.totalSections}
            color="bg-purple-50 text-purple-600"
          />
        </div>
      </div>

      {/* Leader section */}
      {isLeader && (
        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
            Leadership Overview
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              icon={Users}
              label="Total Teachers"
              value={leaderStats.totalTeachers}
              color="bg-indigo-50 text-indigo-600"
            />
            <StatCard
              icon={School}
              label="Total Schools"
              value={leaderStats.totalSchools}
              color="bg-rose-50 text-rose-600"
            />
            <StatCard
              icon={TrendingUp}
              label="Avg Score Across Schools"
              value={
                leaderStats.avgScore
                  ? `${Math.round(leaderStats.avgScore)}%`
                  : "--"
              }
              color="bg-teal-50 text-teal-600"
            />
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <QuickLinkCard
              icon={BarChart3}
              title="Leader Dashboard"
              description="View teacher performance and school-wide analytics"
              to="/leader/dashboard"
            />
            <QuickLinkCard
              icon={BookOpen}
              title="Rubrics"
              description="Create and manage action step rubrics"
              to="/leader/rubrics"
            />
          </div>
        </div>
      )}
    </div>
  );
}
