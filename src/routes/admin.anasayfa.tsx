import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useSaveSettings, useSiteSettings } from "@/lib/site-api";
import { useMyRoles } from "@/lib/rbac";

export const Route = createFileRoute("/admin/anasayfa")({
  component: HomeContentPage,
});

type FieldKey =
  | "hero_eyebrow"
  | "hero_title"
  | "hero_subtitle"
  | "about_quote"
  | "programs_heading"
  | "schedule_heading"
  | "cta_title"
  | "cta_text";

const fields: { key: FieldKey; label: string; multiline?: boolean; hint?: string }[] = [
  { key: "hero_eyebrow", label: "Üst Etiket", hint: "Başlığın üzerindeki küçük yazı" },
  { key: "hero_title", label: "Ana Başlık", multiline: true },
  { key: "hero_subtitle", label: "Ana Açıklama", multiline: true },
  { key: "about_quote", label: "Hakkımızda Alıntısı", multiline: true },
  { key: "programs_heading", label: "Programlar Bölümü Başlığı" },
  { key: "schedule_heading", label: "Haftalık Program Başlığı" },
  { key: "cta_title", label: "Ön Kayıt Bölümü Başlığı" },
  { key: "cta_text", label: "Ön Kayıt Bölümü Metni", multiline: true },
];

const empty: Record<FieldKey, string> = {
  hero_eyebrow: "",
  hero_title: "",
  hero_subtitle: "",
  about_quote: "",
  programs_heading: "",
  schedule_heading: "",
  cta_title: "",
  cta_text: "",
};

function HomeContentPage() {
  const { isAdmin } = useMyRoles();
  const { settings, isLoading } = useSiteSettings();
  const save = useSaveSettings();
  const [form, setForm] = useState(empty);

  useEffect(() => {
    setForm({
      hero_eyebrow: settings.hero_eyebrow,
      hero_title: settings.hero_title,
      hero_subtitle: settings.hero_subtitle,
      about_quote: settings.about_quote,
      programs_heading: settings.programs_heading,
      schedule_heading: settings.schedule_heading,
      cta_title: settings.cta_title,
      cta_text: settings.cta_text,
    });
  }, [settings]);

  if (!isAdmin) {
    return <p className="text-sm text-muted-foreground">Bu bölüm yalnızca yöneticiler içindir.</p>;
  }

  const run = async (patch: Record<string, unknown>, msg: string) => {
    try {
      await save.mutateAsync(patch);
      toast.success(msg);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Kaydedilemedi");
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.hero_title.trim()) {
      toast.error("Ana başlık boş olamaz.");
      return;
    }
    void run(form, "Ana sayfa içeriği güncellendi.");
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Ana Sayfa Yönetimi</p>
        <h1 className="mt-2 text-2xl text-foreground">Ana Sayfa İçeriği</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Buradaki metinler ana sayfada anında güncellenir.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Yükleniyor…</p>
      ) : (
        <>
          <div className="card-soft max-w-2xl space-y-4 border-accent/40 p-6">
            <p className="eyebrow">Bölüm Görünürlüğü</p>
            <Toggle
              label="Programlar bölümü"
              checked={settings.programs_section_enabled}
              onChange={(v) => void run({ programs_section_enabled: v }, "Bölüm güncellendi.")}
            />
            <Toggle
              label="Haftalık program bölümü"
              checked={settings.schedule_section_enabled}
              onChange={(v) => void run({ schedule_section_enabled: v }, "Bölüm güncellendi.")}
            />
            <Toggle
              label="Ön kayıt bölümü ve butonları"
              checked={settings.pre_registration_enabled}
              onChange={(v) => void run({ pre_registration_enabled: v }, "Bölüm güncellendi.")}
            />
          </div>

          <form onSubmit={submit} className="card-soft grid max-w-2xl gap-4 border-accent/40 p-6">
            {fields.map((f) => (
              <label key={f.key} className="grid gap-1.5">
                <span className="eyebrow">{f.label}</span>
                {f.multiline ? (
                  <textarea
                    value={form[f.key]}
                    rows={3}
                    onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
                    className="rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                  />
                ) : (
                  <input
                    value={form[f.key]}
                    onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
                    className="h-10 rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none focus:border-primary"
                  />
                )}
                {f.hint && <span className="text-[11px] text-muted-foreground">{f.hint}</span>}
              </label>
            ))}
            <button
              disabled={save.isPending}
              className="mt-2 w-fit rounded-full bg-primary px-6 py-2.5 text-sm text-primary-foreground disabled:opacity-60"
            >
              Kaydet
            </button>
          </form>
        </>
      )}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-lg border border-border px-4 py-3">
      <span className="text-sm text-foreground">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? "bg-primary" : "bg-secondary"}`}
      >
        <span
          className={`block h-5 w-5 rounded-full bg-background transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`}
        />
      </button>
    </label>
  );
}
