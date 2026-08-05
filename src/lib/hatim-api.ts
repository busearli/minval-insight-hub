import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type HatimRow = {
  id: string;
  title: string;
  description: string;
  is_open: boolean;
  created_at: string;
};

export type HatimClaimRow = {
  id: string;
  hatim_id: string;
  cuz_no: number;
  user_id: string;
  participant_name: string;
  completed: boolean;
};

export const CUZ_NUMBERS = Array.from({ length: 30 }, (_, i) => i + 1);

export function useHatims() {
  return useQuery({
    queryKey: ["hatims"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hatims")
        .select("id, title, description, is_open, created_at")
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []) as HatimRow[];
    },
  });
}

export function useHatimClaims() {
  return useQuery({
    queryKey: ["hatim-claims"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hatim_claims")
        .select("id, hatim_id, cuz_no, user_id, participant_name, completed")
        .order("cuz_no");
      if (error) throw new Error(error.message);
      return (data ?? []) as HatimClaimRow[];
    },
  });
}

export function useSaveHatim() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (row: Record<string, unknown>) => {
      const q = supabase.from("hatims");
      const res = row["id"]
        ? await q.update(row as never).eq("id", row["id"] as string)
        : await q.insert(row as never);
      if (res.error) throw new Error(res.error.message);
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["hatims"] }),
  });
}

export function useRemoveHatim() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await supabase.from("hatims").delete().eq("id", id);
      if (res.error) throw new Error(res.error.message);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["hatims"] });
      void qc.invalidateQueries({ queryKey: ["hatim-claims"] });
    },
  });
}

export function useClaimCuz() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (row: {
      hatim_id: string;
      cuz_no: number;
      user_id: string;
      participant_name: string;
    }) => {
      const res = await supabase.from("hatim_claims").insert(row as never);
      if (res.error) throw new Error(res.error.message);
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["hatim-claims"] }),
  });
}

export function useReleaseCuz() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await supabase.from("hatim_claims").delete().eq("id", id);
      if (res.error) throw new Error(res.error.message);
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["hatim-claims"] }),
  });
}

export function useToggleClaimCompleted() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const res = await supabase.from("hatim_claims").update({ completed } as never).eq("id", id);
      if (res.error) throw new Error(res.error.message);
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["hatim-claims"] }),
  });
}
