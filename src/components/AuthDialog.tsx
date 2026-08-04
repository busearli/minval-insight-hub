import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const schema = z.object({
  name: z.string().trim().max(80).optional(),
  email: z.string().trim().email({ message: "Geçerli bir e-posta giriniz" }).max(255),
  password: z.string().min(6, { message: "Şifre en az 6 karakter olmalı" }).max(72),
});

export function AuthDialog({
  open,
  onOpenChange,
  defaultMode = "login",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultMode?: "login" | "signup";
}) {
  const [mode, setMode] = useState<"login" | "signup">(defaultMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ name, email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Bilgileri kontrol edin");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { name: parsed.data.name || parsed.data.email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("Kaydınız alındı. E-postanızdaki onay bağlantısına tıklayın.");
        onOpenChange(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: parsed.data.email,
          password: parsed.data.password,
        });
        if (error) throw error;
        toast.success("Hoş geldiniz.");
        onOpenChange(false);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Bir hata oluştu");
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">
            {mode === "login" ? "Katılımcı Girişi" : "Kayıt Ol"}
          </DialogTitle>
          <DialogDescription>
            Atölye kayıtlarınıza ve ders materyallerine erişmek için hesabınızı kullanın.
          </DialogDescription>
        </DialogHeader>

        <button
          onClick={google}
          disabled={busy}
          className="w-full rounded-full border border-border bg-card px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-secondary disabled:opacity-60"
        >
          Google ile devam et
        </button>

        <div className="flex items-center gap-3 text-[11px] tracking-widest text-muted-foreground uppercase">
          <span className="h-px flex-1 bg-border" /> veya <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === "signup" && (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ad Soyad"
              maxLength={80}
              className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          )}
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-posta"
            maxLength={255}
            className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Şifre"
            maxLength={72}
            className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
          <button
            disabled={busy}
            className="w-full rounded-full bg-primary px-4 py-2.5 text-sm text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {mode === "login" ? "Giriş Yap" : "Hesap Oluştur"}
          </button>
        </form>

        <button
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="text-[13px] text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
        >
          {mode === "login" ? "Hesabınız yok mu? Kayıt olun" : "Zaten hesabınız var mı? Giriş yapın"}
        </button>
      </DialogContent>
    </Dialog>
  );
}
