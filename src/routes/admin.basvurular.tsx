import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, RefreshCw, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import {
  classLabel,
  useClasses,
  useProfiles,
  useSave,
  useSetProfileStatus,
  useStudents,
} from "@/lib/admin-api";
import {
  applicationLabel,
  useApplications,
  useDeleteApplication,
  useUpdateApplication,
} from "@/lib/site-api";
import { useMyRoles } from "@/lib/rbac";


export const Route = createFileRoute("/admin/basvurular")({
  component: ApplicationsPage,
});

function ApplicationsPage() {
  const { data: apps = [], isLoading, refetch, isFetching } = useApplications();
  const { data: allClasses = [] } = useClasses();
  const { isAdmin, myClassIds } = useMyRoles();
  const classes = isAdmin ? allClasses : allClasses.filter((c) => myClassIds.includes(c.id));
  const { refetch: refetchStudents } = useStudents();
  const update = useUpdateApplication();
  const remove = useDeleteApplication();
  const saveStudent = useSave("students");
  const [assign, setAssign] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState("bekliyor");

  const visible = isAdmin
    ? apps
    : apps.filter(
        (a) =>
          (a.requested_class_id && myClassIds.includes(a.requested_class_id)) ||
          (a.assigned_class_id && myClassIds.includes(a.assigned_class_id)),
      );
  const list = filter === "all" ? visible : visible.filter((a) => a.status === filter);
  const classNameOf = (id: string | null) => {
    const c = allClasses.find((x) => x.id === id);
    return c ? classLabel(c) : "";
  };


  const approve = async (
    id: string,
    name: string,
    phone: string,
    notes: string,
    requestedClassId?: string | null,
  ) => {
    const classId = assign[id] || requestedClassId || "";

    if (!classId) {
      toast.error("Önce bir sınıf seçiniz.");
      return;
    }
    try {
      await saveStudent.mutateAsync({
        full_name: name,
        phone,
        class_id: classId,
        status: "aktif",
        notes,
      });
      await update.mutateAsync({ id, status: "onaylandi", assigned_class_id: classId });
      void refetchStudents();
      toast.success("Başvuru onaylandı ve öğrenci sınıfa eklendi.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "İşlem başarısız");
    }
  };

  return (
    <div className="space-y-6">
      <PendingMembers />

      <div>
        <p className="eyebrow">Başvuru Yönetimi</p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="mt-2 text-2xl text-foreground">Onay Bekleyen Ön Kayıtlar</h1>
          <button
            onClick={() => void refetch()}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-[12px] text-muted-foreground hover:text-primary"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} /> Yenile
          </button>
        </div>
      </div>


      <div className="flex flex-wrap gap-2">
        {[
          ["bekliyor", "Bekleyenler"],
          ["onaylandi", "Onaylananlar"],
          ["reddedildi", "Reddedilenler"],
          ["all", "Tümü"],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setFilter(id!)}
            className={`rounded-full border px-4 py-2 text-[12px] transition-colors ${
              filter === id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:text-primary"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Yükleniyor…</p>}
      {!isLoading && list.length === 0 && (
        <p className="text-sm text-muted-foreground">Bu listede başvuru bulunmuyor.</p>
      )}

      <div className="grid gap-4">
        {list.map((a) => (
          <div key={a.id} className="card-soft border-accent/40 p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-lg text-foreground">{a.full_name}</h3>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  {a.email || "E-posta yok"} · {a.phone} ·{" "}
                  {a.program_label || a.program_id} · {a.age_level || "Düzey belirtilmedi"}
                </p>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  Başvuru tarihi: {a.created_at.slice(0, 10)}
                  {classNameOf(a.requested_class_id) &&
                    ` · Talep edilen sınıf: ${classNameOf(a.requested_class_id)}`}
                </p>
              </div>
              <span className="rounded-full bg-secondary px-3 py-1 text-[11px] text-secondary-foreground">
                {applicationLabel[a.status] ?? a.status}
              </span>
            </div>

            {a.notes && <p className="mt-3 text-sm text-muted-foreground">{a.notes}</p>}

            {a.status === "bekliyor" && (
              <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border pt-5">
                <select
                  value={assign[a.id] ?? a.requested_class_id ?? ""}
                  onChange={(e) => setAssign((s) => ({ ...s, [a.id]: e.target.value }))}

                  className="h-9 min-w-56 rounded-md border border-input bg-card px-3 text-sm text-foreground"
                >
                  <option value="">Sınıf seçiniz</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {classLabel(c)}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => void approve(a.id, a.full_name, a.phone, a.notes)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[12px] text-primary-foreground"
                >
                  <Check className="h-3.5 w-3.5" /> Sınıfa Ata ve Onayla
                </button>
                <button
                  onClick={() => update.mutate({ id: a.id, status: "reddedildi" })}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-[12px] text-muted-foreground hover:text-absent"
                >
                  <X className="h-3.5 w-3.5" /> Reddet
                </button>
                <button
                  onClick={() => remove.mutate(a.id)}
                  className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-[12px] text-muted-foreground hover:text-absent"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Sil
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function PendingMembers() {
  const { data: profiles = [], isLoading } = useProfiles();
  const { data: classes = [] } = useClasses();
  const { data: students = [] } = useStudents();
  const saveStudent = useSave("students");
  const setStatus = useSetProfileStatus();
  const [pick, setPick] = useState<Record<string, string>>({});

  const linked = new Set(students.map((s) => s.user_id).filter(Boolean) as string[]);
  const pending = profiles.filter(
    (p) => p.status === "pending_assignment" && !linked.has(p.user_id),
  );

  const addToClass = async (p: (typeof profiles)[number]) => {
    const classId = pick[p.user_id];
    if (!classId) {
      toast.error("Önce bir sınıf seçiniz.");
      return;
    }
    try {
      await saveStudent.mutateAsync({
        full_name: p.name || "İsimsiz",
        phone: p.phone ?? "",
        class_id: classId,
        user_id: p.user_id,
        status: "aktif",
        notes: p.notes ?? "",
      });
      await setStatus.mutateAsync({ user_id: p.user_id, status: "active" });
      toast.success("Üye sınıfa eklendi ve paneli aktifleşti.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "İşlem başarısız");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="eyebrow">Sınıf Atama</p>
        <h1 className="mt-2 text-2xl text-foreground">Sınıf Bekleyen Üyeler</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Siteden kendi hesabını oluşturan ve henüz sınıfa atanmamış kursiyerler.
        </p>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Yükleniyor…</p>}
      {!isLoading && pending.length === 0 && (
        <p className="text-sm text-muted-foreground">Sınıf bekleyen üye bulunmuyor.</p>
      )}

      <div className="grid gap-4">
        {pending.map((p) => (
          <div key={p.user_id} className="card-soft border-accent/40 p-6">
            <h3 className="text-lg text-foreground">{p.name || "İsimsiz üye"}</h3>
            <p className="mt-1 text-[13px] text-muted-foreground">
              {p.phone || "Telefon yok"} · {p.program_choice || "Program seçilmedi"} ·{" "}
              {p.age_level || "Düzey belirtilmedi"}
            </p>
            {p.notes && <p className="mt-3 text-sm text-muted-foreground">{p.notes}</p>}
            <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border pt-5">
              <select
                value={pick[p.user_id] ?? ""}
                onChange={(e) => setPick((s) => ({ ...s, [p.user_id]: e.target.value }))}
                className="h-9 min-w-56 rounded-md border border-input bg-card px-3 text-sm text-foreground"
              >
                <option value="">Sınıf seçiniz</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {classLabel(c)}
                  </option>
                ))}
              </select>
              <button
                onClick={() => void addToClass(p)}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[12px] text-primary-foreground"
              >
                <Check className="h-3.5 w-3.5" /> Sınıfa Ekle
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
