import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface ChatMessage {
  id: string;
  order_id: string;
  sender_id: string;
  sender_role: "customer" | "store" | "driver" | "admin";
  sender_name: string;
  message: string;
  created_at: string;
}

export interface OrderChatInfo {
  orderId: string;
  status: string;
  chatStage: "store" | "driver"; // "store" during preparation, "driver" once picked up
  store: {
    id: string;
    name: string;
    phone: string | null;
    category: string | null;
    ownerId: string | null;
  } | null;
  driver: {
    id: string | null;
    phone: string | null;
    name: string | null;
  } | null;
  customer: {
    id: string;
    phone: string;
    name: string;
  };
  total: number;
  deliveryFee: number;
  myRole: "customer" | "store" | "driver" | "admin";
  messages: ChatMessage[];
}

function parseMessagesFromNotes(notes: string | null | undefined): { cleanNotes: string; messages: ChatMessage[] } {
  if (!notes) return { cleanNotes: "", messages: [] };
  const match = notes.match(/<!-- CHAT_V1: ([\s\S]*?) -->/);
  if (!match) return { cleanNotes: notes.trim(), messages: [] };
  try {
    const parsed = JSON.parse(match[1]);
    const cleanNotes = notes.replace(/<!-- CHAT_V1: [\s\S]*? -->/, "").trim();
    return { cleanNotes, messages: Array.isArray(parsed) ? parsed : [] };
  } catch {
    return { cleanNotes: notes.trim(), messages: [] };
  }
}

function serializeMessagesToNotes(cleanNotes: string, messages: ChatMessage[]): string {
  const json = JSON.stringify(messages);
  return cleanNotes ? `${cleanNotes}\n<!-- CHAT_V1: ${json} -->` : `<!-- CHAT_V1: ${json} -->`;
}

export const getOrderChat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ orderId: z.string().uuid() }))
  .handler(async ({ context, data }): Promise<OrderChatInfo> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const orderRes = await supabaseAdmin
      .from("orders")
      .select("id, customer_id, driver_id, store_id, status, phone, notes, total, delivery_fee, picked_up_at, stores(id, name, owner_id, phone, category)")
      .eq("id", data.orderId)
      .maybeSingle();

    if (orderRes.error || !orderRes.data) {
      throw new Error("لم يتم العثور على هذا الطلب");
    }

    const order = orderRes.data;
    const storeRow = order.stores as any;

    // Check authorization: customer, assigned driver, store owner, or platform admin
    const isAdmin = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    const isCustomer = context.userId === order.customer_id;
    const isDriver = context.userId === order.driver_id;
    const isStoreOwner = storeRow && storeRow.owner_id === context.userId;

    if (!isCustomer && !isDriver && !isStoreOwner && !isAdmin.data) {
      throw new Error("غير مصرح لك بالاطلاع على محادثة هذا الطلب");
    }

    // Determine current chat stage:
    // If order is with driver (status: "on_the_way" or "delivered" or picked up) -> "driver"
    // Otherwise (placed, confirmed, preparing) -> "store"
    const isDriverStage = order.status === "on_the_way" || order.status === "delivered" || !!order.picked_up_at;
    const chatStage: "store" | "driver" = isDriverStage ? "driver" : "store";

    const myRole: "customer" | "store" | "driver" | "admin" = isDriver
      ? "driver"
      : isStoreOwner
      ? "store"
      : isCustomer
      ? "customer"
      : "admin";

    // Fetch customer details
    let customerName = "العميل";
    const profileRes = await supabaseAdmin
      .from("profiles")
      .select("full_name")
      .eq("id", order.customer_id)
      .maybeSingle();
    if (profileRes.data?.full_name) {
      customerName = profileRes.data.full_name;
    }

    // Fetch driver details if assigned
    let driverData: OrderChatInfo["driver"] = null;
    if (order.driver_id) {
      const driverRes = await supabaseAdmin
        .from("drivers")
        .select("user_id, full_name, phone")
        .eq("user_id", order.driver_id)
        .maybeSingle();

      if (driverRes.data) {
        driverData = {
          id: driverRes.data.user_id,
          name: driverRes.data.full_name ? `الكابتن ${driverRes.data.full_name}` : "كابتن التوصيل",
          phone: driverRes.data.phone || null,
        };
      } else {
        driverData = {
          id: order.driver_id,
          name: "كابتن التوصيل",
          phone: null,
        };
      }
    }

    // Attempt to load messages from order_messages table or fallback from notes
    let messages: ChatMessage[] = [];
    try {
      const tblRes = await (supabaseAdmin.from("order_messages" as any) as any)
        .select("*")
        .eq("order_id", data.orderId)
        .order("created_at", { ascending: true });

      if (!tblRes.error && Array.isArray(tblRes.data) && tblRes.data.length > 0) {
        messages = tblRes.data.map((m: any) => ({
          id: String(m.id),
          order_id: String(m.order_id),
          sender_id: String(m.sender_id),
          sender_role: m.sender_role as "customer" | "store" | "driver" | "admin",
          sender_name: String(m.sender_name),
          message: String(m.message),
          created_at: String(m.created_at),
        }));
      } else {
        const parsed = parseMessagesFromNotes(order.notes);
        messages = parsed.messages;
      }
    } catch {
      const parsed = parseMessagesFromNotes(order.notes);
      messages = parsed.messages;
    }

    return {
      orderId: order.id,
      status: order.status,
      chatStage,
      store: storeRow
        ? {
            id: storeRow.id,
            name: storeRow.name,
            phone: storeRow.phone ?? null,
            category: storeRow.category ?? null,
            ownerId: storeRow.owner_id ?? null,
          }
        : null,
      driver: driverData,
      customer: {
        id: order.customer_id,
        phone: order.phone,
        name: customerName,
      },
      total: Number(order.total || 0),
      deliveryFee: Number(order.delivery_fee || 0),
      myRole,
      messages,
    };
  });

export const sendOrderChatMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      orderId: z.string().uuid(),
      message: z.string().trim().min(1, "الرسالة لا يمكن أن تكون فارغة").max(1000, "الرسالة طويلة جداً"),
    })
  )
  .handler(async ({ context, data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const orderRes = await supabaseAdmin
      .from("orders")
      .select("id, customer_id, driver_id, store_id, status, notes, picked_up_at, stores(id, name, owner_id, phone)")
      .eq("id", data.orderId)
      .maybeSingle();

    if (orderRes.error || !orderRes.data) {
      throw new Error("الطلب غير موجود");
    }

    const order = orderRes.data;
    const storeRow = order.stores as any;

    // Check authorization
    const isAdmin = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    const isCustomer = context.userId === order.customer_id;
    const isDriver = context.userId === order.driver_id;
    const isStoreOwner = storeRow && storeRow.owner_id === context.userId;

    if (!isCustomer && !isDriver && !isStoreOwner && !isAdmin.data) {
      throw new Error("غير مصرح لك بإرسال رسائل في هذا الطلب");
    }

    // Auto-close chat once order is delivered, completed, or cancelled
    if (order.status === "delivered" || order.status === "completed" || order.status === "cancelled") {
      throw new Error("تم إغلاق المحادثة تلقائياً لاكتمال تسليم الطلب");
    }

    const isDriverStage = order.status === "on_the_way" || order.status === "delivered" || !!order.picked_up_at;
    const chatStage: "store" | "driver" = isDriverStage ? "driver" : "store";

    const senderRole: "customer" | "store" | "driver" | "admin" = isDriver
      ? "driver"
      : isStoreOwner
      ? "store"
      : isCustomer
      ? "customer"
      : "admin";

    // Determine sender display name
    let senderName = "مستخدم";
    if (senderRole === "store") {
      senderName = storeRow?.name ? `إدارة ${storeRow.name}` : "إدارة المتجر";
    } else if (senderRole === "driver") {
      const dr = await supabaseAdmin.from("drivers").select("full_name").eq("user_id", context.userId).maybeSingle();
      senderName = dr.data?.full_name ? `الكابتن ${dr.data.full_name}` : "كابتن التوصيل";
    } else if (senderRole === "customer") {
      const pr = await supabaseAdmin.from("profiles").select("full_name").eq("id", context.userId).maybeSingle();
      senderName = pr.data?.full_name || "العميل";
    } else {
      senderName = "إدارة خدمات الحسينية";
    }

    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      order_id: data.orderId,
      sender_id: context.userId,
      sender_role: senderRole,
      sender_name: senderName,
      message: data.message,
      created_at: new Date().toISOString(),
    };

    let savedInTable = false;
    try {
      const insertRes = await (supabaseAdmin.from("order_messages" as any) as any).insert({
        id: newMessage.id,
        order_id: newMessage.order_id,
        sender_id: newMessage.sender_id,
        sender_role: newMessage.sender_role,
        sender_name: newMessage.sender_name,
        message: newMessage.message,
        created_at: newMessage.created_at,
      });
      if (!insertRes.error) {
        savedInTable = true;
      }
    } catch {
      savedInTable = false;
    }

    // Always guarantee persistence in order notes if table didn't save
    if (!savedInTable) {
      const { cleanNotes, messages } = parseMessagesFromNotes(order.notes);
      const updatedMessages = [...messages, newMessage];
      const serialized = serializeMessagesToNotes(cleanNotes, updatedMessages);
      await supabaseAdmin.from("orders").update({ notes: serialized }).eq("id", data.orderId);
    }

    // Intelligent notification routing based on chat stage
    try {
      if (senderRole === "customer") {
        if (chatStage === "store" && storeRow?.owner_id) {
          await supabaseAdmin.from("notifications").insert({
            user_id: storeRow.owner_id,
            title: `💬 رسالة من العميل (${storeRow.name})`,
            body: data.message.length > 70 ? data.message.slice(0, 67) + "..." : data.message,
            link: `/provider?tab=orders&chat=${data.orderId}`,
          });
        } else if (chatStage === "driver" && order.driver_id) {
          await supabaseAdmin.from("notifications").insert({
            user_id: order.driver_id,
            title: "💬 رسالة جديدة من العميل",
            body: data.message.length > 70 ? data.message.slice(0, 67) + "..." : data.message,
            link: `/delivery?tab=current&chat=${data.orderId}`,
          });
        }
      } else if (senderRole === "store" || senderRole === "driver" || senderRole === "admin") {
        const title =
          senderRole === "store"
            ? `🏪 رسالة من ${storeRow?.name ?? "المتجر"}`
            : senderRole === "driver"
            ? "🛵 رسالة من كابتن التوصيل"
            : "رسالة من إدارة المنصة";

        await supabaseAdmin.from("notifications").insert({
          user_id: order.customer_id,
          title,
          body: data.message.length > 70 ? data.message.slice(0, 67) + "..." : data.message,
          link: `/orders?filter=active&chat=${data.orderId}`,
        });
      }
    } catch (err) {
      console.error("Failed to send notification:", err);
    }

    return { ok: true, message: newMessage };
  });
