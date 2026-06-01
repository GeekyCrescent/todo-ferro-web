import { useState } from "react";
import { Navigate } from "react-router-dom";

import { Button } from "../components/ui/Button";
import { Field, Input } from "../components/ui/Field";
import { ErrorBanner } from "../components/ui/States";
import { ListIcon } from "../components/ui/Icons";
import { useAuth } from "../context/AuthContext";
import { createUser } from "../api/user";

type Mode = "login" | "register";

export default function Login() {
  const { user, initializing, login } = useAuth();

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Si ya hay sesión, no tiene sentido mostrar el login.
  if (!initializing && user) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // En registro: primero creamos el usuario (Firebase + BD) vía la ruta
      // pública POST /user, luego iniciamos sesión normalmente.
      if (mode === "register") {
        await createUser({ email, password, fullName });
      }
      await login(email, password);
      // El guard / la redirección de arriba se encargan al cambiar `user`.
    } catch (err) {
      setError(humanizeError(err, mode));
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      <form className="card auth__card" onSubmit={onSubmit}>
        <div className="auth__brand">
          <span className="auth__logo">
            <ListIcon width={26} height={26} />
          </span>
          <div>
            <h1>{mode === "login" ? "Bienvenido de vuelta" : "Crea tu cuenta"}</h1>
            <p>
              {mode === "login"
                ? "Inicia sesión para ver tus listas y tareas."
                : "Regístrate para empezar a organizar tus tareas."}
            </p>
          </div>
        </div>

        {error && <ErrorBanner message={error} />}

        {mode === "register" && (
          <Field label="Nombre completo">
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
              required
              placeholder="Tu nombre"
            />
          </Field>
        )}

        <Field label="Correo electrónico">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            placeholder="tucorreo@ejemplo.com"
          />
        </Field>

        <Field label="Contraseña">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            required
            minLength={6}
            placeholder="••••••••"
          />
        </Field>

        <Button type="submit" block loading={loading}>
          {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
        </Button>

        <p className="text-center muted" style={{ fontSize: "0.88rem" }}>
          {mode === "login" ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
          <button
            type="button"
            className="link-btn"
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError(null);
            }}
          >
            {mode === "login" ? "Regístrate" : "Inicia sesión"}
          </button>
        </p>
      </form>
    </div>
  );
}

/** Traduce los errores más comunes de Firebase a mensajes claros. */
function humanizeError(err: unknown, mode: Mode): string {
  const raw = err instanceof Error ? err.message : String(err);
  if (raw.includes("auth/invalid-credential") || raw.includes("auth/wrong-password"))
    return "Correo o contraseña incorrectos.";
  if (raw.includes("auth/user-not-found"))
    return "No existe una cuenta con ese correo.";
  if (raw.includes("auth/email-already-in-use"))
    return "Ese correo ya está registrado. Inicia sesión.";
  if (raw.includes("auth/invalid-email")) return "El correo no es válido.";
  if (raw.includes("auth/weak-password"))
    return "La contraseña debe tener al menos 6 caracteres.";
  if (raw.includes("auth/too-many-requests"))
    return "Demasiados intentos. Espera un momento e inténtalo de nuevo.";
  if (mode === "register")
    return raw || "No se pudo crear la cuenta.";
  return raw || "No se pudo iniciar sesión.";
}
