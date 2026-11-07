import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Store, Bike, BellRing, Check, ChevronDown, ChevronUp } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/lib/auth";
import { getNotifications, readNotification } from "@/lib/customer.functions";
import { registerPushDevice } from "@/lib/push.functions";
import { OrderChatDialog } from "@/components/OrderChatDialog";
import { Button } from "@/components/ui/button";

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
  const registerDevice = useServerFn(registerPushDevice);
  const qc = useQueryClient();

  const [activeBanner, setActiveBanner] = useState<{
    id: string;
    orderId: string;
    title: string;
    body: string;
  } | null>(null);

  const [openChatOrderId, setOpenChatOrderId] = useState<string | null>(null);
  const [showPushPrompt, setShowPushPrompt] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);
  const seenNotificationIdsRef = useRef<Set<string>>(new Set());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Touch gesture states for swipe down to open, swipe up to dismiss
  const touchStartY = useRef<number | null>(null);
  const [touchDeltaY, setTouchDeltaY] = useState(0);

  // Auto-register push if permission is granted, or prompt if default
  useEffect(() => {
    if (!user || typeof window === "undefined") return;

    async function checkPushPermission() {
      if (!("Notification" in window) || !("serviceWorker" in navigator)) return;

      if (Notification.permission === "granted") {
        try {
          const { enablePush } = await import("@/lib/push-browser");
          const res = await enablePush();
          if (res.status === "registered" && res.token) {
            await registerDevice({ data: { token: res.token } });
          }
        } catch {}
      } else if (Notification.permission === "default") {
        const dismissed = localStorage.getItem("husayniya_push_dismissed");
        if (!dismissed) {
          setShowPushPrompt(true);
        }
      }
    }

    const t = setTimeout(checkPushPermission, 3000);
    return () => clearTimeout(t);
  }, [user]);

  async function handleEnablePush() {
    setPushBusy(true);
    try {
      const { enablePush } = await import("@/lib/push-browser");
      const res = await enablePush();
      if (res.status === "registered" && res.token) {
        await registerDevice({ data: { token: res.token } });
        setShowPushPrompt(false);
      } else if (res.status === "denied") {
        setShowPushPrompt(false);
      }
    } catch {
      setShowPushPrompt(false);
    } finally {
      setPushBusy(false);
    }
  }

  function handleDismissPushPrompt() {
    setShowPushPrompt(false);
    try {
      localStorage.setItem("husayniya_push_dismissed", "true");
    } catch {}
  }

  // Poll for notifications every 3.5 seconds when user is signed in
  const { data: notifications } = useQuery({
    queryKey: ["in-app-chat-notifications", user?.id],
    queryFn: () => getNotifs(),
    enabled: !!user,
    refetchInterval: 3500,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (notifId: string) => markRead({ data: { id: notifId } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["in-app-chat-notifications"] });
    },
  });

  // Check for incoming chat messages & order update notifications
  useEffect(() => {
    if (!notifications || !Array.isArray(notifications) || !user) return;

    // Find the latest unread chat or order status notification
    const unread = notifications.find(
      (n: any) =>
        !n.is_read &&
        (n.title.includes("رسالة") || n.link?.includes("chat=") || n.title.includes("طلبك") || n.title.includes("طلب")) &&
        !seenNotificationIdsRef.current.has(n.id)
    );

    if (unread) {
      seenNotificationIdsRef.current.add(unread.id);

      // Extract orderId from link if present
      let extractedOrderId = "";
      if (unread.link && unread.link.includes("chat=")) {
        extractedOrderId = unread.link.split("chat=")[1].split("&")[0];
      }

      // Requirement: When chat dialog is currently open for that order,
      // suffice with displaying the message in the chat feed and DO NOT show the top banner!
      const activeWindowChatId = typeof window !== "undefined" ? (window as any).__HUSAYNIYA_ACTIVE_CHAT_ORDER_ID : null;
      if (
        (activeWindowChatId && activeWindowChatId === extractedOrderId) ||
        (openChatOrderId && openChatOrderId === extractedOrderId)
      ) {
        // Silently mark as read without top banner interruption
        markAsReadMutation.mutate(unread.id);
        return;
      }

      if (extractedOrderId) {
        // Show banner and play sound
        setActiveBanner({
          id: unread.id,
          orderId: extractedOrderId,
          title: unread.title,
          body: unread.body,
        });

        playMessageChime();

        // Auto dismiss after 6 seconds
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          setActiveBanner(null);
        }, 6000);
      }
    }
  }, [notifications, user, openChatOrderId]);

  function handleBannerClick() {
    if (!activeBanner) return;
    const targetOrderId = activeBanner.orderId;
    const notifId = activeBanner.id;
    setActiveBanner(null);
    setTouchDeltaY(0);
    markAsReadMutation.mutate(notifId);
    setOpenChatOrderId(targetOrderId);
  }

  function handleDismiss(e?: React.MouseEvent) {
    if (e) e.stopPropagation();
    if (activeBanner) {
      markAsReadMutation.mutate(activeBanner.id);
    }
    setActiveBanner(null);
    setTouchDeltaY(0);
  }

  // Swipe gesture handlers
  function handleTouchStart(e: React.TouchEvent) {
    touchStartY.current = e.touches[0].clientY;
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (touchStartY.current === null) return;
    const delta = e.touches[0].clientY - touchStartY.current;
    // Bound drag for responsive feel
    if (delta > -90 && delta < 90) {
      setTouchDeltaY(delta);
    }
  }

  function handleTouchEnd() {
    if (touchStartY.current === null) return;
    if (touchDeltaY > 25) {
      // Swiped DOWN -> Open Chat!
      handleBannerClick();
    } else if (touchDeltaY < -20) {
      // Swiped UP -> Dismiss Banner!
      handleDismiss();
    }
    touchStartY.current = null;
    setTouchDeltaY(0);
  }

  return (
    <>
      {/* Push Notification Enable Banner */}
      {showPushPrompt && !activeBanner && (
        <div
          role="alert"
          className="fixed top-3 left-1/2 -translate-x-1/2 z-[9998] w-[94%] max-w-md animate-in fade-in slide-in-from-top-4"
        >
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-primary/30 bg-card/95 p-3 shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <BellRing className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-xs">تفعيل إشعارات الهاتف</p>
                <p className="text-[11px] text-muted-foreground truncate">
                  لتلقي رسائل الطلبات وتنبيهات الكابتن حتى لو أغلقت الموقع
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                size="sm"
                disabled={pushBusy}
                onClick={handleEnablePush}
                className="h-8 gap-1 px-2.5 text-xs font-bold"
              >
                <Check className="size-3.5" />
                تفعيل
              </Button>
              <button
                type="button"
                onClick={handleDismissPushPrompt}
                className="rounded-lg p-1 text-muted-foreground hover:text-foreground"
                title="لاحقاً"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Banner Alert with Swipe Gestures: Swipe down to open, swipe up to dismiss */}
      {activeBanner && (
        <div
          role="alert"
          onClick={handleBannerClick}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            transform: `translate(-50%, ${touchDeltaY}px)`,
            transition: touchStartY.current !== null ? "none" : "transform 0.25s ease-out",
          }}
          className="fixed top-3 left-1/2 z-[9999] w-[94%] max-w-md cursor-pointer select-none transition-all duration-200 animate-in fade-in slide-in-from-top-4"
        >
          <div className="relative overflow-hidden rounded-2xl border-2 border-primary/40 bg-card/95 backdrop-blur-md p-3.5 shadow-2xl hover:border-primary transition-colors">
            {/* 6-second countdown progress bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-primary/20">
              <div className="h-full bg-primary animate-[shrink_6s_linear_forwards]" />
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
                  <p className="text-[11px] font-semibold text-primary pt-0.5 flex items-center gap-1">
                    <span>اسحب لأسفل لفتح المحادثة ⬇️ • اسحب لأعلى للإغلاق ⬆️</span>
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

      {/* Global Order Chat Dialog when banner is clicked or swiped down */}
      <OrderChatDialog
        orderId={openChatOrderId}
        open={!!openChatOrderId}
        onOpenChange={(open) => !open && setOpenChatOrderId(null)}
      />
    </>
  );
}
