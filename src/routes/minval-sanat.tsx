import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";

import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ArchPattern } from "@/components/MinvalMark";
import { WHATSAPP_URL } from "@/lib/minval-programs";

export const Route = createFileRoute("/minval-sanat")({
  head: () => ({
    meta: [
      { title: "Minval Sanat — Minval Akademi | Kahve" },
      {
        name: "description",
        content:
          "Minval Sanat atölyeleri hazırlanıyor. Hat, ebru ve estetik üzerine programlarımızdan ilk siz haberdar olun.",
      },
      { property: "og:title", content: "Minval Sanat — Yakında" },
      {
        property: "og:description",
        content: "Güzelliği hakikatin tercümesi olarak okuyan sanat atölyelerimiz yolda.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ArtPage,
});

function ArtPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-5 py-16">
        <div className="relative overflow-hidden rounded-2xl bg-primary p-10 text-primary-foreground sm:p-14">
          <ArchPattern className="pointer-events-none absolute inset-0 h-full w-full text-primary-foreground/15" />
          <div className="relative">
            <p className="text-[11px] tracking-[0.28em] uppercase opacity-70">🎨 Minval Sanat</p>
            <h1 className="mt-5 font-serif text-4xl leading-tight sm:text-5xl">Yakında</h1>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed opacity-85">
              Hat, ebru ve estetik üzerine atölyelerimiz hazırlanıyor. Detaylar en kısa sürede
              burada paylaşılacak.
            </p>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-background px-6 py-3 text-sm text-foreground"
            >
              <MessageCircle className="h-4 w-4" /> Haberdar olmak için yazın
            </a>
          </div>
        </div>

        <blockquote className="mt-12 border-l-2 border-accent pl-6 font-serif text-2xl leading-snug text-foreground">
          “Güzellik, hakikatin gözle görülen tercümesidir.”
        </blockquote>
      </main>
      <SiteFooter />
    </div>
  );
}
