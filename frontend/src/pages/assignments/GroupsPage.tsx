import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { BookOpen, Settings } from "lucide-react";
import StandardGroupBoard from "@/components/standards/StandardGroupBoard";

const MOCK_SECTIONS = [
  { id: 1, name: "3rd Grade - Section A" },
  { id: 2, name: "3rd Grade - Section B" },
  { id: 3, name: "3rd Grade - Section C" },
];

export default function GroupsPage() {
  const [selectedSection, setSelectedSection] = useState(MOCK_SECTIONS[0].id);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <BookOpen className="h-5 w-5 text-indigo-600" />
          <h1 className="text-xl font-semibold text-gray-900">
            Standard Groups
          </h1>
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
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-1.5" />
            Manage Standards
          </Button>
        </div>
      </div>

      {/* Description */}
      <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
        <p className="text-sm text-gray-600">
          Drag and drop assignments into standard-aligned groups to track
          progress by standard. Each column represents a standard, and
          assignments can be moved between groups freely.
        </p>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-hidden p-6">
        <StandardGroupBoard />
      </div>
    </div>
  );
}
