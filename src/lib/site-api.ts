import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type ApplicationRow = Database["public"]["Tables"]["registration_applications"]["Row"];
export type SiteSettings = Database["public"]["Tables"]["site_settings"]["Row"];

export const APPLICATION_STATUSES = ["bekliyor", "onaylandi", "reddedildi"] as const;
export const applicationLabel: Record<string, string> = {
  bekliyor: "Onay Bekliyor",
  onaylandi: "Onaylandı",
  reddedildi: "Reddedildi",
};

export const defaultSettings: SiteSettings = {
  id: "main",
  instagram_url: "https://www.instagram.com/minvalakademikahve/",
  whatsapp_number: "905010641717",
  phone: "+90 501 064 17 17",
  email: "merhaba@minvalakademi.com",
  address: "1450. Sokak, ATM İş Merkezi B Blok, Kat 19, No 88, Çukurambar, Çankaya/Ankara",
  intro: "",
  pre_registration_enabled: true,
  cuz_tracking_enabled: false,
  updated_at: "",
};

export const mapsUrl = (address: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
export const telUrl = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;


export function useSiteSettings() {
  const query = useQuery({
    queryKey: ["site_settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("*").eq("id", "main").maybeSingle();
      if (error) throw new Error(error.message);
      return (data ?? defaultSettings) as SiteSettings;
    },
  });
  return { ...query, settings: query.data ?? defaultSettings };
}

export function useSaveSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (row: Partial<SiteSettings>) => {
      const { error } = await supabase
        .from("site_settings")
        .upsert({ ...row, id: "main" } as never, { onConflict: "id" });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["site_settings"] }),
  });
}

export function useApplications() {
  return useQuery({
    queryKey: ["applications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("registration_applications")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []) as ApplicationRow[];
    },
  });
}

export function useUpdateApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: { id: string } & Partial<ApplicationRow>) => {
      const { error } = await supabase
        .from("registration_applications")
        .update(patch as never)
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["applications"] });
      void qc.invalidateQueries({ queryKey: ["students"] });
    },
  });
}

export function useDeleteApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("registration_applications").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["applications"] }),
  });
}

export async function submitApplication(input: {
  full_name: string;
  phone: string;
  program_id: string;
  program_label: string;
  age_level: string;
  notes: string;
}) {
  const { error } = await supabase.from("registration_applications").insert(input as never);
  if (error) throw new Error(error.message);
}
