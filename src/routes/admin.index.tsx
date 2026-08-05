import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import {
  attendanceLabel,
  classLabel,
  useAttendance,
  useClasses,
  useHomework,
  useProfiles,
  useStudents,
  useSubmissions,
} from "@/lib/admin-api";
import { useApplications, useSaveSettings, useSiteSettings } from "@/lib/site-api";
import { useMyRoles } from "@/lib/rbac";

export const Route = createFileRoute("/admin/")({
  component: ReportsPage,
});

function pct(part: number, total: number) {
  return total === 0 ? 0 : Math.round((part / total) * 100);
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-border p-4">
      <div>
        <p className="text-sm text-foreground">{label}</p>
        <p className="mt-1 text-[12px] text-muted-foreground">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`mt-1 h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? "bg-primary" : "bg-muted"
        }`}
      >
        <span
          className={`block h-5 w-5 rounded-full bg-card transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function ReportsPage() {
  const { isSuperAdmin, isAdmin, myClassIds } = useMyRoles();
  const { data: allClasses = [] } = useClasses();
  const { data: allStudents = [] } = useStudents();
  const { data: records = [] } = useAttendance();
  const { data: homework = [] } = useHomework();
  const { data: submissions = [] } = useSubmissions();
  const { data: applications = [] } = useApplications();
  const { data: profiles = [] } = useProfiles();
  const { settings } = useSiteSettings();
  const saveSettings = useSaveSettings();
  const [studentId, setStudentId] = useState("");

  const classes = isAdmin ? allClasses : allClasses.filter((c) => myClassIds.includes(c.id));
  const students = isAdmin
    ? allStudents
    : allStudents.filter((s) => s.class_id && myClassIds.includes(s.class_id));

  const activeStudents = students.filter((s) => s.status === "aktif");
  const avgAttendance = pct(records.filter((r) => r.status === "var").length, records.length);
  const hwCompletion = pct(
    submissions.filter((s) => s.status === "edildi" || s.status === "gec").length,
    submissions.length,
  );
  const pendingAssignments =
    profiles.filter((p) => p.status === "pending_assignment").length +
    applications.filter((a) => a.status === "bekliyor").length;

  const toggleModule = (patch: Record<string, boolean>) => {
    saveSettings.mutate(
      { ...settings, ...patch },
      {
        onSuccess: () => toast.success("Modül ayarı güncellendi."),
        onError: (e) => toast.error(e instanceof Error ? e.message : "Güncellenemedi"),
      },
    );
  };

  const detail = useMemo(() => {
    if (!studentId) return null;
    const student = students.find((s) => s.id === studentId);
    if (!student) return null;
    const mine = records.filter((r) => r.student_id === studentId);
    const mySubs = submissions.filter((s) => s.student_id === studentId);
    return {
      student,
      className: classLabel(
        allClasses.find((c) => c.id === student.class_id) ??
          ({ program: "", level: "", name: "—" } as never),
      ),
      attendance: pct(mine.filter((r) => r.status === "var").length, mine.length),
      records: mine.sort((a, b) => b.session_date.localeCompare(a.session_date)).slice(0, 8),
      homework: mySubs.map((s) => ({
        title: homework.find((h) => h.id === s.homework_id)?.title ?? "—",
        status: s.status,
        feedback: s.feedback,
      })),
    };
  }, [studentId, students, records, submissions, allClasses, homework]);

  const kpis = [
    ["Aktif Öğrenci", String(activeStudents.length)],
    ["Sınıf Ataması Bekleyen", String(pendingAssignments)],
    ["Aktif Sınıf", String(classes.length)],
    ["Ortalama Devam", `%${avgAttendance}`],
    ["Ödev Tamamlama", `%${hwCompletion}`],
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Kontrol Paneli</p>
        <h1 className="mt-2 text-2xl text-foreground">Genel Bakış</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {kpis.map(([label, value]) => (
          <div key={label} className="card-soft border-accent/40 p-6">
            <p className="eyebrow">{label}</p>
            <p className="mt-3 font-serif text-3xl text-foreground">{value}</p>
          </div>
        ))}
      </div>

      <div className="card-soft border-accent/40 p-6">
        <h2 className="text-lg text-foreground">Son Hareketler</h2>
        <ul className="mt-4 space-y-2">
          {activity.length === 0 && (
            <li className="text-sm text-muted-foreground">Henüz hareket yok.</li>
          )}
          {activity.map((a, i) => (
            <li key={i} className="flex items-start justify-between gap-4 text-sm text-foreground">
              <span>{a.text}</span>
              <span className="shrink-0 text-[12px] text-muted-foreground">{a.at.slice(0, 10)}</span>
            </li>
          ))}
        </ul>
      </div>

      {isSuperAdmin && (
        <div className="card-soft space-y-3 border-accent/40 p-6">
          <h2 className="text-lg text-foreground">Sistem Modülleri</h2>
          <Toggle
            label="Ön Kayıt Başvuruları"
            description="Kapatıldığında sitedeki “Ön Kayıt Ol” butonu ve formu gizlenir."
            checked={settings.pre_registration_enabled !== false}
            onChange={(v) => toggleModule({ pre_registration_enabled: v })}
          />
          <Toggle
            label="Cüz Takip Modülü"
            description="Cüz ve ezber takip ekranlarını panelde ve öğrenci portalında gösterir."
            checked={!!settings.cuz_tracking_enabled}
            onChange={(v) => toggleModule({ cuz_tracking_enabled: v })}
          />
        </div>
      )}

      <div className="card-soft border-accent/40 p-6">
        <h2 className="text-lg text-foreground">Öğrenci Karnesi</h2>
        <select
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          className="mt-4 h-9 min-w-56 rounded-md border border-input bg-card px-3 text-sm text-foreground"
        >
          <option value="">Öğrenci seçiniz</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.full_name}
            </option>
          ))}
        </select>

        {detail && (
          <div className="mt-6 space-y-6">
            <div className="flex flex-wrap gap-8 border-t border-border pt-5">
              <div>
                <p className="eyebrow">Sınıf</p>
                <p className="mt-1 text-sm text-foreground">{detail.className}</p>
              </div>
              <div>
                <p className="eyebrow">Devam Oranı</p>
                <p className="mt-1 font-serif text-2xl text-foreground">%{detail.attendance}</p>
              </div>
            </div>

            <div>
              <p className="eyebrow">Son Yoklamalar</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {detail.records.length === 0 && (
                  <li className="text-sm text-muted-foreground">Kayıt yok.</li>
                )}
                {detail.records.map((r) => (
                  <li
                    key={r.id}
                    className="rounded-full bg-secondary px-3 py-1 text-[12px] text-secondary-foreground"
                  >
                    {r.session_date} · {attendanceLabel[r.status] ?? r.status}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="eyebrow">Ödev Geçmişi</p>
              <ul className="mt-3 space-y-2">
                {detail.homework.length === 0 && (
                  <li className="text-sm text-muted-foreground">Kayıt yok.</li>
                )}
                {detail.homework.map((h, i) => (
                  <li key={i} className="text-sm text-foreground">
                    {h.title} — <span className="text-muted-foreground">{h.status}</span>
                    {h.feedback && <span className="text-muted-foreground"> · {h.feedback}</span>}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
