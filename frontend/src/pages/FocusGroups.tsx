import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Users, ChevronDown } from "lucide-react";
import FocusGroupBuilder from "@/components/focus-groups/FocusGroupBuilder";

const MOCK_SECTIONS = [
  { id: 1, name: "3rd Grade - Section A" },
  { id: 2, name: "3rd Grade - Section B" },
  { id: 3, name: "3rd Grade - Section C" },
];

// Summary stats (matching the mock data in FocusGroupBuilder)
const TOTAL_STUDENTS = 8;
const GROUPED_COUNT = 6;
const UNGROUPED_COUNT = 2;

export default function FocusGroupsPage() {
  const [selectedSection, setSelectedSection] = useState(MOCK_SECTIONS[0].id);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <Users className="h-5 w-5 text-indigo-600" />
          <h1 className="text-xl font-semibold text-gray-900">Focus Groups</h1>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(Number(e.target.value))}
            className="text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {MOCK_SECTIONS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary bar */}
      <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Total Students:</span>
          <span className="text-sm font-semibold text-gray-900">
            {TOTAL_STUDENTS}
          </span>
        </div>
        <div className="h-4 w-px bg-gray-300" />
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Grouped:</span>
          <span className="text-sm font-semibold text-green-700">
            {GROUPED_COUNT}
          </span>
        </div>
        <div className="h-4 w-px bg-gray-300" />
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Ungrouped:</span>
          <span className="text-sm font-semibold text-amber-700">
            {UNGROUPED_COUNT}
          </span>
        </div>
      </div>

      {/* Builder */}
      <div className="flex-1 overflow-hidden p-6">
        <FocusGroupBuilder />
      </div>
    </div>
  );
}
