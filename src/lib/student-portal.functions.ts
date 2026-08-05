import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  phone: z.string().trim().min(7).max(24),
});

function normalize(phone: string) {
  return phone.replace(/\D/g, "");
}

export type StudentPortalData = {
  student: { id: string; full_name: string; status: string; registered_at: string };
  className: string;
  schedule: string;
  instructor: string;
  attendance: { session_date: string; status: string }[];
  homework: { title: string; due_date: string | null; status: string; feedback: string }[];
};

export const getStudentPortal = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }): Promise<StudentPortalData | null> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const digits = normalize(data.phone);
    if (digits.length < 7) return null;

    const { data: students, error } = await supabaseAdmin.from("students").select("*");
    if (error) throw new Error(error.message);

    const student = (students ?? []).find((s) => normalize(s.phone).endsWith(digits.slice(-10)));
    if (!student) return null;

    const [{ data: cls }, { data: records }, { data: homework }, { data: subs }] = await Promise.all([
      student.class_id
        ? supabaseAdmin.from("classes").select("*").eq("id", student.class_id).maybeSingle()
        : Promise.resolve({ data: null }),
      supabaseAdmin
        .from("attendance_records")
        .select("session_date,status")
        .eq("student_id", student.id)
        .order("session_date", { ascending: false })
        .limit(20),
      student.class_id
        ? supabaseAdmin.from("homework").select("*").eq("class_id", student.class_id)
        : Promise.resolve({ data: [] as { id: string; title: string; due_date: string | null }[] }),
      supabaseAdmin.from("homework_submissions").select("*").eq("student_id", student.id),
    ]);

    return {
      student: {
        id: student.id,
        full_name: student.full_name,
        status: student.status,
        registered_at: student.registered_at,
      },
      className: cls ? [cls.program, cls.level, cls.name].filter(Boolean).join(" · ") : "Sınıf atanmadı",
      schedule: cls?.schedule ?? "",
      instructor: cls?.instructor_name ?? "",
      attendance: (records ?? []).map((r) => ({ session_date: r.session_date, status: r.status })),
      homework: (homework ?? []).map((h) => {
        const sub = (subs ?? []).find((s) => s.homework_id === h.id);
        return {
          title: h.title,
          due_date: h.due_date ?? null,
          status: sub?.status ?? "edilmedi",
          feedback: sub?.feedback ?? "",
        };
      }),
    };
  });
