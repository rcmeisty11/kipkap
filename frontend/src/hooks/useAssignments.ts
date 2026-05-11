import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Assignment, StudentScore } from "@/types";

export function useAssignments(sectionId?: number | null) {
  return useQuery<Assignment[]>({
    queryKey: ["assignments", sectionId],
    queryFn: async () => {
      const params = sectionId ? { section_id: sectionId } : {};
      const { data } = await api.get("/assignments", { params });
      return data;
    },
  });
}

export function useAssignmentScores(assignmentId: number | null) {
  return useQuery<StudentScore[]>({
    queryKey: ["scores", assignmentId],
    queryFn: async () => {
      const { data } = await api.get(`/assignments/${assignmentId}/scores`);
      return data;
    },
    enabled: !!assignmentId,
  });
}

export function useUpdateScore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { assignmentId: number; studentId: number; score?: number | null; override_score?: number | null; notes?: string | null }) => {
      const { assignmentId, studentId, ...body } = params;
      const { data } = await api.put(`/assignments/${assignmentId}/scores/${studentId}`, body);
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["scores", vars.assignmentId] });
    },
  });
}

export function useCreateAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { title: string; subject?: string; max_score: number; due_date?: string; section_id: number; standard_id?: number; notes?: string }) => {
      const { data } = await api.post("/assignments", body);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assignments"] });
    },
  });
}

export function useDeleteAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (assignmentId: number) => {
      await api.delete(`/assignments/${assignmentId}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assignments"] });
    },
  });
}
