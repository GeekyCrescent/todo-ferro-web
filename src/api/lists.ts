import { api } from "../lib/api";
import type { CreateListDto, TaskList, Todo, UpdateListDto } from "../lib/types";

export const listLists = async (): Promise<TaskList[]> => {
  const { data } = await api.get<TaskList[]>("/list");
  return data;
};

export const createList = async (dto: CreateListDto): Promise<TaskList> => {
  const { data } = await api.post<TaskList>("/list", dto);
  return data;
};

export const updateList = async (
  id: string,
  dto: UpdateListDto
): Promise<TaskList> => {
  const { data } = await api.put<TaskList>(`/list/${id}`, dto);
  return data;
};

export const deleteList = async (id: string): Promise<void> => {
  await api.delete(`/list/${id}`);
};

export const listTodosByList = async (listId: string): Promise<Todo[]> => {
  const { data } = await api.get<Todo[]>(`/list/${listId}/todos`);
  return data;
};
