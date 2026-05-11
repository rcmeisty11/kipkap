import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { FocusGroup } from "@/types";

export function useFocusGroups(sectionId?: number | null) {
  return useQuery<FocusGroup[]>({
    queryKey: ["focus-groups", sectionId],
    queryFn: async () => {
      const params = sectionId ? { section_id: sectionId } : {};
      const { data } = await api.get("/focus-groups", { params });
      return data;
    },
    enabled: !!sectionId,
  });
}

export function useCreateFocusGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { name: string; section_id: number; color: string }) => {
      const { data } = await api.post("/focus-groups", body);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["focus-groups"] }),
  });
}

export function useUpdateFocusGroupMembers() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { groupId: number; student_ids: number[] }) => {
      const { data } = await api.put(`/focus-groups/${params.groupId}/members`, { student_ids: params.student_ids });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["focus-groups"] }),
  });
}
