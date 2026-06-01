import type { ReactNode } from "react";

export function Spinner({ center = false }: { center?: boolean }) {
  return <div className={`spinner${center ? " spinner--center" : ""}`} />;
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="banner" role="alert">
      <span>⚠️</span>
      <span>{message}</span>
    </div>
  );
}

export function EmptyState({
  icon = "📭",
  title,
  children,
}: {
  icon?: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="state card" style={{ padding: "48px 24px" }}>
      <div className="state__icon">{icon}</div>
      <div className="state__title">{title}</div>
      {children && <div>{children}</div>}
    </div>
  );
}
