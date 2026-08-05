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
import { useSiteSettings } from "@/lib/site-api";


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
  const { settings } = useSiteSettings();
  const customPrinciples = asList<PrincipleItem>(settings.principles_json);
  const principleList = customPrinciples.length > 0 ? customPrinciples : principles;
  const stats = asList<StatItem>(settings.stats_json);
  const testimonials = asList<TestimonialItem>(settings.testimonials_json);
  const faq = asList<FaqItem>(settings.faq_json);
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
            {settings.hero_eyebrow}
          </p>
          <h1 className="mt-6 max-w-3xl font-serif text-4xl leading-[1.12] sm:text-5xl md:text-6xl">
            {settings.hero_title}
          </h1>
          <p className="mt-6 max-w-2xl text-[15px] leading-relaxed opacity-85">
            {settings.hero_subtitle}
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              to="/programlar"
              className="inline-flex items-center gap-2 rounded-full bg-background px-6 py-3 text-sm text-foreground transition-opacity hover:opacity-90"
            >
              Programlarımızı Keşfedin <ArrowRight className="h-4 w-4" />
            </Link>
            {settings.pre_registration_enabled && (
              <button
                onClick={() => openRegister()}
                className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/40 px-6 py-3 text-sm transition-colors hover:bg-primary-foreground/10"
              >
                <Sparkles className="h-4 w-4" /> Ön Kayıt Ol
              </button>
            )}

          </div>
        </div>
      </section>

      {/* Principles */}
      {settings.about_section_enabled && (
      <section className="mx-auto max-w-6xl px-5 py-16">
        <p className="eyebrow">{settings.about_eyebrow}</p>
        {settings.about_heading && (
          <h2 className="mt-4 text-3xl text-foreground sm:text-4xl">{settings.about_heading}</h2>
        )}
        <blockquote className="mt-5 max-w-3xl border-l-2 border-accent pl-5 font-serif text-2xl leading-snug text-foreground sm:text-3xl">
          “{settings.about_quote}”
        </blockquote>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {principleList.map((v, i) => (
            <div key={`${v.title}-${i}`} className="card-soft hover-lift border-accent/40 p-6">
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
          {settings.about_link_label} <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
      )}

      {/* Stats */}
      {settings.stats_section_enabled && stats.length > 0 && (
        <section className="border-y border-border bg-secondary/50">
          <div className="mx-auto max-w-6xl px-5 py-14">
            <h2 className="text-2xl text-foreground sm:text-3xl">{settings.stats_heading}</h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((s, i) => (
                <div key={`${s.label}-${i}`} className="card-soft border-accent/40 p-6">
                  <p className="font-serif text-3xl text-primary">{s.value}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Programs preview */}
      {settings.programs_section_enabled && (
      <section className="border-y border-border bg-secondary/50">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <p className="eyebrow">{settings.programs_eyebrow}</p>
          <h2 className="mt-4 text-3xl text-foreground sm:text-4xl">{settings.programs_heading}</h2>
          {settings.programs_description && (
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {settings.programs_description}
            </p>
          )}
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {programs.slice(0, 3).map((p) => (
              <ProgramCard key={p.id} p={p} onOpen={setDetail} />
            ))}
          </div>
          <Link
            to="/programlar"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground"
          >
            {settings.programs_button_label} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
      )}

      {/* Weekly timetable */}
      {settings.schedule_section_enabled && (
      <section className="mx-auto max-w-6xl px-5 py-16">
        <p className="eyebrow">{settings.schedule_eyebrow}</p>
        <h2 className="mt-4 text-3xl text-foreground sm:text-4xl">{settings.schedule_heading}</h2>
        {settings.schedule_description && (
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {settings.schedule_description}
          </p>
        )}
        <div className="mt-10">
          <WeeklySchedule />
        </div>
      </section>
      )}

      {/* Testimonials */}
      {settings.testimonials_section_enabled && testimonials.length > 0 && (
        <section className="border-y border-border bg-secondary/50">
          <div className="mx-auto max-w-6xl px-5 py-16">
            <h2 className="text-2xl text-foreground sm:text-3xl">{settings.testimonials_heading}</h2>
            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((t, i) => (
                <figure key={`${t.name}-${i}`} className="card-soft border-accent/40 p-6">
                  <blockquote className="text-sm leading-relaxed text-foreground">“{t.text}”</blockquote>
                  <figcaption className="mt-4 text-[13px] text-muted-foreground">
                    <span className="text-foreground">{t.name}</span>
                    {t.role ? ` · ${t.role}` : ""}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {settings.faq_section_enabled && faq.length > 0 && (
        <section className="mx-auto max-w-4xl px-5 py-16">
          <h2 className="text-2xl text-foreground sm:text-3xl">{settings.faq_heading}</h2>
          <div className="mt-8 space-y-3">
            {faq.map((f, i) => (
              <details key={`${f.question}-${i}`} className="card-soft border-accent/40 p-5">
                <summary className="cursor-pointer text-sm text-foreground">{f.question}</summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.answer}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* Registration */}
      {settings.cta_section_enabled && (
      <section className="mx-auto max-w-6xl px-5 pb-16 pt-16">
        <div className="card-soft flex flex-col items-start gap-6 border-accent/40 p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
          <div>
            <h2 className="text-2xl text-foreground">{settings.cta_title}</h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
              {settings.cta_text}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            {settings.pre_registration_enabled && (
              <button
                onClick={() => openRegister()}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground"
              >
                <Sparkles className="h-4 w-4" /> {settings.cta_button_label}
              </button>
            )}
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
      )}


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
