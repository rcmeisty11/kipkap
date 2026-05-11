import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Calendar } from "lucide-react";
import type { ActionStepRubric } from "@/types";

const MOCK_RUBRICS: ActionStepRubric[] = [
  {
    id: 1,
    title: "Classroom Observation Rubric",
    description:
      "Evaluate teacher effectiveness across key instructional domains including engagement, differentiation, and classroom management.",
    school_id: 1,
    created_by_user_id: 1,
    created_at: "2026-03-15T10:00:00Z",
    criteria: [
      {
        id: 1,
        rubric_id: 1,
        title: "Student Engagement",
        description: "How effectively does the teacher engage all learners?",
        position: 0,
        levels_json: [
          { level: 1, label: "Beginning", desc: "Few students are engaged." },
          { level: 2, label: "Developing", desc: "Some students are engaged." },
          { level: 3, label: "Proficient", desc: "Most students are engaged." },
          { level: 4, label: "Distinguished", desc: "All students are deeply engaged." },
        ],
      },
      {
        id: 2,
        rubric_id: 1,
        title: "Differentiation",
        description: "Teacher provides differentiated instruction.",
        position: 1,
        levels_json: [
          { level: 1, label: "Beginning", desc: "No differentiation observed." },
          { level: 2, label: "Developing", desc: "Limited differentiation." },
          { level: 3, label: "Proficient", desc: "Consistent differentiation." },
          { level: 4, label: "Distinguished", desc: "Exemplary differentiation for all." },
        ],
      },
      {
        id: 3,
        rubric_id: 1,
        title: "Classroom Management",
        description: "Routines, transitions, and behavior management.",
        position: 2,
        levels_json: [
          { level: 1, label: "Beginning", desc: "Frequent disruptions." },
          { level: 2, label: "Developing", desc: "Some disruptions." },
          { level: 3, label: "Proficient", desc: "Smooth routines." },
          { level: 4, label: "Distinguished", desc: "Seamless self-managed classroom." },
        ],
      },
    ],
  },
  {
    id: 2,
    title: "Data-Driven Instruction Rubric",
    description:
      "Assess how effectively teachers use assessment data to inform instruction and support student growth.",
    school_id: 1,
    created_by_user_id: 1,
    created_at: "2026-04-02T14:30:00Z",
    criteria: [
      {
        id: 4,
        rubric_id: 2,
        title: "Data Analysis",
        description: "Teacher analyzes student data to identify trends.",
        position: 0,
        levels_json: [
          { level: 1, label: "Beginning", desc: "Rarely examines data." },
          { level: 2, label: "Developing", desc: "Reviews data occasionally." },
          { level: 3, label: "Proficient", desc: "Regularly analyzes data." },
          { level: 4, label: "Distinguished", desc: "Deep, proactive data analysis." },
        ],
      },
      {
        id: 5,
        rubric_id: 2,
        title: "Instructional Adjustments",
        description: "Teacher adjusts instruction based on data.",
        position: 1,
        levels_json: [
          { level: 1, label: "Beginning", desc: "No adjustments observed." },
          { level: 2, label: "Developing", desc: "Minimal adjustments." },
          { level: 3, label: "Proficient", desc: "Timely adjustments." },
          { level: 4, label: "Distinguished", desc: "Continuous, responsive adjustments." },
        ],
      },
    ],
  },
];

export default function RubricsPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rubrics</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage observation and action-step rubrics for your teachers
          </p>
        </div>
        <Button onClick={() => navigate("/leader/rubrics/new")}>
          <Plus className="mr-2 h-4 w-4" /> New Rubric
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {MOCK_RUBRICS.map((rubric) => (
          <Card
            key={rubric.id}
            className="cursor-pointer transition-shadow hover:shadow-md"
            onClick={() => navigate(`/leader/rubrics/${rubric.id}`)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{rubric.title}</CardTitle>
                <Badge variant="secondary">
                  {rubric.criteria.length} criteria
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-gray-600">{rubric.description}</p>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span className="inline-flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5" />
                  {rubric.criteria.length} criteria
                </span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(rubric.created_at).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
