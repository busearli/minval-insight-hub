import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { asList, useSaveSettings, useSiteSettings } from "@/lib/site-api";

export const Route = createFileRoute("/admin/ayarlar")({
  component: SettingsPage,
});

const schema = z.object({
  instagram_url: z.string().trim().url({ message: "Geçerli bir Instagram bağlantısı giriniz" }).max(200),
  whatsapp_number: z.string().trim().regex(/^[0-9]{10,15}$/, {
    message: "WhatsApp numarası yalnızca rakam olmalı (ülke kodu ile)",
  }),
  phone: z.string().trim().max(30),
  email: z.string().trim().email({ message: "Geçerli bir e-posta giriniz" }).max(120),
  address: z.string().trim().max(200),
  intro: z.string().trim().max(400),
});

const fields: { key: keyof z.infer<typeof schema>; label: string; placeholder: string }[] = [
  { key: "instagram_url", label: "Instagram Adresi", placeholder: "https://instagram.com/…" },
  { key: "whatsapp_number", label: "WhatsApp Numarası", placeholder: "905xxxxxxxxx" },
  { key: "phone", label: "Telefon", placeholder: "+90 …" },
  { key: "email", label: "E-posta", placeholder: "merhaba@…" },
  { key: "address", label: "Adres", placeholder: "Mekan adresi" },
  { key: "intro", label: "Alt Bilgi Tanıtım Metni", placeholder: "Kısa tanıtım cümlesi" },
];

function SettingsPage() {
  const { settings, isLoading } = useSiteSettings();
  const save = useSaveSettings();
  const [form, setForm] = useState({
    instagram_url: "",
    whatsapp_number: "",
    phone: "",
    email: "",
    address: "",
    intro: "",
  });

  useEffect(() => {
    setForm({
      instagram_url: settings.instagram_url,
      whatsapp_number: settings.whatsapp_number,
      phone: settings.phone,
      email: settings.email,
      address: settings.address,
      intro: settings.intro,
    });
  }, [settings]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Bilgileri kontrol edin");
      return;
    }
    try {
      await save.mutateAsync(parsed.data);
      toast.success("Site ayarları güncellendi.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Kaydedilemedi");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Site Ayarları</p>
        <h1 className="mt-2 text-2xl text-foreground">İletişim ve Sosyal Medya</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Buradaki bilgiler site alt bilgisinde ve iletişim sayfasında otomatik güncellenir.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Yükleniyor…</p>
      ) : (
        <form onSubmit={submit} className="card-soft grid max-w-2xl gap-4 border-accent/40 p-6">
          {fields.map((f) => (
            <label key={f.key} className="grid gap-1.5">
              <span className="eyebrow">{f.label}</span>
              <input
                value={form[f.key]}
                placeholder={f.placeholder}
                onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
                className="h-10 rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none focus:border-primary"
              />
            </label>
          ))}
          <button
            disabled={save.isPending}
            className="mt-2 w-fit rounded-full bg-primary px-6 py-2.5 text-sm text-primary-foreground disabled:opacity-60"
          >
            Kaydet
          </button>
        </form>
      )}

      <EventFieldCard />
    </div>
  );
}

/** Kayıt formundaki opsiyonel "etkinlik / program" alanının yönetimi. */
function EventFieldCard() {
  const { settings } = useSiteSettings();
  const save = useSaveSettings();
  const [enabled, setEnabled] = useState(false);
  const [label, setLabel] = useState("");
  const [options, setOptions] = useState("");

  useEffect(() => {
    setEnabled(settings.signup_event_enabled);
    setLabel(settings.signup_event_label);
    setOptions(asList<string>(settings.signup_event_options_json).join("\n"));
  }, [settings]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await save.mutateAsync({
        signup_event_enabled: enabled,
        signup_event_label: label.trim() || "Katılmak istediğiniz etkinlik",
        signup_event_options_json: options
          .split("\n")
          .map((o) => o.trim())
          .filter(Boolean),
      });
      toast.success("Kayıt formu etkinlik alanı güncellendi.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Kaydedilemedi");
    }
  };

  return (
    <form onSubmit={submit} className="card-soft grid max-w-2xl gap-4 border-accent/40 p-6">
      <div>
        <p className="eyebrow">Kayıt Formu</p>
        <h2 className="mt-1 text-lg text-foreground">Etkinlik / Program Seçimi</h2>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Kapalıyken kayıt formunda bu alan hiç görünmez. Açtığınızda seçenekler listelenir ancak
          seçim zorunlu değildir.
        </p>
      </div>
      <label className="flex items-center gap-3 text-sm text-foreground">
        <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
        Kayıt formunda etkinlik seçimi gösterilsin
      </label>
      <label className="grid gap-1.5">
        <span className="eyebrow">Alan Başlığı</span>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Katılmak istediğiniz etkinlik"
          className="h-10 rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none focus:border-primary"
        />
      </label>
      <label className="grid gap-1.5">
        <span className="eyebrow">Seçenekler (her satıra bir etkinlik)</span>
        <textarea
          value={options}
          onChange={(e) => setOptions(e.target.value)}
          placeholder={"Strateji Kampı\nGençlik Buluşması"}
          className="min-h-28 rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
        />
      </label>
      <button
        disabled={save.isPending}
        className="mt-1 w-fit rounded-full bg-primary px-6 py-2.5 text-sm text-primary-foreground disabled:opacity-60"
      >
        Kaydet
      </button>
    </form>
  );
}
