import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AuthState = {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isDriver: boolean;
  refreshRoles: () => Promise<void>;
};

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  isAdmin: false,
  isDriver: false,
  refreshRoles: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDriver, setIsDriver] = useState(false);

  const loadRoles = async (u: User | null) => {
    if (!u) { setIsAdmin(false); setIsDriver(false); return; }
    const [{ data }, driver] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", u.id),
      supabase.from("drivers").select("is_active").eq("user_id", u.id).maybeSingle(),
    ]);
    setIsAdmin(!!data?.some((r) => r.role === "admin"));
    setIsDriver(!!driver.data?.is_active);
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      const u = session?.user ?? null;
      setUser(u);
      setTimeout(() => loadRoles(u), 0);
    });
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user ?? null;
      setUser(u);
      loadRoles(u).finally(() => setLoading(false));
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, isDriver, refreshRoles: () => loadRoles(user) }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
