import { createFileRoute } from "@tanstack/react-router";

import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { WeeklySchedule } from "@/components/WeeklySchedule";
import { ArchPattern } from "@/components/MinvalMark";

export const Route = createFileRoute("/haftalik-program")({
  head: () => ({
    meta: [
      { title: "Haftalık Ders Programı — Minval Akademi | Kahve" },
      {
        name: "description",
        content:
          "Minval Akademi haftalık ders programı: Risale, Tefsir, Hadis, Psikoloji ve Minval Genç gruplarının gün ve saatleri.",
      },
      { property: "og:title", content: "Haftalık Ders Programı — Minval Akademi" },
      {
        property: "og:description",
        content: "Pazartesi'den Pazar'a tüm okuma halkalarının gün ve saat çizelgesi.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TimetablePage,
});

function TimetablePage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="relative overflow-hidden border-b border-border bg-primary text-primary-foreground">
        <ArchPattern className="pointer-events-none absolute inset-0 h-full w-full text-primary-foreground/15" />
        <div className="relative mx-auto max-w-6xl px-5 py-16">
          <p className="text-[11px] tracking-[0.28em] uppercase opacity-70">Haftalık Program</p>
          <h1 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
            Hangi grup, hangi gün?
          </h1>
          <p className="mt-5 max-w-2xl text-[15px] leading-relaxed opacity-85">
            Ders saatleri dönem başında güncellenir. Kesin saat bilgisi için grubunuzun eğitmeniyle
            iletişime geçebilirsiniz.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-5 py-14">
        <WeeklySchedule />
      </main>

      <SiteFooter />
    </div>
  );
}
