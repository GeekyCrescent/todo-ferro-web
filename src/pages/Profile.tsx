import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "../components/ui/Button";
import { LogoutIcon, UserIcon } from "../components/ui/Icons";
import { ErrorBanner, Spinner } from "../components/ui/States";
import { listLists } from "../api/lists";
import { listMyTodos } from "../api/todos";
import { useAuth } from "../context/AuthContext";
import { PRIORITY_LABEL } from "../lib/format";
import type { Priority, TaskList, Todo } from "../lib/types";

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [lists, setLists] = useState<TaskList[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [l, t] = await Promise.all([listLists(), listMyTodos()]);
        setLists(l);
        setTodos(t);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "No se pudieron cargar las estadísticas"
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const completed = todos.filter((t) => t.completed).length;
  const pending = todos.length - completed;
  const byPriority = (p: Priority) => todos.filter((t) => t.priority === p).length;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Perfil</h1>
          <p>Tu cuenta y un resumen de tu actividad.</p>
        </div>
      </div>

      {/* Tarjeta de usuario */}
      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <div className="row" style={{ gap: 16 }}>
          <span
            className="auth__logo"
            style={{ width: 56, height: 56, borderRadius: 16 }}
          >
            <UserIcon width={28} height={28} />
          </span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: "1.05rem" }}>
              {user?.displayName || "Mi cuenta"}
            </div>
            <div className="muted" style={{ wordBreak: "break-all" }}>
              {user?.email}
            </div>
          </div>
          <span className="spacer" />
          <Button variant="danger" onClick={onLogout}>
            <LogoutIcon width={17} height={17} /> Cerrar sesión
          </Button>
        </div>
      </div>

      {error && <ErrorBanner message={error} />}

      {loading ? (
        <Spinner center />
      ) : (
        <>
          <h3 style={{ margin: "8px 0 14px", fontSize: "0.95rem" }}>
            Estadísticas
          </h3>
          <div className="stats" style={{ marginBottom: 18 }}>
            <Stat num={lists.length} label="Listas" />
            <Stat num={todos.length} label="Tareas" />
            <Stat num={pending} label="Pendientes" />
            <Stat num={completed} label="Completadas" />
          </div>

          <div className="stats">
            <Stat
              num={byPriority("HIGH")}
              label={`Prioridad ${PRIORITY_LABEL.HIGH.toLowerCase()}`}
              color="var(--priority-high)"
            />
            <Stat
              num={byPriority("MEDIUM")}
              label={`Prioridad ${PRIORITY_LABEL.MEDIUM.toLowerCase()}`}
              color="var(--priority-medium)"
            />
            <Stat
              num={byPriority("LOW")}
              label={`Prioridad ${PRIORITY_LABEL.LOW.toLowerCase()}`}
              color="var(--priority-low)"
            />
          </div>

          <div className="card" style={{ padding: 20, marginTop: 24 }}>
            <h3 style={{ fontSize: "0.95rem", marginBottom: 6 }}>
              Acerca de
            </h3>
            <p className="muted" style={{ fontSize: "0.9rem", lineHeight: 1.6 }}>
              App web de tareas construida con React + TypeScript, Firebase
              Authentication y Axios, consumiendo un backend en Cloud Run. Misma
              cuenta y mismos datos que la app móvil.
            </p>
          </div>
        </>
      )}
    </>
  );
}

function Stat({
  num,
  label,
  color,
}: {
  num: number;
  label: string;
  color?: string;
}) {
  return (
    <div className="card stat">
      <div className="stat__num" style={color ? { color } : undefined}>
        {num}
      </div>
      <div className="stat__label">{label}</div>
    </div>
  );
}
