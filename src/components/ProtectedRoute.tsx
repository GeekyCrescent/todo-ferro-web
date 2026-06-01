import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { Spinner } from "./ui/States";

/**
 * Protege las rutas internas. Mientras Firebase restaura la sesión muestra un
 * spinner (evita el "parpadeo" hacia Login). Sin sesión, redirige a /login.
 */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, initializing } = useAuth();

  if (initializing) {
    return (
      <div className="auth">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
