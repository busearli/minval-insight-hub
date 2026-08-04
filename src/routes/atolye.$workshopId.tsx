import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, BookOpen, Check, CreditCard, Users } from "lucide-react";
import { toast } from "sonner";

import { ViewSwitcher } from "@/components/ViewSwitcher";
import { AuthDialog } from "@/components/AuthDialog";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { workshops, workshopDetails, defaultWorkshopDetail, instructors } from "@/lib/minval-data";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/atolye/$workshopId")({
  loader: ({ params }) => {
    const workshop = workshops.find((w) => w.id === params.workshopId);
    if (!workshop) throw notFound();
    return { workshop };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Atölye bulunamadı — Minval Akademi" }, { name: "robots", content: "noindex" }] };
    }
    const t = `${loaderData.workshop.title} — Minval Akademi`;
    return {
      meta: [
        { title: t },
        { name: "description", content: loaderData.workshop.summary },
        { property: "og:title", content: t },
        { property: "og:description", content: loaderData.workshop.summary },
      ],
    };
  },
  component: WorkshopDetail,
});

function WorkshopDetail() {
  const { workshop } = Route.useLoaderData();
  const detail = workshopDetails[workshop.id] ?? defaultWorkshopDetail;
  const instructor = instructors.find((i) => i.name === workshop.instructor);
  const [regOpen, setRegOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 px-5 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <Link to="/" className="brand-wordmark text-sm text-foreground sm:text-base">
            Minval
          </Link>
          <div className="ml-auto hidden sm:block">
            <ViewSwitcher />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[13px] text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Tüm atölyeler
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-[1.5fr_0.7fr]">
          <article className="min-w-0 space-y-12">
            <header>
              <span className="eyebrow">{workshop.category}</span>
              <h1 className="mt-4 text-4xl leading-tight text-foreground sm:text-5xl">
                {workshop.title}
              </h1>
              <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
                {workshop.summary}
              </p>
              <img
                src={workshop.image}
                alt={workshop.title}
                width={900}
                height={600}
                className="mt-8 h-64 w-full rounded-2xl object-cover sm:h-80"
              />
            </header>

            <section>
              <h2 className="text-2xl text-foreground">Atölye Hakkında</h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">{detail.overview}</p>
              <h3 className="mt-8 text-lg text-foreground">Kazanımlar</h3>
              <ul className="mt-4 space-y-2">
                {detail.objectives.map((o) => (
                  <li key={o} className="flex gap-3 text-sm text-muted-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-sage" />
                    {o}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-2xl text-foreground">Hafta Hafta Program</h2>
              <Accordion type="single" collapsible className="mt-4">
                {detail.syllabus.map((s) => (
                  <AccordionItem key={s.week} value={s.week}>
                    <AccordionTrigger className="text-left">
                      <span className="text-[13px] tracking-wide text-primary">{s.week}</span>
                      <span className="ml-3 flex-1 text-[15px] text-foreground">{s.title}</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                      {s.text}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>

            <section className="card-soft p-7">
              <div className="flex items-start gap-4">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-accent font-serif text-accent-foreground">
                  {instructor?.initials ?? "M"}
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl text-foreground">{workshop.instructor}</h2>
                  <p className="text-[12px] text-primary">{workshop.academicTitle}</p>
                </div>
              </div>
              <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                {detail.instructorBio.background}
              </p>
              <h3 className="mt-6 text-[13px] tracking-widest text-muted-foreground uppercase">
                Yayınları
              </h3>
              <ul className="mt-3 space-y-1.5">
                {detail.instructorBio.publications.map((p) => (
                  <li key={p} className="text-sm text-foreground">
                    · {p}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-2xl text-foreground">Okuma Listesi</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="card-soft p-6">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <h3 className="text-base text-foreground">Zorunlu Okumalar</h3>
                  </div>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    {detail.readings.required.map((r) => (
                      <li key={r}>· {r}</li>
                    ))}
                  </ul>
                </div>
                <div className="card-soft p-6">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-sage" />
                    <h3 className="text-base text-foreground">Önerilen Okumalar</h3>
                  </div>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    {detail.readings.recommended.map((r) => (
                      <li key={r}>· {r}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          </article>

          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <div className="card-soft p-6">
              <p className="eyebrow">Kayıt</p>
              <p className="mt-3 font-serif text-3xl text-foreground">{workshop.price}</p>
              <ul className="mt-5 space-y-3 border-t border-border pt-5 text-sm text-muted-foreground">
                <li className="flex justify-between gap-3">
                  <span>Süre</span>
                  <span className="text-foreground">{detail.syllabus.length} hafta</span>
                </li>
                <li className="flex justify-between gap-3">
                  <span>Program</span>
                  <span className="text-right text-foreground">{workshop.schedule}</span>
                </li>
                <li className="flex justify-between gap-3">
                  <span>Eğitmen</span>
                  <span className="text-right text-foreground">{workshop.instructor}</span>
                </li>
              </ul>
              <div className="mt-5 flex items-center gap-2 rounded-lg bg-secondary px-3 py-2.5 text-[13px] text-secondary-foreground">
                <Users className="h-4 w-4 text-primary" />
                Son {detail.seatsLeft} Kontenjan
              </div>
              <button
                onClick={() => setRegOpen(true)}
                className="mt-5 w-full rounded-full bg-primary px-5 py-3 text-sm text-primary-foreground transition-opacity hover:opacity-90"
              >
                Atölyeye Kaydol
              </button>
              <p className="mt-3 text-center text-[11px] text-muted-foreground">
                Kayıt sonrası materyaller katılımcı panelinde açılır.
              </p>
            </div>
          </aside>
        </div>
      </div>

      <RegistrationDialog
        open={regOpen}
        onOpenChange={setRegOpen}
        workshopId={workshop.id}
        title={workshop.title}
        price={workshop.price}
        onNeedsAuth={() => {
          setRegOpen(false);
          setAuthOpen(true);
        }}
      />
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} defaultMode="signup" />
    </div>
  );
}

function RegistrationDialog({
  open,
  onOpenChange,
  workshopId,
  title,
  price,
  onNeedsAuth,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  workshopId: string;
  title: string;
  price: string;
  onNeedsAuth: () => void;
}) {
  const { user, profile, refresh } = useAuth();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const steps = ["Bilgileriniz", "Ödeme", "Onay"];

  const finish = async () => {
    if (!user) {
      onNeedsAuth();
      return;
    }
    setBusy(true);
    const { error } = await supabase
      .from("enrollments")
      .upsert({ user_id: user.id, workshop_id: workshopId, completion_rate: 0 }, { onConflict: "user_id,workshop_id" });
    setBusy(false);
    if (error) {
      toast.error("Kayıt tamamlanamadı: " + error.message);
      return;
    }
    await refresh();
    setStep(2);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) setStep(0);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">{title}</DialogTitle>
        </DialogHeader>

        <ol className="flex gap-2">
          {steps.map((s, i) => (
            <li
              key={s}
              className={`flex-1 rounded-full px-3 py-1.5 text-center text-[11px] ${
                i <= step ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
              }`}
            >
              {s}
            </li>
          ))}
        </ol>

        {step === 0 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setStep(1);
            }}
            className="space-y-3"
          >
            <input
              required
              maxLength={80}
              value={name || profile?.name || ""}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ad Soyad"
              className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
            <input
              required
              type="email"
              maxLength={255}
              value={email || user?.email || ""}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-posta"
              className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
            <button className="w-full rounded-full bg-primary px-4 py-2.5 text-sm text-primary-foreground">
              Ödeme adımına geç
            </button>
          </form>
        )}

        {step === 1 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-secondary px-4 py-3 text-sm">
              <span className="text-muted-foreground">Toplam</span>
              <span className="font-serif text-lg text-foreground">{price}</span>
            </div>
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center gap-2 text-sm text-foreground">
                <CreditCard className="h-4 w-4 text-primary" /> Kart ile ödeme (demo)
              </div>
              <input
                placeholder="4242 4242 4242 4242"
                className="mt-3 w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
              <div className="mt-3 grid grid-cols-2 gap-3">
                <input
                  placeholder="AA/YY"
                  className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
                />
                <input
                  placeholder="CVC"
                  className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>
            <button
              onClick={finish}
              disabled={busy}
              className="w-full rounded-full bg-primary px-4 py-2.5 text-sm text-primary-foreground disabled:opacity-60"
            >
              {user ? "Kaydı Tamamla" : "Devam etmek için giriş yapın"}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-sage text-sage-foreground">
              <Check className="h-6 w-6" />
            </div>
            <p className="text-sm text-muted-foreground">
              Kaydınız alındı. Atölye artık katılımcı panelinizde görünüyor.
            </p>
            <Link
              to="/panel"
              className="inline-flex rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground"
            >
              Panele git
            </Link>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
