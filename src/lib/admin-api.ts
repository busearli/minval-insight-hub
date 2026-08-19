import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { purgeLocalClasses } from "@/lib/local-classes";
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
  return useQuery<ClassRow[]>({
    queryKey: ["classes"],
    queryFn: async (): Promise<ClassRow[]> => {
      // Eski sürümden kalan yerel (hayalet) sınıf kayıtlarını temizle.
      purgeLocalClasses();
      return throwIf(
        await supabase.from("classes").select("*").order("created_at"),
      ) as ClassRow[];
    },
  });
}

/** Sınıf kaydı: doğrudan veritabanına yazar, hata olursa yüzeye çıkarır. */
export function useSaveClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (row: Record<string, unknown>): Promise<{ local: boolean; id: string }> => {
      const q = supabase.from("classes");
      const res = row["id"]
        ? await q.update(row as never).eq("id", row["id"] as string).select("id").single()
        : await q.insert(row as never).select("id").single();
      if (res.error) throw new Error(res.error.message);
      return { local: false, id: (res.data as { id: string }).id };
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["classes"] });
      void qc.invalidateQueries({ queryKey: ["class-instructors"] });
    },
  });
}


export function useRemoveClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await supabase.from("classes").delete().eq("id", id);
      if (res.error) throw new Error(res.error.message);
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["classes"] }),
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
      const res = row["id"]
        ? await q.update(row as never).eq("id", row["id"] as string)
        : await q.insert(row as never);
      if (res.error) throw new Error(res.error.message);
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: [keyOf[table]] }),
  });
}

export function useUpsert(table: TableName, onConflict: string) {
  const qc = useQueryClient();
  const key = [keyOf[table]];
  return useMutation({
    mutationFn: async (row: Record<string, unknown>) => {
      const res = await supabase.from(table).upsert(row as never, { onConflict });
      if (res.error) throw new Error(res.error.message);
    },
    // Yoklama gibi hızlı tıklamalarda arayüz anında güncellensin.
    onMutate: async (row: Record<string, unknown>) => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<Record<string, unknown>[]>(key);
      if (previous && table === "attendance_records") {
        const idx = previous.findIndex(
          (r) => r["student_id"] === row["student_id"] && r["session_date"] === row["session_date"],
        );
        const next = [...previous];
        if (idx >= 0) next[idx] = { ...next[idx], ...row };
        else next.push({ id: `temp-${Date.now()}`, ...row });
        qc.setQueryData(key, next);
      }
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) qc.setQueryData(key, ctx.previous);
    },
    onSettled: () => void qc.invalidateQueries({ queryKey: key }),
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

/* ---------- Kullanıcı & yetki yönetimi ---------- */

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type AppRole = "super_admin" | "admin" | "instructor" | "student";

export function useProfiles() {
  return useQuery({
    queryKey: ["profiles"],
    queryFn: async () =>
      throwIf(await supabase.from("profiles").select("*").order("created_at")) as ProfileRow[],
  });
}

export function useAllRoles() {
  return useQuery({
    queryKey: ["all-roles"],
    queryFn: async () =>
      throwIf(await supabase.from("user_roles").select("id, user_id, role")) as {
        id: string;
        user_id: string;
        role: AppRole;
      }[],
  });
}

export function useGrantRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ user_id, role }: { user_id: string; role: AppRole }) => {
      const res = await supabase.from("user_roles").insert({ user_id, role } as never);
      if (res.error) throw new Error(res.error.message);
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["all-roles"] }),
  });
}

export function useRevokeRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ user_id, role }: { user_id: string; role: AppRole }) => {
      const res = await supabase.from("user_roles").delete().eq("user_id", user_id).eq("role", role);
      if (res.error) throw new Error(res.error.message);
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["all-roles"] }),
  });
}

export function useSetProfileStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ user_id, status }: { user_id: string; status: string }) => {
      const res = await supabase.from("profiles").update({ status } as never).eq("user_id", user_id);
      if (res.error) throw new Error(res.error.message);
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["profiles"] }),
  });
}

/* ---------- Sınıf – eğitmen atamaları ---------- */

export function useClassInstructors() {
  return useQuery({
    queryKey: ["class-instructors"],
    queryFn: async () =>
      throwIf(await supabase.from("class_instructors").select("id, class_id, user_id")) as {
        id: string;
        class_id: string;
        user_id: string;
      }[],
  });
}

export function useAssignInstructor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ class_id, user_id }: { class_id: string; user_id: string }) => {
      const res = await supabase.from("class_instructors").insert({ class_id, user_id } as never);
      if (res.error) throw new Error(res.error.message);
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["class-instructors"] }),
  });
}

export function useUnassignInstructor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await supabase.from("class_instructors").delete().eq("id", id);
      if (res.error) throw new Error(res.error.message);
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["class-instructors"] }),
  });
}

/* ---------- Cüz & ezber takibi ---------- */

export type CuzRow = Database["public"]["Tables"]["cuz_records"]["Row"];

export const CUZ_STATUSES = ["baslanmadi", "devam", "tamamlandi"] as const;
export const cuzLabel: Record<string, string> = {
  baslanmadi: "Başlanmadı",
  devam: "Devam Ediyor",
  tamamlandi: "Tamamlandı",
};

export function useCuzRecords() {
  return useQuery({
    queryKey: ["cuz"],
    queryFn: async () =>
      throwIf(await supabase.from("cuz_records").select("*").order("cuz_no")) as CuzRow[],
  });
}

export function useSaveCuz() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (row: {
      student_id: string;
      cuz_no: number;
      status: string;
      pages_memorized?: number;
      feedback?: string;
    }) => {
      const res = await supabase
        .from("cuz_records")
        .upsert(row as never, { onConflict: "student_id,cuz_no" });
      if (res.error) throw new Error(res.error.message);
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["cuz"] }),
  });
}

