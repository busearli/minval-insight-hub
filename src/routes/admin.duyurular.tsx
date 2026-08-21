import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Megaphone, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { classLabel, useClasses } from "@/lib/admin-api";
import { useAnnouncements, useDeleteAnnouncement, useSaveAnnouncement } from "@/lib/announcements";
import { useMyRoles } from "@/lib/rbac";
import { useSaveSettings, useSiteSettings } from "@/lib/site-api";

export const Route = createFileRoute("/admin/duyurular")({
  component: AnnouncementsPage,
});

function AnnouncementsPage() {
  const { isAdmin, isInstructor, isStaff, myClassIds } = useMyRoles();
  const { data: allClasses = [] } = useClasses();
  const classes = isAdmin ? allClasses : allClasses.filter((c) => myClassIds.includes(c.id));
  const { data: allList = [], isLoading } = useAnnouncements();
  const save = useSaveAnnouncement();
  const remove = useDeleteAnnouncement();
  const { settings } = useSiteSettings();
  const saveSettings = useSaveSettings();

  const list = isAdmin
    ? allList
    : allList.filter((a) => a.class_id && myClassIds.includes(a.class_id));

  const [form, setForm] = useState({ title: "", body: "", class_id: "" });
  const [contact, setContact] = useState<Record<string, string> | null>(null);

  const c = contact ?? {
    whatsapp_number: settings.whatsapp_number,
    instagram_url: settings.instagram_url,
    phone: settings.phone,
    email: settings.email,
    address: settings.address,
  };
  const setC = (k: string, v: string) => setContact({ ...c, [k]: v });

  if (!isStaff) {
    return <p className="text-sm text-muted-foreground">Bu bölüm yalnızca yönetici ve eğitmenler içindir.</p>;
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Duyuru başlığı giriniz.");
      return;
    }
    if (!isAdmin && !form.class_id) {
      toast.error("Lütfen duyuruyu göndereceğiniz sınıfı seçiniz.");
      return;
    }
    save.mutate(
      { title: form.title.trim(), body: form.body.trim(), class_id: form.class_id || null },
      {
        onSuccess: () => {
          setForm({ title: "", body: "", class_id: "" });
          toast.success("Duyuru yayınlandı.");
        },
        onError: (err) => toast.error(err instanceof Error ? err.message : "Duyuru kaydedilemedi"),
      },
    );
  };

  const saveContact = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettings.mutate(
      { ...settings, ...c },
      {
        onSuccess: () => toast.success("İletişim bilgileri güncellendi."),
        onError: (err) => toast.error(err instanceof Error ? err.message : "Güncellenemedi"),
      },
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">İçerik Yönetimi</p>
        <h1 className="mt-2 text-2xl text-foreground">
          {isAdmin ? "Duyurular & Site İçeriği" : "Sınıf Duyurularım"}
        </h1>
      </div>

      <form onSubmit={submit} className="card-soft grid gap-3 border-accent/40 p-6 sm:grid-cols-2">
        <Input
          placeholder="Duyuru başlığı"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
        />
        <select
          value={form.class_id}
          onChange={(e) => setForm((f) => ({ ...f, class_id: e.target.value }))}
          className="h-9 rounded-md border border-input bg-card px-3 text-sm text-foreground"
        >
          <option value="">{isAdmin ? "Tüm öğrenciler" : "Sınıf seçiniz"}</option>
          {classes.map((cl) => (
            <option key={cl.id} value={cl.id}>
              {classLabel(cl)}
            </option>
          ))}
        </select>
        <Textarea
          placeholder="Duyuru metni"
          className="sm:col-span-2"
          value={form.body}
          onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
        />
        <button
          type="submit"
          disabled={save.isPending}
          className="inline-flex w-fit items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground disabled:opacity-60"
        >
          <Plus className="h-4 w-4" /> Duyuru Yayınla
        </button>
      </form>

      <div className="card-soft divide-y divide-border border-accent/40">
        {isLoading && <p className="px-5 py-6 text-sm text-muted-foreground">Yükleniyor…</p>}
        {!isLoading && list.length === 0 && (
          <p className="px-5 py-6 text-sm text-muted-foreground">Henüz duyuru yok.</p>
        )}
        {list.map((a) => {
          const cls = classes.find((x) => x.id === a.class_id);
          return (
            <div key={a.id} className="flex items-start gap-3 px-5 py-4">
              <Megaphone className="mt-1 h-4 w-4 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-foreground">{a.title}</p>
                {a.body && <p className="mt-1 text-[13px] text-muted-foreground">{a.body}</p>}
                <p className="mt-1 text-[12px] text-muted-foreground">
                  {cls ? classLabel(cls) : "Tüm öğrenciler"} · {a.created_at.slice(0, 10)}
                </p>
              </div>
              <button
                onClick={() => remove.mutate(a.id)}
                className="rounded-full border border-border p-1.5 text-muted-foreground hover:text-destructive"
                aria-label="Duyuruyu sil"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {isAdmin && (
      <form onSubmit={saveContact} className="card-soft grid gap-3 border-accent/40 p-6 sm:grid-cols-2">
        <h2 className="text-lg text-foreground sm:col-span-2">Site İletişim Bilgileri</h2>
        <Input placeholder="WhatsApp numarası" value={c["whatsapp_number"] ?? ""} onChange={(e) => setC("whatsapp_number", e.target.value)} />
        <Input placeholder="Instagram adresi" value={c["instagram_url"] ?? ""} onChange={(e) => setC("instagram_url", e.target.value)} />
        <Input placeholder="Telefon" value={c["phone"] ?? ""} onChange={(e) => setC("phone", e.target.value)} />
        <Input placeholder="E-posta" value={c["email"] ?? ""} onChange={(e) => setC("email", e.target.value)} />
        <Textarea placeholder="Adres" className="sm:col-span-2" value={c["address"] ?? ""} onChange={(e) => setC("address", e.target.value)} />
        <button
          type="submit"
          disabled={saveSettings.isPending}
          className="inline-flex w-fit items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground disabled:opacity-60"
        >
          Bilgileri Kaydet
        </button>
      </form>
      )}
    </div>
  );
}
