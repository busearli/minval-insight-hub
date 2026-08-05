import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarCheck, LogOut, Sparkles } from "lucide-react";

import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { attendanceLabel, classLabel, cuzLabel, submissionLabel } from "@/lib/admin-api";
import { useSiteSettings } from "@/lib/site-api";

export const Route = createFileRoute("/ogrenci")({
  head: () => ({
    meta: [
      { title: "Öğrenci Paneli — Minval Akademi | Kahve" },
      {
        name: "description",
        content: "Kayıtlı katılımcılar için sınıf bilgisi, yoklama durumu, ödev ve cüz takibi.",
      },
      { property: "og:title", content: "Öğrenci Paneli — Minval Akademi" },
      { property: "og:description", content: "Sınıfınız, yoklamanız ve ödevleriniz tek ekranda." },
      { name: "robots", content: "noindex" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StudentPortalPage,
});

const statusTone: Record<string, string> = {
  var: "bg-present/15 text-foreground",
  yok: "bg-absent/15 text-foreground",
  izinli: "bg-secondary text-secondary-foreground",
  gec: "bg-late/15 text-foreground",
};

function StudentPortalPage() {
  const { user, profile, loading, signOut } = useAuth();
  const { settings } = useSiteSettings();

  const { data, isLoading } = useQuery({
    queryKey: ["student-self", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data: student } = await supabase
        .from("students")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (!student) return null;

      const [{ data: cls }, { data: attendance }, { data: homework }, { data: subs }, { data: cuz }] =
        await Promise.all([
          student.class_id
            ? supabase.from("classes").select("*").eq("id", student.class_id).maybeSingle()
            : Promise.resolve({ data: null }),
          supabase
            .from("attendance_records")
            .select("session_date,status")
            .eq("student_id", student.id)
            .order("session_date", { ascending: false })
            .limit(20),
          student.class_id
            ? supabase.from("homework").select("*").eq("class_id", student.class_id)
            : Promise.resolve({ data: [] as { id: string; title: string; due_date: string | null }[] }),
          supabase.from("homework_submissions").select("*").eq("student_id", student.id),
          supabase.from("cuz_records").select("*").eq("student_id", student.id).order("cuz_no"),
        ]);

      return {
        student,
        className: cls ? classLabel(cls) : "Sınıf atanmadı",
        schedule: cls?.schedule ?? "",
        instructor: cls?.instructor_name ?? "",
        attendance: attendance ?? [],
        homework: (homework ?? []).map((h) => {
          const sub = (subs ?? []).find((s) => s.homework_id === h.id);
          return {
            title: h.title,
            due_date: h.due_date ?? null,
            status: sub?.status ?? "edilmedi",
            feedback: sub?.feedback ?? "",
          };
        }),
        cuz: (cuz ?? []).filter((c) => c.status !== "baslanmadi"),
      };
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-5 py-14">
        {!loading && !user && (
          <div className="card-soft border-accent/40 p-8 text-center">
            <h1 className="text-2xl text-foreground">Öğrenci Paneli</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Devam etmek için üstteki “Giriş Yap” butonundan hesabınıza giriş yapın.
            </p>
            <Link to="/" className="mt-6 inline-block text-[13px] text-primary hover:underline">
              Ana sayfaya dön
            </Link>
          </div>
        )}

        {user && isLoading && <p className="text-sm text-muted-foreground">Yükleniyor…</p>}

        {user && !isLoading && !data && (
          <div className="card-soft border-accent/40 p-8 text-center">
            <h1 className="text-2xl text-foreground">
              Hoş geldiniz{profile?.name ? `, ${profile.name}` : ""}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Kayıt talebiniz alındı. Yöneticilerimiz tarafından sınıf atamanız yapıldıktan sonra
              paneliniz aktifleşecektir.
            </p>
            <button
              onClick={() => void signOut()}
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-[12px] text-muted-foreground hover:text-primary"
            >
              <LogOut className="h-3.5 w-3.5" /> Çıkış
            </button>
          </div>
        )}

        {data && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="eyebrow">Öğrenci Paneli</p>
                <h1 className="mt-2 text-3xl text-foreground">
                  Hoş geldiniz, {data.student.full_name}
                </h1>
              </div>
              <button
                onClick={() => void signOut()}
                className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-[12px] text-muted-foreground hover:text-primary"
              >
                <LogOut className="h-3.5 w-3.5" /> Çıkış
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ["Sınıfım", data.className],
                ["Ders Saati", data.schedule || "—"],
                ["Eğitmen", data.instructor || "—"],
              ].map(([l, v]) => (
                <div key={l} className="card-soft border-accent/40 p-6">
                  <p className="eyebrow">{l}</p>
                  <p className="mt-2 text-sm text-foreground">{v}</p>
                </div>
              ))}
            </div>

            <div className="card-soft border-accent/40 p-6">
              <h2 className="flex items-center gap-2 text-lg text-foreground">
                <CalendarCheck className="h-4 w-4" /> Yoklama Durumum
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {data.attendance.length === 0 && (
                  <p className="text-sm text-muted-foreground">Henüz yoklama kaydı yok.</p>
                )}
                {data.attendance.map((r, i) => (
                  <span
                    key={i}
                    className={`rounded-full px-3 py-1 text-[12px] ${statusTone[r.status] ?? "bg-secondary"}`}
                  >
                    {r.session_date} · {attendanceLabel[r.status] ?? r.status}
                  </span>
                ))}
              </div>
            </div>

            <div className="card-soft border-accent/40 p-6">
              <h2 className="text-lg text-foreground">Ödevlerim</h2>
              <ul className="mt-4 space-y-3">
                {data.homework.length === 0 && (
                  <li className="text-sm text-muted-foreground">Atanmış ödev bulunmuyor.</li>
                )}
                {data.homework.map((h, i) => (
                  <li key={i} className="rounded-lg border border-border px-4 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm text-foreground">{h.title}</span>
                      <span className="text-[12px] text-muted-foreground">
                        {h.due_date ? `Son tarih: ${h.due_date}` : "Tarih belirtilmedi"} ·{" "}
                        {submissionLabel[h.status] ?? h.status}
                      </span>
                    </div>
                    {h.feedback && (
                      <p className="mt-2 text-[13px] text-muted-foreground">{h.feedback}</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {settings.cuz_tracking_enabled && (
              <div className="card-soft border-accent/40 p-6">
                <h2 className="flex items-center gap-2 text-lg text-foreground">
                  <Sparkles className="h-4 w-4" /> Cüz & Ezber İlerlemem
                </h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {data.cuz.length === 0 && (
                    <p className="text-sm text-muted-foreground">Henüz cüz kaydı bulunmuyor.</p>
                  )}
                  {data.cuz.map((c) => (
                    <span
                      key={c.id}
                      className="rounded-full bg-secondary px-3 py-1 text-[12px] text-secondary-foreground"
                    >
                      {c.cuz_no}. Cüz · {cuzLabel[c.status] ?? c.status} · {c.pages_memorized} sayfa
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
