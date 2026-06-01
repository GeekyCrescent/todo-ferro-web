import { api } from "../lib/api";
import type { AppUser, CreateUserDto } from "../lib/types";

/** Ruta pública: crea el usuario en Firebase + base de datos. */
export const createUser = async (dto: CreateUserDto): Promise<AppUser> => {
  const { data } = await api.post<AppUser>("/user", dto);
  return data;
};
