import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CalendarDays, GripVertical, LayoutGrid, Plus, Save, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import {
  useDeleteProgram,
  useDeleteTimetableEntry,
  usePrograms,
  useSaveProgram,
  useSaveTimetableEntry,
  useTimetable,
  type ProgramRow,
  type TimetableRow,
} from "@/lib/programs-api";
import { categoryTabs, weekDays } from "@/lib/minval-programs";

export const Route = createFileRoute("/admin/programlar")({
  head: () => ({
    meta: [
      { title: "Program & Takvim Yönetimi — Minval Akademi" },
      {
        name: "description",
        content: "Ana sayfadaki programları ve haftalık ders takvimini yönetin.",
      },
      { property: "og:title", content: "Program & Takvim Yönetimi — Minval Akademi" },
      { property: "og:description", content: "Programlar ve haftalık takvim düzenleme paneli." },
      { name: "robots", content: "noindex" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProgramsAdmin,
});

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground outline-none focus:border-primary";
const labelCls = "text-[11px] tracking-[0.12em] text-muted-foreground uppercase";

function Field({
  label,
  value,
  onChange,
  multiline,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block space-y-1.5">
      <span className={labelCls}>{label}</span>
      {multiline ? (
        <textarea
          rows={3}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={inputCls}
        />
      ) : (
        <input
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={inputCls}
        />
      )}
    </label>
  );
}

function ListEditor({
  label,
  items,
  onChange,
  placeholder,
}: {
  label: string;
  items: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <span className={labelCls}>{label}</span>
      {items.map((it, i) => (
        <div key={i} className="flex gap-2">
          <input
            value={it}
            placeholder={placeholder}
            onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))}
            className={inputCls}
          />
          <button
            type="button"
            onClick={() => onChange(items.filter((_, j) => j !== i))}
            className="shrink-0 rounded-lg border border-border px-2 text-muted-foreground hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, ""])}
        className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[12px] text-muted-foreground hover:text-primary"
      >
        <Plus className="h-3.5 w-3.5" /> Satır ekle
      </button>
    </div>
  );
}

type GroupItem = { label: string; items: string[] };
type CurriculumItem = { week: string; topic: string };

function emptyProgram(): ProgramRow {
  return {
    id: "",
    emoji: "📘",
    title: "",
    subtitle: "",
    category: "risale",
    category_label: "",
    audience: "",
    fee: "Ücretsiz",
    paid: false,
    soon: false,
    quote: "",
    description: "",
    instructor: "",
    schedule: "",
    badges_json: [],
    groups_json: [],
    books_json: [],
    curriculum_json: [],
    is_published: true,
    sort_order: 99,
  };
}

function asList<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

function ProgramEditor({
  initial,
  isNew,
  onClose,
}: {
  initial: ProgramRow;
  isNew: boolean;
  onClose: () => void;
}) {
  const [row, setRow] = useState<ProgramRow>(initial);
  const save = useSaveProgram();
  const set = <K extends keyof ProgramRow>(k: K, v: ProgramRow[K]) =>
    setRow((r) => ({ ...r, [k]: v }));

  const groups = asList<GroupItem>(row.groups_json);
  const curriculum = asList<CurriculumItem>(row.curriculum_json);

  const submit = async () => {
    const id = (row.id || row.title)
      .toLowerCase()
      .replace(/[çğıöşü]/g, (c) => ({ ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u" })[c] ?? c)
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    if (!id || !row.title.trim()) {
      toast.error("Program adı zorunludur.");
      return;
    }
    try {
      await save.mutateAsync({ ...row, id });
      toast.success(isNew ? "Program eklendi." : "Program güncellendi.");
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Kaydedilemedi.");
    }
  };

  return (
    <div className="card-soft space-y-6 border-primary/30 p-6">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg text-foreground">{isNew ? "Yeni Program" : `Düzenle: ${row.title}`}</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Emoji" value={row.emoji} onChange={(v) => set("emoji", v)} />
        <Field label="Program Adı" value={row.title} onChange={(v) => set("title", v)} />
        <Field label="Alt Başlık" value={row.subtitle} onChange={(v) => set("subtitle", v)} />
        <label className="block space-y-1.5">
          <span className={labelCls}>Kategori</span>
          <select
            value={row.category}
            onChange={(e) => {
              const c = e.target.value;
              const found = categoryTabs.find((t) => t.id === c);
              setRow((r) => ({ ...r, category: c, category_label: found?.label ?? r.category_label }));
            }}
            className={inputCls}
          >
            {categoryTabs
              .filter((c) => c.id !== "all")
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            <option value="sanat">Minval Sanat</option>
          </select>
        </label>
        <Field
          label="Kategori Etiketi (kartta görünür)"
          value={row.category_label}
          onChange={(v) => set("category_label", v)}
        />
        <Field label="Kimlere Açık" value={row.audience} onChange={(v) => set("audience", v)} />
        <Field label="Ücret Bilgisi" value={row.fee} onChange={(v) => set("fee", v)} />
        <Field label="Eğitmen" value={row.instructor} onChange={(v) => set("instructor", v)} />
        <Field label="Ders Zamanı Özeti" value={row.schedule} onChange={(v) => set("schedule", v)} />
        <Field
          label="Sıra No"
          value={String(row.sort_order)}
          onChange={(v) => set("sort_order", Number(v) || 0)}
        />
      </div>

      <Field label="Alıntı" value={row.quote} onChange={(v) => set("quote", v)} multiline />
      <Field label="Açıklama" value={row.description} onChange={(v) => set("description", v)} multiline />

      <div className="flex flex-wrap gap-5">
        {(
          [
            ["is_published", "Sitede yayında"],
            ["paid", "Ücretli program"],
            ["soon", "Yakında etiketi"],
          ] as const
        ).map(([k, l]) => (
          <label key={k} className="flex items-center gap-2 text-[13px] text-foreground">
            <input
              type="checkbox"
              checked={Boolean(row[k])}
              onChange={(e) => set(k, e.target.checked as never)}
              className="h-4 w-4 accent-[var(--color-primary)]"
            />
            {l}
          </label>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ListEditor
          label="Rozetler"
          items={asList<string>(row.badges_json)}
          onChange={(v) => set("badges_json", v)}
          placeholder="Ör. Ücretsiz"
        />
        <ListEditor
          label="Kaynak Kitaplar"
          items={asList<string>(row.books_json)}
          onChange={(v) => set("books_json", v)}
          placeholder="Ör. Sözler"
        />
      </div>

      <div className="space-y-3">
        <span className={labelCls}>Gruplar</span>
        {groups.map((g, i) => (
          <div key={i} className="rounded-xl border border-border p-3">
            <div className="flex gap-2">
              <input
                value={g.label}
                placeholder="Grup başlığı (Ör. Başlangıç Düzey)"
                onChange={(e) =>
                  set(
                    "groups_json",
                    groups.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)),
                  )
                }
                className={inputCls}
              />
              <button
                type="button"
                onClick={() => set("groups_json", groups.filter((_, j) => j !== i))}
                className="shrink-0 rounded-lg border border-border px-2 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <input
              value={g.items.join(", ")}
              placeholder="Alt gruplar, virgülle ayırın: Grup 1, Grup 2"
              onChange={(e) =>
                set(
                  "groups_json",
                  groups.map((x, j) =>
                    j === i
                      ? { ...x, items: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) }
                      : x,
                  ),
                )
              }
              className={`${inputCls} mt-2`}
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() => set("groups_json", [...groups, { label: "", items: [] }])}
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[12px] text-muted-foreground hover:text-primary"
        >
          <Plus className="h-3.5 w-3.5" /> Grup ekle
        </button>
      </div>

      <div className="space-y-3">
        <span className={labelCls}>Müfredat</span>
        {curriculum.map((c, i) => (
          <div key={i} className="flex flex-col gap-2 sm:flex-row">
            <input
              value={c.week}
              placeholder="1–4. Hafta"
              onChange={(e) =>
                set(
                  "curriculum_json",
                  curriculum.map((x, j) => (j === i ? { ...x, week: e.target.value } : x)),
                )
              }
              className={`${inputCls} sm:max-w-[180px]`}
            />
            <input
              value={c.topic}
              placeholder="Konu"
              onChange={(e) =>
                set(
                  "curriculum_json",
                  curriculum.map((x, j) => (j === i ? { ...x, topic: e.target.value } : x)),
                )
              }
              className={inputCls}
            />
            <button
              type="button"
              onClick={() => set("curriculum_json", curriculum.filter((_, j) => j !== i))}
              className="shrink-0 rounded-lg border border-border px-2 py-2 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => set("curriculum_json", [...curriculum, { week: "", topic: "" }])}
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[12px] text-muted-foreground hover:text-primary"
        >
          <Plus className="h-3.5 w-3.5" /> Hafta ekle
        </button>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => void submit()}
          disabled={save.isPending}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-[13px] text-primary-foreground disabled:opacity-60"
        >
          <Save className="h-4 w-4" /> Kaydet
        </button>
        <button
          onClick={onClose}
          className="rounded-full border border-border px-5 py-2.5 text-[13px] text-muted-foreground"
        >
          Vazgeç
        </button>
      </div>
    </div>
  );
}

function TimetableTab({ programs }: { programs: ProgramRow[] }) {
  const { rows } = useTimetable();
  const save = useSaveTimetableEntry();
  const remove = useDeleteTimetableEntry();
  const [draft, setDraft] = useState<Partial<TimetableRow>>({
    day: "Pazartesi",
    time: "10:30",
    program_id: programs[0]?.id ?? null,
    group_label: "",
  });

  const add = async () => {
    if (!draft.program_id) {
      toast.error("Önce bir program seçin.");
      return;
    }
    try {
      await save.mutateAsync({ ...draft, sort_order: rows.length + 1 });
      toast.success("Ders saati eklendi.");
      setDraft({ ...draft, group_label: "" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Eklenemedi.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="card-soft space-y-4 border-accent/40 p-5">
        <h3 className="text-[15px] text-foreground">Yeni ders saati</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <select
            value={draft.day}
            onChange={(e) => setDraft({ ...draft, day: e.target.value })}
            className={inputCls}
          >
            {weekDays.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <input
            type="time"
            value={draft.time ?? ""}
            onChange={(e) => setDraft({ ...draft, time: e.target.value })}
            className={inputCls}
          />
          <select
            value={draft.program_id ?? ""}
            onChange={(e) => setDraft({ ...draft, program_id: e.target.value })}
            className={inputCls}
          >
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.emoji} {p.title}
              </option>
            ))}
          </select>
          <input
            value={draft.group_label ?? ""}
            placeholder="Grup adı"
            onChange={(e) => setDraft({ ...draft, group_label: e.target.value })}
            className={inputCls}
          />
          <button
            onClick={() => void add()}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-[13px] text-primary-foreground"
          >
            <Plus className="h-4 w-4" /> Ekle
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {weekDays.map((day) => {
          const items = rows
            .filter((r) => r.day === day)
            .sort((a, b) => a.time.localeCompare(b.time));
          return (
            <div key={day} className="card-soft border-accent/40 p-4">
              <div className="flex items-baseline justify-between">
                <h4 className="text-[15px] text-foreground">{day}</h4>
                <span className="text-[11px] text-muted-foreground">{items.length} ders</span>
              </div>
              <div className="mt-3 space-y-2">
                {items.length === 0 && (
                  <p className="text-[12px] text-muted-foreground">Ders yok.</p>
                )}
                {items.map((r) => {
                  const p = programs.find((x) => x.id === r.program_id);
                  return (
                    <div key={r.id} className="rounded-lg border border-border p-2.5 text-[12px]">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <span className="font-medium text-foreground">
                          {p?.emoji} {p?.title ?? "—"}
                        </span>
                        <input
                          type="time"
                          value={r.time}
                          onChange={(e) =>
                            void save.mutateAsync({ id: r.id, time: e.target.value })
                          }
                          className="ml-auto w-[92px] rounded border border-border bg-background px-1.5 py-1 tabular-nums"
                        />
                      </div>
                      <div className="mt-2 flex gap-2">
                        <input
                          defaultValue={r.group_label}
                          onBlur={(e) => {
                            if (e.target.value !== r.group_label)
                              void save.mutateAsync({ id: r.id, group_label: e.target.value });
                          }}
                          className="w-full rounded border border-border bg-background px-2 py-1"
                        />
                        <button
                          onClick={() => void remove.mutateAsync(r.id)}
                          className="shrink-0 rounded border border-border px-1.5 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProgramsAdmin() {
  const { rows, isLoading } = usePrograms();
  const remove = useDeleteProgram();
  const [tab, setTab] = useState<"programlar" | "takvim">("programlar");
  const [editing, setEditing] = useState<{ row: ProgramRow; isNew: boolean } | null>(null);

  const sorted = useMemo(() => [...rows].sort((a, b) => a.sort_order - b.sort_order), [rows]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl text-foreground">Program & Takvim Yönetimi</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Buradaki değişiklikler <strong>Programlar</strong> ve <strong>Haftalık Program</strong>{" "}
            sayfalarına anında yansır.
          </p>
        </div>
        {tab === "programlar" && !editing && (
          <button
            onClick={() => setEditing({ row: emptyProgram(), isNew: true })}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-[13px] text-primary-foreground"
          >
            <Plus className="h-4 w-4" /> Program Ekle
          </button>
        )}
      </header>

      <div className="flex gap-2">
        {(
          [
            ["programlar", "Programlar", LayoutGrid],
            ["takvim", "Haftalık Program", CalendarDays],
          ] as const
        ).map(([id, label, Icon]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] transition-colors ${
              tab === id
                ? "bg-primary text-primary-foreground"
                : "border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      {tab === "programlar" ? (
        editing ? (
          <ProgramEditor
            key={editing.row.id || "new"}
            initial={editing.row}
            isNew={editing.isNew}
            onClose={() => setEditing(null)}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {isLoading && <p className="text-sm text-muted-foreground">Yükleniyor…</p>}
            {sorted.map((p) => (
              <article key={p.id} className="card-soft flex flex-col border-accent/40 p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <span className="text-xl leading-none">{p.emoji}</span>
                    <div>
                      <h3 className="text-[16px] text-foreground">{p.title}</h3>
                      <p className="text-[12px] text-muted-foreground">{p.subtitle}</p>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] ${
                      p.is_published
                        ? "bg-present/15 text-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {p.is_published ? "Yayında" : "Gizli"}
                  </span>
                </div>
                <p className="mt-3 line-clamp-3 text-[13px] text-muted-foreground">{p.description}</p>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => setEditing({ row: p, isNew: false })}
                    className="rounded-full border border-border px-4 py-2 text-[12px] text-foreground hover:border-primary hover:text-primary"
                  >
                    Düzenle
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`"${p.title}" programı silinsin mi?`))
                        void remove
                          .mutateAsync(p.id)
                          .then(() => toast.success("Program silindi."))
                          .catch((e: Error) => toast.error(e.message));
                    }}
                    className="ml-auto rounded-full border border-border px-3 py-2 text-[12px] text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )
      ) : (
        <TimetableTab programs={sorted} />
      )}
    </div>
  );
}
