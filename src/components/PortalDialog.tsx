import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";

import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { getStudentPortal } from "@/lib/student-portal.functions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const adminSchema = z.object({
  email: z.string().trim().email({ message: "Geçerli bir e-posta giriniz" }).max(255),
  password: z.string().min(6, { message: "Şifre en az 6 karakter olmalı" }).max(72),
});

const field =
  "w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary";

export function PortalDialog({
  open,
  onOpenChange,
  defaultTab = "student",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultTab?: "student" | "admin";
}) {
  const [tab, setTab] = useState<"student" | "admin">(defaultTab);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const studentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      toast.error("Geçerli bir telefon numarası giriniz");
      return;
    }
    setBusy(true);
    try {
      const result = await getStudentPortal({ data: { phone } });
      if (!result) {
        toast.error("Bu numaraya ait kayıtlı öğrenci bulunamadı.");
        return;
      }
      localStorage.setItem("minval_student_phone", phone);
      toast.success(`Hoş geldiniz, ${result.student.full_name}.`);
      onOpenChange(false);
      void navigate({ to: "/ogrenci" });
    } catch {
      toast.error("Giriş yapılamadı, lütfen tekrar deneyin.");
    } finally {
      setBusy(false);
    }
  };

  const adminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = adminSchema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Bilgileri kontrol edin");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword(parsed.data);
      if (error) throw error;
      toast.success("Hoş geldiniz.");
      onOpenChange(false);
      void navigate({ to: "/admin" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Giriş başarısız");
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
          <DialogTitle className="font-serif text-2xl">Giriş Yap</DialogTitle>
          <DialogDescription>
            Katılımcılar telefon numarası ile, yönetici ve eğitmenler e-posta ile giriş yapar.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-1 rounded-full bg-secondary p-1">
          {(
            [
              ["student", "Öğrenci Girişi"],
              ["admin", "Yönetici / Eğitmen"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`rounded-full px-3 py-2 text-[12px] transition-colors ${
                tab === id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "student" ? (
          <form onSubmit={studentLogin} className="space-y-3">
            <input
              className={field}
              placeholder="Kayıtlı telefon numaranız"
              inputMode="tel"
              maxLength={24}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <button
              disabled={busy}
              className="w-full rounded-full bg-primary px-4 py-2.5 text-sm text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {busy ? "Kontrol ediliyor…" : "Öğrenci Paneline Gir"}
            </button>
            <p className="text-[12px] leading-relaxed text-muted-foreground">
              Sınıfınızı, yoklama durumunuzu ve ödevlerinizi görüntüleyebilirsiniz.
            </p>
          </form>
        ) : (
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
            <form onSubmit={adminLogin} className="space-y-3">
              <input
                type="email"
                className={field}
                placeholder="E-posta"
                maxLength={255}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                className={field}
                placeholder="Şifre"
                maxLength={72}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                disabled={busy}
                className="w-full rounded-full bg-primary px-4 py-2.5 text-sm text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                Yönetim Paneline Gir
              </button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
