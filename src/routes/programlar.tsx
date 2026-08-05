import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";

import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ProgramCard } from "@/components/ProgramCard";
import { WHATSAPP_URL, programs } from "@/lib/minval-programs";

export const Route = createFileRoute("/programlar")({
  head: () => ({
    meta: [
      { title: "Programlarımız — Minval Akademi | Kahve" },
      {
        name: "description",
        content:
          "Minval Risale, Tefsir, Minval Hadis, Minval Psikoloji ve Minval Genç programları; açık gruplar, katılım şartları ve kayıt bilgileri.",
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
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 py-16">
        <p className="eyebrow">Programlarımız</p>
        <h1 className="mt-4 text-4xl text-foreground sm:text-5xl">Okuma halkaları ve atölyeler</h1>
        <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
          Programlarımızın tamamı kontenjan esaslıdır. Katılım için kurumsal WhatsApp hattımızdan
          mesaj göndermeniz yeterlidir.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {programs.map((p) => (
            <ProgramCard key={p.id} p={p} />
          ))}
        </div>

        <div className="card-soft mt-12 flex flex-col items-start gap-5 border-accent/40 p-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Tüm kayıtlarımız kurumsal WhatsApp hattımız üzerinden mesajla alınmaktadır.
          </p>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground"
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp ile Kayıt Ol
          </a>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
