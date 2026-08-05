import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { BarChart3, BookOpen, CalendarCheck, GraduationCap, Home, Users } from "lucide-react";
import { useState } from "react";

import { MinvalMark } from "@/components/MinvalMark";
import { AuthDialog } from "@/components/AuthDialog";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Yönetim Paneli — Minval Akademi" },
      {
        name: "description",
        content:
          "Minval Akademi iç yönetim sistemi: sınıf yönetimi, öğrenci kayıtları, yoklama, ödev takibi ve raporlar.",
      },
      { property: "og:title", content: "Yönetim Paneli — Minval Akademi" },
      { property: "og:description", content: "Sınıf, yoklama ve ödev takip sistemi." },
      { name: "robots", content: "noindex" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminLayout,
});

const items = [
  { to: "/admin", label: "Genel Bakış & Raporlar", icon: BarChart3, exact: true },
  { to: "/admin/siniflar", label: "Sınıflar", icon: Home },
  { to: "/admin/ogrenciler", label: "Öğrenciler", icon: Users },
  { to: "/admin/yoklama", label: "Yoklama", icon: CalendarCheck },
  { to: "/admin/odevler", label: "Ödevler", icon: BookOpen },
] as const;

function AdminLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, loading, signOut } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);

  if (!loading && !user) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-5">
        <div className="card-soft w-full max-w-md border-accent/40 p-9 text-center">
          <MinvalMark className="mx-auto h-14 w-14" />
          <h1 className="mt-6 text-2xl text-foreground">Yönetim Paneli</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Sınıf, yoklama ve ödev kayıtlarına erişmek için giriş yapmanız gerekir.
          </p>
          <button
            onClick={() => setAuthOpen(true)}
            className="mt-7 w-full rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground"
          >
            Giriş Yap
          </button>
          <Link to="/" className="mt-4 inline-block text-[13px] text-muted-foreground hover:text-primary">
            Siteye dön
          </Link>
        </div>
        <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-5 py-3">
          <Link to="/" className="flex items-center gap-3">
            <MinvalMark className="h-8 w-8" />
            <span className="text-[12px] font-semibold tracking-[0.18em] text-foreground uppercase">
              Yönetim
            </span>
          </Link>
          <button
            onClick={() => void signOut()}
            className="ml-auto rounded-full border border-border px-4 py-2 text-[12px] text-muted-foreground hover:text-primary"
          >
            Çıkış
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-6 lg:flex-row">
        <nav className="flex gap-2 overflow-x-auto lg:w-60 lg:shrink-0 lg:flex-col lg:overflow-visible">
          {items.map((it) => {
            const active = it.exact ? pathname === it.to : pathname.startsWith(it.to);
            return (
              <Link
                key={it.to}
                to={it.to}
                className={`flex shrink-0 items-center gap-2.5 rounded-xl px-4 py-2.5 text-[13px] transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <it.icon className="h-4 w-4" /> {it.label}
              </Link>
            );
          })}
        </nav>

        <main className="min-w-0 flex-1">
          {loading ? (
            <div className="flex items-center gap-2 p-10 text-sm text-muted-foreground">
              <GraduationCap className="h-4 w-4" /> Yükleniyor…
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
}
