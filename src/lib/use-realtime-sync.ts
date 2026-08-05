import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/** Tablo değişimi -> yenilenecek react-query anahtarları */
const TABLE_KEYS: Record<string, string[]> = {
  registration_applications: ["applications"],
  students: ["students", "student-self"],
  classes: ["classes"],
  class_instructors: ["class-instructors", "my-classes"],
  profiles: ["profiles"],
};

/**
 * Ön kayıt başvuruları ve sınıf atamaları için canlı abonelik.
 * Değişiklik geldiğinde ilgili sorgular otomatik yenilenir.
 */
export function useRealtimeSync(enabled = true) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    const channel = supabase.channel("minval-admin-sync");
    for (const table of Object.keys(TABLE_KEYS)) {
      channel.on("postgres_changes", { event: "*", schema: "public", table }, () => {
        for (const key of TABLE_KEYS[table] ?? []) {
          void qc.invalidateQueries({ queryKey: [key] });
        }
      });
    }
    channel.subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [enabled, qc]);
}
