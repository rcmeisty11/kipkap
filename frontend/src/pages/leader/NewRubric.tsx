import { useNavigate } from "react-router-dom";
import RubricEditor from "@/components/leader/RubricEditor";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NewRubricPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/leader/rubrics")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Rubric</h1>
          <p className="text-sm text-gray-500">
            Define criteria and performance levels for teacher observations
          </p>
        </div>
      </div>

      <RubricEditor onSaved={() => navigate("/leader/rubrics")} />
    </div>
  );
}
