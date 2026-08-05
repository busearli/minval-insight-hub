import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  classLabel,
  useClasses,
  useRemove,
  useSave,
  useStudents,
  type StudentRow,
} from "@/lib/admin-api";

export const Route = createFileRoute("/admin/ogrenciler")({
  component: StudentsPage,
});

const empty = { full_name: "", phone: "", class_id: "", status: "aktif", notes: "" };

function StudentsPage() {
  const { data: students = [], isLoading } = useStudents();
  const { data: classes = [] } = useClasses();
  const save = useSave("students");
  const remove = useRemove("students");
  const [form, setForm] = useState<Record<string, string>>(empty);
  const [editing, setEditing] = useState<string | null>(null);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const className = (id: string | null) => {
    const c = classes.find((x) => x.id === id);
    return c ? classLabel(c) : "—";
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form["full_name"]?.trim()) return;
    const payload = { ...form, class_id: form["class_id"] || null };
    save.mutate(editing ? { ...payload, id: editing } : payload, {
      onSuccess: () => {
        setForm(empty);
        setEditing(null);
      },
    });
  };

  const edit = (s: StudentRow) => {
    setEditing(s.id);
    setForm({
      full_name: s.full_name,
      phone: s.phone,
      class_id: s.class_id ?? "",
      status: s.status,
      notes: s.notes,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Öğrenci Kayıtları</p>
        <h1 className="mt-2 text-2xl text-foreground">Öğrenciler</h1>
      </div>

      <form onSubmit={submit} className="card-soft grid gap-3 border-accent/40 p-6 sm:grid-cols-2">
        <Input placeholder="Ad Soyad" value={form["full_name"] ?? ""} onChange={(e) => set("full_name", e.target.value)} />
        <Input placeholder="WhatsApp Telefon" value={form["phone"] ?? ""} onChange={(e) => set("phone", e.target.value)} />
        <select
          value={form["class_id"] ?? ""}
          onChange={(e) => set("class_id", e.target.value)}
          className="h-9 rounded-md border border-input bg-card px-3 text-sm text-foreground"
        >
          <option value="">Sınıf seçiniz</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>{classLabel(c)}</option>
          ))}
        </select>
        <select
          value={form["status"] ?? "aktif"}
          onChange={(e) => set("status", e.target.value)}
          className="h-9 rounded-md border border-input bg-card px-3 text-sm text-foreground"
        >
          <option value="aktif">Aktif</option>
          <option value="beklemede">Beklemede</option>
          <option value="ayrildi">Ayrıldı</option>
        </select>
        <Textarea placeholder="Durum notu" value={form["notes"] ?? ""} onChange={(e) => set("notes", e.target.value)} className="sm:col-span-2" />
        <div className="flex gap-2 sm:col-span-2">
          <button type="submit" disabled={save.isPending} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground disabled:opacity-60">
            <Plus className="h-4 w-4" /> {editing ? "Güncelle" : "Öğrenci Ekle"}
          </button>
          {editing && (
            <button type="button" onClick={() => { setEditing(null); setForm(empty); }} className="rounded-full border border-border px-5 py-2.5 text-sm text-muted-foreground">
              Vazgeç
            </button>
          )}
        </div>
      </form>

      <div className="card-soft overflow-x-auto border-accent/40">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-border text-[12px] text-muted-foreground">
            <tr>
              <th className="px-5 py-3">Ad Soyad</th>
              <th className="px-5 py-3">WhatsApp</th>
              <th className="px-5 py-3">Sınıf</th>
              <th className="px-5 py-3">Kayıt</th>
              <th className="px-5 py-3">Durum</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={6} className="px-5 py-6 text-muted-foreground">Yükleniyor…</td></tr>}
            {!isLoading && students.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-6 text-muted-foreground">Henüz öğrenci eklenmedi.</td></tr>
            )}
            {students.map((s) => (
              <tr key={s.id} className="border-b border-border/70 last:border-0">
                <td className="px-5 py-3 text-foreground">{s.full_name}</td>
                <td className="px-5 py-3 text-muted-foreground">{s.phone || "—"}</td>
                <td className="px-5 py-3 text-muted-foreground">{className(s.class_id)}</td>
                <td className="px-5 py-3 text-muted-foreground">{s.registered_at}</td>
                <td className="px-5 py-3">
                  <span className="rounded-full bg-secondary px-3 py-1 text-[11px] text-secondary-foreground">{s.status}</span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => edit(s)} className="rounded-full border border-border p-2 text-muted-foreground hover:text-primary">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => remove.mutate(s.id)} className="rounded-full border border-border p-2 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
