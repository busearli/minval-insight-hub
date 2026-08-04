import { Link, useRouterState } from "@tanstack/react-router";

export function ViewSwitcher() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isPanel = pathname.startsWith("/panel");

  const base =
    "rounded-full px-3 py-1.5 text-[11px] font-medium tracking-wide transition-colors whitespace-nowrap";

  return (
    <div className="flex items-center gap-1 rounded-full border border-border bg-secondary/70 p-1">
      <Link
        to="/"
        className={`${base} ${!isPanel ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
      >
        Akademi Tanıtım Sitesi
      </Link>
      <Link
        to="/panel"
        className={`${base} ${isPanel ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
      >
        Katılımcı Paneli
      </Link>
    </div>
  );
}
