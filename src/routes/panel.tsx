import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Award,
  BookOpen,
  FileDown,
  LayoutGrid,
  Megaphone,
  MessageSquare,
  PlayCircle,
  Radio,
  GraduationCap,
  Menu,
} from "lucide-react";

import { ViewSwitcher } from "@/components/ViewSwitcher";
import philosophy from "@/assets/w-philosophy.jpg";

export const Route = createFileRoute("/panel")({
  head: () => ({
    meta: [
      { title: "Katılımcı Paneli — Minval Akademi" },
      {
        name: "description",
        content:
          "Kayıtlı atölyeleriniz, canlı oturumlar, haftalık okuma metinleri ve tartışma panosu tek panelde.",
      },
      { property: "og:title", content: "Minval Akademi Katılımcı Paneli" },
      {
        property: "og:description",
        content: "Atölye ilerlemeniz, ders kayıtları ve okuma listeleriniz.",
      },
    ],
  }),
  component: Portal,
});

const navItems = [
  { label: "Genel Bakış", icon: LayoutGrid, key: "overview" as const },
  { label: "Kayıtlı Atölyelerim", icon: GraduationCap, key: "classroom" as const },
  { label: "Canlı Oturumlar (Zoom)", icon: Radio, key: "classroom" as const },
  { label: "Ders Notları & Okumalar", icon: BookOpen, key: "classroom" as const },
  { label: "Soru & Tartışma Panosu", icon: MessageSquare, key: "classroom" as const },
  { label: "Sertifikalarım", icon: Award, key: "overview" as const },
];

const readings = [
  { title: "Byung-Chul Han — Yorgunluk Toplumu (1. Bölüm)", size: "PDF · 1.2 MB" },
  { title: "Foucault — Panoptikizm (seçki)", size: "PDF · 860 KB" },
  { title: "Haftanın tartışma soruları", size: "PDF · 210 KB" },
];

const announcements = [
  {
    date: "2 Ekim",
    text: "Perşembe oturumu 20.00'de başlayacak; Zoom bağlantısı 19.45'te panelde açılır.",
  },
  { date: "28 Eylül", text: "Güz dönemi sertifika başvuruları 15 Aralık'a kadar açıktır." },
  { date: "21 Eylül", text: "Moda'daki açık okuma masası bu cumartesi 15.00'te." },
];

const curriculum = [
  { week: "1. Hafta", title: "Modernite ve özne", done: true },
  { week: "2. Hafta", title: "İktidar ve disiplin", done: true },
  { week: "3. Hafta", title: "Gözetim toplumu", done: true },
  { week: "4. Hafta", title: "Performans ve yorgunluk", done: false },
  { week: "5. Hafta", title: "Şeffaflık eleştirisi", done: false },
  { week: "6. Hafta", title: "Kapanış tartışması", done: false },
];

const forum = [
  {
    who: "Zeynep A.",
    when: "2 saat önce",
    text: "Han'ın 'başarı öznesi' kavramını Foucault'nun disiplin toplumuyla nasıl birlikte okumalıyız?",
  },
  {
    who: "Prof. Dr. Necmi Aydın",
    when: "1 saat önce",
    text: "Güzel soru. Disiplinden performansa geçişi bir kopuş değil, bir iç dönüşüm olarak düşünmenizi öneririm.",
  },
  { who: "Kerem T.", when: "34 dakika önce", text: "3. haftanın notlarında bu ayrım şemayla vardı, çok işime yaradı." },
];

function Portal() {
  const [page, setPage] = useState<"overview" | "classroom">("overview");
  const [active, setActive] = useState("Genel Bakış");
  const [tab, setTab] = useState<"okuma" | "kayit" | "forum">("okuma");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 px-5 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Menü"
            className="rounded-full border border-border p-2 lg:hidden"
          >
            <Menu className="h-4 w-4" />
          </button>
          <Link to="/" className="min-w-0">
            <div className="brand-wordmark text-sm text-foreground sm:text-base">Minval</div>
          </Link>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden sm:block">
              <ViewSwitcher />
            </div>
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-xs text-accent-foreground">
              ZA
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl">
        {/* Sidebar */}
        <aside
          className={`${sidebarOpen ? "block" : "hidden"} fixed inset-x-0 top-[57px] z-30 border-b border-sidebar-border bg-sidebar p-4 lg:sticky lg:top-[57px] lg:block lg:h-[calc(100vh-57px)] lg:w-64 lg:shrink-0 lg:border-r lg:border-b-0`}
        >
          <div className="sm:hidden">
            <ViewSwitcher />
          </div>
          <nav className="mt-4 space-y-1 lg:mt-0">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  setActive(item.label);
                  setPage(item.key);
                  setSidebarOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] transition-colors ${
                  active === item.label
                    ? "bg-card text-foreground shadow-sm"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </nav>
          <div className="mt-6 rounded-xl bg-card p-4">
            <p className="eyebrow">Dönem</p>
            <p className="mt-2 font-serif text-lg text-foreground">Güz 2026</p>
            <p className="mt-1 text-[12px] text-muted-foreground">2 aktif atölye · 1 sertifika</p>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-5 py-8">
          {page === "overview" ? <Overview /> : <Classroom tab={tab} setTab={setTab} />}
        </main>
      </div>
    </div>
  );
}

function Overview() {
  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-ink p-8 text-ink-foreground">
        <p className="text-[11px] tracking-[0.22em] uppercase opacity-60">Katılımcı Paneli</p>
        <h1 className="mt-3 text-3xl text-ink-foreground">Hoş Geldiniz, Zeynep Hanım 🌿</h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed opacity-70">
          Bu hafta iki okuma metniniz ve bir canlı oturumunuz var. İyi çalışmalar dileriz.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="card-soft overflow-hidden">
          <img
            src={philosophy}
            alt="Çağdaş Felsefe Okumaları atölyesi"
            width={900}
            height={600}
            loading="lazy"
            className="h-40 w-full object-cover"
          />
          <div className="p-6">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
              <div className="min-w-0">
                <h2 className="truncate text-xl text-foreground">Çağdaş Felsefe Okumaları</h2>
                <p className="text-[12px] text-muted-foreground">Prof. Dr. Necmi Aydın</p>
              </div>
              <span className="shrink-0 rounded-full bg-primary px-3 py-1.5 text-[11px] text-primary-foreground">
                Bu Perşembe 20:00 · Canlı
              </span>
            </div>
            <div className="mt-6">
              <div className="flex items-center justify-between text-[12px] text-muted-foreground">
                <span>İlerleme · 3 / 8 hafta</span>
                <span>%38</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div className="h-full w-[38%] rounded-full bg-sage" />
              </div>
            </div>
          </div>
        </section>

        <section className="card-soft p-6">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <h2 className="text-lg text-foreground">Haftalık Okuma Listesi</h2>
          </div>
          <ul className="mt-4 space-y-3">
            {readings.map((r) => (
              <li
                key={r.title}
                className="flex items-start justify-between gap-3 rounded-lg border border-border p-3"
              >
                <div className="min-w-0">
                  <p className="text-[13px] leading-snug text-foreground">{r.title}</p>
                  <p className="text-[11px] text-muted-foreground">{r.size}</p>
                </div>
                <button aria-label="İndir" className="shrink-0 text-primary">
                  <FileDown className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="card-soft p-6">
        <div className="flex items-center gap-2">
          <Megaphone className="h-4 w-4 text-primary" />
          <h2 className="text-lg text-foreground">Akademi Duyuruları</h2>
        </div>
        <ul className="mt-4 divide-y divide-border">
          {announcements.map((a) => (
            <li key={a.date} className="flex gap-4 py-3">
              <span className="w-16 shrink-0 text-[12px] text-muted-foreground">{a.date}</span>
              <span className="text-[13px] leading-relaxed text-foreground">{a.text}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Classroom({
  tab,
  setTab,
}: {
  tab: "okuma" | "kayit" | "forum";
  setTab: (t: "okuma" | "kayit" | "forum") => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Kayıtlı Atölyem</p>
        <h1 className="mt-2 text-3xl text-foreground">Çağdaş Felsefe Okumaları</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Prof. Dr. Necmi Aydın · Perşembe 20.00 – 21.30
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="space-y-6">
          <div className="card-soft overflow-hidden">
            <div className="relative">
              <img
                src={philosophy}
                alt="3. hafta ders kaydı"
                width={900}
                height={600}
                loading="lazy"
                className="h-56 w-full object-cover sm:h-72"
              />
              <button className="absolute inset-0 grid place-items-center bg-ink/40 transition-colors hover:bg-ink/50">
                <PlayCircle className="h-14 w-14 text-ink-foreground" />
              </button>
            </div>
            <div className="p-5">
              <h2 className="text-lg text-foreground">3. Hafta — Gözetim Toplumu</h2>
              <p className="mt-1 text-[12px] text-muted-foreground">
                Ders kaydı · 1s 28dk · 26 Eylül tarihli oturum
              </p>
            </div>
          </div>

          <div className="card-soft">
            <div className="flex flex-wrap gap-1 border-b border-border p-2">
              {[
                ["okuma", "Haftalık Okuma Metinleri & PDF'ler"],
                ["kayit", "Ders Kaydı (Tekrar İzle)"],
                ["forum", "Atölye Tartışma Forumu"],
              ].map(([k, label]) => (
                <button
                  key={k}
                  onClick={() => setTab(k as typeof tab)}
                  className={`rounded-lg px-3 py-2 text-[12px] transition-colors ${
                    tab === k
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="p-5">
              {tab === "okuma" && (
                <ul className="space-y-3">
                  {readings.map((r) => (
                    <li
                      key={r.title}
                      className="flex items-start justify-between gap-3 rounded-lg border border-border p-3"
                    >
                      <div className="min-w-0">
                        <p className="text-[13px] text-foreground">{r.title}</p>
                        <p className="text-[11px] text-muted-foreground">{r.size}</p>
                      </div>
                      <FileDown className="h-4 w-4 shrink-0 text-primary" />
                    </li>
                  ))}
                </ul>
              )}

              {tab === "kayit" && (
                <ul className="space-y-3">
                  {curriculum
                    .filter((c) => c.done)
                    .map((c) => (
                      <li
                        key={c.week}
                        className="flex items-center gap-3 rounded-lg border border-border p-3"
                      >
                        <PlayCircle className="h-4 w-4 shrink-0 text-primary" />
                        <span className="text-[13px] text-foreground">
                          {c.week} — {c.title}
                        </span>
                      </li>
                    ))}
                </ul>
              )}

              {tab === "forum" && (
                <div className="space-y-4">
                  {forum.map((f) => (
                    <div key={f.text} className="rounded-lg border border-border p-4">
                      <div className="flex flex-wrap items-baseline gap-2">
                        <span className="text-[13px] text-foreground">{f.who}</span>
                        <span className="text-[11px] text-muted-foreground">{f.when}</span>
                      </div>
                      <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                        {f.text}
                      </p>
                    </div>
                  ))}
                  <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
                    <input
                      placeholder="Sorunuzu yazın…"
                      className="min-w-0 flex-1 rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
                    />
                    <button className="shrink-0 rounded-lg bg-primary px-4 text-sm text-primary-foreground">
                      Gönder
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>

        <aside className="card-soft h-fit p-5">
          <h2 className="text-lg text-foreground">Program & Okuma Takvimi</h2>
          <ul className="mt-4 space-y-2">
            {curriculum.map((c) => (
              <li
                key={c.week}
                className={`rounded-lg border p-3 ${
                  c.done ? "border-border bg-secondary/60" : "border-dashed border-border"
                }`}
              >
                <p className="text-[11px] tracking-wide text-muted-foreground uppercase">{c.week}</p>
                <p className="mt-1 text-[13px] text-foreground">{c.title}</p>
                <p className="mt-1 text-[11px] text-sage">
                  {c.done ? "Tamamlandı · kayıt hazır" : "Yaklaşan oturum"}
                </p>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
