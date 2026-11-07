import { useState } from "react";
import { Star, Store, Bike, Send, Check } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { submitOrderReview } from "@/lib/customer.functions";

interface OrderReviewDialogProps {
  orderId: string | null;
  storeId: string | null;
  storeName: string;
  hasDriver?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReviewed?: () => void;
}

export function OrderReviewDialog({
  orderId,
  storeId,
  storeName,
  hasDriver = true,
  open,
  onOpenChange,
  onReviewed,
}: OrderReviewDialogProps) {
  const submitReview = useServerFn(submitOrderReview);
  const qc = useQueryClient();

  const [storeRating, setStoreRating] = useState(5);
  const [storeComment, setStoreComment] = useState("");
  const [driverRating, setDriverRating] = useState(5);
  const [driverComment, setDriverComment] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      if (!orderId || !storeId) throw new Error("بيانات الطلب غير مكتملة");
      return submitReview({
        data: {
          orderId,
          storeId,
          storeRating,
          storeComment: storeComment.trim() || undefined,
          driverRating: hasDriver ? driverRating : undefined,
          driverComment: hasDriver ? driverComment.trim() || undefined : undefined,
        },
      });
    },
    onSuccess: () => {
      if (orderId) {
        try {
          localStorage.setItem(
            `order_reviewed_${orderId}`,
            JSON.stringify({
              storeRating,
              driverRating: hasDriver ? driverRating : null,
            })
          );
        } catch {}
      }
      qc.invalidateQueries({ queryKey: ["customer-orders"] });
      qc.invalidateQueries({ queryKey: ["catalog"] });
      toast.success("شكراً لك! تم تسجيل تقييمك للمتجر والتوصيل بنجاح ⭐");
      onOpenChange(false);
      onReviewed?.();
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "تعذر إرسال التقييم");
    },
  });

  function renderStars(current: number, onChange: (val: number) => void) {
    return (
      <div className="flex items-center gap-1.5" dir="ltr">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1 transition-transform hover:scale-110 focus:outline-hidden"
          >
            <Star
              className={`size-6 transition-colors ${
                star <= current
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted-foreground/30 hover:text-amber-300"
              }`}
            />
          </button>
        ))}
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full p-5 rounded-2xl" dir="rtl">
        <DialogHeader className="text-right space-y-1">
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <Star className="size-5 fill-amber-400 text-amber-400" />
            تقييم تجربة الطلب والتوصيل
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            رأيك يهمنا لمساعدتنا في تحسين جودة الخدمة والمتاجر في الحسينية
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* 1. Store Review */}
          <div className="rounded-xl border bg-card p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                <Store className="size-4 text-primary" />
                تقييم المتجر: {storeName}
              </span>
              {renderStars(storeRating, setStoreRating)}
            </div>
            <Textarea
              rows={2}
              value={storeComment}
              onChange={(e) => setStoreComment(e.target.value)}
              placeholder="اكتب ملاحظاتك على جودة الأكل، التغليف، والتحضير (اختياري)..."
              className="text-xs resize-none bg-muted/20"
            />
          </div>

          {/* 2. Driver Review */}
          {hasDriver && (
            <div className="rounded-xl border bg-card p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                  <Bike className="size-4 text-emerald-600" />
                  تقييم كابتن التوصيل
                </span>
                {renderStars(driverRating, setDriverRating)}
              </div>
              <Textarea
                rows={2}
                value={driverComment}
                onChange={(e) => setDriverComment(e.target.value)}
                placeholder="اكتب ملاحظاتك على سرعة وحسن معاملة الكابتن (اختياري)..."
                className="text-xs resize-none bg-muted/20"
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 pt-2">
          <Button
            type="button"
            className="flex-1 font-bold gap-2 bg-primary text-primary-foreground h-10"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            <Check className="size-4" />
            {mutation.isPending ? "جاري الإرسال..." : "إرسال التقييم"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-10"
            onClick={() => onOpenChange(false)}
          >
            تخطي
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
