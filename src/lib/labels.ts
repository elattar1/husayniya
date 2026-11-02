export const STATUS_LABELS: Record<string, string> = {
  pending: "قيد الانتظار",
  accepted: "تم القبول",
  preparing: "تم التجهيز",
  on_the_way: "في الطريق",
  delivered: "تم التوصيل",
  cancelled: "ملغي",
  confirmed: "مؤكد",
  completed: "مكتمل",
  in_progress: "جاري التنفيذ",
};

export const ORDER_FLOW = ["pending", "accepted", "preparing", "on_the_way", "delivered"];
export const BOOKING_FLOW = ["pending", "confirmed", "completed"];
export const SERVICE_FLOW = ["pending", "accepted", "in_progress", "completed"];

export const CATEGORY_ICONS: Record<string, string> = {
  restaurants: "🍽️",
  supermarkets: "🛒",
  pharmacies: "💊",
  doctors: "🩺",
  maintenance: "🔧",
  gifts: "🎁",
  home: "🏠",
};

export const money = (n: number | string | null | undefined) =>
  `${Number(n ?? 0).toLocaleString("ar-EG", { maximumFractionDigits: 2 })} ج.م`;

export const dateAr = (d: string) =>
  new Date(d).toLocaleString("ar-EG", { dateStyle: "medium", timeStyle: "short" });

export const TIME_SLOTS = ["10:00 ص", "11:00 ص", "12:00 م", "1:00 م", "5:00 م", "6:00 م", "7:00 م", "8:00 م", "9:00 م"];
