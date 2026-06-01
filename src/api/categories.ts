import { api } from "../lib/api";
import type { Category, CreateCategoryDto } from "../lib/types";

export const listCategories = async (): Promise<Category[]> => {
  const { data } = await api.get<Category[]>("/category");
  return data;
};

export const createCategory = async (
  dto: CreateCategoryDto
): Promise<Category> => {
  const { data } = await api.post<Category>("/category", dto);
  return data;
};
