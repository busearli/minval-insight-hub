import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type Profile = { user_id: string; name: string; role: string; avatar_url: string | null };
type Enrollment = {
  id: string;
  workshop_id: string;
  completion_rate: number;
  workshops: { title: string; instructor_name: string; total_weeks: number } | null;
};

type AuthValue = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  enrollments: Enrollment[];
  loading: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthValue>({
  session: null,
  user: null,
  profile: null,
  enrollments: [],
  loading: true,
  refresh: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async (uid: string | undefined) => {
    if (!uid) {
      setProfile(null);
      setEnrollments([]);
      return;
    }
    const [{ data: p }, { data: e }] = await Promise.all([
      supabase.from("profiles").select("user_id, name, role, avatar_url").eq("user_id", uid).maybeSingle(),
      supabase
        .from("enrollments")
        .select("id, workshop_id, completion_rate, workshops(title, instructor_name, total_weeks)")
        .order("created_at", { ascending: true }),
    ]);
    setProfile((p as Profile) ?? null);
    setEnrollments((e as unknown as Enrollment[]) ?? []);
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setTimeout(() => void loadData(s?.user?.id), 0);
    });
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      void loadData(data.session?.user?.id).finally(() => setLoading(false));
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const value: AuthValue = {
    session,
    user: session?.user ?? null,
    profile,
    enrollments,
    loading,
    refresh: () => loadData(session?.user?.id),
    signOut: async () => {
      await supabase.auth.signOut();
      setProfile(null);
      setEnrollments([]);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
