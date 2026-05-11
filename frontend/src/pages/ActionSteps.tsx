import ActionStepCard, {
  type ActionStepFeedback,
} from "@/components/action-steps/ActionStepCard";
import { ClipboardCheck } from "lucide-react";

const MOCK_FEEDBACK: ActionStepFeedback[] = [
  {
    id: 1,
    rubricTitle: "Classroom Observation Rubric",
    leaderName: "Dr. Angela Wright",
    createdAt: "2026-04-20T14:30:00Z",
    overallNotes:
      "Strong lesson structure and clear learning objectives. Consider incorporating more student voice during discussions and providing additional wait time for ELL students.",
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
          { level: 3, label: "Proficient", desc: "Most students are actively engaged." },
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
          { level: 3, label: "Proficient", desc: "Consistent differentiation strategies." },
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
    ratings: { 1: 3, 2: 2, 3: 4 },
    reflections: [
      {
        id: 101,
        text: "I appreciate the feedback on differentiation. I plan to implement tiered assignments next week and will use the ML/DL student data to form flexible groups.",
        submittedAt: "2026-04-21T09:15:00Z",
      },
    ],
  },
  {
    id: 2,
    rubricTitle: "Data-Driven Instruction Rubric",
    leaderName: "Dr. Angela Wright",
    createdAt: "2026-05-05T10:00:00Z",
    overallNotes:
      "Good use of exit ticket data to identify gaps. Next step: build a re-teach plan using Illuminate reports to target specific standards.",
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
    ratings: { 4: 3, 5: 3 },
    reflections: [],
  },
];

export default function ActionStepsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-indigo-50 p-2">
          <ClipboardCheck className="h-6 w-6 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Action Steps</h1>
          <p className="text-sm text-gray-500">
            Review feedback from your leader and submit reflections
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {MOCK_FEEDBACK.map((fb) => (
          <ActionStepCard key={fb.id} feedback={fb} />
        ))}
      </div>
    </div>
  );
}
