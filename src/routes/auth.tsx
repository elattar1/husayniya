import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Store,
  ArrowLeft,
  LoaderCircle,
  ShieldCheck,
  CheckCircle2,
  Phone,
  Mail,
  Lock,
  Sparkles,
  Eye,
  EyeOff,
  KeyRound,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { pageMeta } from "@/lib/page-meta";
import {
  registerUserWithPhone,
  resolveLoginIdentifier,
  requestPasswordReset,
  normalizePhone,
  autoConfirmUser,
} from "@/lib/auth.functions";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => {
    const r = s["redirect"];
    return { redirect: typeof r === "string" && r.startsWith("/") && !r.startsWith("//") ? r : "/" };
  },
  head: () =>
    pageMeta(
      "تسجيل الدخول",
      "تسجيل الدخول وإدارة الطلبات والمتاجر في خدمات الحسينية برقم التليفون أو البريد الإلكتروني أو حساب Google"
    ),
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

function translateAuthError(err: unknown): string {
  if (!err) return "حدث خطأ غير متوقع، يرجى المحاولة لاحقًا.";
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes("Invalid login credentials")) {
    return "رقم التليفون أو كلمة المرور غير صحيحة.";
  }
  if (msg.includes("Email not confirmed")) {
    return "تم تفعيل الحساب تلقائياً، يرجى الضغط على تسجيل الدخول مجدداً.";
  }
  if (msg.includes("User already registered") || msg.includes("already registered")) {
    return "هذا الرقم مسجل بالفعل، يرجى تسجيل الدخول بدلاً من ذلك.";
  }
  if (msg.includes("Password should be at least")) {
    return "كلمة المرور يجب أن لا تقل عن 6 أحرف أو أرقام.";
  }
  return msg || "تعذر إتمام العملية، يرجى مراجعة البيانات والمحاولة مجددًا.";
}

function Auth() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();

  // أوضاع الشاشة: تسجيل دخول | إنشاء حساب جديد | نسيت كلمة المرور
  const [authMode, setAuthMode] = useState<"signin" | "signup" | "forgot_password">("signin");

  // حقول تسجيل الدخول
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [password, setPassword] = useState("");

  // حقول الحساب الجديد
  const [phone, setPhone] = useState("");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // حقول استعادة كلمة المرور
  const [resetIdentifier, setResetIdentifier] = useState("");

  // إظهار/إخفاء كلمة المرور
  const [showPassword, setShowPassword] = useState(false);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const targetPath = redirect.startsWith("/admin") ? "/admin" : redirect || "/";

  // 1. تسجيل الدخول برقم التليفون أو البريد الإلكتروني
  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    const cleanId = loginIdentifier.trim();
    if (!cleanId || !password.trim()) {
      setError("يرجى إدخال رقم التليفون (أو البريد) وكلمة المرور");
      return;
    }
    setBusy(true);
    setError("");
    setSuccessMsg("");
    try {
      // تحويل رقم الهاتف أو البريد إلى الحساب المعتمد
      const resolveRes = await resolveLoginIdentifier({
        data: { identifier: cleanId },
      });

      const { data, error: signInErr } = await supabase.auth.signInWithPassword({
        email: resolveRes.authEmail,
        password: password.trim(),
      });

      if (signInErr) {
        // إذا كان الحساب بحاجة لتأكيد فوري
        if (signInErr.message.includes("Email not confirmed")) {
          try {
            await autoConfirmUser({ data: { email: resolveRes.authEmail } });
            const retry = await supabase.auth.signInWithPassword({
              email: resolveRes.authEmail,
              password: password.trim(),
            });
            if (retry.data?.session) {
              navigate({ to: targetPath });
              return;
            }
            if (retry.error) throw retry.error;
          } catch (autoErr) {
            console.error("Auto confirm retry error:", autoErr);
          }
        }
        throw signInErr;
      }

      if (data.session) {
        navigate({ to: targetPath });
      }
    } catch (err: any) {
      setError(translateAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  // 2. إنشاء حساب جديد برقم التليفون، وتفعيل فوري بدون كود
  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    const cleanPhone = normalizePhone(phone);
    if (!cleanPhone || cleanPhone.length < 10) {
      setError("يرجى إدخال رقم تليفون صحيح (مثال: 01012345678)");
      return;
    }
    if (password.trim().length < 6) {
      setError("كلمة المرور يجب أن لا تقل عن 6 أحرف أو أرقام");
      return;
    }
    if (!confirmPassword.trim()) {
      setError("يرجى إدخال تأكيد كلمة المرور");
      return;
    }
    if (password.trim() !== confirmPassword.trim()) {
      setError("كلمتا المرور غير متطابقتين، يرجى التأكد من تطابق كلمة المرور وتأكيدها");
      return;
    }
    setBusy(true);
    setError("");
    setSuccessMsg("");
    try {
      // إنشاء الحساب وتفعيله فوراً على السيرفر
      const regRes = await registerUserWithPhone({
        data: {
          phone: cleanPhone,
          password: password.trim(),
          email: recoveryEmail.trim() || undefined,
        },
      });

      if (!regRes.success) {
        throw new Error("تعذر إنشاء الحساب، يرجى المحاولة لاحقاً");
      }

      // تسجيل الدخول مباشرة بعد التفعيل الفوري
      const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
        email: regRes.authEmail,
        password: password.trim(),
      });

      if (signInErr) {
        await autoConfirmUser({ data: { email: regRes.authEmail } });
        const retry = await supabase.auth.signInWithPassword({
          email: regRes.authEmail,
          password: password.trim(),
        });
        if (retry.error) throw retry.error;
        if (retry.data?.session) {
          navigate({ to: targetPath });
          return;
        }
      }

      if (signInData?.session) {
        navigate({ to: targetPath });
        return;
      }
    } catch (err: any) {
      setError(translateAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  // 3. إعادة تعيين كلمة المرور عبر البريد الإلكتروني
  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    const cleanId = resetIdentifier.trim();
    if (!cleanId) {
      setError("يرجى إدخال رقم التليفون أو البريد الإلكتروني المسجل");
      return;
    }
    setBusy(true);
    setError("");
    setSuccessMsg("");
    try {
      const res = await requestPasswordReset({
        data: {
          identifier: cleanId,
          redirectUrl: `${window.location.origin}/auth`,
        },
      });

      setSuccessMsg(res.message || `تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك: ${res.maskedEmail}`);
    } catch (err: any) {
      setError(err?.message || "تعذر إرسال رابط إعادة التعيين، يرجى التأكد من البيانات");
    } finally {
      setBusy(false);
    }
  }

  // 4. تسجيل الدخول السريع بواسطة Google
  async function signInGoogle() {
    setBusy(true);
    setError("");
    setSuccessMsg("");
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
      setError(translateAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  const displayUser =
    user?.user_metadata?.phone ||
    (user?.email?.endsWith("@phone.husayniya.app")
      ? user?.email.replace("@phone.husayniya.app", "")
      : user?.email) ||
    "حساب مسجل";

  return (
    <div className="mx-auto flex min-h-[75vh] max-w-md flex-col justify-center px-4 py-10">
      <div className="rounded-2xl border bg-card p-6 shadow-soft sm:p-8">
        {/* الشعار والعنوان الرئيسي */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 grid size-14 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <Store size={28} />
          </div>
          <h1 className="text-2xl font-bold md:text-3xl">خدمات الحسينية</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {user
              ? "مرحبًا بك، تم تسجيل دخولك بنجاح"
              : authMode === "forgot_password"
                ? "إعادة تعيين كلمة المرور عبر البريد المسجل"
                : "تسجيل الدخول برقم التليفون وإدارة طلباتك ومتاجرك في الحسينية"}
          </p>
        </div>

        {/* حالة المستخدم المسجل بالفعل */}
        {user ? (
          <div className="space-y-3">
            <div className="rounded-xl border bg-secondary/50 p-3 text-center text-sm">
              <p className="font-medium text-foreground" dir="ltr">
                {displayUser}
              </p>
              <span className="text-[11px] text-muted-foreground mt-0.5 block">أنت مسجل الدخول حالياً</span>
            </div>
            <Button asChild className="w-full font-bold">
              <Link to={targetPath}>
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
            {/* رسائل التنبيه والخطأ والنجاح */}
            {error && (
              <div
                role="alert"
                className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs font-medium text-destructive text-center leading-relaxed"
              >
                {error}
              </div>
            )}
            {successMsg && (
              <div
                role="status"
                className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-medium text-emerald-700 dark:text-emerald-400 text-center leading-relaxed"
              >
                {successMsg}
              </div>
            )}

            {/* وضع 1: نسيت كلمة المرور (إعادة التعيين عبر البريد) */}
            {authMode === "forgot_password" ? (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="rounded-xl border bg-muted/40 p-3.5 text-center text-xs text-muted-foreground leading-relaxed">
                  <KeyRound className="size-5 mx-auto mb-1.5 text-primary" />
                  <span>أدخل رقم هاتفك أو بريدك الإلكتروني المسجل وسنرسل لك رابط إعادة تعيين كلمة المرور على بريدك:</span>
                </div>

                <div className="space-y-1.5 text-right">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 justify-end">
                    <span>رقم التليفون أو البريد الإلكتروني</span>
                    <Mail className="size-3.5 text-muted-foreground" />
                  </label>
                  <Input
                    type="text"
                    required
                    placeholder="01xxxxxxxxx أو name@example.com"
                    value={resetIdentifier}
                    onChange={(e) => {
                      setResetIdentifier(e.target.value);
                      setError("");
                    }}
                    disabled={busy}
                    className="h-11 text-left"
                    dir="ltr"
                  />
                </div>

                <Button type="submit" disabled={busy} className="h-11 w-full font-bold">
                  {busy ? <LoaderCircle className="size-4 animate-spin ml-2" /> : <RotateCcw className="size-4 ml-2" />}
                  إرسال رابط إعادة التعيين
                </Button>

                <div className="text-center pt-2 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("signin");
                      setError("");
                      setSuccessMsg("");
                    }}
                    className="text-xs text-primary hover:underline font-semibold"
                  >
                    العودة إلى تسجيل الدخول
                  </button>
                </div>
              </form>
            ) : (
              /* وضع 2: تسجيل الدخول أو حساب جديد برقم التليفون */
              <div className="space-y-4">
                {/* شريط التبديل بين تسجيل الدخول وحساب جديد */}
                <div className="grid grid-cols-2 rounded-xl bg-muted p-1 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("signin");
                      setError("");
                      setSuccessMsg("");
                    }}
                    className={`rounded-lg py-2 transition-all ${
                      authMode === "signin"
                        ? "bg-background text-foreground shadow-xs font-bold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    تسجيل الدخول
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("signup");
                      setError("");
                      setSuccessMsg("");
                    }}
                    className={`rounded-lg py-2 transition-all ${
                      authMode === "signup"
                        ? "bg-background text-foreground shadow-xs font-bold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    حساب جديد
                  </button>
                </div>

                {/* نموذج تسجيل الدخول */}
                {authMode === "signin" ? (
                  <form onSubmit={handleSignIn} className="space-y-3.5">
                    <div className="space-y-1.5 text-right">
                      <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 justify-end">
                        <span>رقم التليفون أو البريد الإلكتروني</span>
                        <Phone className="size-3.5 text-muted-foreground" />
                      </label>
                      <Input
                        type="text"
                        required
                        placeholder="01xxxxxxxxx أو البريد الإلكتروني"
                        value={loginIdentifier}
                        onChange={(e) => {
                          setLoginIdentifier(e.target.value);
                          setError("");
                        }}
                        disabled={busy}
                        className="h-11 text-left"
                        dir="ltr"
                      />
                    </div>

                    <div className="space-y-1.5 text-right">
                      <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 justify-end">
                        <span>كلمة المرور</span>
                        <Lock className="size-3.5 text-muted-foreground" />
                      </label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          required
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            setError("");
                          }}
                          disabled={busy}
                          className="h-11 text-left pl-10"
                          dir="ltr"
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors"
                          tabIndex={-1}
                          aria-label={showPassword ? "إخفاء كلمة المرور" : "عرض كلمة المرور"}
                        >
                          {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
                    </div>

                    <Button type="submit" disabled={busy} className="h-11 w-full font-bold shadow-sm">
                      {busy ? <LoaderCircle className="size-4 animate-spin ml-2" /> : <ArrowLeft className="size-4 ml-2" />}
                      تسجيل الدخول
                    </Button>

                    {/* رابط استعادة كلمة السر عبر الإيميل */}
                    <div className="text-center pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode("forgot_password");
                          setError("");
                          setSuccessMsg("");
                          setResetIdentifier(loginIdentifier);
                        }}
                        disabled={busy}
                        className="text-xs text-primary hover:underline font-medium"
                      >
                        نسيت كلمة المرور؟ إعادة تعيين عبر البريد الإلكتروني
                      </button>
                    </div>
                  </form>
                ) : (
                  /* نموذج إنشاء حساب جديد */
                  <form onSubmit={handleSignUp} className="space-y-3.5">
                    {/* رقم التليفون */}
                    <div className="space-y-1.5 text-right">
                      <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 justify-end">
                        <span>رقم التليفون / الموبايل</span>
                        <span className="text-destructive">*</span>
                        <Phone className="size-3.5 text-muted-foreground" />
                      </label>
                      <Input
                        type="tel"
                        required
                        placeholder="01012345678"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          setError("");
                        }}
                        disabled={busy}
                        className="h-11 text-left"
                        dir="ltr"
                      />
                      <p className="text-[11px] text-muted-foreground">التسجيل يتم فورياً بدون انتظار أي كود تأكيد</p>
                    </div>

                    {/* البريد الإلكتروني لاستعادة كلمة السر */}
                    <div className="space-y-1.5 text-right">
                      <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 justify-end">
                        <span>البريد الإلكتروني</span>
                        <span className="text-[11px] text-muted-foreground font-normal">(اختياري / لاستعادة كلمة المرور)</span>
                        <Mail className="size-3.5 text-muted-foreground" />
                      </label>
                      <Input
                        type="email"
                        placeholder="name@example.com"
                        value={recoveryEmail}
                        onChange={(e) => {
                          setRecoveryEmail(e.target.value);
                          setError("");
                        }}
                        disabled={busy}
                        className="h-11 text-left"
                        dir="ltr"
                      />
                      <p className="text-[11px] text-muted-foreground">يُستخدم لإرسال رابط إعادة تعيين كلمة المرور في حال نسيانها</p>
                    </div>

                    {/* كلمة المرور */}
                    <div className="space-y-1.5 text-right">
                      <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 justify-end">
                        <span>كلمة المرور</span>
                        <span className="text-destructive">*</span>
                        <Lock className="size-3.5 text-muted-foreground" />
                      </label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          required
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            setError("");
                          }}
                          disabled={busy}
                          className="h-11 text-left pl-10"
                          dir="ltr"
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors"
                          tabIndex={-1}
                          aria-label={showPassword ? "إخفاء كلمة المرور" : "عرض كلمة المرور"}
                        >
                          {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
                      <p className="text-[11px] text-muted-foreground">يجب أن لا تقل كلمة المرور عن 6 أحرف أو أرقام</p>
                    </div>

                    {/* تأكيد كلمة المرور */}
                    <div className="space-y-1.5 text-right">
                      <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 justify-end">
                        <span>تأكيد كلمة المرور</span>
                        <span className="text-destructive">*</span>
                        <Lock className="size-3.5 text-muted-foreground" />
                      </label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          required
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            setError("");
                          }}
                          disabled={busy}
                          className="h-11 text-left pl-10"
                          dir="ltr"
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors"
                          tabIndex={-1}
                          aria-label={showPassword ? "إخفاء كلمة المرور" : "عرض كلمة المرور"}
                        >
                          {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
                    </div>

                    <Button type="submit" disabled={busy} className="h-11 w-full font-bold shadow-sm">
                      {busy ? <LoaderCircle className="size-4 animate-spin ml-2" /> : <Sparkles className="size-4 ml-2" />}
                      إنشاء حساب جديد والدخول فوراً
                    </Button>
                  </form>
                )}

                {/* فاصل */}
                <div className="relative my-4 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <span className="relative bg-card px-3 text-[11px] font-medium text-muted-foreground">
                    أو المتابعة السريعة باستخدام
                  </span>
                </div>

                {/* زر Google المباشر */}
                <Button
                  type="button"
                  disabled={busy}
                  onClick={signInGoogle}
                  variant="outline"
                  className="h-11 w-full gap-3 text-sm font-bold shadow-xs bg-background hover:bg-muted/50 border transition-all"
                >
                  {busy ? <LoaderCircle className="size-4 animate-spin" /> : <GoogleIcon />}
                  <span>المتابعة باستخدام Google</span>
                </Button>

                {/* مميزات النظام الجديد */}
                <div className="rounded-xl border bg-muted/20 p-3 space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>تفعيل فوري ودخول مباشر برقم التليفون بدون انتظار كود</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="size-4 text-primary shrink-0" />
                    <span>استعادة آمنة لحسابك عبر البريد الإلكتروني في أي وقت</span>
                  </div>
                </div>

                <p className="text-center text-[11px] text-muted-foreground leading-relaxed pt-1">
                  بتسجيل الدخول، فإنك توافق على شروط الاستخدام وسياسة الخصوصية الخاصة بتطبيق خدمات الحسينية.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
