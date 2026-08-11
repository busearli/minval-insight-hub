import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import {
  programs as staticPrograms,
  timetable as staticTimetable,
  type Program,
  type ProgramCategory,
  type TimetableEntry,
  weekDays,
} from "@/lib/minval-programs";

export type ProgramRow = {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  category: string;
  category_label: string;
  audience: string;
  fee: string;
  paid: boolean;
  soon: boolean;
  quote: string;
  description: string;
  instructor: string;
  schedule: string;
  badges_json: unknown;
  groups_json: unknown;
  books_json: unknown;
  curriculum_json: unknown;
  is_published: boolean;
  sort_order: number;
};

export type TimetableRow = {
  id: string;
  day: string;
  time: string;
  program_id: string | null;
  group_label: string;
  sort_order: number;
};

function list<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

export function rowToProgram(r: ProgramRow): Program {
  return {
    id: r.id,
    emoji: r.emoji,
    title: r.title,
    subtitle: r.subtitle,
    category: (r.category || "risale") as ProgramCategory,
    categoryLabel: r.category_label || r.subtitle,
    audience: r.audience,
    fee: r.fee,
    paid: r.paid,
    soon: r.soon,
    badges: list<string>(r.badges_json),
    quote: r.quote,
    description: r.description,
    groups: list<{ label: string; items: string[] }>(r.groups_json),
    instructor: r.instructor,
    schedule: r.schedule,
    books: list<string>(r.books_json),
    curriculum: list<{ week: string; topic: string }>(r.curriculum_json),
  };
}

/** Yayındaki programlar (public). Veri yoksa statik listeye düşer. */
export function usePrograms() {
  const query = useQuery({
    queryKey: ["site_programs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_programs")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw new Error(error.message);
      return (data ?? []) as unknown as ProgramRow[];
    },
  });
  const rows = query.data ?? [];
  const published = rows.filter((r) => r.is_published).map(rowToProgram);
  return {
    ...query,
    rows,
    programs: rows.length > 0 ? published : staticPrograms,
  };
}

export function useSaveProgram() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (row: Partial<ProgramRow> & { id: string }) => {
      const { error } = await supabase
        .from("site_programs")
        .upsert(row as never, { onConflict: "id" });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["site_programs"] }),
  });
}

export function useDeleteProgram() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("site_programs").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["site_programs"] });
      void qc.invalidateQueries({ queryKey: ["site_timetable"] });
    },
  });
}

export function useTimetable() {
  const query = useQuery({
    queryKey: ["site_timetable"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_timetable")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw new Error(error.message);
      return (data ?? []) as unknown as TimetableRow[];
    },
  });
  const rows = query.data ?? [];
  const entries: TimetableEntry[] =
    rows.length > 0
      ? rows.map((r) => ({
          day: (weekDays.includes(r.day as never) ? r.day : "Pazartesi") as TimetableEntry["day"],
          time: r.time,
          programId: r.program_id ?? "",
          group: r.group_label,
        }))
      : staticTimetable;
  return { ...query, rows, entries };
}

export function useSaveTimetableEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (row: Partial<TimetableRow>) => {
      const { error } = await supabase.from("site_timetable").upsert(row as never, { onConflict: "id" });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["site_timetable"] }),
  });
}

export function useDeleteTimetableEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("site_timetable").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["site_timetable"] }),
  });
}
