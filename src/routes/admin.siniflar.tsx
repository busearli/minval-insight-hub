import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { classLabel, useClasses, useRemove, useSave, type ClassRow } from "@/lib/admin-api";

export const Route = createFileRoute("/admin/siniflar")({
  component: ClassesPage,
});

const empty = { program: "", name: "", level: "", instructor_name: "", schedule: "", notes: "" };

function ClassesPage() {
  const { data: classes = [], isLoading } = useClasses();
  const save = useSave("classes");
  const remove = useRemove("classes");
  const [form, setForm] = useState<Record<string, string>>(empty);
  const [editing, setEditing] = useState<string | null>(null);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form["name"]?.trim()) return;
    save.mutate(editing ? { ...form, id: editing } : form, {
      onSuccess: () => {
        setForm(empty);
        setEditing(null);
      },
    });
  };

  const edit = (c: ClassRow) => {
    setEditing(c.id);
    setForm({
      program: c.program,
      name: c.name,
      level: c.level,
      instructor_name: c.instructor_name,
      schedule: c.schedule,
      notes: c.notes,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Sınıf Yönetimi</p>
        <h1 className="mt-2 text-2xl text-foreground">Sınıflar & Gruplar</h1>
      </div>

      <form onSubmit={submit} className="card-soft grid gap-3 border-accent/40 p-6 sm:grid-cols-2">
        <Input placeholder="Program (ör. Minval Risale)" value={form["program"] ?? ""} onChange={(e) => set("program", e.target.value)} />
        <Input placeholder="Grup adı (ör. Grup 1)" value={form["name"] ?? ""} onChange={(e) => set("name", e.target.value)} />
        <Input placeholder="Düzey (ör. Orta Düzey N2)" value={form["level"] ?? ""} onChange={(e) => set("level", e.target.value)} />
        <Input placeholder="Eğitmen adı" value={form["instructor_name"] ?? ""} onChange={(e) => set("instructor_name", e.target.value)} />
        <Input placeholder="Program saati (ör. Salı 20:00)" value={form["schedule"] ?? ""} onChange={(e) => set("schedule", e.target.value)} />
        <Textarea placeholder="Not" value={form["notes"] ?? ""} onChange={(e) => set("notes", e.target.value)} className="sm:col-span-2" />
        <div className="flex gap-2 sm:col-span-2">
          <button
            type="submit"
            disabled={save.isPending}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground disabled:opacity-60"
          >
            <Plus className="h-4 w-4" /> {editing ? "Güncelle" : "Sınıf Ekle"}
          </button>
          {editing && (
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setForm(empty);
              }}
              className="rounded-full border border-border px-5 py-2.5 text-sm text-muted-foreground"
            >
              Vazgeç
            </button>
          )}
        </div>
      </form>

      <div className="card-soft overflow-x-auto border-accent/40">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-border text-[12px] text-muted-foreground">
            <tr>
              <th className="px-5 py-3">Sınıf</th>
              <th className="px-5 py-3">Eğitmen</th>
              <th className="px-5 py-3">Program Saati</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={4} className="px-5 py-6 text-muted-foreground">Yükleniyor…</td></tr>
            )}
            {!isLoading && classes.length === 0 && (
              <tr><td colSpan={4} className="px-5 py-6 text-muted-foreground">Henüz sınıf eklenmedi.</td></tr>
            )}
            {classes.map((c) => (
              <tr key={c.id} className="border-b border-border/70 last:border-0">
                <td className="px-5 py-3 text-foreground">{classLabel(c)}</td>
                <td className="px-5 py-3 text-muted-foreground">{c.instructor_name || "—"}</td>
                <td className="px-5 py-3 text-muted-foreground">{c.schedule || "—"}</td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => edit(c)} className="rounded-full border border-border p-2 text-muted-foreground hover:text-primary">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => remove.mutate(c.id)} className="rounded-full border border-border p-2 text-muted-foreground hover:text-destructive">
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
