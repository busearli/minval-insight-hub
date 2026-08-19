import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { UserCog } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { ProfileSettings } from "@/components/ProfileSettings";

export const Route = createFileRoute("/admin/profil")({
  component: StaffProfilePage,
});

function StaffProfilePage() {
  const { user, profile, refresh } = useAuth();
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (!user?.id) return;
    void supabase
      .from("profiles")
      .select("phone")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => setPhone((data as { phone?: string } | null)?.phone ?? ""));
  }, [user?.id]);

  if (!user) return <p className="text-sm text-muted-foreground">Yükleniyor…</p>;

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Hesabım</p>
        <h1 className="mt-2 flex items-center gap-2 text-2xl text-foreground">
          <UserCog className="h-5 w-5 text-primary" /> Kişisel Bilgilerim
        </h1>
      </div>

      <ProfileSettings
        userId={user.id}
        email={user.email ?? ""}
        initialName={profile?.name ?? ""}
        initialPhone={phone}
        onSaved={() => {
          void refresh();
          toast.success("Bilgileriniz güncellendi.");
        }}
      />
    </div>
  );
}
