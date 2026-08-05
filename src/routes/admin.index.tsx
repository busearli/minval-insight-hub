import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import {
  attendanceLabel,
  classLabel,
  useAttendance,
  useClasses,
  useHomework,
  useStudents,
  useSubmissions,
} from "@/lib/admin-api";

export const Route = createFileRoute("/admin/")({
  component: ReportsPage,
});

function pct(part: number, total: number) {
  return total === 0 ? 0 : Math.round((part / total) * 100);
}

function ReportsPage() {
  const { data: classes = [] } = useClasses();
  const { data: students = [] } = useStudents();
  const { data: records = [] } = useAttendance();
  const { data: homework = [] } = useHomework();
  const { data: submissions = [] } = useSubmissions();
  const [studentId, setStudentId] = useState("");

  const activeStudents = students.filter((s) => s.status === "aktif");
  const avgAttendance = pct(records.filter((r) => r.status === "var").length, records.length);
  const hwCompletion = pct(
    submissions.filter((s) => s.status === "edildi" || s.status === "gec").length,
    submissions.length,
  );

  const detail = useMemo(() => {
    if (!studentId) return null;
    const student = students.find((s) => s.id === studentId);
    if (!student) return null;
    const mine = records.filter((r) => r.student_id === studentId);
    const mySubs = submissions.filter((s) => s.student_id === studentId);
    return {
      student,
      className: classLabel(classes.find((c) => c.id === student.class_id) ?? ({ program: "", level: "", name: "—" } as never)),
      attendance: pct(mine.filter((r) => r.status === "var").length, mine.length),
      records: mine.sort((a, b) => b.session_date.localeCompare(a.session_date)).slice(0, 8),
      homework: mySubs.map((s) => ({
        title: homework.find((h) => h.id === s.homework_id)?.title ?? "—",
        status: s.status,
        feedback: s.feedback,
      })),
    };
  }, [studentId, students, records, submissions, classes, homework]);

  const kpis = [
    ["Aktif Öğrenci", String(activeStudents.length)],
    ["Aktif Sınıf", String(classes.length)],
    ["Ortalama Devam", `%${avgAttendance}`],
    ["Ödev Tamamlama", `%${hwCompletion}`],
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Raporlar</p>
        <h1 className="mt-2 text-2xl text-foreground">Genel Bakış</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map(([label, value]) => (
          <div key={label} className="card-soft border-accent/40 p-6">
            <p className="eyebrow">{label}</p>
            <p className="mt-3 font-serif text-3xl text-foreground">{value}</p>
          </div>
        ))}
      </div>

      <div className="card-soft border-accent/40 p-6">
        <h2 className="text-lg text-foreground">Öğrenci Karnesi</h2>
        <select
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          className="mt-4 h-9 min-w-56 rounded-md border border-input bg-card px-3 text-sm text-foreground"
        >
          <option value="">Öğrenci seçiniz</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>{s.full_name}</option>
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
                  <li key={r.id} className="rounded-full bg-secondary px-3 py-1 text-[12px] text-secondary-foreground">
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
