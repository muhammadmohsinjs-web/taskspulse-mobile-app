import { apiClient } from "../../../services/apiClient";
import { toSnakeCase } from "../../../services/mappers";
import { CategoryRaw, Category, mapCategory, CategoryCreatePayload, CategoryUpdatePayload } from "../../../types/category";

export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    const data = await apiClient.get<CategoryRaw[]>("/categories");
    return data.map(mapCategory);
  },

  create: async (payload: CategoryCreatePayload): Promise<Category> => {
    const body = toSnakeCase(payload as Record<string, unknown>);
    const data = await apiClient.post<CategoryRaw>("/categories", body);
    return mapCategory(data);
  },

  update: async (id: string, payload: CategoryUpdatePayload): Promise<Category> => {
    const body = toSnakeCase(payload as Record<string, unknown>);
    const data = await apiClient.put<CategoryRaw>(`/categories/${id}`, body);
    return mapCategory(data);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/categories/${id}`);
  },
};
