import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type AnnouncementRow = Database["public"]["Tables"]["announcements"]["Row"];

export function useAnnouncements() {
  return useQuery({
    queryKey: ["announcements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []) as AnnouncementRow[];
    },
  });
}

export function useSaveAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (row: { id?: string; title: string; body: string; class_id: string | null }) => {
      const q = supabase.from("announcements");
      const res = row.id
        ? await q.update(row as never).eq("id", row.id)
        : await q.insert(row as never);
      if (res.error) throw new Error(res.error.message);
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["announcements"] }),
  });
}

export function useDeleteAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("announcements").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["announcements"] }),
  });
}
