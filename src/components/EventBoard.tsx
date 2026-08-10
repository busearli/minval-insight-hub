import { useState } from "react";
import { toast } from "sonner";
import { CalendarDays, Users } from "lucide-react";

import {
  formatEventDate,
  useEventRegistrations,
  useEvents,
  useJoinEvent,
  useLeaveEvent,
} from "@/lib/events-api";

/** Öğrenci/üye tarafı: açık etkinlikleri listeler, kayıt ol / kaydı iptal et. */
export function EventBoard({
  userId,
  fullName,
  phone,
}: {
  userId?: string;
  fullName: string;
  phone?: string;
}) {
  const { data: events = [] } = useEvents();
  const { data: myRegs = [] } = useEventRegistrations(!!userId);
  const join = useJoinEvent();
  const leave = useLeaveEvent();
  const [note, setNote] = useState<Record<string, string>>({});

  const open = events.filter((e) => e.is_published);
  if (open.length === 0)
    return <p className="text-sm text-muted-foreground">Şu anda açık bir etkinlik yok.</p>;

  const run = async (p: Promise<unknown>, msg: string) => {
    try {
      await p;
      toast.success(msg);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "İşlem başarısız");
    }
  };

  return (
    <div className="grid gap-3">
      {open.map((ev) => {
        const mine = myRegs.find((r) => r.event_id === ev.id && r.user_id === userId);
        return (
          <div key={ev.id} className="card-soft border-accent/40 p-5">
            <div className="flex flex-wrap items-center gap-3">
              <CalendarDays className="h-4 w-4 text-primary" />
              <span className="text-foreground">{ev.title}</span>
              <span className="text-[12px] text-muted-foreground">
                {formatEventDate(ev.starts_at)}
                {ev.location ? ` · ${ev.location}` : ""}
              </span>
              {!!ev.capacity && (
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-[11px] text-secondary-foreground">
                  <Users className="h-3 w-3" /> Kontenjan {ev.capacity}
                </span>
              )}
            </div>
            {ev.description && (
              <p className="mt-2 text-[13px] text-muted-foreground">{ev.description}</p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {mine ? (
                <>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-[12px] text-primary">
                    Kaydınız alındı
                  </span>
                  <button
                    onClick={() => void run(leave.mutateAsync(mine.id), "Kaydınız iptal edildi.")}
                    className="rounded-full border border-border px-4 py-2 text-[12px] text-muted-foreground hover:text-destructive"
                  >
                    Kaydımı İptal Et
                  </button>
                </>
              ) : ev.is_open ? (
                <>
                  <input
                    className="h-9 min-w-56 flex-1 rounded-md border border-input bg-card px-3 text-sm outline-none focus:border-primary"
                    placeholder="Not (opsiyonel)"
                    value={note[ev.id] ?? ""}
                    onChange={(e) => setNote((s) => ({ ...s, [ev.id]: e.target.value }))}
                  />
                  <button
                    onClick={() => {
                      if (!userId) {
                        toast.error("Kayıt için giriş yapmalısınız.");
                        return;
                      }
                      void run(
                        join.mutateAsync({
                          event_id: ev.id,
                          user_id: userId,
                          full_name: fullName,
                          phone: phone ?? "",
                          notes: note[ev.id] ?? "",
                        }),
                        "Etkinlik kaydınız alındı.",
                      );
                    }}
                    className="rounded-full bg-primary px-4 py-2 text-[12px] text-primary-foreground"
                  >
                    Etkinliğe Kayıt Ol
                  </button>
                </>
              ) : (
                <span className="text-[12px] text-muted-foreground">Kayıtlar kapalı.</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
