import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

const BUCKET = "class-materials";

export type MaterialRow = {
  id: string;
  class_id: string;
  title: string;
  file_path: string;
  file_name: string;
  file_size: number;
  created_at: string;
};

export function useMaterials(classId?: string | null) {
  return useQuery({
    queryKey: ["class-materials", classId],
    enabled: !!classId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("class_materials")
        .select("*")
        .eq("class_id", classId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as MaterialRow[];
    },
  });
}

export function useUploadMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ classId, file }: { classId: string; file: File }) => {
      const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `${classId}/${Date.now()}-${safe}`;
      const up = await supabase.storage.from(BUCKET).upload(path, file);
      if (up.error) throw up.error;
      const { error } = await supabase.from("class_materials").insert({
        class_id: classId,
        title: file.name,
        file_name: file.name,
        file_path: path,
        file_size: file.size,
      });
      if (error) throw error;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["class-materials"] }),
  });
}

export function useDeleteMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (row: MaterialRow) => {
      await supabase.storage.from(BUCKET).remove([row.file_path]);
      const { error } = await supabase.from("class_materials").delete().eq("id", row.id);
      if (error) throw error;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["class-materials"] }),
  });
}

/** Dosyayı geçici imzalı bağlantı ile açar. */
export async function openMaterial(path: string) {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 10);
  if (error || !data?.signedUrl) throw error ?? new Error("Bağlantı oluşturulamadı");
  window.open(data.signedUrl, "_blank", "noopener");
}
