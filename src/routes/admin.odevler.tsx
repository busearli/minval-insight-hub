import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  SUBMISSION_STATUSES,
  classLabel,
  submissionLabel,
  useClasses,
  useHomework,
  useRemove,
  useSave,
  useStudents,
  useSubmissions,
  useUpsert,
} from "@/lib/admin-api";

export const Route = createFileRoute("/admin/odevler")({
  component: HomeworkPage,
});

function HomeworkPage() {
  const { data: classes = [] } = useClasses();
  const { data: students = [] } = useStudents();
  const { data: homework = [] } = useHomework();
  const { data: submissions = [] } = useSubmissions();
  const save = useSave("homework");
  const remove = useRemove("homework");
  const upsert = useUpsert("homework_submissions", "homework_id,student_id");

  const [form, setForm] = useState({ class_id: "", title: "", description: "", due_date: "" });
  const [selected, setSelected] = useState<string | null>(null);

  const active = homework.find((h) => h.id === selected) ?? null;
  const roster = useMemo(
    () => (active ? students.filter((s) => s.class_id === active.class_id) : []),
    [students, active],
  );
  const subOf = (studentId: string) =>
    submissions.find((s) => s.homework_id === active?.id && s.student_id === studentId);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.class_id || !form.title.trim()) return;
    save.mutate({ ...form, due_date: form.due_date || null }, {
      onSuccess: () => setForm({ class_id: "", title: "", description: "", due_date: "" }),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Ödev Takibi</p>
        <h1 className="mt-2 text-2xl text-foreground">Ödevler & Teslimler</h1>
      </div>

      <form onSubmit={submit} className="card-soft grid gap-3 border-accent/40 p-6 sm:grid-cols-2">
        <select
          value={form.class_id}
          onChange={(e) => setForm((f) => ({ ...f, class_id: e.target.value }))}
          className="h-9 rounded-md border border-input bg-card px-3 text-sm text-foreground"
        >
          <option value="">Sınıf seçiniz</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>{classLabel(c)}</option>
          ))}
        </select>
        <Input
          type="date"
          value={form.due_date}
          onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
        />
        <Input
          placeholder="Ödev başlığı"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          className="sm:col-span-2"
        />
        <Textarea
          placeholder="Açıklama"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          className="sm:col-span-2"
        />
        <button
          type="submit"
          disabled={save.isPending}
          className="inline-flex w-fit items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground disabled:opacity-60"
        >
          <Plus className="h-4 w-4" /> Ödev Ata
        </button>
      </form>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="card-soft divide-y divide-border border-accent/40">
          {homework.length === 0 && (
            <p className="px-5 py-6 text-sm text-muted-foreground">Henüz ödev atanmadı.</p>
          )}
          {homework.map((h) => {
            const c = classes.find((x) => x.id === h.class_id);
            return (
              <div
                key={h.id}
                className={`flex items-start gap-2 px-5 py-4 ${selected === h.id ? "bg-secondary/60" : ""}`}
              >
                <button onClick={() => setSelected(h.id)} className="min-w-0 flex-1 text-left">
                  <div className="truncate text-sm text-foreground">{h.title}</div>
                  <div className="mt-1 truncate text-[12px] text-muted-foreground">
                    {c ? classLabel(c) : "—"} · {h.due_date ?? "tarihsiz"}
                  </div>
                </button>
                <button
                  onClick={() => remove.mutate(h.id)}
                  className="rounded-full border border-border p-1.5 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        <div className="card-soft border-accent/40 p-6">
          {!active ? (
            <p className="text-sm text-muted-foreground">
              Teslim durumlarını görmek için soldan bir ödev seçin.
            </p>
          ) : (
            <>
              <h2 className="text-lg text-foreground">{active.title}</h2>
              {active.description && (
                <p className="mt-2 text-sm text-muted-foreground">{active.description}</p>
              )}
              <div className="mt-6 space-y-5">
                {roster.length === 0 && (
                  <p className="text-sm text-muted-foreground">Bu sınıfta öğrenci yok.</p>
                )}
                {roster.map((s) => {
                  const sub = subOf(s.id);
                  return (
                    <div key={s.id} className="border-t border-border pt-4 first:border-0 first:pt-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="min-w-40 flex-1 text-sm text-foreground">{s.full_name}</span>
                        <div className="flex gap-2">
                          {SUBMISSION_STATUSES.map((st) => (
                            <button
                              key={st}
                              onClick={() =>
                                upsert.mutate({
                                  homework_id: active.id,
                                  student_id: s.id,
                                  status: st,
                                  feedback: sub?.feedback ?? "",
                                })
                              }
                              className={`rounded-full border px-4 py-1.5 text-[12px] ${
                                sub?.status === st
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border text-muted-foreground hover:border-accent"
                              }`}
                            >
                              {submissionLabel[st]}
                            </button>
                          ))}
                        </div>
                      </div>
                      <Textarea
                        placeholder="Eğitmen geri bildirimi"
                        defaultValue={sub?.feedback ?? ""}
                        onBlur={(e) =>
                          upsert.mutate({
                            homework_id: active.id,
                            student_id: s.id,
                            status: sub?.status ?? "edilmedi",
                            feedback: e.target.value,
                          })
                        }
                        className="mt-3"
                      />
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
