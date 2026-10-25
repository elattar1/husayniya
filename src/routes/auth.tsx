import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Store, ArrowLeft, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/lib/auth";
import { pageMeta } from "@/lib/page-meta";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => ({ redirect: typeof s.redirect === "string" && s.redirect.startsWith("/") && !s.redirect.startsWith("//") ? s.redirect : "/provider" }),
  head: () => pageMeta("تسجيل الدخول", "تسجيل الدخول لإدارة متجرك في خدمات الحسينية"),
  component: Auth,
});
function Auth() {
  const { user } = useAuth();
  const [busy,setBusy] = useState(false), [error,setError] = useState("");
  const { redirect } = Route.useSearch();
  async function signIn(provider: "google" | "lovable") {
    setBusy(true); setError("");
    const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: `${window.location.origin}/auth?redirect=${encodeURIComponent(redirect)}` });
    if (result.error) setError("تعذر تسجيل الدخول، يرجى المحاولة مرة أخرى.");
    setBusy(false);
  }
  return <div className="mx-auto flex min-h-[65vh] max-w-md flex-col justify-center gap-6 px-6 py-12"><div className="grid size-14 place-items-center rounded-lg bg-primary text-primary-foreground"><Store size={28} /></div><h1 className="text-3xl">خدمات الحسينية</h1><p className="text-muted-foreground">{user ? "تم تسجيل الدخول بنجاح" : "تسجيل الدخول"}</p>{user ? <><Button asChild><Link to={redirect.startsWith("/admin") ? "/admin" : "/provider"}>الانتقال إلى اللوحة <ArrowLeft /></Link></Button><Button variant="outline" asChild><Link to="/account">الحساب</Link></Button></> : <><Button disabled={busy} onClick={() => signIn("google")}><LogIn />المتابعة باستخدام Google</Button><Button variant="outline" disabled={busy} onClick={() => signIn("lovable")}>المتابعة باستخدام Lovable</Button></>}{error && <p role="alert" className="text-sm text-destructive">{error}</p>}</div>;
}
