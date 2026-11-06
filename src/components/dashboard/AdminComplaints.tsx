import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageSquareWarning, Clock, CheckCircle2, AlertCircle, Image as ImageIcon, Send, RefreshCw, Phone, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

export type Complaint = {
  id: string;
  user_id: string;
  customer_name: string;
  phone: string;
  type: "complaint" | "suggestion" | "inquiry";
  title: string;
  description: string;
  image_url: string | null;
  status: "pending" | "in_review" | "resolved" | "closed";
  admin_reply: string | null;
  replied_at: string | null;
  created_at: string;
};

const TYPE_LABELS = {
  complaint: { text: "شكوى", bg: "bg-destructive/10 text-destructive border-destructive/20" },
  suggestion: { text: "اقتراح", bg: "bg-primary/10 text-primary border-primary/20" },
  inquiry: { text: "استفسار", bg: "bg-accent/15 text-accent-foreground border-accent/20" },
};

const STATUS_LABELS = {
  pending: { text: "بانتظار المراجعة", color: "text-amber-500", bg: "bg-amber-500/10" },
  in_review: { text: "قيد المتابعة", color: "text-blue-500", bg: "bg-blue-500/10" },
  resolved: { text: "تم الرد والحل", color: "text-green-500", bg: "bg-green-500/10" },
  closed: { text: "مغلقة", color: "text-muted-foreground", bg: "bg-muted" },
};

export function AdminComplaints({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const client = useQueryClient();
  const [selectedTicket, setSelectedTicket] = useState<Complaint | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyStatus, setReplyStatus] = useState<"in_review" | "resolved">("resolved");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const { data: tickets = [], isLoading, refetch } = useQuery({
    queryKey: ["admin-complaints"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("complaints_suggestions" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Error fetching complaints:", error);
        return [];
      }
      return (data as unknown as Complaint[]) ?? [];
    },
    enabled: open,
  });

  const replyMutation = useMutation({
    mutationFn: async ({ id, reply, status }: { id: string; reply: string; status: string }) => {
      const { error } = await supabase
        .from("complaints_suggestions" as any)
        .update({
          admin_reply: reply,
          status: status,
          replied_at: new Date().toISOString(),
        } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("تم إرسال الرد بنجاح");
      client.invalidateQueries({ queryKey: ["admin-complaints"] });
      setSelectedTicket(null);
      setReplyText("");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "تعذر حفظ الرد");
    },
  });

  const filteredTickets = tickets.filter((t) => {
    if (filterStatus === "all") return true;
    return t.status === filterStatus;
  });

  const pendingCount = tickets.filter((t) => t.status === "pending").length;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
            <div>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <MessageSquareWarning className="size-6 text-primary" />
                إدارة الشكاوى والاقتراحات
              </DialogTitle>
              <DialogDescription>
                متابعة بلاغات واقتراحات العملاء والرد المباشر عليها
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {pendingCount} بانتظار الرد
              </span>
              <Button size="icon" variant="outline" onClick={() => refetch()} title="تحديث">
                <RefreshCw className="size-4" />
              </Button>
            </div>
          </div>

          {/* تصفية الحالات */}
          <div className="flex flex-wrap gap-2 pt-2">
            {[
              { id: "all", label: `الكل (${tickets.length})` },
              { id: "pending", label: `جديدة (${tickets.filter((t) => t.status === "pending").length})` },
              { id: "in_review", label: `قيد المتابعة (${tickets.filter((t) => t.status === "in_review").length})` },
              { id: "resolved", label: `تم الرد (${tickets.filter((t) => t.status === "resolved").length})` },
            ].map((f) => (
              <Button
                key={f.id}
                size="sm"
                variant={filterStatus === f.id ? "default" : "outline"}
                onClick={() => setFilterStatus(f.id)}
              >
                {f.label}
              </Button>
            ))}
          </div>

          {/* قائمة الشكاوى */}
          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground">جاري تحميل الشكاوى والاقتراحات...</div>
          ) : filteredTickets.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">لا توجد شكاوى أو اقتراحات حالياً</div>
          ) : (
            <div className="divide-y rounded-lg border">
              {filteredTickets.map((ticket) => {
                const typeInfo = TYPE_LABELS[ticket.type] || TYPE_LABELS.complaint;
                const statusInfo = STATUS_LABELS[ticket.status] || STATUS_LABELS.pending;

                return (
                  <div key={ticket.id} className="space-y-3 p-4 transition-colors hover:bg-muted/40">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`rounded-md border px-2 py-0.5 text-xs font-medium ${typeInfo.bg}`}>
                          {typeInfo.text}
                        </span>
                        <h3 className="font-semibold">{ticket.title}</h3>
                      </div>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusInfo.bg} ${statusInfo.color}`}>
                        {statusInfo.text}
                      </span>
                    </div>

                    <p className="text-sm text-foreground/90 whitespace-pre-line">{ticket.description}</p>

                    {/* الصورة المرفقة إن وجدت */}
                    {ticket.image_url && (
                      <div className="pt-1">
                        <p className="mb-1 text-xs text-muted-foreground flex items-center gap-1">
                          <ImageIcon className="size-3.5" /> صورة مرفقة:
                        </p>
                        <img
                          src={ticket.image_url}
                          alt="مرفق الشكوى"
                          className="h-24 w-36 rounded-md object-cover border cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => setZoomedImage(ticket.image_url)}
                        />
                      </div>
                    )}

                    {/* بيانات العميل والتاريخ */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-2 text-xs text-muted-foreground">
                      <div className="flex flex-wrap items-center gap-4">
                        {ticket.customer_name && (
                          <span className="flex items-center gap-1">
                            <User className="size-3.5" /> {ticket.customer_name}
                          </span>
                        )}
                        {ticket.phone && (
                          <a href={`tel:${ticket.phone}`} className="flex items-center gap-1 text-primary hover:underline">
                            <Phone className="size-3.5" /> {ticket.phone}
                          </a>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="size-3.5" /> {new Date(ticket.created_at).toLocaleDateString("ar-EG")}
                        </span>
                      </div>

                      <Button
                        size="sm"
                        variant={ticket.admin_reply ? "outline" : "default"}
                        onClick={() => {
                          setSelectedTicket(ticket);
                          setReplyText(ticket.admin_reply || "");
                        }}
                      >
                        {ticket.admin_reply ? "تعديل الرد" : "الرد على الشكوى"}
                      </Button>
                    </div>

                    {/* عرض رد الإدارة إذا وُجد */}
                    {ticket.admin_reply && (
                      <div className="mt-2 rounded-md bg-primary/5 border border-primary/20 p-3 text-sm">
                        <p className="font-semibold text-primary mb-1 text-xs flex items-center gap-1">
                          <CheckCircle2 className="size-3.5" /> رد الإدارة:
                        </p>
                        <p className="text-foreground/90">{ticket.admin_reply}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* نافذة كتابة الرد */}
      <Dialog open={selectedTicket !== null} onOpenChange={(o) => { if (!o) setSelectedTicket(null); }}>
        <DialogContent className="max-w-lg">
          <DialogTitle>الرد على: {selectedTicket?.title}</DialogTitle>
          <DialogDescription>
            سيظهر هذا الرد مباشرة للعميل داخل حسابه
          </DialogDescription>

          {selectedTicket && (
            <div className="space-y-4 pt-2">
              <div className="rounded-md bg-muted p-3 text-sm">
                <p className="font-semibold text-xs text-muted-foreground mb-1">تفاصيل الشكوى:</p>
                <p>{selectedTicket.description}</p>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">نص الرد للعميل:</label>
                <Textarea
                  rows={4}
                  placeholder="اكتب ردك هنا..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">تحديث حالة الشكوى:</label>
                <select
                  className="h-10 w-full rounded-md border bg-card px-3 text-sm"
                  value={replyStatus}
                  onChange={(e) => setReplyStatus(e.target.value as any)}
                >
                  <option value="resolved">تم الرد والحل (مكتملة)</option>
                  <option value="in_review">قيد المتابعة والفحص</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setSelectedTicket(null)}>
                  إلغاء
                </Button>
                <Button
                  disabled={!replyText.trim() || replyMutation.isPending}
                  onClick={() => {
                    replyMutation.mutate({
                      id: selectedTicket.id,
                      reply: replyText.trim(),
                      status: replyStatus,
                    });
                  }}
                >
                  <Send className="ml-2 size-4" />
                  {replyMutation.isPending ? "جاري الإرسال..." : "إرسال الرد"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* تكبير الصورة المرفقة */}
      <Dialog open={zoomedImage !== null} onOpenChange={(o) => { if (!o) setZoomedImage(null); }}>
        <DialogContent className="max-w-2xl p-2">
          {zoomedImage && (
            <img src={zoomedImage} alt="مرفق مكبر" className="w-full rounded-md object-contain max-h-[80vh]" />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
