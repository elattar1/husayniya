import { createFileRoute, Link } from "@tanstack/react-router";
import { Store, ShieldCheck, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pageMeta } from "@/lib/page-meta";
export const Route = createFileRoute("/")({
  head: () => pageMeta("مركز إدارة الخدمات", "لوحات مقدمي الخدمات وإدارة خدمات الحسينية بمحافظة الشرقية"),
  component: Index,
});

function Index() {
  return <section className="mx-auto max-w-6xl px-4 py-12"><p className="mb-3 text-sm text-primary">الحسينية • الشرقية</p><h1 className="mb-10 text-3xl">خدمات الحسينية</h1><div className="grid gap-6 md:grid-cols-2">{[{ title: "لوحة مقدم الخدمة", to: "/provider" as const, icon: Store }, { title: "لوحة الإدارة", to: "/admin" as const, icon: ShieldCheck }].map(p => <div key={p.to} className="rounded-lg border bg-card p-6"><p.icon className="mb-7 size-9 text-primary" /><h2 className="mb-6 text-xl">{p.title}</h2><Button asChild><Link to={p.to}>فتح اللوحة <ArrowLeft /></Link></Button></div>)}</div></section>;
}
