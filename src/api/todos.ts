import { api } from "../lib/api";
import type { CreateTodoDto, Todo, UpdateTodoDto } from "../lib/types";

export const listMyTodos = async (): Promise<Todo[]> => {
  const { data } = await api.get<Todo[]>("/todo/my-todos");
  return data;
};

export const createTodo = async (dto: CreateTodoDto): Promise<Todo> => {
  const { data } = await api.post<Todo>("/todo", dto);
  return data;
};

export const updateTodo = async (
  id: string,
  dto: UpdateTodoDto
): Promise<Todo> => {
  const { data } = await api.put<Todo>(`/todo/${id}`, dto);
  return data;
};

export const toggleTodo = async (id: string): Promise<Todo> => {
  const { data } = await api.patch<Todo>(`/todo/${id}/toggle`, {});
  return data;
};

export const deleteTodo = async (id: string): Promise<void> => {
  await api.delete(`/todo/${id}`);
};
