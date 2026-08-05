import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";

import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { programs } from "@/lib/minval-programs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const credsSchema = z.object({
  email: z.string().trim().email({ message: "Geçerli bir e-posta giriniz" }).max(255),
  password: z.string().min(6, { message: "Şifre en az 6 karakter olmalı" }).max(72),
});

const signUpSchema = credsSchema.extend({
  name: z.string().trim().min(3, { message: "Ad soyad giriniz" }).max(80),
  phone: z
    .string()
    .trim()
    .min(10, { message: "Geçerli bir WhatsApp numarası giriniz" })
    .max(24)
    .regex(/^[0-9+()\s-]+$/, { message: "Telefon yalnızca rakam içermelidir" }),
  program_choice: z.string().min(1, { message: "Program seçiniz" }),
  age_level: z.string().trim().max(80),
  notes: z.string().trim().max(500),
});

const levels = ["Ortaokul", "Lise", "Üniversite", "Mezun / Yetişkin"];

const field =
  "w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary";

type Tab = "student" | "staff" | "signup";

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
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    program_choice: "",
    age_level: "",
    notes: "",
  });
  const navigate = useNavigate();
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const routeByRole = async (userId: string) => {
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    const roles = (data ?? []).map((r) => r.role as string);
    const staff = roles.some((r) => ["super_admin", "admin", "instructor"].includes(r));
    void navigate({ to: staff ? "/admin" : "/ogrenci" });
  };

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = credsSchema.safeParse({ email: form.email, password: form.password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Bilgileri kontrol edin");
      return;
    }
    setBusy(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
      if (error) throw error;
      toast.success("Hoş geldiniz.");
      onOpenChange(false);
      if (data.user) await routeByRole(data.user.id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Giriş başarısız");
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
      const { email, password, ...meta } = parsed.data;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin, data: meta },
      });
      if (error) throw error;
      toast.success(
        "Kayıt talebiniz alındı. Yöneticilerimiz tarafından sınıf atamanız yapıldıktan sonra paneliniz aktifleşecektir.",
      );
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Kayıt başarısız");
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
              ["student", "Öğrenci"],
              ["staff", "Eğitmen / Admin"],
              ["signup", "Kayıt Ol"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
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

        {tab === "signup" ? (
          <form onSubmit={signUp} className="space-y-3">
            <input
              className={field}
              placeholder="Ad Soyad"
              maxLength={80}
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
            <input
              type="email"
              className={field}
              placeholder="E-posta"
              maxLength={255}
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
            <input
              className={field}
              placeholder="WhatsApp Telefon"
              inputMode="tel"
              maxLength={24}
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
            />
            <input
              type="password"
              className={field}
              placeholder="Şifre (en az 6 karakter)"
              maxLength={72}
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
            />
            <select
              className={field}
              value={form.program_choice}
              onChange={(e) => set("program_choice", e.target.value)}
            >
              <option value="">Katılmak istediğiniz program</option>
              {programs.map((p) => (
                <option key={p.id} value={p.title}>
                  {p.title}
                </option>
              ))}
            </select>
            <select
              className={field}
              value={form.age_level}
              onChange={(e) => set("age_level", e.target.value)}
            >
              <option value="">Yaş / Eğitim düzeyi</option>
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
              {busy ? "Gönderiliyor…" : "Kayıt Talebi Gönder"}
            </button>
          </form>
        ) : (
          <>
            {tab === "staff" && (
              <>
                <button
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
              </>
            )}
            <form onSubmit={signIn} className="space-y-3">
              <input
                type="email"
                className={field}
                placeholder="E-posta"
                maxLength={255}
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
              />
              <input
                type="password"
                className={field}
                placeholder="Şifre"
                maxLength={72}
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
              />
              <button
                disabled={busy}
                className="w-full rounded-full bg-primary px-4 py-2.5 text-sm text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {busy ? "Giriş yapılıyor…" : tab === "student" ? "Öğrenci Paneline Gir" : "Yönetim Paneline Gir"}
              </button>
            </form>
            <p className="text-[12px] leading-relaxed text-muted-foreground">
              {tab === "student"
                ? "Sınıfınızı, yoklama durumunuzu, ödevlerinizi ve cüz ilerlemenizi görüntüleyebilirsiniz."
                : "Eğitmenler yalnızca kendilerine atanmış sınıfları görüntüleyebilir."}
            </p>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
