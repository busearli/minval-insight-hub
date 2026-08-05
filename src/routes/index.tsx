import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MessageCircle, Sparkles } from "lucide-react";
import { useState } from "react";

import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ArchPattern } from "@/components/MinvalMark";
import { ProgramCard } from "@/components/ProgramCard";
import { ProgramDetailModal } from "@/components/ProgramDetailModal";
import { RegistrationModal } from "@/components/RegistrationModal";
import { WeeklySchedule } from "@/components/WeeklySchedule";
import { WHATSAPP_URL, principles, programs, type Program } from "@/lib/minval-programs";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Minval Akademi | Kahve — İlim, Hikmet ve Güzel Ahlak" },
      {
        name: "description",
        content:
          "Maneviyat, kültür ve sanatı bir arada yaşatmayı hedefleyen bağımsız eğitim ve gönül merkezi. Risale, Tefsir, Hadis, Psikoloji ve Genç programları.",
      },
      { property: "og:title", content: "Minval Akademi | Kahve" },
      {
        property: "og:description",
        content:
          "İlim, hikmet ve güzel ahlak ekseninde bağımsız bir ilim, kültür ve gençlik hareketi.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const [detail, setDetail] = useState<Program | null>(null);
  const [regOpen, setRegOpen] = useState(false);
  const [regProgram, setRegProgram] = useState("");
  const openRegister = (id = "") => {
    setRegProgram(id);
    setRegOpen(true);
  };

  return (

    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <ArchPattern className="pointer-events-none absolute inset-0 h-full w-full text-primary-foreground/15" />
        <div className="relative mx-auto max-w-6xl px-5 py-20 sm:py-28">
          <p className="text-[11px] tracking-[0.28em] uppercase opacity-70">
            Minval Akademi | Kahve
          </p>
          <h1 className="mt-6 max-w-3xl font-serif text-4xl leading-[1.12] sm:text-5xl md:text-6xl">
            İlim, Hikmet ve Güzel Ahlak Ekseninde Bir Gelecek
          </h1>
          <p className="mt-6 max-w-2xl text-[15px] leading-relaxed opacity-85">
            Maneviyat, kültür ve sanatı bir arada yaşatmayı hedefleyen bağımsız eğitim ve gönül
            merkezi.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              to="/programlar"
              className="inline-flex items-center gap-2 rounded-full bg-background px-6 py-3 text-sm text-foreground transition-opacity hover:opacity-90"
            >
              Programlarımızı Keşfedin <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              onClick={() => openRegister()}
              className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/40 px-6 py-3 text-sm transition-colors hover:bg-primary-foreground/10"
            >
              <Sparkles className="h-4 w-4" /> Ön Kayıt Ol
            </button>

          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <p className="eyebrow">Hakkımızda</p>
        <blockquote className="mt-5 max-w-3xl border-l-2 border-accent pl-5 font-serif text-2xl leading-snug text-foreground sm:text-3xl">
          “Minval Akademi, ilim, hikmet ve güzel ahlak ekseninde; insanın aklına, kalbine ve
          hayatına dokunmayı amaçlayan bağımsız bir ilim, kültür ve gençlik hareketidir.”
        </blockquote>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {principles.map((v, i) => (
            <div key={v.title} className="card-soft hover-lift border-accent/40 p-6">
              <span className="font-serif text-sm text-accent">0{i + 1}</span>
              <h3 className="mt-3 text-lg leading-snug text-foreground">{v.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.text}</p>
            </div>
          ))}
        </div>
        <Link
          to="/hakkimizda"
          className="mt-8 inline-flex items-center gap-2 text-sm text-primary hover:underline"
        >
          Daha fazlası <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      {/* Programs preview */}
      <section className="border-y border-border bg-secondary/50">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <p className="eyebrow">Programlarımız</p>
          <h2 className="mt-4 text-3xl text-foreground sm:text-4xl">Açık okuma halkalarımız</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {programs.slice(0, 3).map((p) => (
              <ProgramCard key={p.id} p={p} onOpen={setDetail} />
            ))}
          </div>
          <Link
            to="/programlar"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground"
          >
            Tüm Programlar <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Weekly timetable */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <p className="eyebrow">Haftalık Program</p>
        <h2 className="mt-4 text-3xl text-foreground sm:text-4xl">Hangi grup, hangi gün?</h2>
        <div className="mt-10">
          <WeeklySchedule />
        </div>
      </section>

      {/* Registration */}
      <section className="mx-auto max-w-6xl px-5 pb-16">
        <div className="card-soft flex flex-col items-start gap-6 border-accent/40 p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
          <div>
            <h2 className="text-2xl text-foreground">Ön kayıt formu ile başlayın</h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Formu doldurun; kontenjan durumuna göre kurumsal WhatsApp hattımızdan sizinle
              iletişime geçelim.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <button
              onClick={() => openRegister()}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground"
            >
              <Sparkles className="h-4 w-4" /> Ön Kayıt Ol
            </button>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm text-foreground"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          </div>
        </div>
      </section>

      <ProgramDetailModal
        program={detail}
        onOpenChange={(v) => !v && setDetail(null)}
        onRegister={(p) => {
          setDetail(null);
          openRegister(p.id);
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
