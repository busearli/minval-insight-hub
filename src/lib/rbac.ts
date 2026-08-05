import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useDevAdmin } from "@/lib/dev-mode";

export type AppRole = "super_admin" | "admin" | "instructor" | "student";

export const roleLabel: Record<AppRole, string> = {
  super_admin: "Ana Yönetici",
  admin: "Yönetici",
  instructor: "Hoca / Eğitmen",
  student: "Öğrenci",
};

export function useMyRoles() {
  const { user, loading: authLoading } = useAuth();
  const devAdmin = useDevAdmin();


  const { data: roles = [], isLoading } = useQuery({
    queryKey: ["my-roles", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user!.id);
      if (error) throw new Error(error.message);
      return (data ?? []).map((r) => r.role as AppRole);
    },
  });

  const { data: myClassIds = [] } = useQuery({
    queryKey: ["my-classes", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("class_instructors")
        .select("class_id")
        .eq("user_id", user!.id);
      if (error) throw new Error(error.message);
      return (data ?? []).map((r) => r.class_id);
    },
  });

  const isSuperAdmin = devAdmin || roles.includes("super_admin");
  const isAdmin = isSuperAdmin || roles.includes("admin");
  const isInstructor = roles.includes("instructor");

  return {
    roles: devAdmin && !roles.length ? (["super_admin"] as AppRole[]) : roles,
    myClassIds,
    isSuperAdmin,
    isAdmin,
    isInstructor,
    isStaff: isAdmin || isInstructor,
    loading: devAdmin ? false : authLoading || (!!user && isLoading),
  };
}
