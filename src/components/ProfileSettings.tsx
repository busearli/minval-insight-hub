import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { supabase } from "@/integrations/supabase/client";

const field =
  "w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary";

const schema = z.object({
  name: z.string().trim().min(3, { message: "Ad soyad en az 3 karakter olmalı" }).max(80),
  phone: z.string().trim().max(24),
});

/** Öğrenci ve personelin kendi iletişim bilgilerini ve şifresini güncellediği ortak form. */
export function ProfileSettings({
  userId,
  email,
  initialName,
  initialPhone,
  onSaved,
}: {
  userId: string;
  email: string;
  initialName: string;
  initialPhone: string;
  onSaved?: () => void;
}) {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [busy, setBusy] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ name, phone });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Bilgileri kontrol edin");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ name: parsed.data.name, phone: parsed.data.phone } as never)
        .eq("user_id", userId);
      if (error) throw new Error(error.message);

      // Öğrenci kaydı varsa aynı bilgileri oraya da yansıt.
      await supabase
        .from("students")
        .update({ full_name: parsed.data.name, phone: parsed.data.phone } as never)
        .eq("user_id", userId);

      toast.success("Bilgileriniz güncellendi.");
      onSaved?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Güncellenemedi");
    } finally {
      setBusy(false);
    }
  };

  const changePassword = async () => {
    if (password.length < 6) {
      toast.error("Yeni şifre en az 6 karakter olmalı.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      toast.error("Şifre güncellenemedi.");
      return;
    }
    setPassword("");
    toast.success("Şifreniz güncellendi.");
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <form onSubmit={save} className="card-soft space-y-3 border-accent/40 p-6">
        <h2 className="text-lg text-foreground">İletişim Bilgilerim</h2>
        <div>
          <label className="eyebrow">Ad Soyad</label>
          <input className={`${field} mt-1`} value={name} onChange={(e) => setName(e.target.value)} maxLength={80} />
        </div>
        <div>
          <label className="eyebrow">Telefon</label>
          <input
            className={`${field} mt-1`}
            value={phone}
            inputMode="tel"
            maxLength={24}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div>
          <label className="eyebrow">E-posta</label>
          <input className={`${field} mt-1 opacity-70`} value={email} disabled />
        </div>
        <button
          disabled={busy}
          className="rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground disabled:opacity-60"
        >
          Bilgilerimi Kaydet
        </button>
      </form>

      <div className="card-soft space-y-3 border-accent/40 p-6">
        <h2 className="text-lg text-foreground">Şifre Değiştir</h2>
        <input
          type={showPass ? "text" : "password"}
          className={field}
          placeholder="Yeni şifre (en az 6 karakter)"
          maxLength={72}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <label className="flex cursor-pointer items-center gap-2 text-[12px] text-muted-foreground">
          <input
            type="checkbox"
            checked={showPass}
            onChange={() => setShowPass((s) => !s)}
            className="accent-primary"
          />
          Şifreyi göster
        </label>
        <button
          type="button"
          onClick={() => void changePassword()}
          disabled={busy}
          className="rounded-full border border-border px-5 py-2.5 text-sm text-muted-foreground hover:text-primary disabled:opacity-60"
        >
          Şifremi Güncelle
        </button>
      </div>
    </div>
  );
}
