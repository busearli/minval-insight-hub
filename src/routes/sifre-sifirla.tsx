import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/sifre-sifirla")({
  head: () => ({
    meta: [
      { title: "Şifre Sıfırlama · Minval Akademi" },
      {
        name: "description",
        content:
          "Minval Akademi hesabınızın şifresini e-posta ile gelen bağlantı üzerinden güvenle yenileyin.",
      },
      { property: "og:title", content: "Şifre Sıfırlama · Minval Akademi" },
      {
        property: "og:description",
        content: "Minval Akademi hesap şifrenizi yenileyin.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => setReady(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = z.string().min(6).max(72).safeParse(password);
    if (!parsed.success) {
      toast.error("Şifre en az 6 karakter olmalı.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      toast.error("Şifre güncellenemedi. Bağlantının süresi dolmuş olabilir.");
      return;
    }
    toast.success("Şifreniz güncellendi. Artık yeni şifrenizle giriş yapabilirsiniz.");
    setPassword("");
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-md px-5 py-20">
        <p className="eyebrow">Hesap Güvenliği</p>
        <h1 className="mt-2 font-serif text-3xl text-foreground">Yeni Şifre Belirle</h1>

        {!ready ? (
          <p className="mt-6 text-sm text-muted-foreground">
            Bu sayfayı e-postanıza gönderilen sıfırlama bağlantısı üzerinden açmanız gerekiyor.
            Bağlantıyı henüz almadıysanız giriş ekranındaki “Şifremi unuttum” adımını tekrarlayın.
          </p>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-3">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Yeni şifre (en az 6 karakter)"
              maxLength={72}
              className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
            <button
              disabled={busy}
              className="w-full rounded-full bg-primary px-4 py-2.5 text-sm text-primary-foreground disabled:opacity-60"
            >
              {busy ? "Kaydediliyor…" : "Şifremi Güncelle"}
            </button>
          </form>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
