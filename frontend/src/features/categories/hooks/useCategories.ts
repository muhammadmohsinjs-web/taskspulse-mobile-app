import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoriesApi } from "../api/categoriesApi";
import { CategoryCreatePayload, CategoryUpdatePayload } from "../../../types";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: categoriesApi.getAll,
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CategoryCreatePayload) => categoriesApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
    onError: (error: Error) => {
      console.error("Failed to create category:", error.message);
    },
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CategoryUpdatePayload }) =>
      categoriesApi.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
    onError: (error: Error) => {
      console.error("Failed to update category:", error.message);
    },
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
    onError: (error: Error) => {
      console.error("Failed to delete category:", error.message);
    },
  });
}
