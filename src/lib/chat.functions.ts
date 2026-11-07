import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface ChatMessage {
  id: string;
  order_id: string;
  sender_id: string;
  sender_role: "customer" | "driver" | "admin";
  sender_name: string;
  message: string;
  created_at: string;
}

export interface OrderChatInfo {
  orderId: string;
  status: string;
  storeName: string | null;
  total: number;
  deliveryFee: number;
  customer: {
    id: string;
    phone: string;
    name: string;
  };
  driver: {
    id: string | null;
    phone: string | null;
    name: string | null;
  } | null;
  myRole: "customer" | "driver" | "admin";
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
      .select("id, customer_id, driver_id, status, phone, notes, total, delivery_fee, stores(name)")
      .eq("id", data.orderId)
      .maybeSingle();

    if (orderRes.error || !orderRes.data) {
      throw new Error("لم يتم العثور على هذا الطلب");
    }

    const order = orderRes.data;

    // Check authorization: must be customer, driver, or platform admin
    const isAdmin = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    const isCustomer = context.userId === order.customer_id;
    const isDriver = context.userId === order.driver_id;

    if (!isCustomer && !isDriver && !isAdmin.data) {
      throw new Error("غير مصرح لك بالاطلاع على محادثة هذا الطلب");
    }

    const myRole: "customer" | "driver" | "admin" = isDriver
      ? "driver"
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
          sender_role: m.sender_role as "customer" | "driver" | "admin",
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
      storeName: (order.stores as any)?.name ?? null,
      total: Number(order.total || 0),
      deliveryFee: Number(order.delivery_fee || 0),
      customer: {
        id: order.customer_id,
        phone: order.phone,
        name: customerName,
      },
      driver: driverData,
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
      .select("id, customer_id, driver_id, status, notes")
      .eq("id", data.orderId)
      .maybeSingle();

    if (orderRes.error || !orderRes.data) {
      throw new Error("الطلب غير موجود");
    }

    const order = orderRes.data;

    // Check authorization: customer, driver, or admin
    const isAdmin = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    const isCustomer = context.userId === order.customer_id;
    const isDriver = context.userId === order.driver_id;

    if (!isCustomer && !isDriver && !isAdmin.data) {
      throw new Error("غير مصرح لك بإرسال رسائل في هذا الطلب");
    }

    const senderRole: "customer" | "driver" | "admin" = isDriver
      ? "driver"
      : isCustomer
      ? "customer"
      : "admin";

    // Determine sender display name
    let senderName = senderRole === "driver" ? "كابتن التوصيل" : senderRole === "customer" ? "العميل" : "إدارة خدمات الحسينية";
    if (senderRole === "driver") {
      const dr = await supabaseAdmin.from("drivers").select("full_name").eq("user_id", context.userId).maybeSingle();
      if (dr.data?.full_name) senderName = `الكابتن ${dr.data.full_name}`;
    } else if (senderRole === "customer") {
      const pr = await supabaseAdmin.from("profiles").select("full_name").eq("id", context.userId).maybeSingle();
      if (pr.data?.full_name) senderName = pr.data.full_name;
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

    // In all cases, also guarantee persistence in order notes if table didn't save
    if (!savedInTable) {
      const { cleanNotes, messages } = parseMessagesFromNotes(order.notes);
      const updatedMessages = [...messages, newMessage];
      const serialized = serializeMessagesToNotes(cleanNotes, updatedMessages);
      await supabaseAdmin.from("orders").update({ notes: serialized }).eq("id", data.orderId);
    }

    // Send notification to the other party
    const targetUserId = senderRole === "driver" ? order.customer_id : order.driver_id;
    if (targetUserId && targetUserId !== context.userId) {
      try {
        await supabaseAdmin.from("notifications").insert({
          user_id: targetUserId,
          title: senderRole === "driver" ? "🛵 رسالة جديدة من كابتن التوصيل" : "💬 رسالة جديدة من العميل",
          body: data.message.length > 70 ? data.message.slice(0, 67) + "..." : data.message,
          link: senderRole === "driver" ? "/orders?filter=active" : "/delivery?tab=current",
        });
      } catch (err) {
        console.error("Failed to insert notification:", err);
      }
    }

    return { ok: true, message: newMessage };
  });
