import { apiClient } from "../../../services/apiClient";
import { CategoryRaw, Category, mapCategory, CategoryCreatePayload, CategoryUpdatePayload } from "../../../types/category";

export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    const data = await apiClient.get<CategoryRaw[]>("/categories");
    return data.map(mapCategory);
  },

  create: async (payload: CategoryCreatePayload): Promise<Category> => {
    const body: Record<string, unknown> = { name: payload.name };
    if (payload.color) body.color = payload.color;
    if (payload.icon) body.icon = payload.icon;
    if (payload.appliesTo) body.applies_to = payload.appliesTo;
    const data = await apiClient.post<CategoryRaw>("/categories", body);
    return mapCategory(data);
  },

  update: async (id: string, payload: CategoryUpdatePayload): Promise<Category> => {
    const body: Record<string, unknown> = {};
    if (payload.name !== undefined) body.name = payload.name;
    if (payload.color !== undefined) body.color = payload.color;
    if (payload.icon !== undefined) body.icon = payload.icon;
    if (payload.appliesTo !== undefined) body.applies_to = payload.appliesTo;
    const data = await apiClient.put<CategoryRaw>(`/categories/${id}`, body);
    return mapCategory(data);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/categories/${id}`);
  },
};
