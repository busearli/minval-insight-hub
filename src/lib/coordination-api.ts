import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type CoordinationRow = Database["public"]["Tables"]["coordinations"]["Row"];
export type CoordinationMemberRow = Database["public"]["Tables"]["coordination_members"]["Row"];
export type CoordinationGoalRow = Database["public"]["Tables"]["coordination_goals"]["Row"];

export const GOAL_STATUSES = ["tamamlandi", "devam", "gecikti", "baslanmadi"] as const;
export type GoalStatus = (typeof GOAL_STATUSES)[number];

export const goalStatusLabel: Record<string, string> = {
  tamamlandi: "Tamamlandı",
  devam: "Devam Ediyor",
  gecikti: "Gecikti",
  baslanmadi: "Başlamadı",
};

export const goalStatusTone: Record<string, string> = {
  tamamlandi: "bg-primary/10 text-primary",
  devam: "bg-accent/40 text-foreground",
  gecikti: "bg-destructive/10 text-destructive",
  baslanmadi: "bg-secondary text-secondary-foreground",
};

function unwrap<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return (res.data ?? []) as T;
}

export function useCoordinations() {
  return useQuery({
    queryKey: ["coordinations"],
    queryFn: async () =>
      unwrap<CoordinationRow[]>(
        await supabase.from("coordinations").select("*").order("sort_order").order("name"),
      ),
  });
}

export function useCoordinationMembers() {
  return useQuery({
    queryKey: ["coordination-members"],
    queryFn: async () =>
      unwrap<CoordinationMemberRow[]>(await supabase.from("coordination_members").select("*")),
  });
}

export function useCoordinationGoals() {
  return useQuery({
    queryKey: ["coordination-goals"],
    queryFn: async () =>
      unwrap<CoordinationGoalRow[]>(
        await supabase
          .from("coordination_goals")
          .select("*")
          .order("sort_order")
          .order("created_at"),
      ),
  });
}

type Table = "coordinations" | "coordination_members" | "coordination_goals";
const keyOf: Record<Table, string> = {
  coordinations: "coordinations",
  coordination_members: "coordination-members",
  coordination_goals: "coordination-goals",
};

export function useSaveCoordination(table: Table) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (row: Record<string, unknown>) => {
      const q = supabase.from(table);
      const res = row["id"]
        ? await q.update(row as never).eq("id", row["id"] as string)
        : await q.insert(row as never);
      if (res.error) throw new Error(res.error.message);
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: [keyOf[table]] }),
  });
}

export function useRemoveCoordination(table: Table) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await supabase.from(table).delete().eq("id", id);
      if (res.error) throw new Error(res.error.message);
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: [keyOf[table]] }),
  });
}

/** Excel'deki "Performans Özeti" mantığı: koordinatörlük başına durum dağılımı. */
export function summarize(goals: CoordinationGoalRow[]) {
  const total = goals.length;
  const count = (s: GoalStatus) => goals.filter((g) => g.status === s).length;
  const avg = total ? Math.round(goals.reduce((a, g) => a + (g.progress ?? 0), 0) / total) : 0;
  return {
    total,
    tamamlandi: count("tamamlandi"),
    devam: count("devam"),
    gecikti: count("gecikti"),
    baslanmadi: count("baslanmadi"),
    avg,
  };
}
