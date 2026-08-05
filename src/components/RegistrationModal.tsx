import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { programs } from "@/lib/minval-programs";
import { submitApplication } from "@/lib/site-api";

const schema = z.object({
  full_name: z.string().trim().min(3, { message: "Ad soyad giriniz" }).max(80),
  phone: z
    .string()
    .trim()
    .min(10, { message: "Geçerli bir WhatsApp numarası giriniz" })
    .max(24)
    .regex(/^[0-9+()\s-]+$/, { message: "Telefon yalnızca rakam içermelidir" }),
  program_id: z.string().min(1, { message: "Program seçiniz" }),
  age_level: z.string().trim().max(80),
  notes: z.string().trim().max(500),
});

const levels = ["Ortaokul", "Lise", "Üniversite", "Mezun / Yetişkin"];

export function RegistrationModal({
  open,
  onOpenChange,
  defaultProgramId = "",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultProgramId?: string;
}) {
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    program_id: defaultProgramId,
    age_level: "",
    notes: "",
  });
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Bilgileri kontrol edin");
      return;
    }
    setBusy(true);
    try {
      const program = programs.find((p) => p.id === parsed.data.program_id);
      await submitApplication({
        ...parsed.data,
        program_label: program ? `${program.title} — ${program.subtitle}` : parsed.data.program_id,
      });
      toast.success("Ön kaydınız alınmıştır. En kısa sürede sizinle iletişime geçilecektir.");
      setForm({ full_name: "", phone: "", program_id: "", age_level: "", notes: "" });
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Kayıt gönderilemedi");
    } finally {
      setBusy(false);
    }
  };

  const field =
    "w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Ön Kayıt Formu</DialogTitle>
          <DialogDescription>
            Formu doldurun; kontenjan durumuna göre WhatsApp üzerinden sizinle iletişime geçelim.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-3">
          <input
            className={field}
            placeholder="Ad Soyad"
            maxLength={80}
            value={form.full_name}
            onChange={(e) => set("full_name", e.target.value)}
          />
          <input
            className={field}
            placeholder="WhatsApp Telefon Numarası"
            maxLength={24}
            inputMode="tel"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
          />
          <select
            className={field}
            value={form.program_id}
            onChange={(e) => set("program_id", e.target.value)}
          >
            <option value="">Program seçiniz</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} — {p.subtitle}
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
            className={`${field} min-h-24 resize-y`}
            placeholder="Eklemek istedikleriniz (isteğe bağlı)"
            maxLength={500}
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
          />
          <button
            disabled={busy}
            className="w-full rounded-full bg-primary px-4 py-3 text-sm text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {busy ? "Gönderiliyor…" : "Ön Kaydımı Gönder"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
