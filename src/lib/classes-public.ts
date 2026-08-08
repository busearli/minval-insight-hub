import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export type PublicClass = {
  id: string;
  program: string;
  name: string;
  level: string;
  schedule: string;
};

/** Kayıt formunda gösterilecek aktif sınıf listesi (girişsiz de okunabilir). */
export function usePublicClasses() {
  return useQuery({
    queryKey: ["public-classes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("classes")
        .select("id, program, name, level, schedule")
        .order("program");
      if (error) throw error;
      return (data ?? []) as PublicClass[];
    },
  });
}

export function publicClassLabel(c: PublicClass) {
  return [c.program, c.name, c.level].filter(Boolean).join(" · ");
}
