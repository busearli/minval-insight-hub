import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, LogIn, Menu, Sparkles, X } from "lucide-react";

import { MinvalMark, ArchPattern } from "@/components/MinvalMark";
import { PortalDialog } from "@/components/PortalDialog";
import { RegistrationModal } from "@/components/RegistrationModal";
import { useSiteSettings } from "@/lib/site-api";
import { useAuth } from "@/hooks/use-auth";
import { useMyRoles } from "@/lib/rbac";

const navLinks = [
  { label: "Hakkımızda", to: "/hakkimizda" },
  { label: "Programlarımız", to: "/programlar" },
  { label: "Haftalık Program", to: "/haftalik-program" },
  { label: "Minval Sanat", to: "/minval-sanat" },
  { label: "İletişim", to: "/iletisim" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [portal, setPortal] = useState(false);
  const [register, setRegister] = useState(false);
  const { settings } = useSiteSettings();
  const { user } = useAuth();
  const { isStaff } = useMyRoles();

  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const showPreRegistration = settings.pre_registration_enabled !== false;

  // Çift rollü kullanıcılar için: bulunduğu panelin dışındaki paneli göster.
  const onAdmin = pathname.startsWith("/admin");
  const onStudent = pathname.startsWith("/ogrenci");
  const panel = isStaff
    ? onAdmin
      ? { to: "/ogrenci" as const, label: "Öğrenci Panelim" }
      : { to: "/admin" as const, label: "Eğitmen Panelim" }
    : onStudent
      ? null
      : { to: "/ogrenci" as const, label: "Öğrenci Panelim" };

  return (
    <header className="sticky top-0 z-40 overflow-hidden border-b border-border bg-background/90 backdrop-blur">
      <ArchPattern className="pointer-events-none absolute inset-x-0 bottom-0 h-full w-full text-accent/15" />
      <div className="relative mx-auto flex max-w-6xl items-center gap-4 px-5 py-3">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <MinvalMark className="h-9 w-9 shrink-0" />
          <span className="min-w-0">
            <span className="block truncate text-[13px] font-semibold tracking-[0.18em] text-foreground uppercase">
              Minval Akademi
            </span>
            <span className="block text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
              Kahve
            </span>
          </span>
        </Link>

        <nav className="mx-auto hidden items-center gap-6 lg:flex">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeProps={{ className: "text-primary" }}
              className="text-[13px] text-muted-foreground transition-colors hover:text-primary"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          {user ? (
            panel && (
              <Link
                to={panel.to}
                className="hidden items-center gap-1.5 rounded-full border border-border px-4 py-2 text-[12px] text-muted-foreground transition-colors hover:border-accent hover:text-primary sm:inline-flex"
              >
                <LayoutDashboard className="h-3.5 w-3.5" /> {panel.label}
              </Link>
            )
          ) : (
            <button
              onClick={() => setPortal(true)}
              className="hidden items-center gap-1.5 rounded-full border border-border px-4 py-2 text-[12px] text-muted-foreground transition-colors hover:border-accent hover:text-primary sm:inline-flex"
            >
              <LogIn className="h-3.5 w-3.5" /> Giriş Yap
            </button>
          )}
          {showPreRegistration && (
            <button
              onClick={() => setRegister(true)}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-[13px] text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Sparkles className="h-4 w-4" /> Ön Kayıt Ol
            </button>
          )}
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Menü"
            className="rounded-full border border-border p-2 lg:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="relative border-t border-border bg-card px-5 py-4 lg:hidden">
          <div className="flex flex-col gap-3">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="text-sm text-muted-foreground"
              >
                {l.label}
              </Link>
            ))}
            {user ? (
              panel && (
                <Link to={panel.to} onClick={() => setOpen(false)} className="text-sm text-muted-foreground">
                  {panel.label}
                </Link>
              )
            ) : (
              <button
                onClick={() => {
                  setOpen(false);
                  setPortal(true);
                }}
                className="text-left text-sm text-muted-foreground"
              >
                Giriş Yap
              </button>
            )}
          </div>
        </div>
      )}

      <PortalDialog open={portal} onOpenChange={setPortal} />
      <RegistrationModal open={register} onOpenChange={setRegister} />
    </header>
  );
}
