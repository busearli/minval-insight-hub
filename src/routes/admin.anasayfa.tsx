import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  asList,
  useSaveSettings,
  useSiteSettings,
  type FaqItem,
  type PrincipleItem,
  type StatItem,
  type TestimonialItem,
} from "@/lib/site-api";
import { useMyRoles } from "@/lib/rbac";

export const Route = createFileRoute("/admin/anasayfa")({
  component: HomeContentPage,
});

type FieldKey =
  | "hero_eyebrow"
  | "hero_title"
  | "hero_subtitle"
  | "hero_primary_label"
  | "hero_secondary_label"
  | "about_eyebrow"
  | "about_heading"
  | "about_quote"
  | "about_link_label"
  | "programs_eyebrow"
  | "programs_heading"
  | "programs_description"
  | "programs_button_label"
  | "schedule_eyebrow"
  | "schedule_heading"
  | "schedule_description"
  | "stats_heading"
  | "testimonials_heading"
  | "faq_heading"
  | "cta_title"
  | "cta_text"
  | "cta_button_label";

type Field = { key: FieldKey; label: string; multiline?: boolean; hint?: string };

const groups: { title: string; fields: Field[] }[] = [
  {
    title: "Giriş (Hero) Bölümü",
    fields: [
      { key: "hero_eyebrow", label: "Üst Etiket", hint: "Başlığın üzerindeki küçük yazı" },
      { key: "hero_title", label: "Ana Başlık", multiline: true },
      { key: "hero_subtitle", label: "Ana Açıklama", multiline: true },
      { key: "hero_primary_label", label: "Birinci Buton Yazısı" },
      { key: "hero_secondary_label", label: "İkinci Buton Yazısı (Ön Kayıt)" },
    ],
  },
  {
    title: "Hakkımızda Bölümü",
    fields: [
      { key: "about_eyebrow", label: "Üst Etiket" },
      { key: "about_heading", label: "Bölüm Başlığı", hint: "Boş bırakılırsa gösterilmez" },
      { key: "about_quote", label: "Alıntı Metni", multiline: true },
      { key: "about_link_label", label: "Bağlantı Yazısı" },
    ],
  },
  {
    title: "Programlar Bölümü",
    fields: [
      { key: "programs_eyebrow", label: "Üst Etiket" },
      { key: "programs_heading", label: "Başlık" },
      { key: "programs_description", label: "Açıklama", multiline: true },
      { key: "programs_button_label", label: "Buton Yazısı" },
    ],
  },
  {
    title: "Haftalık Program Bölümü",
    fields: [
      { key: "schedule_eyebrow", label: "Üst Etiket" },
      { key: "schedule_heading", label: "Başlık" },
      { key: "schedule_description", label: "Açıklama", multiline: true },
    ],
  },
  {
    title: "Diğer Bölüm Başlıkları",
    fields: [
      { key: "stats_heading", label: "Sayılarla Biz Başlığı" },
      { key: "testimonials_heading", label: "Görüşler Başlığı" },
      { key: "faq_heading", label: "SSS Başlığı" },
    ],
  },
  {
    title: "Ön Kayıt (CTA) Bölümü",
    fields: [
      { key: "cta_title", label: "Başlık" },
      { key: "cta_text", label: "Metin", multiline: true },
      { key: "cta_button_label", label: "Buton Yazısı" },
    ],
  },
];

const allFields = groups.flatMap((g) => g.fields);

function HomeContentPage() {
  const { isAdmin } = useMyRoles();
  const { settings, isLoading } = useSiteSettings();
  const save = useSaveSettings();
  const [form, setForm] = useState<Record<FieldKey, string>>(
    () => Object.fromEntries(allFields.map((f) => [f.key, ""])) as Record<FieldKey, string>,
  );
  const [principles, setPrinciples] = useState<PrincipleItem[]>([]);
  const [stats, setStats] = useState<StatItem[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [faq, setFaq] = useState<FaqItem[]>([]);

  useEffect(() => {
    setForm(
      Object.fromEntries(
        allFields.map((f) => [f.key, (settings[f.key] as string | null) ?? ""]),
      ) as Record<FieldKey, string>,
    );
    setPrinciples(asList<PrincipleItem>(settings.principles_json));
    setStats(asList<StatItem>(settings.stats_json));
    setTestimonials(asList<TestimonialItem>(settings.testimonials_json));
    setFaq(asList<FaqItem>(settings.faq_json));
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
    void run(form, "Ana sayfa metinleri güncellendi.");
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Ana Sayfa Yönetimi</p>
        <h1 className="mt-2 text-2xl text-foreground">Ana Sayfa İçeriği</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tüm metinler, listeler ve bölümler buradan yönetilir; ana sayfa anında güncellenir.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Yükleniyor…</p>
      ) : (
        <>
          <div className="card-soft max-w-2xl space-y-3 border-accent/40 p-6">
            <p className="eyebrow">Bölüm Görünürlüğü</p>
            <Toggle
              label="Hakkımızda / ilkeler bölümü"
              checked={settings.about_section_enabled}
              onChange={(v) => void run({ about_section_enabled: v }, "Bölüm güncellendi.")}
            />
            <Toggle
              label="Sayılarla Minval bölümü"
              checked={settings.stats_section_enabled}
              onChange={(v) => void run({ stats_section_enabled: v }, "Bölüm güncellendi.")}
            />
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
              label="Katılımcı görüşleri bölümü"
              checked={settings.testimonials_section_enabled}
              onChange={(v) => void run({ testimonials_section_enabled: v }, "Bölüm güncellendi.")}
            />
            <Toggle
              label="Sıkça sorulan sorular bölümü"
              checked={settings.faq_section_enabled}
              onChange={(v) => void run({ faq_section_enabled: v }, "Bölüm güncellendi.")}
            />
            <Toggle
              label="Ön kayıt (CTA) bölümü"
              checked={settings.cta_section_enabled}
              onChange={(v) => void run({ cta_section_enabled: v }, "Bölüm güncellendi.")}
            />
            <Toggle
              label="Ön kayıt butonları aktif"
              checked={settings.pre_registration_enabled}
              onChange={(v) => void run({ pre_registration_enabled: v }, "Bölüm güncellendi.")}
            />
          </div>

          <form onSubmit={submit} className="max-w-2xl space-y-5">
            {groups.map((g) => (
              <div key={g.title} className="card-soft grid gap-4 border-accent/40 p-6">
                <h2 className="text-lg text-foreground">{g.title}</h2>
                {g.fields.map((f) => (
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
              </div>
            ))}
            <button
              disabled={save.isPending}
              className="w-fit rounded-full bg-primary px-6 py-2.5 text-sm text-primary-foreground disabled:opacity-60"
            >
              Metinleri Kaydet
            </button>
          </form>

          <ListEditor
            title="İlke Kartları"
            hint="Boş bırakılırsa varsayılan ilkeler gösterilir."
            items={principles}
            columns={[
              { key: "title", label: "Başlık" },
              { key: "text", label: "Açıklama", multiline: true },
            ]}
            onAdd={() => setPrinciples((s) => [...s, { title: "", text: "" }])}
            onChange={setPrinciples}
            onSave={() => void run({ principles_json: principles }, "İlkeler kaydedildi.")}
          />

          <ListEditor
            title="Sayılarla Minval"
            items={stats}
            columns={[
              { key: "value", label: "Değer (ör. 250+)" },
              { key: "label", label: "Etiket" },
            ]}
            onAdd={() => setStats((s) => [...s, { value: "", label: "" }])}
            onChange={setStats}
            onSave={() => void run({ stats_json: stats }, "Sayılar kaydedildi.")}
          />

          <ListEditor
            title="Katılımcı Görüşleri"
            items={testimonials}
            columns={[
              { key: "name", label: "İsim" },
              { key: "role", label: "Ünvan / Program" },
              { key: "text", label: "Görüş", multiline: true },
            ]}
            onAdd={() => setTestimonials((s) => [...s, { name: "", role: "", text: "" }])}
            onChange={setTestimonials}
            onSave={() => void run({ testimonials_json: testimonials }, "Görüşler kaydedildi.")}
          />

          <ListEditor
            title="Sıkça Sorulan Sorular"
            items={faq}
            columns={[
              { key: "question", label: "Soru" },
              { key: "answer", label: "Cevap", multiline: true },
            ]}
            onAdd={() => setFaq((s) => [...s, { question: "", answer: "" }])}
            onChange={setFaq}
            onSave={() => void run({ faq_json: faq }, "Sorular kaydedildi.")}
          />
        </>
      )}
    </div>
  );
}

function ListEditor<T extends Record<string, string>>({
  title,
  hint,
  items,
  columns,
  onAdd,
  onChange,
  onSave,
}: {
  title: string;
  hint?: string;
  items: T[];
  columns: { key: keyof T & string; label: string; multiline?: boolean }[];
  onAdd: () => void;
  onChange: (items: T[]) => void;
  onSave: () => void;
}) {
  return (
    <div className="card-soft max-w-2xl space-y-4 border-accent/40 p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg text-foreground">{title}</h2>
          {hint && <p className="mt-1 text-[12px] text-muted-foreground">{hint}</p>}
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-[12px] text-muted-foreground hover:text-primary"
        >
          <Plus className="h-3.5 w-3.5" /> Ekle
        </button>
      </div>

      {items.length === 0 && <p className="text-sm text-muted-foreground">Henüz kayıt yok.</p>}

      {items.map((item, idx) => (
        <div key={idx} className="grid gap-2 rounded-lg border border-border p-4">
          {columns.map((c) => (
            <label key={c.key} className="grid gap-1">
              <span className="text-[11px] text-muted-foreground">{c.label}</span>
              {c.multiline ? (
                <textarea
                  rows={2}
                  value={item[c.key] ?? ""}
                  onChange={(e) =>
                    onChange(
                      items.map((it, i) => (i === idx ? { ...it, [c.key]: e.target.value } : it)),
                    )
                  }
                  className="rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                />
              ) : (
                <input
                  value={item[c.key] ?? ""}
                  onChange={(e) =>
                    onChange(
                      items.map((it, i) => (i === idx ? { ...it, [c.key]: e.target.value } : it)),
                    )
                  }
                  className="h-9 rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none focus:border-primary"
                />
              )}
            </label>
          ))}
          <button
            type="button"
            onClick={() => onChange(items.filter((_, i) => i !== idx))}
            className="w-fit inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" /> Kaldır
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={onSave}
        className="rounded-full bg-primary px-5 py-2 text-sm text-primary-foreground"
      >
        Kaydet
      </button>
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
