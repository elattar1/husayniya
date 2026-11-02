import { useRouter, type ErrorComponentProps } from "@tanstack/react-router";
import { Truck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DeliveryError({ error }: ErrorComponentProps) {
  const router = useRouter();
  return <div role="alert" className="mx-auto max-w-xl space-y-4 px-4 py-16 text-center"><Truck className="mx-auto size-12 text-primary" /><h1 className="text-xl">تعذر فتح صفحة الدليفري</h1><p className="text-sm text-muted-foreground">{error instanceof Error ? error.message : "حدث خطأ"}</p><Button onClick={() => router.invalidate()}>إعادة المحاولة</Button></div>;
}
export function DeliveryStat({ label, value }: { label: string; value: string | number }) {
  return <div className="min-w-0 border-b border-border py-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-2 break-words text-xl font-semibold text-primary">{value}</p></div>;
}