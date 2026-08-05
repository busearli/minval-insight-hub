import { createFileRoute } from "@tanstack/react-router";

import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { principles } from "@/lib/minval-programs";

export const Route = createFileRoute("/hakkimizda")({
  head: () => ({
    meta: [
      { title: "Hakkımızda — Minval Akademi | Kahve" },
      {
        name: "description",
        content:
          "Minval Akademi; ilim, hikmet ve güzel ahlak ekseninde insanın aklına, kalbine ve hayatına dokunmayı amaçlayan bağımsız bir ilim, kültür ve gençlik hareketidir.",
      },
      { property: "og:title", content: "Hakkımızda — Minval Akademi" },
      {
        property: "og:description",
        content: "Bağımsız bir ilim, kültür ve gençlik hareketinin vizyonu ve temel ilkeleri.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-5 py-16">
        <p className="eyebrow">Hakkımızda</p>
        <h1 className="mt-4 text-4xl text-foreground sm:text-5xl">
          Akla, kalbe ve hayata dokunan bir minval
        </h1>

        <blockquote className="mt-10 border-l-2 border-accent pl-6 font-serif text-2xl leading-snug text-foreground">
          “Minval Akademi, ilim, hikmet ve güzel ahlak ekseninde; insanın aklına, kalbine ve
          hayatına dokunmayı amaçlayan bağımsız bir ilim, kültür ve gençlik hareketidir.”
        </blockquote>

        <p className="mt-8 text-[15px] leading-relaxed text-muted-foreground">
          Maneviyat, kültür ve sanatı bir arada yaşatmayı hedefleyen bağımsız bir eğitim ve gönül
          merkeziyiz. Okuma halkalarımız; bilgiyi yığmayı değil, bilgiyi ahlaka ve hayata
          dönüştürmeyi gaye edinir. Her programımız sakin bir müzakere usulü, sahih kaynaklar ve
          samimi bir yol arkadaşlığı üzerine kuruludur.
        </p>

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {principles.map((v, i) => (
            <div key={v.title} className="card-soft border-accent/40 p-7">
              <span className="font-serif text-sm text-accent">0{i + 1}</span>
              <h2 className="mt-3 text-xl text-foreground">{v.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{v.text}</p>
            </div>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
