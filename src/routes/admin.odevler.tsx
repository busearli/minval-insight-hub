import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BookOpen, CheckCircle2, Clock, Plus, Trash2 } from "lucide-react";

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
import { useMyRoles } from "@/lib/rbac";

export const Route = createFileRoute("/admin/odevler")({
  component: HomeworkPage,
});

/** Hazır geri bildirim şablonları */
const FEEDBACK_TEMPLATES = [
  "Tebrikler, ödev eksiksiz teslim edildi. 🌿",
  "Güzel bir çalışma; ifadeleri biraz daha derinleştirebilirsin.",
  "Eksik bölümler var, lütfen tamamlayıp tekrar teslim et.",
  "Geç teslim edildi; bir sonraki hafta zamanında bekliyorum.",
  "Okuma tamamlanmamış görünüyor, kalan sayfaları bitirelim.",
];

const TASK_TYPES = [
  { value: "onay", label: "Yapıldı / Yapılmadı" },
  { value: "sayfa", label: "Okuma (sayfa sayısı)" },
] as const;

function taskTypeLabel(v: string) {
  return TASK_TYPES.find((t) => t.value === v)?.label ?? "Yapıldı / Yapılmadı";
}

function HomeworkPage() {
  const { isAdmin, myClassIds } = useMyRoles();
  const { data: allClasses = [] } = useClasses();
  const { data: students = [] } = useStudents();
  const { data: homework = [] } = useHomework();
  const { data: submissions = [] } = useSubmissions();
  const save = useSave("homework");
  const remove = useRemove("homework");
  const upsert = useUpsert("homework_submissions", "homework_id,student_id");

  const classes = useMemo(
    () => (isAdmin ? allClasses : allClasses.filter((c) => myClassIds.includes(c.id))),
    [allClasses, isAdmin, myClassIds],
  );
  const classIds = useMemo(() => new Set(classes.map((c) => c.id)), [classes]);

  const emptyForm = {
    class_id: "",
    title: "",
    description: "",
    due_date: "",
    task_type: "onay",
    target_pages: "",
  };
  const [form, setForm] = useState(emptyForm);
  const [selected, setSelected] = useState<string | null>(null);

  const visibleHomework = useMemo(
    () => homework.filter((h) => classIds.has(h.class_id)),
    [homework, classIds],
  );
  const active = visibleHomework.find((h) => h.id === selected) ?? null;
  const roster = useMemo(
    () => (active ? students.filter((s) => s.class_id === active.class_id) : []),
    [students, active],
  );
  const subOf = (studentId: string) =>
    submissions.find((s) => s.homework_id === active?.id && s.student_id === studentId);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.class_id || !form.title.trim()) return;
    save.mutate(
      {
        class_id: form.class_id,
        title: form.title,
        description: form.description,
        due_date: form.due_date || null,
        task_type: form.task_type,
        target_pages: form.task_type === "sayfa" ? Number(form.target_pages || 0) : 0,
      },
      { onSuccess: () => setForm(emptyForm) },
    );
  };

  /** Bir öğrencinin teslim kaydını güncelle (mevcut alanları koruyarak) */
  const patchSub = (studentId: string, patch: Record<string, unknown>) => {
    if (!active) return;
    const sub = subOf(studentId);
    upsert.mutate({
      homework_id: active.id,
      student_id: studentId,
      status: sub?.status ?? "edilmedi",
      feedback: sub?.feedback ?? "",
      pages_read: sub?.pages_read ?? 0,
      ...patch,
    });
  };

  const stats = useMemo(() => {
    if (!active) return null;
    const rows = roster.map((s) => subOf(s.id));
    const done = rows.filter((r) => r?.status === "edildi").length;
    const late = rows.filter((r) => r?.status === "gec").length;
    return { total: roster.length, done, late, pending: roster.length - done - late };
  }, [active, roster, submissions]);

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
        <select
          value={form.task_type}
          onChange={(e) => setForm((f) => ({ ...f, task_type: e.target.value }))}
          className="h-9 rounded-md border border-input bg-card px-3 text-sm text-foreground"
        >
          {TASK_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        {form.task_type === "sayfa" ? (
          <Input
            type="number"
            min={0}
            placeholder="Hedef sayfa sayısı"
            value={form.target_pages}
            onChange={(e) => setForm((f) => ({ ...f, target_pages: e.target.value }))}
          />
        ) : (
          <div className="hidden sm:block" />
        )}
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
          {visibleHomework.length === 0 && (
            <p className="px-5 py-6 text-sm text-muted-foreground">Henüz ödev atanmadı.</p>
          )}
          {visibleHomework.map((h) => {
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
                  <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
                    {h.task_type === "sayfa" ? <BookOpen className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                    {h.task_type === "sayfa"
                      ? `${h.target_pages || "?"} sayfa okuma`
                      : "Yapıldı / Yapılmadı"}
                  </span>
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
              <p className="mt-1 text-[12px] text-muted-foreground">
                {taskTypeLabel(active.task_type)}
                {active.task_type === "sayfa" && active.target_pages
                  ? ` · Hedef: ${active.target_pages} sayfa`
                  : ""}
              </p>
              {active.description && (
                <p className="mt-2 text-sm text-muted-foreground">{active.description}</p>
              )}

              {stats && (
                <div className="mt-4 flex flex-wrap gap-2 text-[12px]">
                  <span className="rounded-full bg-secondary px-3 py-1 text-foreground">
                    Toplam {stats.total}
                  </span>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                    Teslim {stats.done}
                  </span>
                  <span className="rounded-full bg-accent/20 px-3 py-1 text-foreground">
                    Geç {stats.late}
                  </span>
                  <span className="rounded-full border border-border px-3 py-1 text-muted-foreground">
                    Bekleyen {stats.pending}
                  </span>
                </div>
              )}

              <div className="mt-6 space-y-5">
                {roster.length === 0 && (
                  <p className="text-sm text-muted-foreground">Bu sınıfta öğrenci yok.</p>
                )}
                {roster.map((s) => {
                  const sub = subOf(s.id);
                  const pct =
                    active.task_type === "sayfa" && active.target_pages
                      ? Math.min(100, Math.round(((sub?.pages_read ?? 0) / active.target_pages) * 100))
                      : null;
                  return (
                    <div key={s.id} className="border-t border-border pt-4 first:border-0 first:pt-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="min-w-40 flex-1 text-sm text-foreground">{s.full_name}</span>
                        <div className="flex flex-wrap gap-2">
                          {SUBMISSION_STATUSES.map((st) => (
                            <button
                              key={st}
                              onClick={() => patchSub(s.id, { status: st })}
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

                      {sub?.submitted_at && (
                        <p className="mt-2 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(sub.submitted_at).toLocaleString("tr-TR")} tarihinde teslim edildi
                        </p>
                      )}

                      {/* Öğrencinin teslim notu (salt okunur) */}
                      <div className="mt-3 rounded-md border border-border bg-secondary/40 p-3">
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                          Öğrenci teslim notu
                        </p>
                        <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">
                          {sub?.submission_text?.trim()
                            ? sub.submission_text
                            : "Öğrenci henüz bir not göndermedi."}
                        </p>
                      </div>

                      {active.task_type === "sayfa" && (
                        <div className="mt-3 flex flex-wrap items-center gap-3">
                          <label className="text-[12px] text-muted-foreground">Okunan sayfa</label>
                          <Input
                            type="number"
                            min={0}
                            className="h-8 w-24"
                            defaultValue={sub?.pages_read ?? 0}
                            onBlur={(e) =>
                              patchSub(s.id, { pages_read: Number(e.target.value || 0) })
                            }
                          />
                          {active.target_pages > 0 && (
                            <>
                              <div className="h-2 min-w-32 flex-1 overflow-hidden rounded-full bg-secondary">
                                <div
                                  className="h-full rounded-full bg-primary"
                                  style={{ width: `${pct ?? 0}%` }}
                                />
                              </div>
                              <span className="text-[12px] text-muted-foreground">
                                {sub?.pages_read ?? 0}/{active.target_pages}
                              </span>
                            </>
                          )}
                        </div>
                      )}

                      <div className="mt-3 flex flex-wrap gap-2">
                        {FEEDBACK_TEMPLATES.map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => patchSub(s.id, { feedback: t })}
                            className="rounded-full border border-border px-3 py-1 text-[11px] text-muted-foreground hover:border-accent hover:text-foreground"
                          >
                            {t.length > 32 ? `${t.slice(0, 32)}…` : t}
                          </button>
                        ))}
                      </div>

                      <Textarea
                        placeholder="Eğitmen geri bildirimi"
                        key={`${s.id}-${sub?.feedback ?? ""}`}
                        defaultValue={sub?.feedback ?? ""}
                        onBlur={(e) => patchSub(s.id, { feedback: e.target.value })}
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
