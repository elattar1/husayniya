import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppMode = "customer" | "merchant" | "driver" | "admin";

type AuthState = {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isDriver: boolean;
  isProvider: boolean;
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
  refreshRoles: () => Promise<void>;
};

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  isAdmin: false,
  isDriver: false,
  isProvider: false,
  appMode: "customer",
  setAppMode: () => {},
  refreshRoles: async () => {},
});

const MODE_STORAGE_KEY = "husayniya_app_mode";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDriver, setIsDriver] = useState(false);
  const [isProvider, setIsProvider] = useState(false);
  const [appMode, setAppModeState] = useState<AppMode>(() => {
    if (typeof window === "undefined") return "customer";
    const saved = localStorage.getItem(MODE_STORAGE_KEY) as AppMode | null;
    return saved && ["customer", "merchant", "driver", "admin"].includes(saved) ? saved : "customer";
  });

  const setAppMode = (mode: AppMode) => {
    setAppModeState(mode);
    if (typeof window !== "undefined") {
      localStorage.setItem(MODE_STORAGE_KEY, mode);
    }
  };

  const loadRoles = async (u: User | null) => {
    if (!u) {
      setIsAdmin(false);
      setIsDriver(false);
      setIsProvider(false);
      if (appMode !== "customer") {
        setAppMode("customer");
      }
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
      const adminRole = !!roles?.some((r) => r.role === "admin");
      const driverRole = !!driver?.data?.is_active;
      const providerRole = hasProviderRole || hasStoreRecord;

      setIsAdmin(adminRole);
      setIsDriver(driverRole);
      setIsProvider(providerRole);

      // Validate saved mode against actual permissions
      if (appMode === "admin" && !adminRole) {
        setAppMode("customer");
      } else if (appMode === "merchant" && !(providerRole || adminRole)) {
        setAppMode("customer");
      } else if (appMode === "driver" && !(driverRole || adminRole)) {
        setAppMode("customer");
      }
    } catch {
      setIsAdmin(false);
      setIsDriver(false);
      setIsProvider(false);
      setAppMode("customer");
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
        appMode,
        setAppMode,
        refreshRoles: () => loadRoles(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
