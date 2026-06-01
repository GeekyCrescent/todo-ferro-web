// Tipos del dominio. Reflejan exactamente lo que devuelve el backend.

export type Priority = "LOW" | "MEDIUM" | "HIGH";

export type Category = {
  uuid: string;
  name: string;
  color: string;
  createdAt?: string;
};

export type Todo = {
  uuid: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
  ownerId: string;
  listId?: string | null;
  priority: Priority;
  dueDate?: string | null;
  categories: Category[];
};

export type TaskList = {
  uuid: string;
  name: string;
  description?: string;
  color?: string;
  ownerId: string;
  createdAt: string;
  todoCount: number;
};

export type AppUser = {
  id: string;
  email: string;
  fullName: string;
  firebaseUuid: string;
  role?: string;
};

// ---- DTOs de entrada ----

export type CreateUserDto = {
  email: string;
  password: string;
  fullName: string;
};

export type CreateListDto = {
  name: string;
  description?: string;
  color?: string;
};

export type UpdateListDto = {
  name?: string;
  description?: string;
  color?: string;
};

export type CreateTodoDto = {
  title: string;
  description?: string;
  priority?: Priority;
  dueDate?: string;
  listId?: string;
  categoryIds?: string[];
};

export type UpdateTodoDto = {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: Priority;
  dueDate?: string;
  listId?: string;
  categoryIds?: string[];
};

export type CreateCategoryDto = {
  name: string;
  color: string;
};
