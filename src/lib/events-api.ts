import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type EventRow = Database["public"]["Tables"]["events"]["Row"];
export type EventRegistrationRow = Database["public"]["Tables"]["event_registrations"]["Row"];

function unwrap<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return (res.data ?? []) as T;
}

export function useEvents() {
  return useQuery({
    queryKey: ["events"],
    queryFn: async () =>
      unwrap<EventRow[]>(
        await supabase.from("events").select("*").order("starts_at", { ascending: true }),
      ),
  });
}

/** Yönetici: tüm kayıtlar · Öğrenci: yalnızca kendi kayıtları (RLS) */
export function useEventRegistrations(enabled = true) {
  return useQuery({
    queryKey: ["event-registrations"],
    enabled,
    queryFn: async () =>
      unwrap<EventRegistrationRow[]>(
        await supabase.from("event_registrations").select("*").order("created_at"),
      ),
  });
}

export function useSaveEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (row: Record<string, unknown>) => {
      const q = supabase.from("events");
      const res = row["id"]
        ? await q.update(row as never).eq("id", row["id"] as string)
        : await q.insert(row as never);
      if (res.error) throw new Error(res.error.message);
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["events"] }),
  });
}

export function useRemoveEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await supabase.from("events").delete().eq("id", id);
      if (res.error) throw new Error(res.error.message);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["events"] });
      void qc.invalidateQueries({ queryKey: ["event-registrations"] });
    },
  });
}

export function useJoinEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (row: {
      event_id: string;
      user_id: string;
      full_name: string;
      phone?: string;
      notes?: string;
    }) => {
      const res = await supabase.from("event_registrations").insert(row as never);
      if (res.error) throw new Error(res.error.message);
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["event-registrations"] }),
  });
}

export function useUpdateRegistration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: { id: string } & Record<string, unknown>) => {
      const res = await supabase.from("event_registrations").update(patch as never).eq("id", id);
      if (res.error) throw new Error(res.error.message);
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["event-registrations"] }),
  });
}

export function useLeaveEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await supabase.from("event_registrations").delete().eq("id", id);
      if (res.error) throw new Error(res.error.message);
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["event-registrations"] }),
  });
}

export const REG_STATUS_LABEL: Record<string, string> = {
  beklemede: "Onay bekliyor",
  onaylandi: "Onaylandı",
  reddedildi: "Reddedildi",
};

export function formatEventDate(value: string | null) {
  if (!value) return "Tarih belirtilmedi";
  const d = new Date(value);
  return d.toLocaleString("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
