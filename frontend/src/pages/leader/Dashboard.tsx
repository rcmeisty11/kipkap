import { useState } from "react";
import RollupDashboard from "@/components/leader/RollupDashboard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LayoutDashboard } from "lucide-react";

const SCHOOLS = ["All Schools", "Lincoln Elementary", "Washington Middle", "Jefferson High"];

export default function LeaderDashboard() {
  const [school, setSchool] = useState("all");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-indigo-50 p-2">
            <LayoutDashboard className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Leader Dashboard</h1>
            <p className="text-sm text-gray-500">Overview of teacher performance and assignments</p>
          </div>
        </div>

        <div className="w-full sm:w-64">
          <Select value={school} onValueChange={setSchool}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by school" />
            </SelectTrigger>
            <SelectContent>
              {SCHOOLS.map((s) => (
                <SelectItem key={s} value={s === "All Schools" ? "all" : s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <RollupDashboard schoolFilter={school} />
    </div>
  );
}
