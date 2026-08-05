import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { CalendarCheck, LogOut } from "lucide-react";

import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getStudentPortal } from "@/lib/student-portal.functions";
import { attendanceLabel, submissionLabel } from "@/lib/admin-api";

export const Route = createFileRoute("/ogrenci")({
  head: () => ({
    meta: [
      { title: "Öğrenci Paneli — Minval Akademi | Kahve" },
      {
        name: "description",
        content: "Kayıtlı katılımcılar için sınıf bilgisi, yoklama durumu ve ödev takibi.",
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

function StudentPortalPage() {
  const [phone, setPhone] = useState<string | null>(null);

  useEffect(() => {
    setPhone(localStorage.getItem("minval_student_phone"));
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["student-portal", phone],
    enabled: !!phone,
    queryFn: () => getStudentPortal({ data: { phone: phone! } }),
  });

  const statusTone: Record<string, string> = {
    var: "bg-present/15 text-foreground",
    yok: "bg-absent/15 text-foreground",
    izinli: "bg-secondary text-secondary-foreground",
    gec: "bg-late/15 text-foreground",
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-5 py-14">
        {!phone && (
          <div className="card-soft border-accent/40 p-8 text-center">
            <h1 className="text-2xl text-foreground">Öğrenci Paneli</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Devam etmek için üstteki “Giriş Yap” butonundan telefon numaranızla giriş yapın.
            </p>
            <Link to="/" className="mt-6 inline-block text-[13px] text-primary hover:underline">
              Ana sayfaya dön
            </Link>
          </div>
        )}

        {phone && isLoading && <p className="text-sm text-muted-foreground">Yükleniyor…</p>}

        {phone && !isLoading && !data && (
          <div className="card-soft border-accent/40 p-8">
            <p className="text-sm text-muted-foreground">Kayıt bulunamadı.</p>
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
                onClick={() => {
                  localStorage.removeItem("minval_student_phone");
                  setPhone(null);
                }}
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
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
