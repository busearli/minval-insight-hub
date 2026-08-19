import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CalendarDays, ChevronDown, Plus, Trash2, Users } from "lucide-react";

import {
  formatEventDate,
  useEventRegistrations,
  useEvents,
  useRemoveEvent,
  useSaveEvent,
  useUpdateRegistration,
} from "@/lib/events-api";
import { useCoordinations } from "@/lib/coordination-api";
import { useMyRoles } from "@/lib/rbac";

export const Route = createFileRoute("/admin/etkinlikler")({
  component: EventsAdminPage,
});

const field =
  "h-9 rounded-md border border-input bg-card px-3 text-sm text-foreground outline-none focus:border-primary";

const emptyDraft = {
  title: "",
  description: "",
  location: "",
  starts_at: "",
  capacity: "0",
  coordination_id: "",
};

function EventsAdminPage() {
  const { isAdmin } = useMyRoles();
  const { data: events = [], isLoading } = useEvents();
  const { data: regs = [] } = useEventRegistrations();
  const { data: coordinations = [] } = useCoordinations();
  const saveEvent = useSaveEvent();
  const removeEvent = useRemoveEvent();
  const updateReg = useUpdateRegistration();

  const [draft, setDraft] = useState(emptyDraft);
  const [openId, setOpenId] = useState<string | null>(null);

  const regsOf = useMemo(
    () => (id: string) => regs.filter((r) => r.event_id === id),
    [regs],
  );

  const run = async (p: Promise<unknown>, msg: string) => {
    try {
      await p;
      toast.success(msg);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "İşlem başarısız");
    }
  };

  const create = () => {
    if (!draft.title.trim()) {
      toast.error("Etkinlik adı giriniz.");
      return;
    }
    void run(
      saveEvent.mutateAsync({
        title: draft.title.trim(),
        description: draft.description.trim(),
        location: draft.location.trim(),
        starts_at: draft.starts_at ? new Date(draft.starts_at).toISOString() : null,
        capacity: Number(draft.capacity) || 0,
        coordination_id: draft.coordination_id || null,
      }),
      "Etkinlik oluşturuldu.",
    );
    setDraft(emptyDraft);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Organizasyon</p>
        <h1 className="mt-2 text-2xl text-foreground">Etkinlikler & Katılımcı Kayıtları</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Etkinlik açtığınızda katılımcılar öğrenci panelinden kayıt olur; kayıtlar buraya düşer.
        </p>
      </div>

      {isAdmin && (
        <div className="card-soft grid gap-2 border-accent/40 p-4 md:grid-cols-2">
          <input
            className={field}
            placeholder="Etkinlik adı (örn. Strateji Kampı)"
            value={draft.title}
            onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
          />
          <input
            className={field}
            placeholder="Yer / mekân"
            value={draft.location}
            onChange={(e) => setDraft((d) => ({ ...d, location: e.target.value }))}
          />
          <input
            type="datetime-local"
            className={field}
            value={draft.starts_at}
            onChange={(e) => setDraft((d) => ({ ...d, starts_at: e.target.value }))}
          />
          <input
            type="number"
            min={0}
            className={field}
            placeholder="Kontenjan (0 = sınırsız)"
            value={draft.capacity}
            onChange={(e) => setDraft((d) => ({ ...d, capacity: e.target.value }))}
          />
          <select
            className={field}
            value={draft.coordination_id}
            onChange={(e) => setDraft((d) => ({ ...d, coordination_id: e.target.value }))}
          >
            <option value="">Koordinatörlük (opsiyonel)</option>
            {coordinations.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            className={field}
            placeholder="Kısa açıklama"
            value={draft.description}
            onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
          />
          <button
            onClick={create}
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[12px] text-primary-foreground md:col-span-2"
          >
            <Plus className="h-3.5 w-3.5" /> Etkinlik Oluştur
          </button>
        </div>
      )}

      {isLoading && <p className="text-sm text-muted-foreground">Yükleniyor…</p>}
      {!isLoading && events.length === 0 && (
        <p className="text-sm text-muted-foreground">Henüz etkinlik oluşturulmadı.</p>
      )}

      <div className="grid gap-3">
        {events.map((ev) => {
          const list = regsOf(ev.id);
          const open = openId === ev.id;
          return (
            <div key={ev.id} className="card-soft border-accent/40 p-0">
              <button
                onClick={() => setOpenId(open ? null : ev.id)}
                className="flex w-full flex-wrap items-center gap-3 px-5 py-4 text-left"
              >
                <CalendarDays className="h-4 w-4 text-primary" />
                <span className="text-foreground">{ev.title}</span>
                <span className="text-[12px] text-muted-foreground">
                  {formatEventDate(ev.starts_at)}
                  {ev.location ? ` · ${ev.location}` : ""}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-[11px] text-secondary-foreground">
                  <Users className="h-3 w-3" /> {list.length}
                  {ev.capacity ? ` / ${ev.capacity}` : ""}
                </span>
                {!ev.is_open && (
                  <span className="rounded-full bg-destructive/10 px-3 py-1 text-[11px] text-destructive">
                    Kayıtlar kapalı
                  </span>
                )}
                <ChevronDown
                  className={`ml-auto h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
                />
              </button>

              {open && (
                <div className="space-y-4 border-t border-border px-5 py-4">
                  {ev.description && (
                    <p className="text-[13px] text-muted-foreground">{ev.description}</p>
                  )}

                  {isAdmin && (
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() =>
                          void run(
                            saveEvent.mutateAsync({ id: ev.id, is_open: !ev.is_open }),
                            "Kayıt durumu güncellendi.",
                          )
                        }
                        className="rounded-full border border-border px-4 py-2 text-[12px] text-muted-foreground hover:text-primary"
                      >
                        {ev.is_open ? "Kayıtları Kapat" : "Kayıtları Aç"}
                      </button>
                      <button
                        onClick={() =>
                          void run(
                            saveEvent.mutateAsync({ id: ev.id, is_published: !ev.is_published }),
                            "Yayın durumu güncellendi.",
                          )
                        }
                        className="rounded-full border border-border px-4 py-2 text-[12px] text-muted-foreground hover:text-primary"
                      >
                        {ev.is_published ? "Yayından Kaldır" : "Yayına Al"}
                      </button>
                      <button
                        onClick={() =>
                          void run(removeEvent.mutateAsync(ev.id), "Etkinlik silindi.")
                        }
                        className="ml-auto inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Etkinliği sil
                      </button>
                    </div>
                  )}

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[560px] text-sm">
                      <thead>
                        <tr className="bg-secondary text-left text-[12px] text-secondary-foreground">
                          <th className="px-4 py-2.5">Katılımcı</th>
                          <th className="px-3 py-2.5">Telefon</th>
                          <th className="px-3 py-2.5">Not</th>
                          <th className="px-3 py-2.5">Durum</th>
                          <th className="px-3 py-2.5">Katıldı</th>
                        </tr>
                      </thead>
                      <tbody>
                        {list.length === 0 && (
                          <tr>
                            <td className="px-4 py-3 text-muted-foreground" colSpan={5}>
                              Henüz kayıt yok.
                            </td>
                          </tr>
                        )}
                        {list.map((r) => (
                          <tr key={r.id} className="border-t border-border">
                            <td className="px-4 py-2.5 text-foreground">{r.full_name || "—"}</td>
                            <td className="px-3 py-2.5 text-muted-foreground">{r.phone || "—"}</td>
                            <td className="px-3 py-2.5 text-muted-foreground">{r.notes || "—"}</td>
                            <td className="px-3 py-2.5">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span
                                  className={`rounded-full px-2.5 py-1 text-[11px] ${
                                    r.status === "onaylandi"
                                      ? "bg-present/20 text-foreground"
                                      : r.status === "reddedildi"
                                        ? "bg-absent/20 text-foreground"
                                        : "bg-secondary text-secondary-foreground"
                                  }`}
                                >
                                  {REG_STATUS_LABEL[r.status] ?? r.status}
                                </span>
                                {isAdmin && r.status !== "onaylandi" && (
                                  <button
                                    onClick={() =>
                                      void run(
                                        updateReg.mutateAsync({ id: r.id, status: "onaylandi" }),
                                        "Katılım onaylandı.",
                                      )
                                    }
                                    className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground hover:text-primary"
                                  >
                                    Onayla
                                  </button>
                                )}
                                {isAdmin && r.status !== "reddedildi" && (
                                  <button
                                    onClick={() =>
                                      void run(
                                        updateReg.mutateAsync({ id: r.id, status: "reddedildi" }),
                                        "Katılım reddedildi.",
                                      )
                                    }
                                    className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground hover:text-destructive"
                                  >
                                    Reddet
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-2.5">
                              <input
                                type="checkbox"
                                checked={r.attended}
                                disabled={!isAdmin}
                                onChange={(e) =>
                                  void run(
                                    updateReg.mutateAsync({
                                      id: r.id,
                                      attended: e.target.checked,
                                    }),
                                    "Katılım güncellendi.",
                                  )
                                }
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
