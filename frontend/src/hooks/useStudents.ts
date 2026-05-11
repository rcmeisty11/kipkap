import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Student, Section } from "@/types";

export function useStudents(sectionId?: number | null) {
  return useQuery<Student[]>({
    queryKey: ["students", sectionId],
    queryFn: async () => {
      const params = sectionId ? { section_id: sectionId } : {};
      const { data } = await api.get("/students", { params });
      return data;
    },
  });
}

export function useSections() {
  return useQuery<Section[]>({
    queryKey: ["sections"],
    queryFn: async () => {
      const { data } = await api.get("/students/sections");
      return data;
    },
  });
}
