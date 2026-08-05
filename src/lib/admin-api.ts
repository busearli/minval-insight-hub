import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type ClassRow = Database["public"]["Tables"]["classes"]["Row"];
export type StudentRow = Database["public"]["Tables"]["students"]["Row"];
export type AttendanceRow = Database["public"]["Tables"]["attendance_records"]["Row"];
export type HomeworkRow = Database["public"]["Tables"]["homework"]["Row"];
export type SubmissionRow = Database["public"]["Tables"]["homework_submissions"]["Row"];

export const ATTENDANCE_STATUSES = ["var", "yok", "izinli", "gec"] as const;
export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];
export const attendanceLabel: Record<string, string> = {
  var: "Var",
  yok: "Yok",
  izinli: "İzinli",
  gec: "Geç",
};

export const SUBMISSION_STATUSES = ["edildi", "edilmedi", "gec"] as const;
export const submissionLabel: Record<string, string> = {
  edildi: "Teslim Edildi",
  edilmedi: "Edilmedi",
  gec: "Geç Teslim",
};

function throwIf<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
}

export function useClasses() {
  return useQuery({
    queryKey: ["classes"],
    queryFn: async () =>
      throwIf(await supabase.from("classes").select("*").order("created_at")) as ClassRow[],
  });
}

export function useStudents() {
  return useQuery({
    queryKey: ["students"],
    queryFn: async () =>
      throwIf(await supabase.from("students").select("*").order("full_name")) as StudentRow[],
  });
}

export function useAttendance() {
  return useQuery({
    queryKey: ["attendance"],
    queryFn: async () =>
      throwIf(await supabase.from("attendance_records").select("*")) as AttendanceRow[],
  });
}

export function useHomework() {
  return useQuery({
    queryKey: ["homework"],
    queryFn: async () =>
      throwIf(
        await supabase.from("homework").select("*").order("due_date", { ascending: true }),
      ) as HomeworkRow[],
  });
}

export function useSubmissions() {
  return useQuery({
    queryKey: ["submissions"],
    queryFn: async () =>
      throwIf(await supabase.from("homework_submissions").select("*")) as SubmissionRow[],
  });
}

type TableName = "classes" | "students" | "attendance_records" | "homework" | "homework_submissions";
const keyOf: Record<TableName, string> = {
  classes: "classes",
  students: "students",
  attendance_records: "attendance",
  homework: "homework",
  homework_submissions: "submissions",
};

export function useSave(table: TableName) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (row: Record<string, unknown>) => {
      const q = supabase.from(table);
      const res = row.id
        ? await q.update(row as never).eq("id", row.id as string)
        : await q.insert(row as never);
      if (res.error) throw new Error(res.error.message);
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: [keyOf[table]] }),
  });
}

export function useUpsert(table: TableName, onConflict: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (row: Record<string, unknown>) => {
      const res = await supabase.from(table).upsert(row as never, { onConflict });
      if (res.error) throw new Error(res.error.message);
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: [keyOf[table]] }),
  });
}

export function useRemove(table: TableName) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await supabase.from(table).delete().eq("id", id);
      if (res.error) throw new Error(res.error.message);
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: [keyOf[table]] }),
  });
}

export function classLabel(c: ClassRow) {
  return [c.program, c.level, c.name].filter(Boolean).join(" · ");
}
