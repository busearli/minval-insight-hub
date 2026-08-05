import { createServerFn } from "@tanstack/react-start";

const DEV_ADMIN_EMAIL = "admin@minvalakademi.com";
const DEV_ADMIN_PASSWORD = "MinvalDev!2026";

/**
 * GELİŞTİRME MODU: süper admin hesabını hazırlar (yoksa oluşturur, rolü verir)
 * ve oturum jetonlarını döner. Üretimde çalışmaz.
 */
export const devSuperAdminLogin = createServerFn({ method: "POST" }).handler(async () => {
  if (process.env["NODE_ENV"] === "production") {
    return { error: "Bu özellik yalnızca geliştirme modunda kullanılabilir." as const, session: null };
  }

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  // Hesabı bul ya da oluştur
  const { data: list } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
  let user = (list?.users ?? []).find((u) => u.email?.toLowerCase() === DEV_ADMIN_EMAIL);

  if (!user) {
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: DEV_ADMIN_EMAIL,
      password: DEV_ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { name: "Minval Süper Admin" },
    });
    if (error || !created.user) {
      return { error: "Süper admin hesabı oluşturulamadı." as const, session: null };
    }
    user = created.user;
  } else {
    await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password: DEV_ADMIN_PASSWORD,
      email_confirm: true,
    });
  }

  // Profil + rol garantisi
  await supabaseAdmin
    .from("profiles")
    .upsert({ user_id: user.id, name: "Minval Süper Admin", status: "active" }, { onConflict: "user_id" });
  await supabaseAdmin.from("profiles").update({ status: "active" }).eq("user_id", user.id);
  const { data: roles } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "super_admin");
  if (!roles?.length) {
    await supabaseAdmin.from("user_roles").insert({ user_id: user.id, role: "super_admin" });
  }

  const { createClient } = await import("@supabase/supabase-js");
  const publishable = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const anon = createClient(process.env["SUPABASE_URL"]!, publishable, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (publishable.startsWith("sb_") && h.get("Authorization") === `Bearer ${publishable}`) {
          h.delete("Authorization");
        }
        h.set("apikey", publishable);
        return fetch(input, { ...init, headers: h });
      },
    },
  });

  const { data: signIn, error } = await anon.auth.signInWithPassword({
    email: DEV_ADMIN_EMAIL,
    password: DEV_ADMIN_PASSWORD,
  });
  if (error || !signIn.session) {
    return { error: "Süper admin oturumu açılamadı." as const, session: null };
  }

  return {
    error: null,
    session: {
      access_token: signIn.session.access_token,
      refresh_token: signIn.session.refresh_token,
    },
  };
});
