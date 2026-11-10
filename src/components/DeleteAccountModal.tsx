import { useState } from "react";
import { AlertTriangle, Lock, Mail, LoaderCircle, KeyRound, RotateCcw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import {
  requestAccountDeletion,
  sendDeletionVerificationCode,
} from "@/lib/auth.functions";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteAccountModal({ open, onOpenChange }: Props) {
  const { user } = useAuth();

  // نوع التحقق: كلمة مرور أو كود تأكيد عبر البريد
  const isGoogleUser =
    user?.app_metadata?.provider === "google" ||
    user?.app_metadata?.providers?.includes("google") ||
    user?.identities?.some((id: any) => id.provider === "google");

  const [verifyMethod, setVerifyMethod] = useState<"password" | "code">(
    isGoogleUser ? "code" : "password"
  );

  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState("");
  const [countdown, setCountdown] = useState(0);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // مؤقت إعادة إرسال الكود
  useState(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(t);
  });

  // إرسال كود التحقق إلى البريد الإلكتروني
  async function handleSendCode() {
    setBusy(true);
    setError("");
    try {
      const res = await sendDeletionVerificationCode();
      setCodeSent(true);
      setCountdown(60);
      setMaskedEmail(res.maskedEmail);
      toast.success(res.message || "تم إرسال كود التحقق بنجاح إلى بريدك الإلكتروني.");
    } catch (err: any) {
      setError(err?.message || "تعذر إرسال كود التحقق، يرجى المحاولة لاحقاً");
    } finally {
      setBusy(false);
    }
  }

  // تأكيد طلب الحذف والجدولة لمدة 7 أيام
  async function handleConfirmDeletion(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      let method: "password" | "code" | "google_confirm" = verifyMethod;
      if (isGoogleUser && !codeSent && !code) {
        method = "google_confirm";
      }

      const res = await requestAccountDeletion({
        data: {
          method,
          password: verifyMethod === "password" ? password : undefined,
          code: verifyMethod === "code" ? code : undefined,
        },
      });

      toast.success(
        res.message || "سيتم حذف حسابك نهائياً خلال 7 أيام إذا لم يتم تسجيل الدخول.",
        { duration: 6000 }
      );

      onOpenChange(false);

      // تسجيل الخروج ونقل المستخدم للصفحة الرئيسية
      await supabase.auth.signOut();
      window.location.href = "/";
    } catch (err: any) {
      setError(err?.message || "تعذر إتمام طلب الحذف، يرجى مراجعة البيانات المدخلة");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-w-[calc(100%-2rem)] sm:max-w-md text-right">
        <DialogHeader className="space-y-2 text-right">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="size-5 shrink-0" />
            <DialogTitle className="text-lg font-bold text-destructive">طلب حذف الحساب</DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            سيتم إيقاف حسابك وجدولة حذفه نهائياً بعد <strong>7 أيام</strong>. إذا لم تقم بتسجيل الدخول خلال هذه المدة،
            فسيتم مسح الحساب وبياناته تماماً.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs font-medium text-destructive leading-relaxed text-center"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleConfirmDeletion} className="space-y-4 pt-1">
          {/* خيارات طريقة التحقق */}
          <div className="grid grid-cols-2 rounded-xl bg-muted p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setVerifyMethod("password");
                setError("");
              }}
              className={`rounded-lg py-2 transition-all ${
                verifyMethod === "password"
                  ? "bg-background text-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              بكلمة المرور
            </button>
            <button
              type="button"
              onClick={() => {
                setVerifyMethod("code");
                setError("");
              }}
              className={`rounded-lg py-2 transition-all ${
                verifyMethod === "code"
                  ? "bg-background text-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              بكود على الإيميل
            </button>
          </div>

          {/* طريقة 1: التحقق بكلمة المرور */}
          {verifyMethod === "password" ? (
            <div className="space-y-1.5 text-right">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 justify-end">
                <span>أدخل كلمة المرور الحالية لتأكيد الحذف</span>
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
              />
            </div>
          ) : (
            /* طريقة 2: التحقق بكود عبر البريد الإلكتروني */
            <div className="space-y-3 text-right">
              {!codeSent ? (
                <div className="rounded-xl border bg-muted/30 p-3.5 text-center space-y-2">
                  <Mail className="size-5 mx-auto text-primary" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    سنرسل لك كود تحقق مكون من 6 أرقام إلى بريدك الإلكتروني المسجل.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={busy}
                    onClick={handleSendCode}
                    className="w-full text-xs font-bold border-primary/40 text-primary hover:bg-primary/5"
                  >
                    {busy ? <LoaderCircle className="size-3.5 animate-spin ml-1.5" /> : <Mail className="size-3.5 ml-1.5" />}
                    إرسال كود التحقق إلى البريد
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="rounded-xl border bg-emerald-500/10 border-emerald-500/20 p-2.5 text-center text-xs text-emerald-800 dark:text-emerald-300">
                    تم إرسال كود التحقق إلى: <strong>{maskedEmail || "بريدك المسجل"}</strong> وتنبيهاتك.
                  </div>

                  <div className="space-y-1.5 text-right">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 justify-end">
                      <span>كود التحقق (6 أرقام)</span>
                      <KeyRound className="size-3.5 text-muted-foreground" />
                    </label>
                    <Input
                      type="text"
                      maxLength={6}
                      required
                      placeholder="123456"
                      value={code}
                      onChange={(e) => {
                        setCode(e.target.value);
                        setError("");
                      }}
                      disabled={busy}
                      className="h-11 text-center font-mono text-base tracking-widest"
                      dir="ltr"
                    />
                  </div>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleSendCode}
                      disabled={countdown > 0 || busy}
                      className="text-xs text-primary hover:underline font-semibold disabled:text-muted-foreground disabled:no-underline flex items-center justify-center gap-1 mx-auto"
                    >
                      <RotateCcw className="size-3" />
                      {countdown > 0 ? `إعادة الإرسال بعد (${countdown} ثانية)` : "إعادة إرسال الكود"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* تنبيه الـ 7 أيام والترحيب عند العودة */}
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-[11px] text-muted-foreground leading-relaxed">
            💡 <strong>ملاحظة هامة:</strong> سيتم تسجيل خروجك فوراً بعد التأكيد. إذا قمت بتسجيل الدخول خلال الـ 7 أيام
            القادمة، ستظهر لك رسالة ترحيبية تتيح لك <strong>إعادة تنشيط الحساب</strong> بضغطة زر وإلغاء الحذف.
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Button
              type="submit"
              variant="destructive"
              disabled={busy || (verifyMethod === "code" && !code.trim()) || (verifyMethod === "password" && !password.trim())}
              className="w-full font-bold h-11"
            >
              {busy ? <LoaderCircle className="size-4 animate-spin ml-2" /> : <AlertTriangle className="size-4 ml-2" />}
              تأكيد وجدولة حذف الحساب (7 أيام)
            </Button>

            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => onOpenChange(false)}
              className="h-11"
            >
              إلغاء
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
