import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ChevronDown, Plus, Target, Trash2 } from "lucide-react";

import {
  GOAL_STATUSES,
  goalStatusLabel,
  goalStatusTone,
  summarize,
  useCoordinationGoals,
  useCoordinationMembers,
  useCoordinations,
  useRemoveCoordination,
  useSaveCoordination,
  type CoordinationGoalRow,
} from "@/lib/coordination-api";
import { useProfiles } from "@/lib/admin-api";
import { useMyRoles } from "@/lib/rbac";

export const Route = createFileRoute("/admin/koordinasyon")({
  component: CoordinationPage,
});

const field =
  "h-9 rounded-md border border-input bg-card px-3 text-sm text-foreground outline-none focus:border-primary";

function CoordinationPage() {
  const { isAdmin } = useMyRoles();
  const { data: coordinations = [], isLoading } = useCoordinations();
  const { data: goals = [] } = useCoordinationGoals();
  const { data: members = [] } = useCoordinationMembers();
  const { data: profiles = [] } = useProfiles();
  const saveCoord = useSaveCoordination("coordinations");
  const removeCoord = useRemoveCoordination("coordinations");
  const saveGoal = useSaveCoordination("coordination_goals");
  const removeGoal = useRemoveCoordination("coordination_goals");
  const saveMember = useSaveCoordination("coordination_members");
  const removeMember = useRemoveCoordination("coordination_members");

  const [openId, setOpenId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [draft, setDraft] = useState<Record<string, { title: string; owner: string }>>({});
  const [memberPick, setMemberPick] = useState<Record<string, string>>({});

  const nameOf = useMemo(
    () => (uid: string) => profiles.find((p) => p.user_id === uid)?.name ?? "Kullanıcı",
    [profiles],
  );

  const run = async (p: Promise<unknown>, msg: string) => {
    try {
      await p;
      toast.success(msg);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "İşlem başarısız");
    }
  };

  const totals = summarize(goals);

  const addGoal = (coordinationId: string) => {
    const d = draft[coordinationId];
    if (!d?.title?.trim()) {
      toast.error("Önce hedef başlığı yazınız.");
      return;
    }
    void run(
      saveGoal.mutateAsync({
        coordination_id: coordinationId,
        title: d.title.trim(),
        owner_name: d.owner?.trim() ?? "",
      }),
      "Hedef eklendi.",
    );
    setDraft((s) => ({ ...s, [coordinationId]: { title: "", owner: "" } }));
  };

  const patchGoal = (g: CoordinationGoalRow, patch: Record<string, unknown>) =>
    void run(saveGoal.mutateAsync({ id: g.id, ...patch }), "Hedef güncellendi.");

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Etkinlik & Organizasyon</p>
        <h1 className="mt-2 text-2xl text-foreground">Koordinatörlük Takip Sistemi</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Her koordinatörlüğün hedefleri, sorumluları ve gerçekleşme oranları tek tabloda toplanır;
          özet satırı hedeflerden otomatik hesaplanır.
        </p>
      </div>

      {/* Performans Özeti */}
      <div className="card-soft overflow-x-auto border-accent/40 p-0">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="bg-secondary text-left text-[12px] tracking-wide text-secondary-foreground">
              <th className="px-4 py-3">Koordinatörlük</th>
              <th className="px-3 py-3">Toplam Hedef</th>
              <th className="px-3 py-3">Tamamlandı</th>
              <th className="px-3 py-3">Devam Ediyor</th>
              <th className="px-3 py-3">Gecikti</th>
              <th className="px-3 py-3">Başlamadı</th>
              <th className="px-3 py-3">Ort. Gerçekleşme</th>
            </tr>
          </thead>
          <tbody>
            {coordinations.map((c) => {
              const s = summarize(goals.filter((g) => g.coordination_id === c.id));
              return (
                <tr key={c.id} className="border-t border-border">
                  <td className="px-4 py-2.5 text-foreground">{c.name}</td>
                  <td className="px-3 py-2.5">{s.total}</td>
                  <td className="px-3 py-2.5">{s.tamamlandi}</td>
                  <td className="px-3 py-2.5">{s.devam}</td>
                  <td className="px-3 py-2.5">{s.gecikti}</td>
                  <td className="px-3 py-2.5">{s.baslanmadi}</td>
                  <td className="px-3 py-2.5">%{s.avg}</td>
                </tr>
              );
            })}
            <tr className="border-t border-border bg-primary/10 font-medium text-foreground">
              <td className="px-4 py-2.5">TOPLAM</td>
              <td className="px-3 py-2.5">{totals.total}</td>
              <td className="px-3 py-2.5">{totals.tamamlandi}</td>
              <td className="px-3 py-2.5">{totals.devam}</td>
              <td className="px-3 py-2.5">{totals.gecikti}</td>
              <td className="px-3 py-2.5">{totals.baslanmadi}</td>
              <td className="px-3 py-2.5">%{totals.avg}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Yükleniyor…</p>}
      {!isLoading && coordinations.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Henüz koordinatörlük tanımlanmadı. Aşağıdan ekleyebilirsiniz.
        </p>
      )}

      {isAdmin && (
        <div className="card-soft flex flex-wrap items-center gap-2 border-accent/40 p-4">
          <input
            className={`${field} min-w-64 flex-1`}
            placeholder="Yeni koordinatörlük adı (örn. Minval Gençlik Koordinatörlüğü)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <button
            onClick={() => {
              if (!newName.trim()) {
                toast.error("Koordinatörlük adı giriniz.");
                return;
              }
              void run(saveCoord.mutateAsync({ name: newName.trim() }), "Koordinatörlük eklendi.");
              setNewName("");
            }}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[12px] text-primary-foreground"
          >
            <Plus className="h-3.5 w-3.5" /> Koordinatörlük Ekle
          </button>
        </div>
      )}

      {/* Koordinatörlük sekmeleri (açılır-kapanır) */}
      <div className="grid gap-3">
        {coordinations.map((c) => {
          const mine = goals.filter((g) => g.coordination_id === c.id);
          const team = members.filter((m) => m.coordination_id === c.id);
          const s = summarize(mine);
          const open = openId === c.id;
          return (
            <div key={c.id} className="card-soft border-accent/40 p-0">
              <button
                onClick={() => setOpenId(open ? null : c.id)}
                className="flex w-full items-center gap-3 px-5 py-4 text-left"
              >
                <Target className="h-4 w-4 text-primary" />
                <span className="text-foreground">{c.name}</span>
                <span className="text-[12px] text-muted-foreground">
                  {s.total} hedef · %{s.avg}
                </span>
                <ChevronDown
                  className={`ml-auto h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
                />
              </button>

              {open && (
                <div className="space-y-4 border-t border-border px-5 py-4">
                  {/* Ekip */}
                  <div className="space-y-2">
                    <p className="eyebrow">Koordinatörlük Ekibi</p>
                    <div className="flex flex-wrap gap-2">
                      {team.length === 0 && (
                        <span className="text-sm text-muted-foreground">Henüz üye eklenmedi.</span>
                      )}
                      {team.map((m) => (
                        <button
                          key={m.id}
                          onClick={() =>
                            isAdmin
                              ? void run(removeMember.mutateAsync(m.id), "Üye kaldırıldı.")
                              : undefined
                          }
                          className="rounded-full bg-secondary px-3 py-1 text-[12px] text-secondary-foreground"
                        >
                          {nameOf(m.user_id)}
                          {isAdmin ? " ✕" : ""}
                        </button>
                      ))}
                    </div>
                    {isAdmin && (
                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          className={`${field} min-w-56`}
                          value={memberPick[c.id] ?? ""}
                          onChange={(e) =>
                            setMemberPick((st) => ({ ...st, [c.id]: e.target.value }))
                          }
                        >
                          <option value="">Kullanıcı seçiniz</option>
                          {profiles.map((p) => (
                            <option key={p.user_id} value={p.user_id}>
                              {p.name || p.user_id}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => {
                            const uid = memberPick[c.id];
                            if (!uid) {
                              toast.error("Önce kullanıcı seçiniz.");
                              return;
                            }
                            void run(
                              saveMember.mutateAsync({ coordination_id: c.id, user_id: uid }),
                              "Üye eklendi.",
                            );
                          }}
                          className="rounded-full bg-primary px-4 py-2 text-[12px] text-primary-foreground"
                        >
                          Ekibe Ekle
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Hedefler */}
                  <div className="space-y-2">
                    <p className="eyebrow">Hedefler</p>
                    {mine.length === 0 && (
                      <p className="text-sm text-muted-foreground">Bu koordinatörlükte hedef yok.</p>
                    )}
                    <div className="grid gap-2">
                      {mine.map((g) => (
                        <div
                          key={g.id}
                          className="grid gap-2 rounded-xl border border-border p-3 md:grid-cols-[1fr_auto_auto_auto_auto]"
                        >
                          <div>
                            <p className="text-sm text-foreground">{g.title}</p>
                            <p className="text-[12px] text-muted-foreground">
                              Sorumlu: {g.owner_name || "—"}
                            </p>
                          </div>
                          <select
                            className={field}
                            value={g.status}
                            onChange={(e) => patchGoal(g, { status: e.target.value })}
                          >
                            {GOAL_STATUSES.map((s2) => (
                              <option key={s2} value={s2}>
                                {goalStatusLabel[s2]}
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
                              patchGoal(g, {
                                progress: Math.max(0, Math.min(100, Number(e.target.value) || 0)),
                              })
                            }
                          />
                          <input
                            type="date"
                            className={field}
                            value={g.due_date ?? ""}
                            onChange={(e) => patchGoal(g, { due_date: e.target.value || null })}
                          />
                          <div className="flex items-center gap-2">
                            <span
                              className={`rounded-full px-3 py-1 text-[11px] ${goalStatusTone[g.status] ?? ""}`}
                            >
                              {goalStatusLabel[g.status] ?? g.status}
                            </span>
                            <button
                              onClick={() => void run(removeGoal.mutateAsync(g.id), "Hedef silindi.")}
                              className="text-muted-foreground hover:text-destructive"
                              aria-label="Hedefi sil"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <input
                        className={`${field} min-w-56 flex-1`}
                        placeholder="Yeni hedef başlığı"
                        value={draft[c.id]?.title ?? ""}
                        onChange={(e) =>
                          setDraft((st) => ({
                            ...st,
                            [c.id]: { title: e.target.value, owner: st[c.id]?.owner ?? "" },
                          }))
                        }
                      />
                      <input
                        className={`${field} min-w-40`}
                        placeholder="Sorumlu kişi"
                        value={draft[c.id]?.owner ?? ""}
                        onChange={(e) =>
                          setDraft((st) => ({
                            ...st,
                            [c.id]: { title: st[c.id]?.title ?? "", owner: e.target.value },
                          }))
                        }
                      />
                      <button
                        onClick={() => addGoal(c.id)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[12px] text-primary-foreground"
                      >
                        <Plus className="h-3.5 w-3.5" /> Hedef Ekle
                      </button>
                    </div>
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() =>
                        void run(removeCoord.mutateAsync(c.id), "Koordinatörlük silindi.")
                      }
                      className="text-[12px] text-muted-foreground hover:text-destructive"
                    >
                      Bu koordinatörlüğü sil
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
