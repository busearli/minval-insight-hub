import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  Clock,
  GraduationCap,
  LayoutGrid,
  LogOut,
  Megaphone,
  Sparkles,
  User,
} from "lucide-react";

import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { StudentSessionBars } from "@/components/SessionAttendanceChart";
import { ClassMaterials } from "@/components/ClassMaterials";

import { HatimBoard } from "@/components/HatimBoard";
import { attendanceLabel, classLabel, cuzLabel, submissionLabel } from "@/lib/admin-api";
import { useSiteSettings } from "@/lib/site-api";
import { useRealtimeSync } from "@/lib/use-realtime-sync";

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

type TabId =
  | "genel"
  | "yoklama"
  | "odev"
  | "duyuru"
  | "cuz"
  | "koordinasyon"
  | "etkinlik"
  | "profil";

function StudentPortalPage() {
  const { user, profile, loading, signOut } = useAuth();
  const { settings } = useSiteSettings();
  useRealtimeSync(!!user);
  const [tab, setTab] = useState<TabId>("genel");

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
            .limit(40),
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
            id: h.id,
            student_id: student.id,
            submission_text: sub?.submission_text ?? "",
            title: h.title,
            description: (h as { description?: string }).description ?? "",
            due_date: h.due_date ?? null,
            status: sub?.status ?? "edilmedi",
            feedback: sub?.feedback ?? "",
          };
        }),
        cuz: (cuz ?? []).filter((c) => c.status !== "baslanmadi"),
      };
    },
  });

  const { data: announcements = [] } = useQuery({
    queryKey: ["student-announcements", data?.student.class_id],
    enabled: !!user?.id && !!data,
    queryFn: async () => {
      const { data: rows } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      return (rows ?? []).filter(
        (a) => !a.class_id || a.class_id === (data?.student.class_id ?? null),
      );
    },
  });

  const stats = useMemo(() => {
    const att = data?.attendance ?? [];
    const present = att.filter((r) => r.status === "var").length;
    const rate = att.length ? Math.round((present / att.length) * 100) : 0;
    const hw = data?.homework ?? [];
    const done = hw.filter((h) => h.status !== "edilmedi").length;
    const pending = hw.filter((h) => h.status === "edilmedi");
    const upcoming = [...pending]
      .filter((h) => h.due_date)
      .sort((a, b) => (a.due_date! < b.due_date! ? -1 : 1))[0];
    const pages = (data?.cuz ?? []).reduce((s, c) => s + (c.pages_memorized ?? 0), 0);
    return { att, present, rate, hw, done, pending, upcoming, pages };
  }, [data]);

  const tabs: { id: TabId; label: string; icon: typeof LayoutGrid }[] = [
    { id: "genel", label: "Genel Bakış", icon: LayoutGrid },
    { id: "yoklama", label: "Yoklamam", icon: CalendarCheck },
    { id: "odev", label: "Ödevlerim", icon: BookOpen },
    { id: "duyuru", label: "Duyurular", icon: Megaphone },
    ...(settings.cuz_tracking_enabled
      ? [{ id: "cuz" as TabId, label: "Cüz & Ezber", icon: Sparkles }]
      : []),
    { id: "profil", label: "Profilim", icon: User },
  ];

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
                <p className="mt-1 text-[13px] text-muted-foreground">
                  {data.className}
                  {data.schedule ? ` · ${data.schedule}` : ""}
                </p>
              </div>
              <button
                onClick={() => void signOut()}
                className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-[12px] text-muted-foreground hover:text-primary"
              >
                <LogOut className="h-3.5 w-3.5" /> Çıkış
              </button>
            </div>

            <div className="flex flex-wrap gap-2 border-b border-border pb-3">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] transition ${
                    tab === t.id
                      ? "bg-primary text-primary-foreground"
                      : "border border-border text-muted-foreground hover:text-primary"
                  }`}
                >
                  <t.icon className="h-3.5 w-3.5" /> {t.label}
                </button>
              ))}
            </div>

            {tab === "genel" && (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <StatCard label="Sınıfım" value={data.className} icon={GraduationCap} />
                  <StatCard label="Ders Günü & Saati" value={data.schedule || "—"} icon={Clock} />
                  <StatCard
                    label="Devam Oranım"
                    value={`%${stats.rate}`}
                    icon={CalendarCheck}
                    progress={stats.rate}
                  />
                  <StatCard
                    label="Teslim Edilen Ödev"
                    value={`${stats.done}/${stats.hw.length}`}
                    icon={CheckCircle2}
                    progress={stats.hw.length ? (stats.done / stats.hw.length) * 100 : 0}
                  />
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="card-soft border-accent/40 p-6">
                    <p className="eyebrow">Yaklaşan Ödev</p>
                    {stats.upcoming ? (
                      <>
                        <p className="mt-2 text-sm text-foreground">{stats.upcoming.title}</p>
                        <p className="mt-1 text-[12px] text-muted-foreground">
                          Son tarih: {stats.upcoming.due_date}
                        </p>
                        <button
                          onClick={() => setTab("odev")}
                          className="mt-4 rounded-full bg-primary px-4 py-2 text-[12px] text-primary-foreground"
                        >
                          Ödevi Teslim Et
                        </button>
                      </>
                    ) : (
                      <p className="mt-2 text-sm text-muted-foreground">
                        Bekleyen ödeviniz bulunmuyor. 🌿
                      </p>
                    )}
                  </div>

                  <div className="card-soft border-accent/40 p-6">
                    <p className="eyebrow">Son Duyuru</p>
                    {announcements[0] ? (
                      <>
                        <p className="mt-2 text-sm text-foreground">{announcements[0].title}</p>
                        <p className="mt-1 line-clamp-3 text-[13px] text-muted-foreground">
                          {announcements[0].body}
                        </p>
                        <button
                          onClick={() => setTab("duyuru")}
                          className="mt-4 text-[12px] text-primary hover:underline"
                        >
                          Tüm duyurular →
                        </button>
                      </>
                    ) : (
                      <p className="mt-2 text-sm text-muted-foreground">Henüz duyuru yok.</p>
                    )}
                  </div>
                </div>

                <StudentSessionBars records={stats.att} title="Ders Bazlı Devamım" />

                <ClassMaterials classId={data?.student.class_id ?? null} />


                <div className="card-soft border-accent/40 p-6">
                  <p className="eyebrow">Son Yoklamalarım</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {stats.att.length === 0 && (
                      <p className="text-sm text-muted-foreground">Henüz yoklama kaydı yok.</p>
                    )}
                    {stats.att.slice(0, 8).map((r, i) => (
                      <span
                        key={i}
                        className={`rounded-full px-3 py-1 text-[12px] ${statusTone[r.status] ?? "bg-secondary"}`}
                      >
                        {r.session_date} · {attendanceLabel[r.status] ?? r.status}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {tab === "yoklama" && (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <StatCard
                    label="Toplam Oturum"
                    value={String(stats.att.length)}
                    icon={CalendarCheck}
                  />
                  <StatCard label="Katıldığım" value={String(stats.present)} icon={CheckCircle2} />
                  <StatCard
                    label="Devam Oranı"
                    value={`%${stats.rate}`}
                    icon={GraduationCap}
                    progress={stats.rate}
                  />
                </div>
                <StudentSessionBars records={stats.att} />

                <div className="card-soft border-accent/40 p-6">
                  <h2 className="text-lg text-foreground">Yoklama Geçmişi</h2>
                  <ul className="mt-4 divide-y divide-border">
                    {stats.att.length === 0 && (
                      <li className="py-3 text-sm text-muted-foreground">Kayıt bulunmuyor.</li>
                    )}
                    {stats.att.map((r, i) => (
                      <li key={i} className="flex items-center justify-between py-3 text-sm">
                        <span className="text-foreground">{r.session_date}</span>
                        <span
                          className={`rounded-full px-3 py-1 text-[12px] ${statusTone[r.status] ?? "bg-secondary"}`}
                        >
                          {attendanceLabel[r.status] ?? r.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {tab === "odev" && (
              <div className="card-soft border-accent/40 p-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-lg text-foreground">Ödevlerim</h2>
                  <span className="rounded-full bg-secondary px-3 py-1 text-[12px] text-secondary-foreground">
                    {stats.pending.length} bekleyen · {stats.done} teslim
                  </span>
                </div>
                <ul className="mt-4 space-y-3">
                  {data.homework.length === 0 && (
                    <li className="text-sm text-muted-foreground">Atanmış ödev bulunmuyor.</li>
                  )}
                  {data.homework.map((h) => (
                    <li key={h.id} className="rounded-lg border border-border px-4 py-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm text-foreground">{h.title}</span>
                        <span
                          className={`rounded-full px-3 py-1 text-[12px] ${
                            h.status === "edilmedi"
                              ? "bg-absent/15 text-foreground"
                              : "bg-present/15 text-foreground"
                          }`}
                        >
                          {submissionLabel[h.status] ?? h.status}
                        </span>
                      </div>
                      {h.description && (
                        <p className="mt-1 text-[13px] text-muted-foreground">{h.description}</p>
                      )}
                      <p className="mt-1 text-[12px] text-muted-foreground">
                        {h.due_date ? `Son tarih: ${h.due_date}` : "Tarih belirtilmedi"}
                      </p>
                      {h.feedback && (
                        <p className="mt-2 rounded-md bg-secondary px-3 py-2 text-[13px] text-secondary-foreground">
                          Eğitmen notu: {h.feedback}
                        </p>
                      )}
                      <SubmitBox
                        homeworkId={h.id}
                        studentId={h.student_id}
                        initial={h.submission_text}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {tab === "duyuru" && (
              <div className="card-soft border-accent/40 p-6">
                <h2 className="flex items-center gap-2 text-lg text-foreground">
                  <Megaphone className="h-4 w-4" /> Akademi Duyuruları
                </h2>
                <ul className="mt-4 space-y-3">
                  {announcements.length === 0 && (
                    <li className="text-sm text-muted-foreground">Henüz duyuru yok.</li>
                  )}
                  {announcements.map((a) => (
                    <li key={a.id} className="rounded-lg border border-border px-4 py-3">
                      <p className="text-sm text-foreground">{a.title}</p>
                      {a.body && <p className="mt-1 text-[13px] text-muted-foreground">{a.body}</p>}
                      <p className="mt-1 text-[12px] text-muted-foreground">
                        {a.created_at.slice(0, 10)}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {tab === "cuz" && settings.cuz_tracking_enabled && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <h2 className="text-lg text-foreground">Hatim — Cüz Seçimi</h2>
                  <p className="text-[13px] text-muted-foreground">
                    Açık hatimlerde boş bir cüzü seçerek listeye adınızı yazdırabilirsiniz.
                  </p>
                  <HatimBoard userId={user?.id} participantName={profile?.name ?? ""} />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <StatCard
                    label="Tamamlanan Cüz"
                    value={String(data.cuz.filter((c) => c.status === "tamamlandi").length)}
                    icon={Sparkles}
                  />
                  <StatCard
                    label="Ezberlenen Sayfa"
                    value={String(stats.pages)}
                    icon={BookOpen}
                  />
                </div>
                <div className="card-soft border-accent/40 p-6">
                  <h2 className="text-lg text-foreground">Cüz & Ezber İlerlemem</h2>
                  <ul className="mt-4 space-y-3">
                    {data.cuz.length === 0 && (
                      <li className="text-sm text-muted-foreground">Henüz cüz kaydı bulunmuyor.</li>
                    )}
                    {data.cuz.map((c) => (
                      <li key={c.id} className="rounded-lg border border-border px-4 py-3">
                        <div className="flex items-center justify-between gap-2 text-sm">
                          <span className="text-foreground">{c.cuz_no}. Cüz</span>
                          <span className="text-[12px] text-muted-foreground">
                            {cuzLabel[c.status] ?? c.status} · {c.pages_memorized} sayfa
                          </span>
                        </div>
                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                          <div
                            className="h-full bg-primary"
                            style={{
                              width: `${Math.min(100, ((c.pages_memorized ?? 0) / 20) * 100)}%`,
                            }}
                          />
                        </div>
                        {c.feedback && (
                          <p className="mt-2 text-[13px] text-muted-foreground">{c.feedback}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {tab === "profil" && (
              <div className="card-soft border-accent/40 p-6">
                <h2 className="flex items-center gap-2 text-lg text-foreground">
                  <User className="h-4 w-4" /> Profil Bilgilerim
                </h2>
                <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                  {[
                    ["Ad Soyad", data.student.full_name],
                    ["E-posta", user?.email ?? "—"],
                    ["Telefon", data.student.phone || "—"],
                    ["Sınıf", data.className],
                    ["Eğitmen", data.instructor || "—"],
                    ["Kayıt Tarihi", data.student.registered_at ?? "—"],
                  ].map(([l, v]) => (
                    <div key={l} className="rounded-lg border border-border px-4 py-3">
                      <dt className="eyebrow">{l}</dt>
                      <dd className="mt-1 text-sm text-foreground">{v}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-4 text-[12px] text-muted-foreground">
                  Bilgilerinizde bir hata varsa akademi yönetimiyle iletişime geçiniz.
                </p>
              </div>
            )}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  progress,
}: {
  label: string;
  value: string;
  icon: typeof LayoutGrid;
  progress?: number;
}) {
  return (
    <div className="card-soft border-accent/40 p-6">
      <div className="flex items-center justify-between">
        <p className="eyebrow">{label}</p>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <p className="mt-2 text-sm text-foreground">{value}</p>
      {progress !== undefined && (
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div className="h-full bg-primary" style={{ width: `${Math.min(100, progress)}%` }} />
        </div>
      )}
    </div>
  );
}

function SubmitBox({
  homeworkId,
  studentId,
  initial,
}: {
  homeworkId: string;
  studentId: string;
  initial: string;
}) {
  const qc = useQueryClient();
  const [text, setText] = useState(initial);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!text.trim()) {
      toast.error("Lütfen teslim metnini yazınız.");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("homework_submissions").upsert(
      {
        homework_id: homeworkId,
        student_id: studentId,
        submission_text: text.trim(),
        submitted_at: new Date().toISOString(),
        status: "edildi",
      } as never,
      { onConflict: "homework_id,student_id" },
    );
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Ödeviniz teslim edildi.");
    void qc.invalidateQueries({ queryKey: ["student-self"] });
  };

  return (
    <div className="mt-3 space-y-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        placeholder="Ödev teslim metniniz…"
        className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground"
      />
      <button
        onClick={() => void submit()}
        disabled={saving}
        className="rounded-full bg-primary px-4 py-2 text-[12px] text-primary-foreground disabled:opacity-60"
      >
        {saving ? "Gönderiliyor…" : "Ödevi Teslim Et"}
      </button>
    </div>
  );
}
