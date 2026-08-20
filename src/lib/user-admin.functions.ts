import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Yönetici, bir kullanıcıyı (öğrenci/hoca) sistemden tamamen siler. */
export const deleteUserAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ user_id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    if (data.user_id === context.userId) {
      return { error: "Kendi hesabınızı silemezsiniz." as const };
    }

    const { data: myRoles } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    const isAdmin = (myRoles ?? []).some((r) => ["admin", "super_admin"].includes(r.role as string));
    if (!isAdmin) return { error: "Bu işlem için yetkiniz yok." as const };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: targetRoles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user_id);
    if ((targetRoles ?? []).some((r) => r.role === "super_admin")) {
      return { error: "Ana yönetici hesabı silinemez." as const };
    }

    await supabaseAdmin.from("students").delete().eq("user_id", data.user_id);
    await supabaseAdmin.from("user_roles").delete().eq("user_id", data.user_id);
    await supabaseAdmin.from("profiles").delete().eq("user_id", data.user_id);
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.user_id);
    if (error) return { error: "Kullanıcı silinemedi." as const };
    return { error: null };
  });
