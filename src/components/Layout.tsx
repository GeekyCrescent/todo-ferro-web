import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import {
  CheckCircleIcon,
  HomeIcon,
  ListIcon,
  MenuIcon,
  SearchIcon,
  UserIcon,
} from "./ui/Icons";

const NAV = [
  { to: "/", label: "Inicio", icon: HomeIcon, end: true },
  { to: "/todos", label: "Todas las tareas", icon: CheckCircleIcon, end: false },
  { to: "/search", label: "Buscar", icon: SearchIcon, end: false },
  { to: "/profile", label: "Perfil", icon: UserIcon, end: false },
];

export function Layout() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  return (
    <div className="layout">
      {open && <div className="scrim" onClick={close} />}

      <aside className={`sidebar${open ? " sidebar--open" : ""}`}>
        <div className="sidebar__brand">
          <span className="sidebar__logo">
            <ListIcon width={18} height={18} />
          </span>
          Tareas
        </div>

        <nav className="stack" style={{ gap: 2 }}>
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={close}
              className={({ isActive }) =>
                `navlink${isActive ? " navlink--active" : ""}`
              }
            >
              <Icon width={19} height={19} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__spacer" />

        <div className="sidebar__user">
          <div className="sidebar__user-email">{user?.email}</div>
          <NavLink to="/profile" onClick={close} className="navlink">
            <UserIcon width={19} height={19} />
            Mi cuenta
          </NavLink>
        </div>
      </aside>

      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <div className="topbar">
          <button
            className="btn btn--ghost btn--icon"
            onClick={() => setOpen(true)}
            aria-label="Abrir menú"
          >
            <MenuIcon />
          </button>
          Tareas
        </div>

        <main className="content">
          <div className="content__inner">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
