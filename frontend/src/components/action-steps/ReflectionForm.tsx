import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import api from "@/lib/api";

interface Reflection {
  id: number;
  text: string;
  submittedAt: string;
}

interface Props {
  feedbackId: number;
  existingReflections: Reflection[];
}

export default function ReflectionForm({ feedbackId, existingReflections }: Props) {
  const [text, setText] = useState("");
  const [reflections, setReflections] = useState<Reflection[]>(existingReflections);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      await api.post("/leader/reflections", {
        feedback_id: feedbackId,
        reflection_text: text,
      });
    } catch {
      // Prototype: add locally anyway
    }
    const newReflection: Reflection = {
      id: Date.now(),
      text: text.trim(),
      submittedAt: new Date().toISOString(),
    };
    setReflections((prev) => [newReflection, ...prev]);
    setText("");
    setSubmitting(false);
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Your Reflection
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Reflect on this feedback. What steps will you take? What support do you need?"
          rows={3}
          className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
        />
        <div className="mt-2 flex justify-end">
          <Button size="sm" onClick={handleSubmit} disabled={submitting || !text.trim()}>
            <Send className="mr-1.5 h-3.5 w-3.5" />
            {submitting ? "Submitting..." : "Submit Reflection"}
          </Button>
        </div>
      </div>

      {reflections.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Previous Reflections
          </h4>
          {reflections.map((r) => (
            <div
              key={r.id}
              className="rounded-lg border border-gray-200 bg-white p-3"
            >
              <p className="text-sm text-gray-700">{r.text}</p>
              <p className="mt-1 text-xs text-gray-400">
                {new Date(r.submittedAt).toLocaleDateString()} at{" "}
                {new Date(r.submittedAt).toLocaleTimeString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
