import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, MessageCircle, ShieldCheck, X } from "lucide-react";

import { MinvalMark, ArchPattern } from "@/components/MinvalMark";
import { WHATSAPP_URL } from "@/lib/minval-programs";

const navLinks = [
  { label: "Hakkımızda", to: "/hakkimizda" },
  { label: "Programlarımız", to: "/programlar" },
  { label: "Minval Sanat", to: "/minval-sanat" },
  { label: "İletişim", to: "/iletisim" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

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

        <nav className="mx-auto hidden items-center gap-7 lg:flex">
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
          <Link
            to="/admin"
            title="Yönetim Paneli"
            className="hidden items-center gap-1.5 rounded-full border border-border px-3 py-2 text-[12px] text-muted-foreground transition-colors hover:border-accent hover:text-primary sm:inline-flex"
          >
            <ShieldCheck className="h-3.5 w-3.5" /> Yönetim
          </Link>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-[13px] text-primary-foreground transition-opacity hover:opacity-90"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="hidden sm:inline">WhatsApp ile Kayıt Ol</span>
            <span className="sm:hidden">Kayıt</span>
          </a>
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
            <Link to="/admin" onClick={() => setOpen(false)} className="text-sm text-muted-foreground">
              Yönetim Paneli
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
