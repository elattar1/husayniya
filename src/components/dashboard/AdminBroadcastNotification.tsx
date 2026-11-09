import { useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  Megaphone,
  Users,
  Store,
  UtensilsCrossed,
  ShoppingBag,
  Pill,
  Stethoscope,
  Wrench,
  Bike,
  Send,
  LoaderCircle,
  Bell,
  Eye,
  CheckCircle2,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { sendBroadcastNotification, getBroadcastAudienceCount } from "@/lib/dashboard.functions";

type TargetOption = {
  id: string;
  label: string;
  description: string;
  icon: typeof Users;
  defaultPath: string;
};

const TARGET_OPTIONS: TargetOption[] = [
  {
    id: "all",
    label: "جميع المستخدمين والعملاء",
    description: "كل الحسابات المسجلة في المنصة (عملاء، تجار، دليفري)",
    icon: Users,
    defaultPath: "/",
  },
  {
    id: "stores_all",
    label: "أصحاب كافة المتاجر ومقدمي الخدمات",
    description: "جميع التجار ومقدمي الخدمات المعتمدين في الحسينية",
    icon: Store,
    defaultPath: "/provider",
  },
  {
    id: "category:restaurants",
    label: "أصحاب المطاعم والكافيهات فقط",
    description: "المشويات، البيتزا، البرجر، الكريب والمقاهي",
    icon: UtensilsCrossed,
    defaultPath: "/provider",
  },
  {
    id: "category:supermarkets",
    label: "أصحاب السوبر ماركت والبقالة فقط",
    description: "متاجر المواد الغذائية، الألبان، والمستلزمات",
    icon: ShoppingBag,
    defaultPath: "/provider",
  },
  {
    id: "category:pharmacies",
    label: "أصحاب الصيدليات فقط",
    description: "الصيدليات ومنافذ الأدوية والمستلزمات الطبية",
    icon: Pill,
    defaultPath: "/provider",
  },
  {
    id: "category:doctors",
    label: "الأطباء والعيادات فقط",
    description: "العيادات التخصصية ومقدمي الرعاية الصحية",
    icon: Stethoscope,
    defaultPath: "/provider",
  },
  {
    id: "category:maintenance",
    label: "فنيي الصيانة والخدمات المنزلية",
    description: "السباكة، الكهرباء، التكييف، والنجارة",
    icon: Wrench,
    defaultPath: "/provider",
  },
  {
    id: "drivers",
    label: "كباتن وفريق التوصيل (الدليفري)",
    description: "كباتن التوصيل المسجلين لتوصيل الطلبات",
    icon: Bike,
    defaultPath: "/delivery",
  },
];

export function AdminBroadcastNotification({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const sendBroadcast = useServerFn(sendBroadcastNotification);
  const getCount = useServerFn(getBroadcastAudienceCount);

  const [target, setTarget] = useState<string>("all");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [path, setPath] = useState("");
  const [busy, setBusy] = useState(false);
  const [estimatedCount, setEstimatedCount] = useState<number | null>(null);
  const [loadingCount, setLoadingCount] = useState(false);

  // تحديث عدد المستهدفين عند تغيير الفئة أو فتح النافذة
  useEffect(() => {
    if (!open) return;
    let active = true;
    setLoadingCount(true);
    getCount({ data: { target } })
      .then((res) => {
        if (active && res) {
          setEstimatedCount(res.count);
        }
      })
      .catch((err) => {
        console.warn("Count estimation error:", err);
      })
      .finally(() => {
        if (active) setLoadingCount(false);
      });

    // تحديث مسار التوجيه التلقائي إن لم يُكتب مسار مخصص
    const opt = TARGET_OPTIONS.find((o) => o.id === target);
    if (opt && !path) {
      setPath(opt.defaultPath);
    }

    return () => {
      active = false;
    };
  }, [open, target]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const cleanTitle = title.trim();
    const cleanBody = body.trim();

    if (!cleanTitle || cleanTitle.length < 3) {
      toast.error("يرجى كتابة عنوان واضح للإشعار (3 أحرف على الأقل)");
      return;
    }
    if (!cleanBody || cleanBody.length < 5) {
      toast.error("يرجى كتابة نص الإشعار (5 أحرف على الأقل)");
      return;
    }

    setBusy(true);
    try {
      const res = await sendBroadcast({
        data: {
          title: cleanTitle,
          body: cleanBody,
          target,
          path: path.trim() || "/",
        },
      });

      if (res && res.success) {
        toast.success(res.message || "تم إرسال الإشعار الجماعي بنجاح!");
        setTitle("");
        setBody("");
        onOpenChange(false);
      } else {
        toast.error("تعذر إرسال الإشعار، يرجى المحاولة لاحقاً");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "حدث خطأ أثناء إرسال الإشعار");
    } finally {
      setBusy(false);
    }
  }

  const selectedOption = TARGET_OPTIONS.find((o) => o.id === target) || TARGET_OPTIONS[0];
  const TargetIcon = selectedOption.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-7" dir="rtl">
        <div className="flex items-center gap-3 border-b pb-4">
          <div className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Megaphone className="size-6" />
          </div>
          <div>
            <DialogTitle className="text-xl font-bold">إرسال إشعار جماعي</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
              إرسال إشعار فوري لجميع المستخدمين أو لأصحاب فئة معينة من المتاجر والخدمات في الحسينية
            </DialogDescription>
          </div>
        </div>

        <form onSubmit={handleSend} className="space-y-5 pt-3">
          {/* 1. اختيار الفئة المستهدفة */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground">الفئة المستهدفة للإشعار:</label>
              <span className="text-xs text-muted-foreground flex items-center gap-1 font-semibold">
                {loadingCount ? (
                  <LoaderCircle className="size-3 animate-spin text-primary" />
                ) : (
                  <span className="text-primary font-bold">{estimatedCount ?? 0}</span>
                )}
                مستلم متوقع
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1 border rounded-xl bg-muted/20">
              {TARGET_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = target === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setTarget(opt.id);
                      setPath(opt.defaultPath);
                    }}
                    className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-right transition-all cursor-pointer ${
                      isSelected
                        ? "border-primary bg-primary/5 text-primary shadow-xs font-bold ring-1 ring-primary/30"
                        : "border-border/60 bg-card hover:border-primary/40 text-foreground"
                    }`}
                  >
                    <Icon className={`size-4 shrink-0 mt-0.5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold truncate">{opt.label}</p>
                      <p className="text-[10px] text-muted-foreground line-clamp-1">{opt.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. عنوان الإشعار */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground flex items-center justify-between">
              <span>عنوان الإشعار:</span>
              <span className="text-[10px] text-muted-foreground font-normal">{title.length}/100</span>
            </label>
            <Input
              required
              placeholder="مثال: خصومات نهاية الأسبوع بمطاعم الحسينية 🎉 أو تنبيه هام للتجار"
              value={title}
              maxLength={100}
              onChange={(e) => setTitle(e.target.value)}
              disabled={busy}
              className="h-10 text-sm font-semibold"
            />
          </div>

          {/* 3. نص الإشعار */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground flex items-center justify-between">
              <span>نص ومحتوى الإشعار:</span>
              <span className="text-[10px] text-muted-foreground font-normal">{body.length}/500</span>
            </label>
            <Textarea
              required
              placeholder="اكتب تفاصيل الرسالة بوضوح للجمهور المستهدف..."
              value={body}
              maxLength={500}
              onChange={(e) => setBody(e.target.value)}
              disabled={busy}
              rows={3}
              className="text-sm leading-relaxed"
            />
          </div>

          {/* 4. رابط التوجيه عند الضغط */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <span>رابط التوجيه عند النقر (اختياري):</span>
              <span className="text-[10px] text-muted-foreground font-normal">(الصفحة التي ستفتح عند ضغط الإشعار)</span>
            </label>
            <Input
              placeholder="مثال: / أو /orders أو /provider"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              disabled={busy}
              dir="ltr"
              className="h-9 text-xs text-left"
            />
          </div>

          {/* 5. معاينة حية لشكل الإشعار على الهاتف */}
          <div className="rounded-xl border border-dashed border-border p-3.5 bg-muted/30 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <Eye className="size-3.5 text-primary" />
              <span>معاينة الإشعار على هاتف المستخدم:</span>
            </div>
            <div className="rounded-xl border bg-card p-3 shadow-sm flex items-start gap-3">
              <div className="size-10 rounded-xl bg-primary grid place-items-center text-primary-foreground shrink-0 shadow-xs">
                <Bell className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] font-bold text-primary">خدمات الحسينية</p>
                  <span className="text-[10px] text-muted-foreground">الآن</span>
                </div>
                <p className="text-xs font-bold text-foreground truncate mt-0.5">
                  {title.trim() || "عنوان الإشعار يظهر هنا..."}
                </p>
                <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
                  {body.trim() || "نص ومحتوى الإشعار كما سيراه المستخدم في الهاتف وقائمة الإشعارات..."}
                </p>
              </div>
            </div>
          </div>

          {/* الأزرار */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t">
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => onOpenChange(false)}
              className="text-xs font-semibold"
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={busy || !title.trim() || !body.trim()}
              className="gap-2 font-bold text-xs h-10 px-5 shadow-soft"
            >
              {busy ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  جارٍ الإرسال...
                </>
              ) : (
                <>
                  <Send className="size-4" />
                  إرسال الإشعار الآن ({estimatedCount ?? 0})
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
