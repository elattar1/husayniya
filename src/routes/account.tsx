import { useState, useEffect, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  User,
  Phone,
  MapPin,
  MessageSquareWarning,
  Truck,
  Store,
  LogOut,
  Send,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  Save,
  Shield,
  FileText,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { pageMeta } from "@/lib/page-meta";

export const Route = createFileRoute("/account")({
  head: () => pageMeta("حسابي", "إدارة الملف الشخصي، العناوين، الشكاوى والاقتراحات، وطلبات الانضمام"),
  component: AccountPage,
});

type Complaint = {
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

const TYPE_CONFIG = {
  complaint: { text: "شكوى", bg: "bg-destructive/10 text-destructive border-destructive/20" },
  suggestion: { text: "اقتراح", bg: "bg-primary/10 text-primary border-primary/20" },
  inquiry: { text: "استفسار", bg: "bg-accent/15 text-accent-foreground border-accent/20" },
};

const STATUS_CONFIG = {
  pending: { text: "بانتظار المراجعة", color: "text-amber-500", bg: "bg-amber-500/10" },
  in_review: { text: "قيد المتابعة", color: "text-blue-500", bg: "bg-blue-500/10" },
  resolved: { text: "تم الرد والحل", color: "text-green-500", bg: "bg-green-500/10" },
  closed: { text: "مغلقة", color: "text-muted-foreground", bg: "bg-muted" },
};

function AccountPage() {
  const { user, isAdmin, isDriver } = useAuth();
  const client = useQueryClient();
  const navigate = useNavigate();

  // Modals state
  const [complaintsOpen, setComplaintsOpen] = useState(false);
  const [driverModalOpen, setDriverModalOpen] = useState(false);
  const [merchantModalOpen, setMerchantModalOpen] = useState(false);

  // Profile data
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [addressText, setAddressText] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Complaint Form state
  const [complaintType, setComplaintType] = useState<"complaint" | "suggestion" | "inquiry">("complaint");
  const [complaintTitle, setComplaintTitle] = useState("");
  const [complaintDesc, setComplaintDesc] = useState("");
  const [complaintImage, setComplaintImage] = useState<string | null>(null);
  const [submittingComplaint, setSubmittingComplaint] = useState(false);

  // Driver Application state
  const [driverVehicle, setDriverVehicle] = useState("موتوسيكل");
  const [driverNationalId, setDriverNationalId] = useState("");
  const [submittingDriver, setSubmittingDriver] = useState(false);

  // Merchant Application state
  const [merchantName, setMerchantName] = useState("");
  const [merchantCategory, setMerchantCategory] = useState("restaurants");
  const [merchantAddress, setMerchantAddress] = useState("");
  const [merchantPhone, setMerchantPhone] = useState("");
  const [merchantDesc, setMerchantDesc] = useState("");
  const [submittingMerchant, setSubmittingMerchant] = useState(false);

  // Load user profile & address
  useEffect(() => {
    if (!user) return;
    async function loadProfile() {
      // Load Profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, phone")
        .eq("id", user?.id)
        .maybeSingle();

      if (profile) {
        if (profile.full_name) setFullName(profile.full_name);
        if (profile.phone) setPhoneNumber(profile.phone);
      }

      // Load Default Address
      const { data: addr } = await supabase
        .from("customer_addresses")
        .select("address, phone")
        .eq("user_id", user?.id)
        .order("is_default", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (addr) {
        if (addr.address) setAddressText(addr.address);
        if (!phoneNumber && addr.phone) setPhoneNumber(addr.phone);
      }
    }
    loadProfile();
  }, [user]);

  // Load User Complaints
  const { data: myComplaints = [], refetch: refetchComplaints } = useQuery({
    queryKey: ["my-complaints", user?.id],
    enabled: !!user && complaintsOpen,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("complaints_suggestions" as any)
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Error loading complaints:", error);
        return [];
      }
      return (data as unknown as Complaint[]) ?? [];
    },
  });

  // Save profile & address
  async function handleSaveProfile(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);
    try {
      // Update profile
      await supabase.from("profiles").upsert({
        id: user.id,
        full_name: fullName.trim(),
        phone: phoneNumber.trim(),
      });

      // Update address
      if (addressText.trim()) {
        await supabase.from("customer_addresses").upsert(
          {
            user_id: user.id,
            label: "المنزل",
            address: addressText.trim(),
            phone: phoneNumber.trim() || "01000000000",
            is_default: true,
          },
          { onConflict: "user_id,phone,address" }
        );
      }

      toast.success("تم حفظ البيانات بنجاح");
    } catch (err) {
      toast.error("حدث خطأ أثناء حفظ البيانات");
    } finally {
      setSavingProfile(false);
    }
  }

  // Handle complaint image file
  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("حجم الصورة يجب أن يكون أقل من 5 ميجابايت");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setComplaintImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  // Submit Complaint / Suggestion
  async function handleSubmitComplaint(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!complaintTitle.trim() || !complaintDesc.trim()) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    setSubmittingComplaint(true);
    try {
      const { error } = await supabase.from("complaints_suggestions" as any).insert({
        user_id: user.id,
        customer_name: fullName.trim() || user.email?.split("@")[0] || "عميل",
        phone: phoneNumber.trim() || "",
        type: complaintType,
        title: complaintTitle.trim(),
        description: complaintDesc.trim(),
        image_url: complaintImage,
        status: "pending",
      } as any);

      if (error) throw error;

      toast.success("تم إرسال رسالتك بنجاح وسيقوم فريق الإدارة بمراجعتها والرد عليك");
      setComplaintTitle("");
      setComplaintDesc("");
      setComplaintImage(null);
      refetchComplaints();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "تعذر إرسال الشكوى");
    } finally {
      setSubmittingComplaint(false);
    }
  }

  // Submit Driver Application
  async function handleSubmitDriver(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSubmittingDriver(true);
    try {
      const { error } = await supabase.from("driver_applications" as any).insert({
        user_id: user.id,
        full_name: fullName.trim() || "مندوب جديد",
        phone: phoneNumber.trim(),
        vehicle_type: driverVehicle,
        national_id: driverNationalId.trim(),
        status: "pending",
      } as any);

      if (error) throw error;

      toast.success("تم تقديم طلب الانضمام لأسطول التوصيل بنجاح! سنتواصل معك هاتفياً.");
      setDriverModalOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "تعذر إرسال الطلب");
    } finally {
      setSubmittingDriver(false);
    }
  }

  // Submit Merchant Application
  async function handleSubmitMerchant(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSubmittingMerchant(true);
    try {
      const { error } = await supabase.from("merchant_applications" as any).insert({
        user_id: user.id,
        store_name: merchantName.trim(),
        category: merchantCategory,
        address: merchantAddress.trim(),
        phone: merchantPhone.trim() || phoneNumber.trim(),
        description: merchantDesc.trim(),
        status: "pending",
      } as any);

      if (error) throw error;

      toast.success("تم تقديم طلبك لإضافة النشاط بنجاح! سيتم مراجعته وتفعيله قريباً.");
      setMerchantModalOpen(false);
      setMerchantName("");
      setMerchantAddress("");
      setMerchantPhone("");
      setMerchantDesc("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "تعذر إرسال الطلب");
    } finally {
      setSubmittingMerchant(false);
    }
  }

  async function signOut() {
    await client.cancelQueries();
    client.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", search: { redirect: "/" }, replace: true });
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="mx-auto mb-4 grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary">
          <User className="size-8" />
        </div>
        <h1 className="text-2xl font-bold">تسجيل الدخول</h1>
        <p className="mt-2 text-sm text-muted-foreground mb-6">
          يرجى تسجيل الدخول للوصول إلى بيانات حسابك والشكاوى والاقتراحات
        </p>
        <Button asChild className="w-full">
          <Link to="/auth" search={{ redirect: "/account" }}>تسجيل الدخول الآن</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:py-12">
      {/* رأس الصفحة */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b pb-5">
        <div className="flex items-center gap-3">
          <div className="grid size-14 place-items-center rounded-2xl bg-primary text-primary-foreground font-bold text-xl">
            {fullName ? fullName.slice(0, 1) : user.email?.slice(0, 1).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{fullName || "حسابي"}</h1>
            <p className="text-sm text-muted-foreground" dir="ltr">
              {user.email}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isAdmin && (
            <Button variant="default" asChild>
              <Link to="/admin">
                <Shield className="ml-1.5 size-4" />
                لوحة الإدارة
              </Link>
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link to="/provider">
              <Store className="ml-1.5 size-4" />
              لوحة المتجر
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* العمود الأيمن: تعديل العنوان ورقم التليفون */}
        <div className="md:col-span-2 space-y-6">
          <section className="rounded-xl border bg-card p-5 shadow-soft">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
              <User className="size-5 text-primary" />
              بياناتي الشخصية والعنوان
            </h2>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">الاسم بالكامل</label>
                <Input
                  placeholder="اكتب اسمك الثلاثي"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">رقم التليفون</label>
                <div className="relative">
                  <Phone className="absolute right-3 top-3 size-4 text-muted-foreground" />
                  <Input
                    className="pr-9"
                    type="tel"
                    placeholder="مثل: 01012345678"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">عنواني بالتفصيل</label>
                <div className="relative">
                  <MapPin className="absolute right-3 top-3 size-4 text-muted-foreground" />
                  <Input
                    className="pr-9"
                    placeholder="مثال: الحسينية - شارع المركز - بجوار بنك مصر"
                    value={addressText}
                    onChange={(e) => setAddressText(e.target.value)}
                  />
                </div>
              </div>

              <Button type="submit" disabled={savingProfile} className="w-full sm:w-auto">
                <Save className="ml-1.5 size-4" />
                {savingProfile ? "جاري الحفظ..." : "حفظ التعديلات"}
              </Button>
            </form>
          </section>

          {/* أزرار الخدمات والطلبات الرئيسية */}
          <section className="grid gap-3 sm:grid-cols-3">
            {/* زر الشكاوى والاقتراحات */}
            <button
              onClick={() => setComplaintsOpen(true)}
              className="flex flex-col items-center justify-center gap-2 rounded-xl border bg-card p-5 text-center transition-all hover:border-primary hover:shadow-md"
            >
              <div className="grid size-12 place-items-center rounded-xl bg-destructive/10 text-destructive">
                <MessageSquareWarning className="size-6" />
              </div>
              <strong className="text-sm font-semibold">شكاوى واقتراحات</strong>
              <span className="text-xs text-muted-foreground">تقديم بلاغ ومتابعة الرد</span>
            </button>

            {/* زر طلب الانضمام كمندوب توصيل */}
            <button
              onClick={() => setDriverModalOpen(true)}
              className="flex flex-col items-center justify-center gap-2 rounded-xl border bg-card p-5 text-center transition-all hover:border-primary hover:shadow-md"
            >
              <div className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
                <Truck className="size-6" />
              </div>
              <strong className="text-sm font-semibold">كابتن دليفري</strong>
              <span className="text-xs text-muted-foreground">انضم لأسطول التوصيل</span>
            </button>

            {/* زر تقديم على خدمة أو محل جديد */}
            <button
              onClick={() => setMerchantModalOpen(true)}
              className="flex flex-col items-center justify-center gap-2 rounded-xl border bg-card p-5 text-center transition-all hover:border-primary hover:shadow-md"
            >
              <div className="grid size-12 place-items-center rounded-xl bg-accent/20 text-accent-foreground">
                <Store className="size-6" />
              </div>
              <strong className="text-sm font-semibold">أضف متجرك</strong>
              <span className="text-xs text-muted-foreground">سجل نشاطك أو مهنتك</span>
            </button>
          </section>
        </div>

        {/* العمود الأيسر: بطاقات الروابط والإعدادات */}
        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-5 shadow-soft space-y-3">
            <h3 className="font-semibold text-sm text-foreground">روابط الحساب السريعة</h3>
            <div className="divide-y text-sm">
              <Link to="/orders" className="flex items-center justify-between py-2.5 text-muted-foreground hover:text-primary">
                <span>طلباتي ومشترياتي</span>
                <span className="text-xs font-mono">&larr;</span>
              </Link>
              <Link to="/cart" className="flex items-center justify-between py-2.5 text-muted-foreground hover:text-primary">
                <span>سلة المشتريات</span>
                <span className="text-xs font-mono">&larr;</span>
              </Link>
              <Link to="/notifications" className="flex items-center justify-between py-2.5 text-muted-foreground hover:text-primary">
                <span>الإشعارات والتنبيهات</span>
                <span className="text-xs font-mono">&larr;</span>
              </Link>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-5 shadow-soft">
            <Button variant="destructive" onClick={signOut} className="w-full">
              <LogOut className="ml-2 size-4" />
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </div>

      {/* نافذة الشكاوى والاقتراحات الكاملة */}
      <Dialog open={complaintsOpen} onOpenChange={setComplaintsOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <MessageSquareWarning className="size-6 text-primary" />
            الشكاوى والاقتراحات
          </DialogTitle>
          <DialogDescription>
            شاركنا بملاحظاتك أو مشكلتك وسيقوم فريق خدمات الحسينية بالرد عليك مباشرة
          </DialogDescription>

          {/* تبويبات: تقديم شكوى / الشكاوى السابقة */}
          <div className="mt-4 space-y-6">
            {/* النموذج الجديد */}
            <form onSubmit={handleSubmitComplaint} className="rounded-xl border bg-muted/30 p-4 space-y-4">
              <h3 className="font-semibold text-sm flex items-center gap-1.5 text-foreground">
                <Plus className="size-4 text-primary" />
                تقديم شكوى أو اقتراح جديد
              </h3>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "complaint", label: "شكوى" },
                  { id: "suggestion", label: "اقتراح" },
                  { id: "inquiry", label: "استفسار" },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setComplaintType(t.id as any)}
                    className={`rounded-lg border py-2 text-xs font-medium transition-colors ${
                      complaintType === t.id
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium">عنوان الشكوى / الاقتراح</label>
                <Input
                  required
                  placeholder="مثال: تأخر في توصيل الطلب / اقتراح متجر جديد"
                  value={complaintTitle}
                  onChange={(e) => setComplaintTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium">التفاصيل الكاملة</label>
                <Textarea
                  required
                  rows={3}
                  placeholder="اشرح المشكلة أو تفاصيل اقتراحك بالتفصيل..."
                  value={complaintDesc}
                  onChange={(e) => setComplaintDesc(e.target.value)}
                />
              </div>

              {/* رفع صورة اختياري */}
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  إرفاق صورة توضيحية (اختياري - غير إجباري)
                </label>
                <div className="flex items-center gap-3">
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border bg-card px-3 py-2 text-xs font-medium hover:bg-muted">
                    <ImageIcon className="size-4 text-primary" />
                    <span>اختر صورة</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageSelect}
                    />
                  </label>
                  {complaintImage && (
                    <div className="relative inline-block">
                      <img
                        src={complaintImage}
                        alt="معاينة"
                        className="h-12 w-16 rounded-md object-cover border"
                      />
                      <button
                        type="button"
                        onClick={() => setComplaintImage(null)}
                        className="absolute -top-1.5 -left-1.5 grid size-4 place-items-center rounded-full bg-destructive text-destructive-foreground text-[10px]"
                        title="حذف الصورة"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <Button type="submit" disabled={submittingComplaint} className="w-full">
                <Send className="ml-2 size-4" />
                {submittingComplaint ? "جاري الإرسال..." : "إرسال الشكوى / الاقتراح"}
              </Button>
            </form>

            {/* سجل الشكاوى والردود السابقة */}
            <div>
              <h3 className="mb-3 font-semibold text-sm flex items-center gap-1.5">
                <Clock className="size-4 text-primary" />
                شكاويّ واقتراحاتي السابقة ({myComplaints.length})
              </h3>

              {myComplaints.length === 0 ? (
                <div className="rounded-lg border border-dashed py-8 text-center text-xs text-muted-foreground">
                  لا توجد شكاوى أو اقتراحات سابقة لك.
                </div>
              ) : (
                <div className="space-y-3">
                  {myComplaints.map((item) => {
                    const typeCfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.complaint;
                    const statusCfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;

                    return (
                      <div key={item.id} className="rounded-xl border bg-card p-4 space-y-3 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`rounded-md border px-2 py-0.5 text-xs font-medium ${typeCfg.bg}`}>
                              {typeCfg.text}
                            </span>
                            <h4 className="font-semibold text-sm">{item.title}</h4>
                          </div>
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusCfg.bg} ${statusCfg.color}`}>
                            {statusCfg.text}
                          </span>
                        </div>

                        <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-line">
                          {item.description}
                        </p>

                        {item.image_url && (
                          <div className="pt-1">
                            <img
                              src={item.image_url}
                              alt="مرفق الشكوى"
                              className="h-20 w-32 rounded-md object-cover border"
                            />
                          </div>
                        )}

                        <div className="text-[11px] text-muted-foreground">
                          تاريخ الإرسال: {new Date(item.created_at).toLocaleDateString("ar-EG")}
                        </div>

                        {/* قسم رد الإدارة الواضح */}
                        {item.admin_reply ? (
                          <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-1">
                            <p className="flex items-center gap-1 text-xs font-semibold text-primary">
                              <CheckCircle2 className="size-4" />
                              رد الإدارة:
                            </p>
                            <p className="text-xs text-foreground leading-relaxed whitespace-pre-line">
                              {item.admin_reply}
                            </p>
                            {item.replied_at && (
                              <p className="text-[10px] text-muted-foreground pt-1">
                                تم الرد بتاريخ: {new Date(item.replied_at).toLocaleDateString("ar-EG")}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="rounded-md bg-muted/60 p-2 text-[11px] text-muted-foreground flex items-center gap-1.5">
                            <Clock className="size-3.5" />
                            شكواك قيد مراجعة فريق الإدارة وسيظهر الرد هنا قريباً.
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* نافذة طلب الانضمام ككابتن توصيل */}
      <Dialog open={driverModalOpen} onOpenChange={setDriverModalOpen}>
        <DialogContent className="max-w-md">
          <DialogTitle className="flex items-center gap-2">
            <Truck className="size-5 text-primary" />
            الانضمام لأسطول دليفري الحسينية
          </DialogTitle>
          <DialogDescription>
            سجل بياناتك للعمل كمندوب توصيل طلبات مع متاجر ومطاعم الحسينية
          </DialogDescription>

          <form onSubmit={handleSubmitDriver} className="space-y-4 pt-2">
            <div>
              <label className="mb-1 block text-xs font-medium">الاسم ثلاثي</label>
              <Input
                required
                placeholder="اسمك بالكامل"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium">رقم التليفون (واتساب ومكالمات)</label>
              <Input
                required
                type="tel"
                placeholder="010XXXXXXXX"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium">وسيلة التوصيل المتاحة لديك</label>
              <select
                className="h-10 w-full rounded-md border bg-card px-3 text-sm"
                value={driverVehicle}
                onChange={(e) => setDriverVehicle(e.target.value)}
              >
                <option value="موتوسيكل">موتوسيكل (دراجة نارية)</option>
                <option value="تروسيكل">تروسيكل</option>
                <option value="سيارة">سيارة</option>
                <option value="عجلة">عجلة (دراجة هوائية)</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium">الرقم القومي (اختياري)</label>
              <Input
                maxLength={14}
                placeholder="14 رقم"
                value={driverNationalId}
                onChange={(e) => setDriverNationalId(e.target.value)}
              />
            </div>

            <Button type="submit" disabled={submittingDriver} className="w-full">
              {submittingDriver ? "جاري الإرسال..." : "إرسال طلب الانضمام"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* نافذة تقديم على خدمة أو محل جديد */}
      <Dialog open={merchantModalOpen} onOpenChange={setMerchantModalOpen}>
        <DialogContent className="max-w-md">
          <DialogTitle className="flex items-center gap-2">
            <Store className="size-5 text-primary" />
            إضافة متجر أو خدمة جديدة
          </DialogTitle>
          <DialogDescription>
            سجل نشاطك التجاري أو خدمتك لتصل لجميع أهالي مركز الحسينية
          </DialogDescription>

          <form onSubmit={handleSubmitMerchant} className="space-y-4 pt-2">
            <div>
              <label className="mb-1 block text-xs font-medium">اسم المحل أو النشاط أو الخدمة</label>
              <Input
                required
                placeholder="مثال: مطعم البركة / صيدلية النور / سباك منازل"
                value={merchantName}
                onChange={(e) => setMerchantName(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium">القسم</label>
              <select
                className="h-10 w-full rounded-md border bg-card px-3 text-sm"
                value={merchantCategory}
                onChange={(e) => setMerchantCategory(e.target.value)}
              >
                <option value="restaurants">المطاعم والكافيهات</option>
                <option value="supermarkets">السوبر ماركت والبقالة</option>
                <option value="pharmacies">الصيدليات</option>
                <option value="doctors">عيادات وحجز أطباء</option>
                <option value="maintenance">سباكة ونجارة وكهرباء وصيانة</option>
                <option value="gifts">الملابس والهدايا</option>
                <option value="home">الخدمات المنزلية</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium">العنوان التفصيلي</label>
              <Input
                required
                placeholder="الشارع والمنطقة بالحسينية"
                value={merchantAddress}
                onChange={(e) => setMerchantAddress(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium">رقم التليفون للتواصل مع العملاء</label>
              <Input
                required
                type="tel"
                placeholder="010XXXXXXXX"
                value={merchantPhone || phoneNumber}
                onChange={(e) => setMerchantPhone(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium">وصف مختصر للخدمات والمنتجات</label>
              <Textarea
                rows={2}
                placeholder="نبذة عن المتجر وأبرز المنتجات أو الخدمات..."
                value={merchantDesc}
                onChange={(e) => setMerchantDesc(e.target.value)}
              />
            </div>

            <Button type="submit" disabled={submittingMerchant} className="w-full">
              {submittingMerchant ? "جاري الإرسال..." : "إرسال طلب الاعتماد"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
