import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AuthState = {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isDriver: boolean;
  isProvider: boolean;
  refreshRoles: () => Promise<void>;
};

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  isAdmin: false,
  isDriver: false,
  isProvider: false,
  refreshRoles: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDriver, setIsDriver] = useState(false);
  const [isProvider, setIsProvider] = useState(false);

  const loadRoles = async (u: User | null) => {
    if (!u) {
      setIsAdmin(false);
      setIsDriver(false);
      setIsProvider(false);
      return;
    }
    try {
      const [{ data: roles }, driver, ownedStore] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", u.id),
        supabase.from("drivers").select("is_active").eq("user_id", u.id).maybeSingle(),
        supabase.from("stores").select("id").eq("owner_id", u.id).limit(1).maybeSingle(),
      ]);
      const hasProviderRole = !!roles?.some((r) => r.role === "provider");
      const hasStoreRecord = !!ownedStore?.data;
      setIsAdmin(!!roles?.some((r) => r.role === "admin"));
      setIsDriver(!!driver?.data?.is_active);
      setIsProvider(hasProviderRole || hasStoreRecord);
    } catch {
      setIsAdmin(false);
      setIsDriver(false);
      setIsProvider(false);
    }
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
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        isDriver,
        isProvider,
        refreshRoles: () => loadRoles(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
