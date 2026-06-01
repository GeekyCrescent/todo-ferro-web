import axios, { AxiosError } from "axios";

import { auth } from "./firebase";

const baseURL = import.meta.env.VITE_API_URL;

if (!baseURL) {
  throw new Error("Falta la variable de entorno: VITE_API_URL");
}

export const api = axios.create({
  baseURL,
  timeout: 20000,
});

/**
 * Interceptor de request: inyecta SIEMPRE un idToken fresco de Firebase.
 *
 * Usamos `auth.currentUser.getIdToken()` (no un token cacheado en
 * localStorage) para que Firebase auto-refresque el token y no recibamos
 * 401 después de 1 hora. Si todavía no hay usuario (sesión cargando o sin
 * login), la request sale sin header — útil para la ruta pública POST /user.
 */
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Interceptor de response: normaliza cualquier error a un `Error` con un
 * mensaje legible para mostrar en la UI.
 */
api.interceptors.response.use(
  (res) => res,
  (error: AxiosError<{ message?: string; error?: string }>) => {
    const message =
      error.response?.data?.message ??
      error.response?.data?.error ??
      error.message ??
      "Error de red. Revisa tu conexión e inténtalo de nuevo.";
    return Promise.reject(new Error(message));
  }
);
