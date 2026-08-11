import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ProgramCard } from "@/components/ProgramCard";
import { ProgramDetailModal } from "@/components/ProgramDetailModal";
import { RegistrationModal } from "@/components/RegistrationModal";
import { ArchPattern } from "@/components/MinvalMark";
import { categoryTabs, type Program } from "@/lib/minval-programs";
import { usePrograms } from "@/lib/programs-api";

export const Route = createFileRoute("/programlar")({
  head: () => ({
    meta: [
      { title: "Programlarımız — Minval Akademi | Kahve" },
      {
        name: "description",
        content:
          "Minval Risale, Tefsir, Minval Hadis, Minval Psikoloji ve Minval Genç programları; açık gruplar, müfredat, katılım şartları ve ön kayıt.",
      },
      { property: "og:title", content: "Programlarımız — Minval Akademi" },
      {
        property: "og:description",
        content: "Risale, Tefsir, Hadis, Psikoloji ve Genç okuma halkalarımızın tüm grupları.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProgramsPage,
});

function ProgramsPage() {
  const [tab, setTab] = useState<string>("all");
  const [detail, setDetail] = useState<Program | null>(null);
  const [regOpen, setRegOpen] = useState(false);
  const [regProgram, setRegProgram] = useState("");
  const { programs } = usePrograms();

  const list = tab === "all" ? programs : programs.filter((p) => p.category === tab);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="relative overflow-hidden border-b border-border bg-primary text-primary-foreground">
        <ArchPattern className="pointer-events-none absolute inset-0 h-full w-full text-primary-foreground/15" />
        <div className="relative mx-auto max-w-6xl px-5 py-16">
          <p className="text-[11px] tracking-[0.28em] uppercase opacity-70">Programlarımız</p>
          <h1 className="mt-4 max-w-3xl font-serif text-4xl leading-tight sm:text-5xl">
            Okuma halkaları ve atölyeler
          </h1>
          <p className="mt-5 max-w-2xl text-[15px] leading-relaxed opacity-85">
            Programlarımızın tamamı kontenjan esaslıdır. Katılmak için ön kayıt formunu doldurmanız
            yeterlidir; kartlara tıklayarak müfredat detaylarını inceleyebilirsiniz.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-5 py-14">
        <div className="flex flex-wrap gap-2">
          {categoryTabs.map((c) => (
            <button
              key={c.id}
              onClick={() => setTab(c.id)}
              className={`rounded-full border px-4 py-2 text-[13px] transition-colors ${
                tab === c.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-accent/50 text-muted-foreground hover:border-accent hover:text-primary"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => (
            <ProgramCard key={p.id} p={p} onOpen={setDetail} />
          ))}
        </div>

        <div className="card-soft mt-12 flex flex-col items-start gap-5 border-accent/40 p-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Kontenjan durumundan haberdar olmak için ön kayıt formunu doldurabilirsiniz.
          </p>
          <button
            onClick={() => {
              setRegProgram("");
              setRegOpen(true);
            }}
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground"
          >
            Ön Kayıt Ol
          </button>
        </div>
      </main>

      <ProgramDetailModal
        program={detail}
        onOpenChange={(v) => !v && setDetail(null)}
        onRegister={(p) => {
          setDetail(null);
          setRegProgram(p.id);
          setRegOpen(true);
        }}
      />
      <RegistrationModal
        key={regProgram}
        open={regOpen}
        onOpenChange={setRegOpen}
        defaultProgramId={regProgram}
      />

      <SiteFooter />
    </div>
  );
}
