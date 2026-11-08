import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Store, ArrowLeft, LoaderCircle, ShieldCheck, CheckCircle2, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { pageMeta } from "@/lib/page-meta";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => {
    const r = s["redirect"];
    return { redirect: typeof r === "string" && r.startsWith("/") && !r.startsWith("//") ? r : "/" };
  },
  head: () => pageMeta("تسجيل الدخول", "تسجيل الدخول لطلب الخدمات ومتابعتها وإدارة متجرك في خدمات الحسينية عبر حساب Google"),
  component: Auth,
});

function GoogleIcon() {
  return (
    <svg className="size-5 shrink-0" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

function Auth() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [showEmailAuth, setShowEmailAuth] = useState(false);

  // تسجيل الدخول بواسطة البريد الإلكتروني وكلمة المرور مباشرة داخل التطبيق
  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("يرجى إدخال البريد الإلكتروني وكلمة المرور");
      return;
    }
    setBusy(true);
    setError("");
    try {
      if (isSignUp) {
        const { data, error: signUpErr } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
        });
        if (signUpErr) throw signUpErr;
        if (data.session) {
          navigate({ to: redirect.startsWith("/admin") ? "/admin" : redirect || "/" });
        } else {
          setError("تم تسجيل الحساب بنجاح! يمكنك الآن تسجيل الدخول مباشرة.");
          setIsSignUp(false);
        }
      } else {
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });
        if (signInErr) throw signInErr;
        navigate({ to: redirect.startsWith("/admin") ? "/admin" : redirect || "/" });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل تسجيل الدخول، يرجى التأكد من البيانات.");
    } finally {
      setBusy(false);
    }
  }

  // تسجيل الدخول بواسطة Google
  async function signInGoogle() {
    setBusy(true);
    setError("");
    try {
      const redirectUri = `${window.location.origin}/auth?redirect=${encodeURIComponent(redirect)}`;
      const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: redirectUri });
      if (result?.error) {
        const supRes = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo: redirectUri },
        });
        if (supRes.error) throw supRes.error;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر تسجيل الدخول عبر Google، يرجى المحاولة لاحقًا.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[75vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="rounded-2xl border bg-card p-6 shadow-soft sm:p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 grid size-14 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <Store size={28} />
          </div>
          <h1 className="text-2xl font-bold md:text-3xl">خدمات الحسينية</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {user ? "مرحبًا بك، تم تسجيل دخولك بنجاح" : "تسجيل الدخول السريع والآمن عبر حساب Google"}
          </p>
        </div>

        {user ? (
          <div className="space-y-3">
            <div className="rounded-xl border bg-secondary/50 p-3 text-center text-sm">
              <p className="font-medium text-foreground">{user.email || "حساب مسجل"}</p>
              <span className="text-[11px] text-muted-foreground mt-0.5 block">أنت مسجل الدخول حالياً</span>
            </div>
            <Button asChild className="w-full font-bold">
              <Link to={redirect.startsWith("/admin") ? "/admin" : "/"}>
                الانتقال إلى {redirect.startsWith("/admin") ? "لوحة الإدارة" : "الصفحة الرئيسية"}
                <ArrowLeft className="mr-2 size-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link to="/account">حسابي والطلبات السابقة</Link>
            </Button>
            <Button
              variant="ghost"
              className="w-full text-destructive"
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.reload();
              }}
            >
              تسجيل الخروج
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            {error && (
              <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive text-center">
                {error}
              </div>
            )}

            {/* زر تسجيل الدخول المباشر بواسطة Google فقط */}
            <Button
              type="button"
              disabled={busy}
              onClick={signInGoogle}
              className="h-12 w-full gap-3 text-sm font-bold shadow-md bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:text-neutral-100 dark:border-neutral-700 transition-all"
            >
              {busy ? <LoaderCircle className="size-5 animate-spin" /> : <GoogleIcon />}
              <span>{busy ? "جارٍ الاتصال بـ Google..." : "المتابعة باستخدام Google"}</span>
            </Button>

            {/* مميزات تسجيل الدخول عبر Google */}
            <div className="rounded-xl border bg-muted/30 p-4 space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-primary shrink-0" />
                <span>تسجيل دخول فوري وآمن بنقرة واحدة بدون كلمة مرور</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>حفظ تلقائي لعناوين التوصيل وسجل الطلبات</span>
              </div>
            </div>

            <p className="text-center text-[11px] text-muted-foreground leading-relaxed">
              بتسجيل الدخول، فإنك توافق على شروط الاستخدام وسياسة الخصوصية الخاصة بتطبيق خدمات الحسينية.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
