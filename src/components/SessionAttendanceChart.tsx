import { attendanceLabel } from "@/lib/admin-api";

const barTone: Record<string, string> = {
  var: "bg-present",
  gec: "bg-late",
  izinli: "bg-secondary-foreground/40",
  yok: "bg-absent",
};

const heightOf: Record<string, number> = { var: 100, gec: 72, izinli: 46, yok: 14 };

function shortDate(d: string) {
  const [, m, day] = d.split("-");
  return `${day}.${m}`;
}

/** Öğrencinin ders bazlı (gün gün) yoklama çubukları. */
export function StudentSessionBars({
  records,
  title = "Ders Bazlı Devam Grafiği",
}: {
  records: { session_date: string; status: string }[];
  title?: string;
}) {
  const rows = [...records].sort((a, b) => (a.session_date < b.session_date ? -1 : 1)).slice(-16);

  return (
    <div className="card-soft border-accent/40 p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg text-foreground">{title}</h2>
        <span className="text-[12px] text-muted-foreground">{rows.length} ders</span>
      </div>

      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">Henüz yoklama alınmış ders yok.</p>
      ) : (
        <div className="mt-6 flex items-end gap-2 overflow-x-auto pb-1">
          {rows.map((r, i) => (
            <div key={`${r.session_date}-${i}`} className="flex w-9 shrink-0 flex-col items-center gap-2">
              <div className="flex h-28 w-full items-end rounded-md bg-secondary/50">
                <div
                  className={`w-full rounded-md transition-all ${barTone[r.status] ?? "bg-secondary"}`}
                  style={{ height: `${heightOf[r.status] ?? 20}%` }}
                  title={`${r.session_date} · ${attendanceLabel[r.status] ?? r.status}`}
                />
              </div>
              <span className="text-[10px] text-muted-foreground">{shortDate(r.session_date)}</span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
        {Object.keys(heightOf).map((st) => (
          <span key={st} className="inline-flex items-center gap-1.5">
            <i className={`inline-block h-2.5 w-2.5 rounded-sm ${barTone[st]}`} />
            {attendanceLabel[st] ?? st}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Hoca paneli: seçili sınıfın yoklama alınan günlerdeki katılım oranı. */
export function ClassSessionBars({
  records,
  rosterCount,
  title = "Ders Bazlı Katılım Oranı",
}: {
  records: { session_date: string; status: string }[];
  rosterCount: number;
  title?: string;
}) {
  const byDate = new Map<string, { present: number; total: number }>();
  for (const r of records) {
    const cur = byDate.get(r.session_date) ?? { present: 0, total: 0 };
    cur.total += 1;
    if (r.status === "var" || r.status === "gec") cur.present += 1;
    byDate.set(r.session_date, cur);
  }
  const rows = [...byDate.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .slice(-16)
    .map(([date, v]) => ({
      date,
      ...v,
      rate: Math.round((v.present / Math.max(rosterCount || v.total, 1)) * 100),
    }));

  return (
    <div className="card-soft border-accent/40 p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg text-foreground">{title}</h2>
        <span className="text-[12px] text-muted-foreground">
          {rows.length} ders · {rosterCount} öğrenci
        </span>
      </div>

      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">Bu sınıfta henüz yoklama alınmadı.</p>
      ) : (
        <div className="mt-6 flex items-end gap-2 overflow-x-auto pb-1">
          {rows.map((r) => (
            <div key={r.date} className="flex w-11 shrink-0 flex-col items-center gap-2">
              <span className="text-[10px] text-muted-foreground">%{r.rate}</span>
              <div className="flex h-28 w-full items-end rounded-md bg-secondary/50">
                <div
                  className="w-full rounded-md bg-present transition-all"
                  style={{ height: `${Math.max(r.rate, 4)}%` }}
                  title={`${r.date} · ${r.present}/${rosterCount || r.total} katılım`}
                />
              </div>
              <span className="text-[10px] text-muted-foreground">{shortDate(r.date)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
