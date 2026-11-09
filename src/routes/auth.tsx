import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Store,
  ArrowLeft,
  LoaderCircle,
  ShieldCheck,
  CheckCircle2,
  Mail,
  Lock,
  KeyRound,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { pageMeta } from "@/lib/page-meta";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => {
    const r = s["redirect"];
    return { redirect: typeof r === "string" && r.startsWith("/") && !r.startsWith("//") ? r : "/" };
  },
  head: () =>
    pageMeta(
      "تسجيل الدخول",
      "تسجيل الدخول لطلب الخدمات ومتابعتها وإدارة متجرك في خدمات الحسينية عبر البريد الإلكتروني أو حساب Google"
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
    return "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
  }
  if (msg.includes("Email not confirmed")) {
    return "البريد الإلكتروني غير مؤكد بعد. يرجى إدخال كود التأكيد المرسل إليك.";
  }
  if (msg.includes("User already registered")) {
    return "هذا البريد الإلكتروني مسجل بالفعل، يرجى تسجيل الدخول بدلاً من ذلك.";
  }
  if (msg.includes("Password should be at least")) {
    return "كلمة المرور يجب أن لا تقل عن 6 أحرف أو أرقام.";
  }
  if (msg.includes("Token has expired") || msg.includes("invalid") || msg.includes("Token is invalid")) {
    return "كود التأكيد غير صحيح أو انتهت صلاحيته. يرجى التأكد من الرمز أو طلب كود جديد.";
  }
  if (msg.includes("rate limit") || msg.includes("over_email_send_rate_limit")) {
    return "تم إرسال عدد كبير من الرسائل مؤخرًا، يرجى الانتظار دقيقة قبل المحاولة مرة أخرى.";
  }
  return msg || "تعذر إتمام العملية، يرجى مراجعة البيانات والمحاولة مجددًا.";
}

function Auth() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();

  // أوضاع الشاشة: تسجيل دخول | إنشاء حساب جديد | إدخال كود التأكيد OTP
  const [authMode, setAuthMode] = useState<"signin" | "signup" | "otp_verify">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpType, setOtpType] = useState<"signup" | "email">("signup");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [countdown, setCountdown] = useState(0);

  // مؤقت إعادة إرسال الكود
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const targetPath = redirect.startsWith("/admin") ? "/admin" : redirect || "/";

  // 1. تسجيل الدخول بالبريد وكلمة المرور
  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail || !password.trim()) {
      setError("يرجى إدخال البريد الإلكتروني وكلمة المرور");
      return;
    }
    setBusy(true);
    setError("");
    setSuccessMsg("");
    try {
      const { data, error: signInErr } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password.trim(),
      });
      if (signInErr) {
        // إذا كان الحساب غير مؤكد بعد
        if (signInErr.message.includes("Email not confirmed")) {
          try {
            await supabase.auth.resend({ type: "signup", email: cleanEmail });
          } catch {
            await supabase.auth.signInWithOtp({ email: cleanEmail });
          }
          setOtpType("signup");
          setAuthMode("otp_verify");
          setCountdown(60);
          setSuccessMsg("حسابك غير مؤكد بعد. تم إرسال كود التأكيد إلى بريدك الإلكتروني، يرجى إدخاله للمتابعة.");
          return;
        }
        throw signInErr;
      }
      if (data.session) {
        navigate({ to: targetPath });
      }
    } catch (err) {
      setError(translateAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  // 2. إنشاء حساب جديد بالبريد وكلمة المرور
  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail || !password.trim()) {
      setError("يرجى إدخال البريد الإلكتروني وكلمة المرور");
      return;
    }
    if (password.trim().length < 6) {
      setError("كلمة المرور يجب أن لا تقل عن 6 أحرف أو أرقام");
      return;
    }
    setBusy(true);
    setError("");
    setSuccessMsg("");
    try {
      const { data, error: signUpErr } = await supabase.auth.signUp({
        email: cleanEmail,
        password: password.trim(),
      });
      if (signUpErr) throw signUpErr;

      // إذا تم تسجيل الدخول مباشرة بدون تأكيد البريد
      if (data.session) {
        navigate({ to: targetPath });
        return;
      }

      // إذا كان تأكيد البريد الإلكتروني مطلوباً عبر كود التأكيد
      setOtpType("signup");
      setAuthMode("otp_verify");
      setCountdown(60);
      setSuccessMsg("تم إنشاء الحساب بنجاح! أرسلنا كود تأكيد مكون من 6 أرقام إلى بريدك الإلكتروني.");
    } catch (err) {
      setError(translateAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  // 3. التحقق من كود الـ OTP
  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    const cleanEmail = email.trim();
    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length < 6) {
      setError("يرجى إدخال كود التأكيد المكون من 6 أرقام كاملاً");
      return;
    }
    setBusy(true);
    setError("");
    setSuccessMsg("");
    try {
      let verifyRes = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: cleanOtp,
        type: otpType,
      });

      // تجربة النوع البديل إذا فشل النوع الأول
      if (verifyRes.error) {
        const altType = otpType === "signup" ? "email" : "signup";
        verifyRes = await supabase.auth.verifyOtp({
          email: cleanEmail,
          token: cleanOtp,
          type: altType,
        });
      }

      if (verifyRes.error) throw verifyRes.error;

      setSuccessMsg("تم تأكيد البريد الإلكتروني بنجاح! جاري تحويلك...");
      setTimeout(() => {
        navigate({ to: targetPath });
      }, 500);
    } catch (err) {
      setError(translateAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  // 4. إعادة إرسال كود التأكيد
  async function handleResendCode() {
    if (countdown > 0 || busy) return;
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError("يرجى إدخال بريدك الإلكتروني لإعادة إرسال الكود");
      return;
    }
    setBusy(true);
    setError("");
    try {
      if (otpType === "signup") {
        const { error: resendErr } = await supabase.auth.resend({ type: "signup", email: cleanEmail });
        if (resendErr) {
          await supabase.auth.signInWithOtp({ email: cleanEmail });
        }
      } else {
        const { error: otpErr } = await supabase.auth.signInWithOtp({ email: cleanEmail });
        if (otpErr) throw otpErr;
      }
      setCountdown(60);
      setSuccessMsg("تمت إعادة إرسال كود تأكيد جديد إلى بريدك الإلكتروني بنجاح.");
    } catch (err) {
      setError(translateAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  // 5. تسجيل دخول سريع عبر كود الإيميل (بدون كلمة مرور)
  async function handleQuickOtpLogin() {
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError("يرجى كتابة بريدك الإلكتروني أولاً لإرسال كود الدخول");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const { error: otpErr } = await supabase.auth.signInWithOtp({ email: cleanEmail });
      if (otpErr) throw otpErr;
      setOtpType("email");
      setAuthMode("otp_verify");
      setCountdown(60);
      setSuccessMsg("تم إرسال كود الدخول السريع المكون من 6 أرقام إلى بريدك الإلكتروني.");
    } catch (err) {
      setError(translateAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  // 6. تسجيل الدخول بواسطة Google
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
              : authMode === "otp_verify"
                ? "تأكيد كود التحقق المرسل إلى بريدك"
                : "تسجيل الدخول وإدارة الطلبات والمتاجر في الحسينية"}
          </p>
        </div>

        {/* حالة المستخدم المسجل بالفعل */}
        {user ? (
          <div className="space-y-3">
            <div className="rounded-xl border bg-secondary/50 p-3 text-center text-sm">
              <p className="font-medium text-foreground">{user.email || "حساب مسجل"}</p>
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

            {/* وضع 1: التحقق من كود التأكيد (OTP) */}
            {authMode === "otp_verify" ? (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="rounded-xl border bg-muted/40 p-3.5 text-center text-xs text-muted-foreground leading-relaxed">
                  <Mail className="size-5 mx-auto mb-1.5 text-primary" />
                  <span>تم إرسال كود تأكيد مكون من 6 أرقام إلى:</span>
                  <p className="mt-1 font-bold text-foreground text-sm" dir="ltr">
                    {email}
                  </p>
                </div>

                <div className="flex flex-col items-center gap-2 pt-1">
                  <label className="text-xs font-semibold text-muted-foreground">أدخل كود التأكيد (6 أرقام):</label>
                  <div dir="ltr" className="my-1">
                    <InputOTP maxLength={6} value={otp} onChange={setOtp} disabled={busy}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup>
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>

                <Button type="submit" disabled={busy || otp.length < 6} className="h-11 w-full font-bold">
                  {busy ? <LoaderCircle className="size-4 animate-spin ml-2" /> : <KeyRound className="size-4 ml-2" />}
                  تأكيد الكود ودخول الحساب
                </Button>

                <div className="flex items-center justify-between text-xs pt-2 border-t">
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={countdown > 0 || busy}
                    className="text-primary hover:underline font-semibold disabled:text-muted-foreground disabled:no-underline flex items-center gap-1"
                  >
                    <RotateCcw className="size-3" />
                    {countdown > 0 ? `إعادة الإرسال بعد (${countdown} ثانية)` : "إعادة إرسال الكود"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("signin");
                      setError("");
                      setSuccessMsg("");
                    }}
                    className="text-muted-foreground hover:text-foreground underline"
                  >
                    تغيير البريد الإلكتروني
                  </button>
                </div>
              </form>
            ) : (
              /* وضع 2: تسجيل الدخول أو إنشاء حساب بالبريد وكلمة المرور */
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
                      authMode === "signin" ? "bg-background text-foreground shadow-xs font-bold" : "text-muted-foreground hover:text-foreground"
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
                      authMode === "signup" ? "bg-background text-foreground shadow-xs font-bold" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    حساب جديد (مع كود تأكيد)
                  </button>
                </div>

                {/* نموذج البريد وكلمة المرور */}
                <form onSubmit={authMode === "signin" ? handleSignIn : handleSignUp} className="space-y-3.5">
                  <div className="space-y-1.5 text-right">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 justify-end">
                      <span>البريد الإلكتروني</span>
                      <Mail className="size-3.5 text-muted-foreground" />
                    </label>
                    <Input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
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
                    <Input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError("");
                      }}
                      disabled={busy}
                      className="h-11 text-left"
                      dir="ltr"
                      minLength={6}
                    />
                    {authMode === "signup" && (
                      <p className="text-[11px] text-muted-foreground">يجب أن لا تقل كلمة المرور عن 6 أحرف أو أرقام</p>
                    )}
                  </div>

                  <Button type="submit" disabled={busy} className="h-11 w-full font-bold shadow-sm">
                    {busy ? (
                      <LoaderCircle className="size-4 animate-spin ml-2" />
                    ) : authMode === "signin" ? (
                      <ArrowLeft className="size-4 ml-2" />
                    ) : (
                      <Sparkles className="size-4 ml-2" />
                    )}
                    {authMode === "signin" ? "تسجيل الدخول" : "إنشاء حساب وإرسال كود التأكيد"}
                  </Button>

                  {/* رابط إرسال كود دخول سريع بدون كلمة مرور */}
                  {authMode === "signin" && (
                    <div className="text-center pt-1">
                      <button
                        type="button"
                        onClick={handleQuickOtpLogin}
                        disabled={busy}
                        className="text-xs text-primary hover:underline font-medium"
                      >
                        نسيت كلمة المرور؟ أو أرسل لي كود دخول سريع على الإيميل
                      </button>
                    </div>
                  )}
                </form>

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

                {/* مميزات الأمان */}
                <div className="rounded-xl border bg-muted/20 p-3 space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="size-4 text-primary shrink-0" />
                    <span>حسابك محمي بتأكيد الكود عبر البريد الإلكتروني</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>مزامنة فورية للطلبات والعناوين مع الموبايل والموقع</span>
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
