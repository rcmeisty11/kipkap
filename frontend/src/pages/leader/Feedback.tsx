import { useNavigate, useParams } from "react-router-dom";
import FeedbackForm from "@/components/leader/FeedbackForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { RubricCriteria } from "@/types";

const MOCK_TEACHERS: Record<string, string> = {
  "1": "Maria Santos",
  "2": "James Chen",
  "3": "Aisha Johnson",
  "4": "Robert Kim",
  "5": "Elena Rodriguez",
  "6": "David Patel",
};

const MOCK_CRITERIA: RubricCriteria[] = [
  {
    id: 1,
    rubric_id: 1,
    title: "Student Engagement",
    description: "How effectively does the teacher engage all learners?",
    position: 0,
    levels_json: [
      { level: 1, label: "Beginning", desc: "Few students are engaged in learning activities." },
      { level: 2, label: "Developing", desc: "Some students are engaged most of the time." },
      { level: 3, label: "Proficient", desc: "Most students are actively engaged." },
      { level: 4, label: "Distinguished", desc: "All students are deeply and consistently engaged." },
    ],
  },
  {
    id: 2,
    rubric_id: 1,
    title: "Differentiation",
    description: "Teacher provides differentiated instruction to meet diverse learner needs.",
    position: 1,
    levels_json: [
      { level: 1, label: "Beginning", desc: "No differentiation observed." },
      { level: 2, label: "Developing", desc: "Limited differentiation for some learners." },
      { level: 3, label: "Proficient", desc: "Consistent differentiation strategies." },
      { level: 4, label: "Distinguished", desc: "Exemplary, responsive differentiation for all." },
    ],
  },
  {
    id: 3,
    rubric_id: 1,
    title: "Classroom Management",
    description: "Routines, transitions, and behavior management.",
    position: 2,
    levels_json: [
      { level: 1, label: "Beginning", desc: "Frequent disruptions impede learning." },
      { level: 2, label: "Developing", desc: "Some disruptions; routines are inconsistent." },
      { level: 3, label: "Proficient", desc: "Smooth routines with minimal disruptions." },
      { level: 4, label: "Distinguished", desc: "Seamless, student-led classroom management." },
    ],
  },
];

export default function FeedbackPage() {
  const navigate = useNavigate();
  const { rubricId, teacherId } = useParams<{ rubricId: string; teacherId: string }>();
  const teacherName = MOCK_TEACHERS[teacherId ?? ""] ?? "Unknown Teacher";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Give Feedback</h1>
          <p className="text-sm text-gray-500">
            Providing feedback for <span className="font-medium text-gray-700">{teacherName}</span>
          </p>
        </div>
      </div>

      <FeedbackForm
        rubricId={Number(rubricId) || 1}
        teacherId={Number(teacherId) || 1}
        criteria={MOCK_CRITERIA}
        onSubmitted={() => navigate("/leader/dashboard")}
      />
    </div>
  );
}
