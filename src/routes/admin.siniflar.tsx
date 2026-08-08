import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  classLabel,
  useClasses,
  useSave,
  useStudents,
  useRemoveClass,
  useSaveClass,
  useProfiles,
  useAllRoles,
  useClassInstructors,
  useAssignInstructor,
  useUnassignInstructor,
  type ClassRow,
} from "@/lib/admin-api";
import { useMyRoles } from "@/lib/rbac";


export const Route = createFileRoute("/admin/siniflar")({
  component: ClassesPage,
});

const empty = {
  program: "",
  name: "",
  level: "",
  instructor_name: "",
  schedule: "",
  day: "",
  start_time: "",
  end_time: "",
  capacity: "",
  notes: "",
  instructor_user_id: "",
};

const weekDays = [
  "Pazartesi",
  "Salı",
  "Çarşamba",
  "Perşembe",
  "Cuma",
  "Cumartesi",
  "Pazar",
];

/** "Salı 20:00 – 21:30" biçiminde ders günü/saati metni üretir. */
function composeSchedule(day: string, start: string, end: string) {
  const time = [start, end].filter(Boolean).join(" – ");
  return [day, time].filter(Boolean).join(" ").trim();
}

/** Kayıtlı metinden gün ve saatleri geri okur. */
function parseSchedule(value: string) {
  const day = weekDays.find((d) => value.toLowerCase().includes(d.toLowerCase())) ?? "";
  const times = value.match(/\d{1,2}[:.]\d{2}/g) ?? [];
  const norm = (t?: string) => (t ? t.replace(".", ":").padStart(5, "0") : "");
  return { day, start_time: norm(times[0]), end_time: norm(times[1]) };
}

function ClassesPage() {
  const { isAdmin, isInstructor, myClassIds } = useMyRoles();
  const { data: allClasses = [], isLoading } = useClasses();
  const classes = isAdmin ? allClasses : allClasses.filter((c) => myClassIds.includes(c.id));
  const save = useSaveClass();
  const remove = useRemoveClass();
  const { data: students = [] } = useStudents();
  const saveStudent = useSave("students");
  const { data: profiles = [] } = useProfiles();
  const { data: roles = [] } = useAllRoles();
  const { data: links = [] } = useClassInstructors();
  const assign = useAssignInstructor();
  const unassign = useUnassignInstructor();
  const [openRoster, setOpenRoster] = useState<string | null>(null);
  const [moveTo, setMoveTo] = useState<Record<string, string>>({});
  const [newStudent, setNewStudent] = useState<Record<string, string>>({});
  const [addExisting, setAddExisting] = useState<Record<string, string>>({});

  const [form, setForm] = useState<Record<string, string>>(empty);
  const [editing, setEditing] = useState<string | null>(null);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  /** Eğitmen rolüne sahip kullanıcılar. */
  const instructors = profiles.filter((p) =>
    roles.some((r) => r.user_id === p.user_id && r.role === "instructor"),
  );
  const instructorsOf = (classId: string) => links.filter((l) => l.class_id === classId);
  const instructorOf = (classId: string) =>
    links.find((l) => l.class_id === classId) ?? null;
  const instructorName = (userId: string) =>
    profiles.find((p) => p.user_id === userId)?.name ?? "—";

  if (!isAdmin && !isInstructor) {
    return (
      <p className="text-sm text-muted-foreground">
        Sınıf bilgilerini görüntüleme yetkiniz bulunmuyor.
      </p>
    );
  }

  /** Sınıfa yeni bir hoca ekler; mevcut hocalar korunur (bir derse birden çok hoca). */
  const syncInstructor = async (classId: string, userId: string) => {
    if (!userId) return;
    const exists = links.some((l) => l.class_id === classId && l.user_id === userId);
    if (!exists) await assign.mutateAsync({ class_id: classId, user_id: userId });
  };


  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form["name"]?.trim()) {
      toast.error("Lütfen grup adını girin.");
      return;
    }
    const { day, start_time, end_time, instructor_user_id, ...rest } = form;
    const payload: Record<string, unknown> = {
      ...rest,
      schedule: composeSchedule(day ?? "", start_time ?? "", end_time ?? ""),
      capacity: Number(form["capacity"] ?? 0) || 0,
      ...(editing ? { id: editing } : {}),
    };
    const wasEditing = editing;
    setForm(empty);
    setEditing(null);
    save.mutate(payload, {
      onSuccess: async ({ id }) => {
        try {
          await syncInstructor(id, instructor_user_id ?? "");
        } catch {
          toast.error("Sınıf kaydedildi ama hoca ataması yapılamadı.");
        }
        toast.success(wasEditing ? "Sınıf güncellendi" : "Sınıf başarıyla oluşturuldu");
      },
      onError: () => toast.error("Sınıf kaydedilemedi."),
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
      ...parseSchedule(c.schedule ?? ""),
      capacity: String(c.capacity ?? 0),
      notes: c.notes,
      instructor_user_id: instructorOf(c.id)?.user_id ?? "",
    });
  };


  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Sınıf Yönetimi</p>
        <h1 className="mt-2 text-2xl text-foreground">Sınıflar & Gruplar</h1>
      </div>

      {!isAdmin && (
        <p className="text-sm text-muted-foreground">
          Yalnızca size atanmış sınıfları görüntüleyip düzenleyebilirsiniz.
        </p>
      )}

      {isAdmin && (
      <form onSubmit={submit} className="card-soft grid gap-3 border-accent/40 p-6 sm:grid-cols-2">
        <Input placeholder="Program (ör. Minval Risale)" value={form["program"] ?? ""} onChange={(e) => set("program", e.target.value)} />
        <Input placeholder="Grup adı (ör. Grup 1)" value={form["name"] ?? ""} onChange={(e) => set("name", e.target.value)} />
        <Input placeholder="Düzey (ör. Orta Düzey N2)" value={form["level"] ?? ""} onChange={(e) => set("level", e.target.value)} />
        <Input placeholder="Eğitmen adı" value={form["instructor_name"] ?? ""} onChange={(e) => set("instructor_name", e.target.value)} />
        <select
          aria-label="Sorumlu hoca hesabı"
          value={form["instructor_user_id"] ?? ""}
          onChange={(e) => {
            set("instructor_user_id", e.target.value);
            const n = e.target.value ? instructorName(e.target.value) : "";
            if (n && n !== "—") set("instructor_name", n);
          }}
          className="h-10 rounded-md border border-input bg-card px-3 text-sm text-foreground sm:col-span-2"
        >
          <option value="">Sorumlu hoca hesabı ekle (birden fazla olabilir)</option>
          {instructors.map((p) => (
            <option key={p.user_id} value={p.user_id}>
              {p.name}
            </option>
          ))}
        </select>

        <div className="grid grid-cols-3 gap-2 sm:col-span-2">
          <select
            value={form["day"] ?? ""}
            onChange={(e) => set("day", e.target.value)}
            className="h-10 rounded-md border border-input bg-card px-3 text-sm text-foreground"
          >
            <option value="">Ders günü</option>
            {weekDays.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <Input
            type="time"
            aria-label="Başlangıç saati"
            value={form["start_time"] ?? ""}
            onChange={(e) => set("start_time", e.target.value)}
          />
          <Input
            type="time"
            aria-label="Bitiş saati"
            value={form["end_time"] ?? ""}
            onChange={(e) => set("end_time", e.target.value)}
          />
        </div>
        <Input type="number" min={0} placeholder="Kontenjan (kişi)" value={form["capacity"] ?? ""} onChange={(e) => set("capacity", e.target.value)} />
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
      )}

      <div className="card-soft overflow-x-auto border-accent/40">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-border text-[12px] text-muted-foreground">
            <tr>
              <th className="px-5 py-3">Sınıf</th>
              <th className="px-5 py-3">Eğitmen</th>
              <th className="px-5 py-3">Program Saati</th>
              <th className="px-5 py-3">Kontenjan</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={5} className="px-5 py-6 text-muted-foreground">Yükleniyor…</td></tr>
            )}
            {!isLoading && classes.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-6 text-muted-foreground">Henüz sınıf eklenmedi.</td></tr>
            )}
            {classes.map((c) => (
              <tr key={c.id} className="border-b border-border/70 last:border-0">
                <td className="px-5 py-3 text-foreground">{classLabel(c)}</td>
                <td className="px-5 py-3 text-muted-foreground">
                  {instructorOf(c.id) ? instructorName(instructorOf(c.id)!.user_id) : c.instructor_name || "—"}
                  {!instructorOf(c.id) && (
                    <span className="ml-2 text-[11px] text-destructive">hesap atanmadı</span>
                  )}
                </td>

                <td className="px-5 py-3 text-muted-foreground">{c.schedule || "—"}</td>
                <td className="px-5 py-3 text-muted-foreground">
                  {students.filter((s) => s.class_id === c.id).length}
                  {c.capacity ? ` / ${c.capacity}` : ""}
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setOpenRoster((v) => (v === c.id ? null : c.id))}
                      className="rounded-full border border-border px-3 py-1 text-[12px] text-muted-foreground hover:text-primary"
                    >
                      {openRoster === c.id ? "Listeyi Kapat" : "Öğrenci Listesi"}
                    </button>
                    <button onClick={() => edit(c)} className="rounded-full border border-border p-2 text-muted-foreground hover:text-primary">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    {isAdmin && (
                    <button onClick={() => remove.mutate(c.id)} className="rounded-full border border-border p-2 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {classes
              .filter((c) => c.id === openRoster)
              .map((c) => (
                <tr key={`${c.id}-roster`} className="border-b border-border/70 bg-secondary/40">
                  <td colSpan={5} className="px-5 py-4">
                    <p className="eyebrow">{classLabel(c)} · Öğrenci Listesi</p>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Input
                        placeholder="Yeni öğrenci ad soyad"
                        value={newStudent[c.id] ?? ""}
                        onChange={(e) =>
                          setNewStudent((m) => ({ ...m, [c.id]: e.target.value }))
                        }
                        className="h-9 w-56"
                      />
                      <button
                        onClick={() => {
                          const name = (newStudent[c.id] ?? "").trim();
                          if (!name) {
                            toast.error("Öğrenci adı giriniz.");
                            return;
                          }
                          saveStudent.mutate(
                            { full_name: name, class_id: c.id, status: "aktif" },
                            {
                              onSuccess: () => {
                                setNewStudent((m) => ({ ...m, [c.id]: "" }));
                                toast.success("Öğrenci sınıfa eklendi.");
                              },
                              onError: () => toast.error("Öğrenci eklenemedi."),
                            },
                          );
                        }}
                        className="inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-[13px] text-primary-foreground"
                      >
                        <Plus className="h-3.5 w-3.5" /> Sınıfa Ekle
                      </button>

                      <select
                        value={addExisting[c.id] ?? ""}
                        onChange={(e) =>
                          setAddExisting((m) => ({ ...m, [c.id]: e.target.value }))
                        }
                        className="h-9 rounded-md border border-input bg-card px-2 text-[13px] text-foreground"
                      >
                        <option value="">Mevcut öğrenciyi ekle…</option>
                        {students
                          .filter((s) => s.class_id !== c.id)
                          .map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.full_name}
                            </option>
                          ))}
                      </select>
                      <button
                        onClick={() => {
                          const id = addExisting[c.id];
                          if (!id) {
                            toast.error("Önce öğrenci seçiniz.");
                            return;
                          }
                          saveStudent.mutate(
                            { id, class_id: c.id },
                            {
                              onSuccess: () => {
                                setAddExisting((m) => ({ ...m, [c.id]: "" }));
                                toast.success("Öğrenci sınıfa eklendi.");
                              },
                              onError: () => toast.error("Öğrenci eklenemedi."),
                            },
                          );
                        }}
                        className="rounded-full border border-border px-4 py-2 text-[13px] text-muted-foreground hover:text-primary"
                      >
                        Ekle
                      </button>
                    </div>

                    <div className="mt-3 space-y-2">

                      {students.filter((s) => s.class_id === c.id).length === 0 && (
                        <p className="text-sm text-muted-foreground">Bu sınıfta öğrenci yok.</p>
                      )}
                      {students
                        .filter((s) => s.class_id === c.id)
                        .map((s) => (
                          <div key={s.id} className="flex flex-wrap items-center gap-2">
                            <span className="min-w-40 text-sm text-foreground">{s.full_name}</span>
                            <select
                              value={moveTo[s.id] ?? ""}
                              onChange={(e) => setMoveTo((m) => ({ ...m, [s.id]: e.target.value }))}
                              className="h-8 rounded-md border border-input bg-card px-2 text-[13px] text-foreground"
                            >
                              <option value="">Başka sınıfa taşı…</option>
                              {classes
                                .filter((x) => x.id !== c.id)
                                .map((x) => (
                                  <option key={x.id} value={x.id}>
                                    {classLabel(x)}
                                  </option>
                                ))}
                            </select>
                            <button
                              onClick={() => {
                                const target = moveTo[s.id];
                                if (!target) {
                                  toast.error("Önce hedef sınıf seçiniz.");
                                  return;
                                }
                                saveStudent.mutate(
                                  { id: s.id, class_id: target },
                                  {
                                    onSuccess: () => toast.success("Öğrenci taşındı."),
                                    onError: () => toast.error("Öğrenci taşınamadı."),
                                  },
                                );
                              }}
                              className="rounded-full border border-border px-3 py-1 text-[12px] text-muted-foreground hover:text-primary"
                            >
                              Taşı
                            </button>
                            <button
                              onClick={() =>
                                saveStudent.mutate(
                                  { id: s.id, class_id: null },
                                  {
                                    onSuccess: () => toast.success("Öğrenci sınıftan çıkarıldı."),
                                    onError: () => toast.error("İşlem başarısız."),
                                  },
                                )
                              }
                              className="rounded-full border border-border px-3 py-1 text-[12px] text-muted-foreground hover:text-destructive"
                            >
                              Sınıftan Çıkar
                            </button>
                          </div>
                        ))}
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
