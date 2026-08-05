import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  phone: z.string().trim().min(10).max(24),
  password: z.string().min(6).max(72),
});

const digits = (v: string) => v.replace(/\D/g, "");
const tail = (v: string) => digits(v).slice(-10);

/**
 * Telefon + şifre ile giriş. E-posta adresi istemciye asla dönmez;
 * sunucuda eşleştirilip oturum jetonları geri verilir.
 */
export const signInWithPhone = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    const key = tail(data.phone);
    if (key.length < 10) return { error: "Telefon veya şifre hatalı." as const, session: null };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("user_id, phone")
      .neq("phone", "");

    const match = (profiles ?? []).find((p) => tail(p.phone ?? "") === key);
    if (!match) return { error: "Telefon veya şifre hatalı." as const, session: null };

    const { data: userRes } = await supabaseAdmin.auth.admin.getUserById(match.user_id);
    const email = userRes?.user?.email;
    if (!email) return { error: "Telefon veya şifre hatalı." as const, session: null };

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

    const { data: signIn, error } = await anon.auth.signInWithPassword({ email, password: data.password });
    if (error || !signIn.session) {
      return { error: "Telefon veya şifre hatalı." as const, session: null };
    }
    return {
      error: null,
      session: {
        access_token: signIn.session.access_token,
        refresh_token: signIn.session.refresh_token,
      },
    };
  });
