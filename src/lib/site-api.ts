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
  hero_eyebrow: "Minval Akademi | Kahve",
  hero_title: "İlim, Hikmet ve Güzel Ahlak Ekseninde Bir Gelecek",
  hero_subtitle:
    "Maneviyat, kültür ve sanatı bir arada yaşatmayı hedefleyen bağımsız eğitim ve gönül merkezi.",
  about_quote:
    "Minval Akademi, ilim, hikmet ve güzel ahlak ekseninde; insanın aklına, kalbine ve hayatına dokunmayı amaçlayan bağımsız bir ilim, kültür ve gençlik hareketidir.",
  programs_heading: "Açık okuma halkalarımız",
  schedule_heading: "Hangi grup, hangi gün?",
  cta_title: "Ön kayıt formu ile başlayın",
  cta_text:
    "Formu doldurun; kontenjan durumuna göre kurumsal WhatsApp hattımızdan sizinle iletişime geçelim.",
  programs_section_enabled: true,
  schedule_section_enabled: true,
  hero_primary_label: "Programlarımızı Keşfedin",
  hero_secondary_label: "Ön Kayıt Ol",
  about_eyebrow: "Hakkımızda",
  about_heading: "",
  about_link_label: "Daha fazlası",
  about_section_enabled: true,
  programs_eyebrow: "Programlarımız",
  programs_description: "",
  programs_button_label: "Tüm Programlar",
  schedule_eyebrow: "Haftalık Program",
  schedule_description: "",
  cta_button_label: "Ön Kayıt Formu",
  cta_section_enabled: true,
  stats_heading: "Sayılarla Minval",
  stats_section_enabled: false,
  testimonials_heading: "Katılımcılarımız ne diyor?",
  testimonials_section_enabled: false,
  faq_heading: "Sıkça Sorulan Sorular",
  faq_section_enabled: false,
  principles_json: [],
  stats_json: [],
  testimonials_json: [],
  faq_json: [],
};

export type PrincipleItem = { title: string; text: string };
export type StatItem = { value: string; label: string };
export type TestimonialItem = { name: string; role: string; text: string };
export type FaqItem = { question: string; answer: string };

/** jsonb sütunlarını güvenli biçimde listeye çevirir. */
export function asList<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

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
  email: string;
  phone: string;
  program_id: string;
  program_label: string;
  age_level: string;
  notes: string;
}) {
  const { error } = await supabase.from("registration_applications").insert(input as never);
  if (error) throw new Error(error.message);
}
