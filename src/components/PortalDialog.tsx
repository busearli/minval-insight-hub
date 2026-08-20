import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";

import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

import { useSiteSettings } from "@/lib/site-api";
import { formatEventDate, useEvents } from "@/lib/events-api";
import { publicClassLabel, usePublicClasses } from "@/lib/classes-public";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const emailSchema = z.string().trim().email({ message: "Geçerli bir e-posta giriniz" }).max(255);
const passwordSchema = z.string().min(6, { message: "Şifre en az 6 karakter olmalı" }).max(72);
const phoneSchema = z
  .string()
  .trim()
  .min(10, { message: "Geçerli bir telefon numarası giriniz" })
  .max(24)
  .regex(/^[0-9+()\s-]+$/, { message: "Telefon yalnızca rakam içermelidir" });

const signUpSchema = z.object({
  name: z.string().trim().min(3, { message: "Ad soyad giriniz" }).max(80),
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
  program_choice: z.string().max(120),
  event_id: z.string().max(64),
  requested_class_id: z.string().min(1, { message: "Katılmak istediğiniz sınıfı seçiniz" }),
  age_level: z.string().min(1, { message: "Yaş / eğitim durumunuzu seçiniz" }).max(80),
  notes: z.string().trim().max(500),
});


const levels = ["Ortaokul", "Lise", "Üniversite", "Mezun / Yetişkin"];

const field =
  "w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary";

const isEmail = (v: string) => /\S+@\S+\.\S+/.test(v.trim());

function trAuthError(message: string) {
  const m = message.toLowerCase();
  if (m.includes("already registered") || m.includes("already been registered") || m.includes("user already"))
    return "Bu e-posta adresi zaten kayıtlı. Giriş yapmayı deneyin.";
  if (m.includes("invalid login credentials")) return "Şifre veya e-posta hatalı.";
  if (m.includes("email not confirmed")) return "E-posta adresiniz henüz doğrulanmadı. Gelen kutunuzu kontrol edin.";
  if (m.includes("rate limit") || m.includes("too many")) return "Çok fazla deneme yapıldı. Lütfen biraz sonra tekrar deneyin.";
  if (m.includes("password")) return "Şifre en az 6 karakter olmalı.";
  return "İşlem tamamlanamadı. Lütfen bilgileri kontrol edip tekrar deneyin.";
}

type Tab = "student" | "staff" | "signup";

/** Şifre alanı + "Şifreyi göster" kutucuğu. */
function PasswordField({
  placeholder,
  value,
  onChange,
  show,
  onToggle,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="space-y-1.5">
      <input
        type={show ? "text" : "password"}
        className={field}
        placeholder={placeholder}
        maxLength={72}
        autoComplete={show ? "off" : "current-password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <label className="flex cursor-pointer items-center gap-2 text-[12px] text-muted-foreground">
        <input type="checkbox" checked={show} onChange={onToggle} className="accent-primary" />
        Şifreyi göster
      </label>
    </div>
  );
}

export function PortalDialog({
  open,
  onOpenChange,
  defaultTab = "student",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultTab?: Tab;
}) {
  const [tab, setTab] = useState<Tab>(defaultTab);
  const [busy, setBusy] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({
    identifier: "",
    email: "",
    password: "",
    name: "",
    phone: "",
    program_choice: "",
    event_id: "",
    requested_class_id: "",
    age_level: "",
    notes: "",
  });
  const { data: openClasses = [] } = usePublicClasses();
  const { settings } = useSiteSettings();
  const { data: allEvents = [] } = useEvents();
  const openEvents = allEvents.filter((ev) => ev.is_published && ev.is_open);
  const navigate = useNavigate();
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  /** Şifre sıfırlama e-postası gönderir. */
  const forgotPassword = async () => {
    const target = isEmail(form.identifier) ? form.identifier : form.email;
    const parsed = emailSchema.safeParse(target);
    if (!parsed.success) {
      toast.error("Önce e-posta adresinizi yazın, ardından tekrar deneyin.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
      redirectTo: `${window.location.origin}/sifre-sifirla`,
    });
    setBusy(false);
    if (error) {
      toast.error(trAuthError(error.message));
      return;
    }
    toast.success("Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.");
  };


  const rolesOf = async (userId: string) => {
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    return (data ?? []).map((r) => r.role as string);
  };

  /** Öğrenci girişi: e-posta + şifre */
  const studentSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = z
      .object({ email: emailSchema, password: passwordSchema })
      .safeParse({ email: form.identifier, password: form.password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Bilgileri kontrol edin");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword(parsed.data);
      if (error) {
        toast.error(trAuthError(error.message));
        return;
      }
      // Bir kişi aynı anda hem öğrenci hem hoca/yönetici olabilir:
      // öğrenci sekmesinden giriş herkese açıktır, yalnızca bilgilendirme yapılır.
      const { data: sess } = await supabase.auth.getUser();
      const roles = sess.user ? await rolesOf(sess.user.id) : [];
      const staff = roles.some((r) => ["super_admin", "admin", "instructor"].includes(r));
      toast.success(
        staff
          ? "Hoş geldiniz. Yönetim paneline üstteki menüden de geçebilirsiniz."
          : "Hoş geldiniz.",
      );
      onOpenChange(false);
      void navigate({ to: "/ogrenci" });
    } catch (err) {
      toast.error(err instanceof Error && err.message ? err.message : "Giriş başarısız");
    } finally {
      setBusy(false);
    }
  };


  /** Yönetici / eğitmen girişi: yalnızca yetkili roller */
  const staffSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = z
      .object({ email: emailSchema, password: passwordSchema })
      .safeParse({ email: form.email, password: form.password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Bilgileri kontrol edin");
      return;
    }
    setBusy(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
      if (error) {
        toast.error(trAuthError(error.message));
        return;
      }
      const roles = data.user ? await rolesOf(data.user.id) : [];
      const staff = roles.some((r) => ["super_admin", "admin", "instructor"].includes(r));
      if (!staff) {
        await supabase.auth.signOut();
        toast.error("Bu alana erişim yetkiniz bulunmamaktadır.");
        return;
      }
      toast.success("Hoş geldiniz.");
      onOpenChange(false);
      void navigate({ to: "/admin" });
    } finally {
      setBusy(false);
    }
  };

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = signUpSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Bilgileri kontrol edin");
      return;
    }
    setBusy(true);
    try {
      const { email, password, event_id, ...meta } = parsed.data;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin, data: meta },
      });
      if (error) {
        toast.error(trAuthError(error.message));
        return;
      }
      const joinedEvent = openEvents.find((ev) => ev.id === event_id);
      const chosen = openClasses.find((c) => c.id === meta.requested_class_id);
      await supabase.from("registration_applications").insert({
        full_name: meta.name,
        email,
        phone: meta.phone,
        program_id: meta.program_choice || "genel",
        program_label: chosen ? publicClassLabel(chosen) : meta.program_choice,
        requested_class_id: meta.requested_class_id,
        age_level: meta.age_level,
        notes: meta.notes,
      });
      if (joinedEvent) {
        const { data: sess } = await supabase.auth.getSession();
        const uid = sess.session?.user.id;
        if (uid) {
          await supabase.from("event_registrations").insert({
            event_id: joinedEvent.id,
            user_id: uid,
            full_name: meta.name,
            phone: meta.phone,
            notes: meta.notes,
          });
        }
      }
      toast.success(
        "Kaydınız tamamlandı. Paneliniz açıldı; sınıf atamanız yapıldığında ders bilgileriniz görünecektir.",
      );
      onOpenChange(false);
      void navigate({ to: "/ogrenci" });


    } finally {
      setBusy(false);
    }
  };

  const google = async () => {

    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    setBusy(false);
    if (result.error) {
      toast.error("Google ile giriş başarısız oldu.");
      return;
    }
    if (!result.redirected) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Minval Portal</DialogTitle>
          <DialogDescription>
            Kursiyerler, eğitmenler ve yöneticiler için tek giriş noktası.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-1 rounded-full bg-secondary p-1">
          {(
            [
              ["student", "Öğrenci Girişi"],
              ["staff", "Yönetici / Eğitmen"],
              ["signup", "Kayıt Ol"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`rounded-full px-2 py-2 text-[12px] transition-colors ${
                tab === id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "signup" && (
          <>
            <button
              type="button"
              onClick={google}
              disabled={busy}
              className="w-full rounded-full border border-border bg-card px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-secondary disabled:opacity-60"
            >
              Google ile kayıt ol / devam et
            </button>
            <div className="flex items-center gap-3 text-[11px] tracking-widest text-muted-foreground uppercase">
              <span className="h-px flex-1 bg-border" /> veya{" "}
              <span className="h-px flex-1 bg-border" />
            </div>
            <form onSubmit={signUp} className="space-y-3">
            <input

              className={field}
              placeholder="Ad Soyad *"
              maxLength={80}
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
            <input
              type="email"
              className={field}
              placeholder="E-posta Adresi *"
              maxLength={255}
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
            <input
              className={field}
              placeholder="Telefon Numarası *"
              inputMode="tel"
              maxLength={24}
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
            />
            <PasswordField
              placeholder="Şifre (en az 6 karakter) *"
              value={form.password}
              onChange={(v) => set("password", v)}
              show={showPass}
              onToggle={() => setShowPass((s) => !s)}
            />
            {openEvents.length > 0 && (
              <select
                className={field}
                value={form.event_id}
                onChange={(e) => set("event_id", e.target.value)}
              >
                <option value="">Katılmak istediğiniz etkinlik (opsiyonel)</option>
                {openEvents.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title} · {formatEventDate(ev.starts_at)}
                  </option>
                ))}
              </select>
            )}
            <select
              className={field}
              value={form.requested_class_id}
              onChange={(e) => set("requested_class_id", e.target.value)}
            >
              <option value="">Katılmak istediğiniz sınıf *</option>
              {openClasses.map((c) => (
                <option key={c.id} value={c.id}>
                  {publicClassLabel(c)}
                  {c.schedule ? ` · ${c.schedule}` : ""}
                </option>
              ))}
            </select>
            <select
              className={field}
              value={form.age_level}
              onChange={(e) => set("age_level", e.target.value)}
            >
              <option value="">Yaş / Eğitim durumu *</option>
              {levels.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
            <textarea
              className={`${field} min-h-20`}
              placeholder="Eklemek istedikleriniz (opsiyonel)"
              maxLength={500}
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
            />
            <button
              disabled={busy}
              className="w-full rounded-full bg-primary px-4 py-2.5 text-sm text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {busy ? "Kaydediliyor…" : "Kayıt Ol"}
            </button>
            </form>
          </>
        )}


        {tab === "student" && (
          <>
            <form onSubmit={studentSignIn} className="space-y-3">
              <input
                className={field}
                placeholder="E-posta Adresiniz"
                maxLength={255}
                value={form.identifier}
                onChange={(e) => set("identifier", e.target.value)}
              />
              <PasswordField
                placeholder="Şifre"
                value={form.password}
                onChange={(v) => set("password", v)}
                show={showPass}
                onToggle={() => setShowPass((s) => !s)}
              />
              <button
                disabled={busy}
                className="w-full rounded-full bg-primary px-4 py-2.5 text-sm text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {busy ? "Giriş yapılıyor…" : "Öğrenci Paneline Gir"}
              </button>
            </form>
            <button
              type="button"
              onClick={() => void forgotPassword()}
              disabled={busy}
              className="text-[12px] text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
            >
              Şifremi unuttum — kurtarma e-postası gönder
            </button>
            <p className="text-[12px] leading-relaxed text-muted-foreground">
              Sınıfınızı, yoklama durumunuzu, ödevlerinizi ve cüz ilerlemenizi görüntüleyebilirsiniz.
            </p>

          </>
        )}

        {tab === "staff" && (
          <>
            <button
              type="button"
              onClick={google}
              disabled={busy}
              className="w-full rounded-full border border-border bg-card px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-secondary disabled:opacity-60"
            >
              Google ile devam et
            </button>
            <div className="flex items-center gap-3 text-[11px] tracking-widest text-muted-foreground uppercase">
              <span className="h-px flex-1 bg-border" /> veya{" "}
              <span className="h-px flex-1 bg-border" />
            </div>
            <form onSubmit={staffSignIn} className="space-y-3">
              <input
                type="email"
                className={field}
                placeholder="E-posta Adresi"
                maxLength={255}
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
              />
              <PasswordField
                placeholder="Şifre"
                value={form.password}
                onChange={(v) => set("password", v)}
                show={showPass}
                onToggle={() => setShowPass((s) => !s)}
              />
              <button
                disabled={busy}
                className="w-full rounded-full bg-primary px-4 py-2.5 text-sm text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {busy ? "Giriş yapılıyor…" : "Yönetim Paneline Gir"}
              </button>
            </form>

            <button
              type="button"
              onClick={() => void forgotPassword()}
              disabled={busy}
              className="text-[12px] text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
            >
              Şifremi unuttum — kurtarma e-postası gönder
            </button>


            <p className="text-[12px] leading-relaxed text-muted-foreground">
              Bu alana sadece yetkili yöneticiler ve eğitmenler giriş yapabilir. Eğitmenler yalnızca
              kendilerine atanmış sınıfları görüntüleyebilir.
            </p>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
