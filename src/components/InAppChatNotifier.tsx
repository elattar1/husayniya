import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Store, Bike, User, Sparkles } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/lib/auth";
import { getNotifications, readNotification } from "@/lib/customer.functions";
import { OrderChatDialog } from "@/components/OrderChatDialog";

function playMessageChime() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = ctx.currentTime;

    // Double chime: First high tone
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(659.25, now); // E5
    gain1.gain.setValueAtTime(0.25, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.25);

    // Second higher tone
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880, now + 0.12); // A5
    gain2.gain.setValueAtTime(0.3, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.45);
  } catch {}
}

export function InAppChatNotifier() {
  const { user } = useAuth();
  const getNotifs = useServerFn(getNotifications);
  const markRead = useServerFn(readNotification);
  const qc = useQueryClient();

  const [activeBanner, setActiveBanner] = useState<{
    id: string;
    orderId: string;
    title: string;
    body: string;
  } | null>(null);

  const [openChatOrderId, setOpenChatOrderId] = useState<string | null>(null);
  const seenNotificationIdsRef = useRef<Set<string>>(new Set());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Poll for notifications every 4 seconds when user is signed in
  const { data: notifications } = useQuery({
    queryKey: ["in-app-chat-notifications", user?.id],
    queryFn: () => getNotifs(),
    enabled: !!user,
    refetchInterval: 4000,
  });

  // Check for incoming chat messages
  useEffect(() => {
    if (!notifications || !Array.isArray(notifications) || !user) return;

    // Find the latest unread chat notification
    const unreadChat = notifications.find(
      (n: any) =>
        !n.is_read &&
        (n.title.includes("رسالة") || n.link?.includes("chat=")) &&
        !seenNotificationIdsRef.current.has(n.id)
    );

    if (unreadChat) {
      seenNotificationIdsRef.current.add(unreadChat.id);

      // Extract orderId from link if present
      let extractedOrderId = "";
      if (unreadChat.link && unreadChat.link.includes("chat=")) {
        extractedOrderId = unreadChat.link.split("chat=")[1].split("&")[0];
      }

      if (extractedOrderId) {
        // Show banner and play sound
        setActiveBanner({
          id: unreadChat.id,
          orderId: extractedOrderId,
          title: unreadChat.title,
          body: unreadChat.body,
        });

        playMessageChime();

        // Auto dismiss after 5 seconds
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          setActiveBanner(null);
        }, 5000);
      }
    }
  }, [notifications, user]);

  const markAsReadMutation = useMutation({
    mutationFn: (notifId: string) => markRead({ data: { id: notifId } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["in-app-chat-notifications"] });
    },
  });

  function handleBannerClick() {
    if (!activeBanner) return;
    const targetOrderId = activeBanner.orderId;
    const notifId = activeBanner.id;
    setActiveBanner(null);
    markAsReadMutation.mutate(notifId);
    setOpenChatOrderId(targetOrderId);
  }

  function handleDismiss(e: React.MouseEvent) {
    e.stopPropagation();
    if (activeBanner) {
      markAsReadMutation.mutate(activeBanner.id);
    }
    setActiveBanner(null);
  }

  return (
    <>
      {/* Top Banner Alert */}
      {activeBanner && (
        <div
          role="alert"
          onClick={handleBannerClick}
          className="fixed top-3 left-1/2 -translate-x-1/2 z-[9999] w-[94%] max-w-md cursor-pointer transition-all duration-300 animate-in fade-in slide-in-from-top-4"
        >
          <div className="relative overflow-hidden rounded-2xl border-2 border-primary/40 bg-card/95 backdrop-blur-md p-3.5 shadow-2xl hover:border-primary transition-colors">
            {/* 5-second countdown progress bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-primary/20">
              <div className="h-full bg-primary animate-[shrink_5s_linear_forwards]" />
            </div>

            <div className="flex items-start justify-between gap-3 pt-1">
              <div className="flex items-start gap-3 min-w-0">
                <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-xs">
                  {activeBanner.title.includes("المتجر") ? (
                    <Store className="size-5 text-primary" />
                  ) : activeBanner.title.includes("الكابتن") || activeBanner.title.includes("التوصيل") ? (
                    <Bike className="size-5 text-emerald-600" />
                  ) : (
                    <MessageSquare className="size-5 text-primary" />
                  )}
                </div>

                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground truncate">
                      {activeBanner.title}
                    </span>
                    <span className="inline-block size-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {activeBanner.body}
                  </p>
                  <p className="text-[11px] font-semibold text-primary pt-0.5">
                    اضغط هنا لفتح المحادثة والرد مباشرة 💬
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDismiss}
                className="p-1 text-muted-foreground hover:text-foreground rounded-lg transition-colors shrink-0"
                title="إغلاق"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Order Chat Dialog when banner is clicked */}
      <OrderChatDialog
        orderId={openChatOrderId}
        open={!!openChatOrderId}
        onOpenChange={(open) => !open && setOpenChatOrderId(null)}
      />
    </>
  );
}
