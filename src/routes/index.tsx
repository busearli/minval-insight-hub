import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  Calendar,
  Coffee,
  Instagram,
  Mail,
  MapPin,
  Menu,
  Phone,
} from "lucide-react";

import { ViewSwitcher } from "@/components/ViewSwitcher";
import { categories, instructors, values, workshops } from "@/lib/minval-data";
import heroImage from "@/assets/hero-workshop.jpg";
import studyCorner from "@/assets/study-corner.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Minval Akademi — Kültür, Sanat ve Düşünce Atölyeleri" },
      {
        name: "description",
        content:
          "Felsefeden edebiyata, psikolojiden sanat tarihine uzman akademisyenler eşliğinde interaktif atölyeler ve seminerler.",
      },
      { property: "og:title", content: "Minval Akademi — Atölyeler & Seminerler" },
      {
        property: "og:description",
        content:
          "Derinlikli okuma, disiplinlerarası düşünce ve nitelikli bir topluluk için Minval Akademi atölyeleri.",
      },
    ],
  }),
  component: PublicSite,
});

const navLinks = [
  "Atölyeler & Seminerler",
  "Eğitmenlerimiz",
  "Minval Felsefesi",
  "Yayınlar / Blog",
  "İletişim",
];

function PublicSite() {
  const [filter, setFilter] = useState<string>("Tümü");
  const [menuOpen, setMenuOpen] = useState(false);

  const list = filter === "Tümü" ? workshops : workshops.filter((w) => w.category === filter);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-5 py-3">
          <Link to="/" className="min-w-0 shrink-0">
            <div className="brand-wordmark text-base leading-none text-foreground sm:text-lg">
              Minval
            </div>
            <div className="mt-1 text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
              Akademi & Düşünce
            </div>
          </Link>

          <nav className="mx-auto hidden items-center gap-6 lg:flex">
            {navLinks.map((l) => (
              <a
                key={l}
                href="#atolyeler"
                className="text-[13px] text-muted-foreground transition-colors hover:text-primary"
              >
                {l}
              </a>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <div className="hidden md:block">
              <ViewSwitcher />
            </div>
            <Link
              to="/panel"
              className="hidden rounded-full border border-border px-4 py-2 text-[13px] text-foreground transition-colors hover:bg-secondary sm:inline-flex"
            >
              Katılımcı Girişi
            </Link>
            <a
              href="#atolyeler"
              className="hidden rounded-full bg-primary px-4 py-2 text-[13px] text-primary-foreground transition-opacity hover:opacity-90 sm:inline-flex"
            >
              Atölyelere Göz At
            </a>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Menü"
              className="rounded-full border border-border p-2 lg:hidden"
            >
              {menuOpen ? <Menu className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-border bg-card px-5 py-4 lg:hidden">
            <div className="mb-4 md:hidden">
              <ViewSwitcher />
            </div>
            <div className="flex flex-col gap-3">
              {navLinks.map((l) => (
                <a
                  key={l}
                  href="#atolyeler"
                  onClick={() => setMenuOpen(false)}
                  className="text-sm text-muted-foreground"
                >
                  {l}
                </a>
              ))}
              <Link
                to="/panel"
                className="mt-2 rounded-full bg-primary px-4 py-2 text-center text-sm text-primary-foreground"
              >
                Katılımcı Girişi
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-5 py-14 sm:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="eyebrow">Güz Dönemi · 2026</p>
            <h1 className="mt-5 text-4xl leading-[1.1] text-foreground sm:text-5xl md:text-6xl">
              Kültür, Sanat ve Düşüncenin Derinliklerine Yolculuk.
            </h1>
            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
              Felsefeden edebiyata, psikolojiden sosyolojiye uzman akademisyenler eşliğinde
              derinleşen interaktif atölyeler.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#atolyeler"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground transition-opacity hover:opacity-90"
              >
                Güz Dönemi Atölyeleri <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#felsefe"
                className="inline-flex items-center rounded-full border border-accent/30 px-6 py-3 text-sm text-accent transition-colors hover:bg-secondary"
              >
                Minval Kimdir?
              </a>
            </div>
            <div className="mt-10 flex flex-wrap gap-8 border-t border-border pt-6">
              {[
                ["12", "Aktif atölye"],
                ["24", "Akademisyen"],
                ["1.400+", "Katılımcı"],
              ].map(([n, t]) => (
                <div key={t}>
                  <div className="font-serif text-2xl text-foreground">{n}</div>
                  <div className="eyebrow mt-1">{t}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-5 grid-rows-6 gap-3 sm:gap-4">
            <img
              src={heroImage}
              alt="Minval Akademi atölye oturumu"
              width={1200}
              height={1500}
              className="col-span-3 row-span-6 h-full w-full rounded-2xl object-cover"
            />
            <img
              src={studyCorner}
              alt="Kitaplar ve kahve ile çalışma köşesi"
              width={900}
              height={900}
              loading="lazy"
              className="col-span-2 row-span-3 h-full w-full rounded-2xl object-cover"
            />
            <div className="col-span-2 row-span-3 flex flex-col justify-center rounded-2xl bg-ink p-5 text-ink-foreground">
              <Coffee className="h-5 w-5 text-primary" />
              <p className="mt-3 font-serif text-lg leading-snug">
                “Düşünmek, birlikte yavaşlamaktır.”
              </p>
              <p className="mt-2 text-[11px] tracking-widest uppercase opacity-60">Minval</p>
            </div>
          </div>
        </div>
      </section>

      {/* Manifesto */}
      <section id="felsefe" className="border-y border-border bg-secondary/50">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <p className="eyebrow">Minval Felsefesi</p>
          <h2 className="mt-4 max-w-2xl text-3xl text-foreground sm:text-4xl">
            Bir akademiden fazlası: ortak bir düşünme minvali.
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {values.map((v, i) => (
              <div key={v.title} className="card-soft hover-lift p-7">
                <span className="font-serif text-sm text-primary">0{i + 1}</span>
                <h3 className="mt-4 text-xl text-foreground">{v.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workshops */}
      <section id="atolyeler" className="mx-auto max-w-6xl px-5 py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Atölye Kataloğu</p>
            <h2 className="mt-4 text-3xl text-foreground sm:text-4xl">
              Aktif Atölyeler & Seminerler
            </h2>
          </div>
          <p className="max-w-sm text-sm text-muted-foreground">
            Tüm atölyeler çevrimiçi ve canlı yürütülür; kayıtlar katılımcı panelinde saklanır.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`rounded-full border px-4 py-2 text-[13px] transition-colors ${
                filter === c
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((w) => (
            <article key={w.id} className="card-soft hover-lift flex flex-col overflow-hidden">
              <img
                src={w.image}
                alt={w.title}
                width={900}
                height={600}
                loading="lazy"
                className="h-44 w-full object-cover"
              />
              <div className="flex flex-1 flex-col p-6">
                <span className="w-fit rounded-full bg-secondary px-3 py-1 text-[11px] tracking-wide text-secondary-foreground">
                  {w.badge}
                </span>
                <h3 className="mt-4 text-xl leading-snug text-foreground">{w.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{w.summary}</p>
                <div className="mt-4 text-sm text-foreground">{w.instructor}</div>
                <div className="text-[12px] text-muted-foreground">{w.academicTitle}</div>
                <div className="mt-3 flex items-start gap-2 text-[12px] text-muted-foreground">
                  <Calendar className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>{w.schedule}</span>
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                  <span className="font-serif text-lg text-foreground">{w.price}</span>
                  <button className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 px-4 py-2 text-[13px] text-primary transition-colors hover:bg-primary hover:text-primary-foreground">
                    Detay ve Kayıt <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Instructors */}
      <section className="border-y border-border bg-secondary/50">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <p className="eyebrow">Eğitmenlerimiz</p>
          <h2 className="mt-4 text-3xl text-foreground sm:text-4xl">Masanın etrafındaki isimler</h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {instructors.map((p) => (
              <div key={p.name} className="card-soft hover-lift p-6">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-accent font-serif text-accent-foreground">
                  {p.initials}
                </div>
                <h3 className="mt-4 text-lg leading-snug text-foreground">{p.name}</h3>
                <p className="text-[12px] tracking-wide text-primary">{p.field}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.bio}</p>
                <ul className="mt-4 space-y-1 border-t border-border pt-4">
                  {p.courses.map((c) => (
                    <li key={c} className="text-[12px] text-muted-foreground">
                      · {c}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Minval Kahve */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid items-center gap-8 overflow-hidden rounded-3xl bg-ink p-8 text-ink-foreground sm:p-12 lg:grid-cols-[1fr_0.8fr]">
          <div>
            <p className="text-[11px] tracking-[0.22em] uppercase opacity-60">Minval Kahve & Mekân</p>
            <h2 className="mt-4 text-2xl leading-snug sm:text-3xl">
              Akademik derinliği yüz yüze kahve sohbetleriyle buluşturan fiziksel mekânımızda da
              sizleri ağırlıyoruz.
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-relaxed opacity-70">
              Moda, Kadıköy'deki mekânımızda her ayın ilk cumartesi günü açık okuma masası kuruyoruz.
              Katılım ücretsizdir.
            </p>
          </div>
          <img
            src={studyCorner}
            alt="Minval Kahve mekânından bir köşe"
            width={900}
            height={900}
            loading="lazy"
            className="h-56 w-full rounded-2xl object-cover lg:h-72"
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-secondary/40">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="brand-wordmark text-lg text-foreground">Minval</div>
            <p className="mt-1 text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
              Akademi & Düşünce
            </p>
            <p className="mt-5 max-w-sm text-sm text-muted-foreground">
              E-bültenimize katılın; dönem programı ve okuma önerileri ayda bir kez kutunuzda olsun.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="mt-4 flex max-w-sm items-center gap-2"
            >
              <input
                type="email"
                required
                placeholder="E-posta adresiniz"
                className="min-w-0 flex-1 rounded-full border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary"
              />
              <button className="shrink-0 rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground">
                Katıl
              </button>
            </form>
          </div>
          <div>
            <h4 className="text-sm text-foreground">Keşfet</h4>
            <ul className="mt-4 space-y-2">
              {navLinks.map((l) => (
                <li key={l}>
                  <a href="#atolyeler" className="text-[13px] text-muted-foreground hover:text-primary">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm text-foreground">İletişim</h4>
            <ul className="mt-4 space-y-3 text-[13px] text-muted-foreground">
              <li className="flex gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> Caferağa Mah. Moda Cad. No 42, Kadıköy
                / İstanbul
              </li>
              <li className="flex gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0" /> +90 216 000 00 00
              </li>
              <li className="flex gap-2">
                <Mail className="mt-0.5 h-4 w-4 shrink-0" /> merhaba@minvalakademi.com
              </li>
              <li className="flex gap-2">
                <Instagram className="mt-0.5 h-4 w-4 shrink-0" /> @minvalakademi
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border py-6 text-center text-[12px] text-muted-foreground">
          © 2026 Minval Akademi. Tüm hakları saklıdır.
        </div>
      </footer>
    </div>
  );
}
