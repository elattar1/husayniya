import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Store, ArrowLeft, LogIn, Mail, Lock, UserPlus, LoaderCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { pageMeta } from "@/lib/page-meta";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => {
    const r = s["redirect"];
    return { redirect: typeof r === "string" && r.startsWith("/") && !r.startsWith("//") ? r : "/" };
  },
  head: () => pageMeta("تسجيل الدخول", "تسجيل الدخول لطلب الخدمات ومتابعتها وإدارة متجرك في خدمات الحسينية"),
  component: Auth,
});

function Auth() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // تسجيل الدخول بواسطة Google فقط
  async function signInGoogle() {
    setBusy(true);
    setError("");
    setSuccess("");
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

  // تسجيل الدخول أو إنشاء حساب بالبريد الإلكتروني وكلمة المرور
  async function handleEmailAuth(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError("");
    setSuccess("");
    setBusy(true);

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth?redirect=${encodeURIComponent(redirect)}`,
          },
        });
        if (signUpError) throw signUpError;
        if (data.session) {
          navigate({ to: redirect });
        } else {
          setSuccess("تم إنشاء الحساب بنجاح! تفقد بريدك الإلكتروني لتأكيد التسجيل ثم سجل الدخول.");
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });
        if (signInError) throw signInError;
        if (data.session) {
          navigate({ to: redirect });
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "حدث خطأ أثناء معالجة الطلب";
      if (msg.includes("Invalid login credentials")) {
        setError("بيانات الدخول غير صحيحة، يرجى التحقق من البريد الإلكتروني وكلمة المرور.");
      } else if (msg.includes("User already registered")) {
        setError("هذا البريد مسجل مسبقًا، يمكنك تسجيل الدخول مباشرة.");
      } else if (msg.includes("Password should be at least")) {
        setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل.");
      } else {
        setError(msg);
      }
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
            {user ? "مرحبًا بك، تم تسجيل دخولك بنجاح" : isSignUp ? "إنشاء حساب عميل جديد" : "تسجيل الدخول إلى حسابك"}
          </p>
        </div>

        {user ? (
          <div className="space-y-3">
            <div className="rounded-xl border bg-secondary/50 p-3 text-center text-sm">
              <p className="font-medium">{user.email || "حساب مسجل"}</p>
            </div>
            <Button asChild className="w-full">
              <Link to={redirect.startsWith("/admin") ? "/admin" : "/"}>
                الانتقال إلى {redirect.startsWith("/admin") ? "لوحة الإدارة" : "الصفحة الرئيسية"}
                <ArrowLeft className="mr-2 size-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link to="/account">إعدادات الحساب والشكاوى</Link>
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
          <div className="space-y-4">
            {/* تسجيل الدخول بحساب Google فقط وبدون لافابول */}
            <Button
              type="button"
              disabled={busy}
              onClick={signInGoogle}
              className="h-11 w-full gap-2 text-sm font-semibold shadow-sm"
            >
              {busy ? <LoaderCircle className="size-4 animate-spin" /> : <LogIn className="size-4" />}
              المتابعة باستخدام Google
            </Button>

            {/* فاصل */}
            <div className="relative my-4 flex items-center justify-center">
              <div className="w-full border-t border-border/80" />
              <span className="absolute bg-card px-3 text-xs text-muted-foreground">أو بالبريد الإلكتروني</span>
            </div>

            {/* نموذج تسجيل الدخول / إنشاء الحساب */}
            <form onSubmit={handleEmailAuth} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs font-medium">البريد الإلكتروني</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    required
                    disabled={busy}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="h-10 pr-9 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="password" className="text-xs font-medium">كلمة المرور</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    required
                    minLength={6}
                    disabled={busy}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-10 pr-9 text-sm"
                  />
                </div>
              </div>

              {error && (
                <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                  {error}
                </div>
              )}

              {success && (
                <div className="flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
                  <span>{success}</span>
                </div>
              )}

              <Button type="submit" disabled={busy} variant="secondary" className="h-10 w-full font-semibold">
                {busy ? (
                  <LoaderCircle className="size-4 animate-spin ml-2" />
                ) : isSignUp ? (
                  <UserPlus className="size-4 ml-2" />
                ) : (
                  <LogIn className="size-4 ml-2" />
                )}
                {isSignUp ? "إنشاء حساب جديد" : "تسجيل الدخول"}
              </Button>
            </form>

            {/* زر التبديل بين تسجيل الدخول وإنشاء حساب */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError("");
                  setSuccess("");
                }}
                className="text-xs text-primary hover:underline font-medium transition-colors"
              >
                {isSignUp ? "لديك حساب بالفعل؟ سجل دخولك الآن" : "ليس لديك حساب؟ أنشئ حسابًا جديدًا"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
