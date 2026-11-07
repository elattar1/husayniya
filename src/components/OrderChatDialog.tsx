import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { 
  Send, 
  Phone, 
  Bike, 
  Store, 
  User, 
  RefreshCw, 
  MessageCircle, 
  Clock, 
  CheckCheck,
  AlertCircle,
  Sparkles,
  Shield,
  ArrowRightLeft,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getOrderChat, sendOrderChatMessage, type OrderChatInfo } from "@/lib/chat.functions";

interface OrderChatDialogProps {
  orderId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function playReceiveSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(520, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch {}
}

const CUSTOMER_TO_STORE_PRESETS = [
  "هل يمكن تعديل أو إضافة صنف؟ 🛒",
  "كم من الوقت متبقي للتجهيز؟ ⏱️",
  "رجاءً التأكد من تغليف الأصناف جيداً 👍",
  "تمام، في انتظاركم 🙏",
];

const STORE_TO_CUSTOMER_PRESETS = [
  "جاري تجهيز طلبك الآن بعناية 🛍️",
  "يوجد صنف غير متوفر، تحب نستبدله بآخر؟ 🔄",
  "طلبك جاهز وبانتظار وصول كابتن التوصيل 📦",
  "تم التأكيد، سيكون الطلب جاهزاً خلال دقائق ⏱️",
];

const CUSTOMER_TO_DRIVER_PRESETS = [
  "أنا في انتظارك أمام المنزل 👍",
  "أنا نازل أستلم منك حالاً 🏢",
  "اتصل بي أول ما توصل 📱",
  "شكراً جزيلاً يا كابتن 🙏",
];

const DRIVER_TO_CUSTOMER_PRESETS = [
  "أنا في الطريق إليك الآن 🛵",
  "وصلت تحت المبنى/البيت 📍",
  "معي الطلب وجاهز للتسليم 📦",
  "برجاء الرد على الهاتف 📞",
];

export function OrderChatDialog({ orderId, open, onOpenChange }: OrderChatDialogProps) {
  const getChat = useServerFn(getOrderChat);
  const sendMessage = useServerFn(sendOrderChatMessage);
  const qc = useQueryClient();

  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef<number>(0);

  const queryKey = ["order-chat", orderId];

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery<OrderChatInfo>({
    queryKey,
    queryFn: () => getChat({ data: { orderId: orderId! } }),
    enabled: !!orderId && open,
    refetchInterval: open ? 3000 : false, // Auto-poll every 3s when chat dialog is open
  });

  // Sound cue when new incoming message arrives
  useEffect(() => {
    if (data?.messages) {
      if (prevCountRef.current > 0 && data.messages.length > prevCountRef.current) {
        const lastMsg = data.messages[data.messages.length - 1];
        if (lastMsg.sender_role !== data.myRole) {
          playReceiveSound();
        }
      }
      prevCountRef.current = data.messages.length;
    }
  }, [data?.messages, data?.myRole]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (open && data?.messages) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [data?.messages?.length, open]);

  const sendMutation = useMutation({
    mutationFn: async (text: string) => {
      if (!orderId) throw new Error("رقم الطلب مفقود");
      return sendMessage({ data: { orderId, message: text } });
    },
    onSuccess: (res) => {
      setInputMessage("");
      if (res.message) {
        qc.setQueryData<OrderChatInfo>(queryKey, (prev) => {
          if (!prev) return prev;
          const exists = prev.messages.some((m) => m.id === res.message.id);
          if (exists) return prev;
          return {
            ...prev,
            messages: [...prev.messages, res.message],
          };
        });
      }
      qc.invalidateQueries({ queryKey });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "تعذر إرسال الرسالة");
    },
  });

  const handleSend = (textToSend?: string) => {
    const text = (textToSend ?? inputMessage).trim();
    if (!text || sendMutation.isPending) return;
    sendMutation.mutate(text);
  };

  const isCustomer = data?.myRole === "customer";
  const isStore = data?.myRole === "store";
  const isDriver = data?.myRole === "driver";
  const isDriverStage = data?.chatStage === "driver";

  // Determine active other party details
  let otherPartyTitle = "الطرف الآخر";
  let otherPartyPhone: string | null = null;
  let stageDescription = "";
  let presets: string[] = [];

  if (isCustomer) {
    if (isDriverStage) {
      otherPartyTitle = data?.driver?.name || "كابتن التوصيل";
      otherPartyPhone = data?.driver?.phone || null;
      stageDescription = "الطلب في الطريق إليك مع الكابتن 🛵";
      presets = CUSTOMER_TO_DRIVER_PRESETS;
    } else {
      otherPartyTitle = data?.store?.name || "المتجر / المطعم";
      otherPartyPhone = data?.store?.phone || null;
      stageDescription = "جاري تجهيز وتأكيد طلبك داخل المتجر 🏪";
      presets = CUSTOMER_TO_STORE_PRESETS;
    }
  } else if (isStore) {
    otherPartyTitle = data?.customer?.name ? `العميل (${data.customer.name})` : "العميل";
    otherPartyPhone = data?.customer?.phone || null;
    stageDescription = "تواصل مباشر مع العميل أثناء تجهيز الطلب";
    presets = STORE_TO_CUSTOMER_PRESETS;
  } else if (isDriver) {
    otherPartyTitle = data?.customer?.name ? `العميل (${data.customer.name})` : "العميل";
    otherPartyPhone = data?.customer?.phone || null;
    stageDescription = "توصيل الشحنة للعميل";
    presets = DRIVER_TO_CUSTOMER_PRESETS;
  } else {
    // Admin
    otherPartyTitle = isDriverStage ? (data?.driver?.name || "كابتن التوصيل") : (data?.store?.name || "المتجر");
    stageDescription = "متابعة إدارة المنظومة";
    presets = ["مرحباً، للمساعدة بخصوص الطلب...", "تم التحقق من تفاصيل الطلب"];
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full p-0 gap-0 overflow-hidden rounded-2xl flex flex-col h-[85vh] sm:h-[620px]">
        {/* Header */}
        <DialogHeader className="p-4 border-b bg-card shrink-0 flex flex-row items-center justify-between text-right space-y-0">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              {isCustomer ? (
                isDriverStage ? <Bike className="size-5" /> : <Store className="size-5" />
              ) : (
                <User className="size-5" />
              )}
            </div>
            <div>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                {otherPartyTitle}
                <span className="inline-block size-2 rounded-full bg-emerald-500 animate-pulse" title="متصل الآن" />
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <span>طلب #{orderId?.slice(0, 8)}</span>
                <span>•</span>
                <span className="text-primary font-medium">{stageDescription}</span>
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {otherPartyPhone && (
              <Button asChild variant="outline" size="sm" className="h-8 gap-1 text-xs">
                <a href={`tel:${otherPartyPhone}`}>
                  <Phone className="size-3.5" />
                  اتصال
                </a>
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => refetch()}
              disabled={isFetching}
              title="تحديث الرسائل"
            >
              <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin text-primary" : ""}`} />
            </Button>
          </div>
        </DialogHeader>

        {/* Content / Messages List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20">
          {isLoading && (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
              <RefreshCw className="size-6 animate-spin text-primary" />
              <p className="text-xs">جاري فتح المحادثة...</p>
            </div>
          )}

          {isError && (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2 p-4 text-center">
              <AlertCircle className="size-8 text-destructive" />
              <p className="text-sm font-semibold text-destructive">
                {error instanceof Error ? error.message : "تعذر تحميل المحادثة"}
              </p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                إعادة المحاولة
              </Button>
            </div>
          )}

          {!isLoading && !isError && data && (
            <>
              {/* Context info banner */}
              {isCustomer && !isDriverStage && (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-foreground flex items-start gap-2 shadow-xs">
                  <Store className="size-4 shrink-0 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold text-primary">المحادثة الآن مباشرة مع {data.store?.name || "المتجر"}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                      يتم تجهيز طلبك داخل المتجر. يمكنك الاستفسار أو طلب أي تعديل وسيرد عليك المتجر فوراً. عند انتهاء التحضير واستلام الكابتن للطلب، ستنتقل المحادثة تلقائياً لكابتن التوصيل 🛵.
                    </p>
                  </div>
                </div>
              )}

              {isCustomer && isDriverStage && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-950 dark:text-emerald-200 flex items-start gap-2 shadow-xs">
                  <Bike className="size-4 shrink-0 text-emerald-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-emerald-700 dark:text-emerald-300">الطلب الآن مع كابتن التوصيل ({data.driver?.name || "الكابتن"})</p>
                    <p className="text-[11px] opacity-90 mt-0.5 leading-relaxed">
                      انتهى المتجر من التحضير واستلم الكابتن الطلب وهو في الطريق لتسليمه لك. يمكنك مراسلته لتنسيق مكان الاستلام بدقة.
                    </p>
                  </div>
                </div>
              )}

              {/* Empty State */}
              {data.messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-center p-6 space-y-2">
                  <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <MessageCircle className="size-6" />
                  </div>
                  <h4 className="font-bold text-foreground text-sm">محادثة فورية مباشرة</h4>
                  <p className="text-xs max-w-xs text-muted-foreground">
                    تواصل مباشرة مع {otherPartyTitle} لتنسيق ومتابعة تفاصيل الطلب لحظة بلحظة.
                  </p>
                </div>
              )}

              {/* Messages Bubble Stream */}
              {data.messages.map((msg, idx) => {
                const isMe = msg.sender_role === data.myRole;
                const formattedTime = new Date(msg.created_at).toLocaleTimeString("ar-EG", {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                // Display role badge
                const roleBadge = 
                  msg.sender_role === "store"
                    ? `🏪 ${msg.sender_name || (data.store?.name ?? "المتجر")}`
                    : msg.sender_role === "driver"
                    ? `🛵 ${msg.sender_name || "كابتن التوصيل"}`
                    : msg.sender_role === "customer"
                    ? `👤 ${msg.sender_name || "العميل"}`
                    : `🛡️ ${msg.sender_name || "الإدارة"}`;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? "items-start" : "items-end"} gap-1`}
                  >
                    <div className="flex items-center gap-1.5 px-1 text-[11px] text-muted-foreground">
                      <span className="font-medium">
                        {isMe ? "أنت" : roleBadge}
                      </span>
                      <span>•</span>
                      <span>{formattedTime}</span>
                    </div>

                    <div
                      className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm shadow-sm break-words whitespace-pre-wrap leading-relaxed ${
                        isMe
                          ? "bg-primary text-primary-foreground rounded-tr-none"
                          : "bg-card border text-foreground rounded-tl-none"
                      }`}
                    >
                      {msg.message}
                    </div>

                    {isMe && (
                      <div className="flex items-center gap-1 px-1 text-[10px] text-muted-foreground/70">
                        <CheckCheck className="size-3 text-primary" />
                        <span>تم الإرسال</span>
                      </div>
                    )}
                  </div>
                );
              })}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Quick Suggestion Presets & Input Bar, OR Locked Footer when delivered */}
        {data?.status === "delivered" || data?.status === "completed" || data?.status === "cancelled" ? (
          <div className="p-4 border-t bg-muted/40 shrink-0 text-center space-y-1">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-foreground">
              <Lock className="size-4 text-primary" />
              <span>تم اكتمال تسليم الطلب بنجاح وأُغلقت المحادثة تلقائياً</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              سجل الرسائل محفوظ لديك للاطلاع عليه في أي وقت.
            </p>
          </div>
        ) : (
          <>
            {/* Quick Suggestion Presets */}
            <div className="border-t bg-card/60 px-3 py-2 shrink-0 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <Sparkles className="size-3.5 text-primary shrink-0 ml-1" />
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSend(preset)}
                  disabled={sendMutation.isPending}
                  className="text-xs whitespace-nowrap bg-muted hover:bg-muted/80 text-foreground px-2.5 py-1 rounded-full transition-colors font-medium border border-border/50 shrink-0"
                >
                  {preset}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t bg-card shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={
                    isCustomer
                      ? isDriverStage
                        ? "اكتب رسالة لكابتن التوصيل..."
                        : `اكتب رسالة لـ ${data?.store?.name || "المتجر"}...`
                      : "اكتب رسالتك للعميل..."
                  }
                  className="flex-1 bg-muted/30 h-10 text-sm focus-visible:ring-primary"
                  disabled={sendMutation.isPending}
                  autoFocus
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!inputMessage.trim() || sendMutation.isPending}
                  className="size-10 shrink-0 bg-primary text-primary-foreground rounded-xl"
                  title="إرسال"
                >
                  <Send className={`size-4 ${sendMutation.isPending ? "animate-pulse" : ""}`} />
                </Button>
              </form>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
