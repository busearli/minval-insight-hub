import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ChevronDown, Target } from "lucide-react";

import {
  GOAL_STATUSES,
  goalStatusLabel,
  goalStatusTone,
  summarize,
  useCoordinationGoals,
  useCoordinationMembers,
  useCoordinations,
  useSaveCoordination,
  type CoordinationGoalRow,
} from "@/lib/coordination-api";

const field =
  "h-9 rounded-md border border-input bg-card px-3 text-sm text-foreground outline-none focus:border-primary";

/**
 * Kullanıcının üyesi olduğu koordinatörlükler: hedefleri görüntüler ve
 * kendi ekibinin hedeflerinde durum / gerçekleşme oranını güncellemesine izin verir.
 */
export function MyCoordinations({ userId }: { userId?: string | undefined }) {
  const { data: coordinations = [] } = useCoordinations();
  const { data: members = [] } = useCoordinationMembers();
  const { data: goals = [] } = useCoordinationGoals();
  const saveGoal = useSaveCoordination("coordination_goals");
  const [openId, setOpenId] = useState<string | null>(null);

  const mineIds = useMemo(
    () => members.filter((m) => m.user_id === userId).map((m) => m.coordination_id),
    [members, userId],
  );
  const list = coordinations.filter((c) => mineIds.includes(c.id));

  if (!userId || list.length === 0) return null;

  const patch = async (g: CoordinationGoalRow, values: Record<string, unknown>) => {
    try {
      await saveGoal.mutateAsync({ id: g.id, ...values });
      toast.success("Hedef güncellendi.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Güncellenemedi");
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <p className="eyebrow">Koordinatörlüklerim</p>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Görevli olduğunuz koordinatörlüklerin hedeflerini görebilir, tamamladığınız işleri
          işaretleyebilirsiniz.
        </p>
      </div>

      {list.map((c) => {
        const mine = goals.filter((g) => g.coordination_id === c.id);
        const s = summarize(mine);
        const open = openId === c.id;
        const team = members.filter((m) => m.coordination_id === c.id);
        return (
          <div key={c.id} className="card-soft border-accent/40 p-0">
            <button
              onClick={() => setOpenId(open ? null : c.id)}
              className="flex w-full items-center gap-3 px-5 py-4 text-left"
            >
              <Target className="h-4 w-4 text-primary" />
              <span className="text-foreground">{c.name}</span>
              <span className="text-[12px] text-muted-foreground">
                {s.total} hedef · %{s.avg} · {team.length} kişi
              </span>
              <ChevronDown
                className={`ml-auto h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
              />
            </button>

            {open && (
              <div className="space-y-3 border-t border-border px-5 py-4">
                {c.description && (
                  <p className="text-[13px] text-muted-foreground">{c.description}</p>
                )}
                {mine.length === 0 && (
                  <p className="text-sm text-muted-foreground">Henüz hedef tanımlanmadı.</p>
                )}
                {mine.map((g) => (
                  <div
                    key={g.id}
                    className="grid gap-2 rounded-xl border border-border p-3 md:grid-cols-[1fr_auto_auto_auto]"
                  >
                    <div>
                      <p className="text-sm text-foreground">{g.title}</p>
                      <p className="text-[12px] text-muted-foreground">
                        Sorumlu: {g.owner_name || "—"}
                        {g.due_date ? ` · Termin: ${g.due_date}` : ""}
                      </p>
                    </div>
                    <select
                      className={field}
                      value={g.status}
                      onChange={(e) => void patch(g, { status: e.target.value })}
                    >
                      {GOAL_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {goalStatusLabel[st]}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      className={`${field} w-24`}
                      value={g.progress}
                      onChange={(e) =>
                        void patch(g, {
                          progress: Math.max(0, Math.min(100, Number(e.target.value) || 0)),
                        })
                      }
                    />
                    <span
                      className={`self-center rounded-full px-3 py-1 text-center text-[11px] ${goalStatusTone[g.status] ?? ""}`}
                    >
                      {goalStatusLabel[g.status] ?? g.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Kullanıcı herhangi bir koordinatörlüğe üye mi? */
export function useIsCoordinationMember(userId?: string | undefined) {
  const { data: members = [] } = useCoordinationMembers();
  return !!userId && members.some((m) => m.user_id === userId);
}
