import { createFileRoute } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";

import { classLabel, useClasses, useRemove, useStudents } from "@/lib/admin-api";
import { useMyRoles } from "@/lib/rbac";

export const Route = createFileRoute("/admin/ogrenciler")({
  component: StudentsPage,
});

function StudentsPage() {
  const { data: allStudents = [], isLoading } = useStudents();
  const { data: allClasses = [] } = useClasses();
  const { isAdmin, myClassIds } = useMyRoles();
  const classes = isAdmin ? allClasses : allClasses.filter((c) => myClassIds.includes(c.id));
  const students = isAdmin
    ? allStudents
    : allStudents.filter((s) => s.class_id && myClassIds.includes(s.class_id));
  const remove = useRemove("students");

  const className = (id: string | null) => {
    const c = classes.find((x) => x.id === id);
    return c ? classLabel(c) : "—";
  };


  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Öğrenci Kayıtları</p>
        <h1 className="mt-2 text-2xl text-foreground">Öğrenciler</h1>
      </div>

      <p className="text-sm text-muted-foreground">
        Öğrenciler kayıt/ön kayıt onayı veya sınıf listesi üzerinden eklenir.
      </p>


      <div className="card-soft overflow-x-auto border-accent/40">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-border text-[12px] text-muted-foreground">
            <tr>
              <th className="px-5 py-3">Ad Soyad</th>
              <th className="px-5 py-3">WhatsApp</th>
              <th className="px-5 py-3">Sınıf</th>
              <th className="px-5 py-3">Kayıt</th>
              <th className="px-5 py-3">Durum</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={6} className="px-5 py-6 text-muted-foreground">Yükleniyor…</td></tr>}
            {!isLoading && students.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-6 text-muted-foreground">Henüz öğrenci eklenmedi.</td></tr>
            )}
            {students.map((s) => (
              <tr key={s.id} className="border-b border-border/70 last:border-0">
                <td className="px-5 py-3 text-foreground">{s.full_name}</td>
                <td className="px-5 py-3 text-muted-foreground">{s.phone || "—"}</td>
                <td className="px-5 py-3 text-muted-foreground">{className(s.class_id)}</td>
                <td className="px-5 py-3 text-muted-foreground">{s.registered_at}</td>
                <td className="px-5 py-3">
                  <span className="rounded-full bg-secondary px-3 py-1 text-[11px] text-secondary-foreground">{s.status}</span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => edit(s)} className="rounded-full border border-border p-2 text-muted-foreground hover:text-primary">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    {isAdmin && (
                      <button onClick={() => remove.mutate(s.id)} className="rounded-full border border-border p-2 text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}

                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
