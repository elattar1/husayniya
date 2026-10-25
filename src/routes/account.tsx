import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { pageMeta } from "@/lib/page-meta";

export const Route = createFileRoute("/account")({
  head: () => pageMeta("الحساب", "إدارة جلسة حسابك في خدمات الحسينية"),
  component: Account,
});
function Account() {
  const { user } = useAuth(), client = useQueryClient(), navigate = useNavigate();
  async function signOut() { await client.cancelQueries(); client.clear(); await supabase.auth.signOut(); navigate({ to: "/auth", search: { redirect: "/provider" }, replace: true }); }
  return <div className="mx-auto max-w-xl space-y-5 px-4 py-10"><h1 className="text-2xl">حسابي</h1>{user ? <><p dir="ltr" className="text-right">{user.email}</p><Button variant="outline" asChild><Link to="/provider">لوحة متجري</Link></Button><Button variant="outline" asChild className="mr-2"><Link to="/admin">الإدارة</Link></Button><div><Button variant="destructive" onClick={signOut}><LogOut />تسجيل الخروج</Button></div></> : <Button asChild><Link to="/auth" search={{ redirect: "/provider" }}>تسجيل الدخول</Link></Button>}</div>;
}
