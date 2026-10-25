import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/provider")({
  head: () => ({ meta: [{ title: "خدمات الحسينية" }] }),
  component: () => (
    <div className="mx-auto max-w-3xl p-6 text-center text-muted-foreground">هذه الصفحة قيد الإنشاء</div>
  ),
});
