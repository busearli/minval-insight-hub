import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import {
  ATTENDANCE_STATUSES,
  attendanceLabel,
  classLabel,
  useAttendance,
  useClasses,
  useStudents,
  useUpsert,
} from "@/lib/admin-api";

export const Route = createFileRoute("/admin/yoklama")({
  component: AttendancePage,
});

const statusStyle: Record<string, string> = {
  var: "bg-present text-primary-foreground border-present",
  yok: "bg-absent text-primary-foreground border-absent",
  izinli: "bg-secondary text-secondary-foreground border-border",
  gec: "bg-late text-primary-foreground border-late",
};

function AttendancePage() {
  const { data: classes = [] } = useClasses();
  const { data: students = [] } = useStudents();
  const { data: records = [] } = useAttendance();
  const upsert = useUpsert("attendance_records", "student_id,session_date");

  const [classId, setClassId] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  const roster = useMemo(
    () => students.filter((s) => s.class_id === classId),
    [students, classId],
  );

  const statusOf = (studentId: string) =>
    records.find((r) => r.student_id === studentId && r.session_date === date)?.status ?? "";

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Devam Takibi</p>
        <h1 className="mt-2 text-2xl text-foreground">Yoklama</h1>
      </div>

      <div className="card-soft flex flex-wrap gap-3 border-accent/40 p-6">
        <select
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
          className="h-9 min-w-56 rounded-md border border-input bg-card px-3 text-sm text-foreground"
        >
          <option value="">Sınıf seçiniz</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>{classLabel(c)}</option>
          ))}
        </select>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="h-9 rounded-md border border-input bg-card px-3 text-sm text-foreground"
        />
      </div>

      {!classId ? (
        <p className="text-sm text-muted-foreground">Yoklama almak için bir sınıf seçin.</p>
      ) : roster.length === 0 ? (
        <p className="text-sm text-muted-foreground">Bu sınıfa kayıtlı öğrenci bulunmuyor.</p>
      ) : (
        <div className="card-soft divide-y divide-border border-accent/40">
          {roster.map((s) => {
            const current = statusOf(s.id);
            return (
              <div key={s.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
                <span className="min-w-40 flex-1 text-sm text-foreground">{s.full_name}</span>
                <div className="flex gap-2">
                  {ATTENDANCE_STATUSES.map((st) => (
                    <button
                      key={st}
                      onClick={() =>
                        upsert.mutate({
                          student_id: s.id,
                          class_id: classId,
                          session_date: date,
                          status: st,
                        })
                      }
                      className={`rounded-full border px-4 py-1.5 text-[12px] transition-colors ${
                        current === st
                          ? statusStyle[st]
                          : "border-border text-muted-foreground hover:border-accent"
                      }`}
                    >
                      {attendanceLabel[st]}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
