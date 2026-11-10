import { useState, useEffect } from "react";
import { AlertTriangle, RotateCcw, LogOut, Clock, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { reactivateAccount, checkAndPurgeAccount, formatRemainingTime } from "@/lib/auth.functions";
import { toast } from "sonner";

export function AccountDeletionInterceptModal() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [remainingText, setRemainingText] = useState("");
  const [requestedDateText, setRequestedDateText] = useState("");

  const isPendingDeletion = user?.user_metadata?.deletion_status === "pending";

  useEffect(() => {
    if (!user || !isPendingDeletion) {
      setOpen(false);
      return;
    }

    const scheduledIso = user.user_metadata?.scheduled_deletion_at;
    const requestedIso = user.user_metadata?.deletion_requested_at;

    if (requestedIso) {
      try {
        const d = new Date(requestedIso);
        setRequestedDateText(
          d.toLocaleDateString("ar-EG", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        );
      } catch {
        setRequestedDateText(requestedIso);
      }
    }

    if (scheduledIso) {
      setRemainingText(formatRemainingTime(scheduledIso));
    }

    // فحص ما إذا كانت المهلة انقضت بالفعل لحذف الحساب نهائياً
    checkAndPurgeAccount()
      .then(async (res) => {
        if (res.status === "purged") {
          toast.error(res.message || "تم حذف الحساب نهائياً بعد انتهاء مهلة الـ 7 أيام.");
          await supabase.auth.signOut();
          window.location.href = "/";
        } else if (res.status === "pending") {
          setOpen(true);
          if (res.remainingTime) setRemainingText(res.remainingTime);
        }
      })
      .catch((e) => {
        console.error("Check purge error:", e);
        setOpen(true);
      });
  }, [user, isPendingDeletion]);

  if (!open || !user || !isPendingDeletion) {
    return null;
  }

  // 1. خيار إعادة تنشيط الحساب
  async function handleReactivate() {
    setBusy(true);
    try {
      const res = await reactivateAccount();
      toast.success(res.message || "تم إعادة تنشيط حسابك بنجاح! يسعدنا استمرارك معنا.");
      setOpen(false);
      // تحديث الجلسة لتحديث الـ user_metadata في المتصفح
      await supabase.auth.refreshSession();
      window.location.reload();
    } catch (err: any) {
      toast.error(err?.message || "تعذر إعادة تنشيط الحساب، يرجى المحاولة لاحقاً");
    } finally {
      setBusy(false);
    }
  }

  // 2. خيار إبقاء طلب الحذف وتسجيل الخروج
  async function handleKeepDeletionAndSignOut() {
    setBusy(true);
    try {
      await supabase.auth.signOut();
      toast.info("تم تسجيل خروجك. يستمر العد التنازلي لحذف الحساب نهائياً.");
      window.location.href = "/";
    } catch (err) {
      console.error("Sign out error:", err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        dir="rtl"
        className="max-w-[calc(100%-2rem)] sm:max-w-md [&>button]:hidden text-right border-amber-500/30"
      >
        <div className="flex flex-col items-center text-center space-y-3 pt-2">
          <div className="grid size-14 place-items-center rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20 shadow-xs">
            <AlertTriangle className="size-8" />
          </div>

          <DialogTitle className="text-xl font-bold text-foreground flex items-center justify-center gap-1.5">
            <span>مرحباً بعودتك!</span>
            <span className="text-2xl">👋</span>
          </DialogTitle>

          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            تم تسجيل الدخول بنجاح، لكن هذا الحساب معلق حالياً في قائمة انتظار الحذف النهائي.
          </DialogDescription>
        </div>

        {/* تفاصيل طلب الحذف والمتبقي */}
        <div className="rounded-xl border bg-muted/40 p-4 space-y-2.5 text-xs text-foreground mt-3">
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-muted-foreground">تاريخ طلب الحذف:</span>
            <span className="font-semibold" dir="auto">
              {requestedDateText || "مؤخراً"}
            </span>
          </div>

          <div className="flex items-center justify-between pt-0.5">
            <span className="text-muted-foreground flex items-center gap-1">
              <Clock className="size-3.5 text-amber-600" />
              الوقت المتبقي للحذف النهائي:
            </span>
            <span className="font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-md">
              {remainingText || "أقل من 7 أيام"}
            </span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed text-center px-1">
          إذا اخترت <strong>إعادة التنشيط</strong>، فسيتم إلغاء طلب الحذف فوراً والعودة لاستخدام خدمات الحسينية بكل بياناتك.
          أما إذا اخترت <strong>تسجيل الخروج</strong>، فسيستمر العد التنازلي لحذف الحساب نهائياً.
        </p>

        {/* الأزرار والإجراءات */}
        <div className="space-y-2.5 pt-2">
          <Button
            type="button"
            disabled={busy}
            onClick={handleReactivate}
            className="w-full font-bold h-11 bg-primary text-primary-foreground hover:bg-primary/90 gap-2 shadow-sm"
          >
            <Sparkles className="size-4" />
            إعادة تنشيط الحساب والمتابعة
          </Button>

          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={handleKeepDeletionAndSignOut}
            className="w-full text-xs font-semibold h-10 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive gap-1.5"
          >
            <LogOut className="size-3.5" />
            إبقاء طلب الحذف وتسجيل الخروج
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
