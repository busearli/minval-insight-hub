import { programColor, programs, timetable, weekDays } from "@/lib/minval-programs";

export function WeeklySchedule() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {weekDays.map((day) => {
        const entries = timetable
          .filter((t) => t.day === day)
          .sort((a, b) => a.time.localeCompare(b.time));
        return (
          <div key={day} className="card-soft border-accent/40 p-5">
            <div className="flex items-baseline justify-between">
              <h3 className="text-base text-foreground">{day}</h3>
              <span className="text-[11px] text-muted-foreground">{entries.length} ders</span>
            </div>
            <div className="mt-4 space-y-2">
              {entries.length === 0 && (
                <p className="text-[13px] text-muted-foreground">Ders bulunmuyor.</p>
              )}
              {entries.map((e, i) => {
                const p = programs.find((x) => x.id === e.programId);
                return (
                  <div
                    key={i}
                    className={`rounded-lg border px-3 py-2.5 text-[12px] ${
                      programColor[e.programId] ?? ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">
                        {p?.emoji} {p?.title}
                      </span>
                      <span className="tabular-nums opacity-80">{e.time}</span>
                    </div>
                    <p className="mt-1 opacity-80">{e.group}</p>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
