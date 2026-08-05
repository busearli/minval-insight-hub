import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, UserMinus, UserPlus } from "lucide-react";

import {
  classLabel,
  useAllRoles,
  useAssignInstructor,
  useClassInstructors,
  useClasses,
  useGrantRole,
  useProfiles,
  useRevokeRole,
  useSetProfileStatus,
  useUnassignInstructor,
  type AppRole,
} from "@/lib/admin-api";
import { roleLabel, useMyRoles } from "@/lib/rbac";

export const Route = createFileRoute("/admin/kullanicilar")({
  component: UsersPage,
});

function UsersPage() {
  const { isSuperAdmin } = useMyRoles();
  const { data: profiles = [], isLoading } = useProfiles();
  const { data: roles = [] } = useAllRoles();
  const { data: classes = [] } = useClasses();
  const { data: links = [] } = useClassInstructors();
  const grant = useGrantRole();
  const revoke = useRevokeRole();
  const setStatus = useSetProfileStatus();
  const assign = useAssignInstructor();
  const unassign = useUnassignInstructor();
  const [pick, setPick] = useState<Record<string, string>>({});

  if (!isSuperAdmin) {
    return <p className="text-sm text-muted-foreground">Bu bölüm yalnızca Ana Yönetici içindir.</p>;
  }

  const rolesOf = (uid: string) => roles.filter((r) => r.user_id === uid).map((r) => r.role);

  const run = async (p: Promise<unknown>, msg: string) => {
    try {
      await p;
      toast.success(msg);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "İşlem başarısız");
    }
  };

  const toggleRole = (uid: string, role: AppRole, has: boolean) =>
    void run(
      has ? revoke.mutateAsync({ user_id: uid, role }) : grant.mutateAsync({ user_id: uid, role }),
      has ? "Yetki kaldırıldı." : "Yetki verildi.",
    );

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Yetkilendirme</p>
        <h1 className="mt-2 text-2xl text-foreground">Kullanıcı & Yetki Yönetimi</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Kullanıcıları Hoca veya Yönetici yapabilir, eğitmenlere sınıf atayabilirsiniz.
        </p>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Yükleniyor…</p>}

      <div className="grid gap-4">
        {profiles.map((p) => {
          const mine = rolesOf(p.user_id);
          const myLinks = links.filter((l) => l.user_id === p.user_id);
          const isInstructor = mine.includes("instructor");
          return (
            <div key={p.user_id} className="card-soft border-accent/40 p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg text-foreground">{p.name || "İsimsiz kullanıcı"}</h3>
                  <p className="mt-1 text-[13px] text-muted-foreground">
                    {p.phone || "Telefon yok"} · {p.program_choice || "Program seçilmedi"} ·{" "}
                    {p.status === "pending_assignment" ? "Sınıf ataması bekliyor" : p.status === "inactive" ? "Pasif" : "Aktif"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {mine.length === 0 && (
                    <span className="rounded-full bg-secondary px-3 py-1 text-[11px] text-secondary-foreground">
                      Rol yok
                    </span>
                  )}
                  {mine.map((r) => (
                    <span
                      key={r}
                      className="rounded-full bg-primary/10 px-3 py-1 text-[11px] text-primary"
                    >
                      {roleLabel[r]}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border pt-5">
                <button
                  onClick={() => toggleRole(p.user_id, "instructor", isInstructor)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-[12px] text-muted-foreground hover:text-primary"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {isInstructor ? "Hoca Yetkisini Al" : "Hoca Yap"}
                </button>
                <button
                  onClick={() => toggleRole(p.user_id, "admin", mine.includes("admin"))}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-[12px] text-muted-foreground hover:text-primary"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {mine.includes("admin") ? "Admin Yetkisini Al" : "Admin Yap"}
                </button>
                <button
                  onClick={() =>
                    void run(
                      setStatus.mutateAsync({
                        user_id: p.user_id,
                        status: p.status === "inactive" ? "active" : "inactive",
                      }),
                      "Hesap durumu güncellendi.",
                    )
                  }
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-[12px] text-muted-foreground hover:text-absent"
                >
                  <UserMinus className="h-3.5 w-3.5" />
                  {p.status === "inactive" ? "Hesabı Aktife Al" : "Hesabı Pasife Al"}
                </button>
              </div>

              {isInstructor && (
                <div className="mt-4 space-y-3 border-t border-border pt-4">
                  <p className="eyebrow">Atanmış Sınıflar</p>
                  <div className="flex flex-wrap gap-2">
                    {myLinks.length === 0 && (
                      <span className="text-sm text-muted-foreground">Henüz sınıf atanmadı.</span>
                    )}
                    {myLinks.map((l) => {
                      const c = classes.find((x) => x.id === l.class_id);
                      return (
                        <button
                          key={l.id}
                          onClick={() => void run(unassign.mutateAsync(l.id), "Sınıf ataması kaldırıldı.")}
                          className="rounded-full bg-secondary px-3 py-1 text-[12px] text-secondary-foreground hover:text-absent"
                        >
                          {c ? classLabel(c) : "Sınıf"} ✕
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={pick[p.user_id] ?? ""}
                      onChange={(e) => setPick((s) => ({ ...s, [p.user_id]: e.target.value }))}
                      className="h-9 min-w-56 rounded-md border border-input bg-card px-3 text-sm text-foreground"
                    >
                      <option value="">Sınıf seçiniz</option>
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {classLabel(c)}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => {
                        const classId = pick[p.user_id];
                        if (!classId) {
                          toast.error("Önce bir sınıf seçiniz.");
                          return;
                        }
                        void run(
                          assign.mutateAsync({ class_id: classId, user_id: p.user_id }),
                          "Sınıf atandı.",
                        );
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[12px] text-primary-foreground"
                    >
                      <UserPlus className="h-3.5 w-3.5" /> Sınıf Ata
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
