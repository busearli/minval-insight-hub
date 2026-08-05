import { toast } from "sonner";
import { CheckCircle2, Circle } from "lucide-react";

import {
  CUZ_NUMBERS,
  useClaimCuz,
  useHatimClaims,
  useHatims,
  useReleaseCuz,
  useToggleClaimCompleted,
} from "@/lib/hatim-api";

/** Hatim cüz seçim panosu — öğrenci kendi cüzünü alır, yönetici tüm seçimleri görür. */
export function HatimBoard({
  userId,
  participantName,
  manage = false,
}: {
  userId?: string | undefined;
  participantName?: string | undefined;
  manage?: boolean;
}) {
  const { data: hatims = [], isLoading } = useHatims();
  const { data: claims = [] } = useHatimClaims();
  const claim = useClaimCuz();
  const release = useReleaseCuz();
  const toggle = useToggleClaimCompleted();

  const visible = manage ? hatims : hatims.filter((h) => h.is_open);

  if (isLoading) return <p className="text-sm text-muted-foreground">Yükleniyor…</p>;
  if (visible.length === 0)
    return (
      <p className="text-sm text-muted-foreground">
        {manage ? "Henüz hatim açılmadı." : "Şu anda açık bir hatim bulunmuyor."}
      </p>
    );

  return (
    <div className="space-y-6">
      {visible.map((h) => {
        const rows = claims.filter((c) => c.hatim_id === h.id);
        const mine = userId ? rows.find((c) => c.user_id === userId) : undefined;
        const done = rows.filter((c) => c.completed).length;
        return (
          <div key={h.id} className="card-soft border-accent/40 p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-lg text-foreground">{h.title}</h3>
                {h.description && (
                  <p className="mt-1 text-[13px] text-muted-foreground">{h.description}</p>
                )}
              </div>
              <span className="rounded-full bg-secondary px-3 py-1 text-[11px] text-secondary-foreground">
                {rows.length}/30 alındı · {done} tamamlandı {h.is_open ? "" : "· Kapalı"}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {CUZ_NUMBERS.map((no) => {
                const taken = rows.find((c) => c.cuz_no === no);
                const isMine = !!taken && taken.user_id === userId;
                const selectable = !taken && h.is_open && !!userId && !mine;
                return (
                  <div
                    key={no}
                    className={`rounded-lg border px-3 py-2 text-[13px] ${
                      taken ? "border-primary/40 bg-secondary/60" : "border-border bg-card"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-foreground">{no}. Cüz</span>
                      {taken ? (
                        taken.completed ? (
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground" />
                        )
                      ) : null}
                    </div>
                    <p className="mt-1 truncate text-[12px] text-muted-foreground">
                      {taken ? taken.participant_name || "İsimsiz katılımcı" : "Boş"}
                    </p>

                    {selectable && (
                      <button
                        onClick={() =>
                          claim.mutate(
                            {
                              hatim_id: h.id,
                              cuz_no: no,
                              user_id: userId!,
                              participant_name: participantName ?? "",
                            },
                            {
                              onSuccess: () => toast.success(`${no}. cüzü aldınız.`),
                              onError: () => toast.error("Bu cüz alınamadı, yenileyip deneyin."),
                            },
                          )
                        }
                        className="mt-2 w-full rounded-full bg-primary px-3 py-1 text-[12px] text-primary-foreground"
                      >
                        Bu cüzü al
                      </button>
                    )}

                    {isMine && h.is_open && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        <button
                          onClick={() =>
                            toggle.mutate({ id: taken!.id, completed: !taken!.completed })
                          }
                          className="rounded-full border border-border px-2 py-1 text-[11px] text-muted-foreground hover:text-primary"
                        >
                          {taken!.completed ? "Geri al" : "Tamamladım"}
                        </button>
                        <button
                          onClick={() => release.mutate(taken!.id)}
                          className="rounded-full border border-border px-2 py-1 text-[11px] text-muted-foreground hover:text-destructive"
                        >
                          Bırak
                        </button>
                      </div>
                    )}

                    {manage && taken && !isMine && (
                      <button
                        onClick={() => release.mutate(taken.id)}
                        className="mt-2 w-full rounded-full border border-border px-2 py-1 text-[11px] text-muted-foreground hover:text-destructive"
                      >
                        Seçimi kaldır
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {manage && (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[420px] text-left text-sm">
                  <thead className="border-b border-border text-[12px] text-muted-foreground">
                    <tr>
                      <th className="py-2">Cüz</th>
                      <th className="py-2">Alan Kişi</th>
                      <th className="py-2">Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length === 0 && (
                      <tr>
                        <td colSpan={3} className="py-3 text-muted-foreground">
                          Henüz cüz alan yok.
                        </td>
                      </tr>
                    )}
                    {rows.map((c) => (
                      <tr key={c.id} className="border-b border-border/70 last:border-0">
                        <td className="py-2 text-foreground">{c.cuz_no}. Cüz</td>
                        <td className="py-2 text-muted-foreground">
                          {c.participant_name || "İsimsiz katılımcı"}
                        </td>
                        <td className="py-2 text-muted-foreground">
                          {c.completed ? "Tamamlandı" : "Devam ediyor"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
