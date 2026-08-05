import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { HatimBoard } from "@/components/HatimBoard";
import { Input } from "@/components/ui/input";
import { useHatims, useRemoveHatim, useSaveHatim } from "@/lib/hatim-api";
import { useAuth } from "@/hooks/use-auth";
import {
  CUZ_STATUSES,
  classLabel,
  cuzLabel,
  useClasses,
  useCuzRecords,
  useSaveCuz,
  useStudents,
} from "@/lib/admin-api";
import { useMyRoles } from "@/lib/rbac";
import { useSiteSettings } from "@/lib/site-api";

export const Route = createFileRoute("/admin/cuz")({
  component: CuzPage,
});

const CUZ_NUMBERS = Array.from({ length: 30 }, (_, i) => i + 1);

function CuzPage() {
  const { settings } = useSiteSettings();
  const { user, profile } = useAuth();
  const { isAdmin, myClassIds } = useMyRoles();
  const { data: classes = [] } = useClasses();
  const { data: students = [] } = useStudents();
  const { data: records = [] } = useCuzRecords();
  const save = useSaveCuz();
  const { data: hatims = [] } = useHatims();
  const saveHatim = useSaveHatim();
  const removeHatim = useRemoveHatim();
  const [hatimTitle, setHatimTitle] = useState("");

  const visibleClasses = useMemo(
    () => (isAdmin ? classes : classes.filter((c) => myClassIds.includes(c.id))),
    [classes, isAdmin, myClassIds],
  );

  const [classId, setClassId] = useState("");
  const [studentId, setStudentId] = useState("");

  if (!settings.cuz_tracking_enabled) {
    return (
      <p className="text-sm text-muted-foreground">
        Cüz takip modülü kapalı. Ana Yönetici “Genel Bakış” sekmesinden aktifleştirebilir.
      </p>
    );
  }

  const roster = students.filter((s) => (classId ? s.class_id === classId : false));
  const student = students.find((s) => s.id === studentId);
  const recOf = (no: number) => records.find((r) => r.student_id === studentId && r.cuz_no === no);

  const update = (no: number, patch: { status?: string; pages_memorized?: number; feedback?: string }) => {
    if (!studentId) return;
    const current = recOf(no);
    save.mutate(
      {
        student_id: studentId,
        cuz_no: no,
        status: patch.status ?? current?.status ?? "baslanmadi",
        pages_memorized: patch.pages_memorized ?? current?.pages_memorized ?? 0,
        feedback: patch.feedback ?? current?.feedback ?? "",
      },
      { onError: (e) => toast.error(e instanceof Error ? e.message : "Kaydedilemedi") },
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Modül</p>
        <h1 className="mt-2 text-2xl text-foreground">Cüz & Ezber Takibi</h1>
      </div>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg text-foreground">Hatim Organizasyonu</h2>
          {isAdmin && (
            <div className="flex gap-2">
              <Input
                placeholder="Hatim adı (ör. Ramazan Hatmi)"
                value={hatimTitle}
                onChange={(e) => setHatimTitle(e.target.value)}
                className="h-9 w-56"
              />
              <button
                onClick={() => {
                  if (!hatimTitle.trim()) {
                    toast.error("Hatim adı giriniz.");
                    return;
                  }
                  saveHatim.mutate(
                    { title: hatimTitle.trim(), created_by: user?.id ?? null },
                    {
                      onSuccess: () => {
                        setHatimTitle("");
                        toast.success("Hatim açıldı.");
                      },
                      onError: (e) =>
                        toast.error(e instanceof Error ? e.message : "Hatim açılamadı"),
                    },
                  );
                }}
                className="rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground"
              >
                Hatim Aç
              </button>
            </div>
          )}
        </div>

        {isAdmin && hatims.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {hatims.map((h) => (
              <div
                key={h.id}
                className="flex items-center gap-2 rounded-full border border-border px-3 py-1 text-[12px] text-muted-foreground"
              >
                <span className="text-foreground">{h.title}</span>
                <button
                  onClick={() => saveHatim.mutate({ id: h.id, is_open: !h.is_open })}
                  className="hover:text-primary"
                >
                  {h.is_open ? "Kapat" : "Yeniden Aç"}
                </button>
                <button
                  onClick={() => removeHatim.mutate(h.id)}
                  className="hover:text-destructive"
                >
                  Sil
                </button>
              </div>
            ))}
          </div>
        )}

        <HatimBoard userId={user?.id} participantName={profile?.name ?? ""} manage />
      </section>


      <div className="flex flex-wrap gap-2">
        <select
          value={classId}
          onChange={(e) => {
            setClassId(e.target.value);
            setStudentId("");
          }}
          className="h-9 min-w-56 rounded-md border border-input bg-card px-3 text-sm text-foreground"
        >
          <option value="">Sınıf seçiniz</option>
          {visibleClasses.map((c) => (
            <option key={c.id} value={c.id}>
              {classLabel(c)}
            </option>
          ))}
        </select>
        <select
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          className="h-9 min-w-56 rounded-md border border-input bg-card px-3 text-sm text-foreground"
        >
          <option value="">Öğrenci seçiniz</option>
          {roster.map((s) => (
            <option key={s.id} value={s.id}>
              {s.full_name}
            </option>
          ))}
        </select>
      </div>

      {!student && (
        <p className="text-sm text-muted-foreground">Takip için sınıf ve öğrenci seçiniz.</p>
      )}

      {student && (
        <div className="card-soft space-y-4 border-accent/40 p-6">
          <h2 className="text-lg text-foreground">{student.full_name}</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="text-left text-[12px] text-muted-foreground">
                  <th className="py-2">Cüz</th>
                  <th className="py-2">Durum</th>
                  <th className="py-2">Ezberlenen Sayfa</th>
                  <th className="py-2">Hoca Notu</th>
                </tr>
              </thead>
              <tbody>
                {CUZ_NUMBERS.map((no) => {
                  const rec = recOf(no);
                  return (
                    <tr key={no} className="border-t border-border">
                      <td className="py-2 text-foreground">{no}. Cüz</td>
                      <td className="py-2">
                        <select
                          value={rec?.status ?? "baslanmadi"}
                          onChange={(e) => update(no, { status: e.target.value })}
                          className="h-8 rounded-md border border-input bg-card px-2 text-[13px] text-foreground"
                        >
                          {CUZ_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {cuzLabel[s]}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2">
                        <input
                          type="number"
                          min={0}
                          max={20}
                          defaultValue={rec?.pages_memorized ?? 0}
                          onBlur={(e) => update(no, { pages_memorized: Number(e.target.value) })}
                          className="h-8 w-20 rounded-md border border-input bg-card px-2 text-[13px] text-foreground"
                        />
                      </td>
                      <td className="py-2">
                        <input
                          defaultValue={rec?.feedback ?? ""}
                          placeholder="Değerlendirme"
                          maxLength={200}
                          onBlur={(e) => update(no, { feedback: e.target.value })}
                          className="h-8 w-full min-w-40 rounded-md border border-input bg-card px-2 text-[13px] text-foreground"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
