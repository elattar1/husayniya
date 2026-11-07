import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { useSuspenseQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Store,
  Package,
  ClipboardList,
  Wallet,
  Plus,
  Pencil,
  Trash2,
  Save,
  Check,
  RefreshCw,
  ShieldCheck,
  Search,
  ArrowLeft,
  CalendarDays,
  ArrowRightLeft,
  UserCheck,
  UserX,
  Clock,
  Timer,
  Flame,
  ExternalLink,
  TrendingUp,
  CheckCircle2,
  Award,
  Calendar,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/AppShell";
import { Field, SelectField, ToggleField } from "./fields";
import { ImageUploadField } from "./ImageUpload";
import { CatalogPicker } from "./CatalogPicker";
import { dashboardQuery, dashboardProductsQuery, dashboardOrderItemsQuery, type DashboardData, type DashboardProduct } from "./queries";
import { saveStore, saveProduct, deleteProduct, approveStore, updateRequest, transferStoreOwnership } from "@/lib/dashboard.functions";
import { allowedNext, earnings, type LedgerRow, type RequestKind } from "@/lib/dashboard-rules";
import { money, dateAr, STATUS_LABELS } from "@/lib/labels";
import { cleanOrderNotes } from "@/lib/utils";
import { cleanDisplayAddress } from "@/lib/map-utils";
import { OrderChatDialog } from "@/components/OrderChatDialog";

type StoreRow = DashboardData["stores"][number];
type ProductRow = DashboardProduct;
type Task = LedgerRow & { id: string; phone: string; detail: string; address: string; notes: string | null; items: { name: string; qty: number; price: number }[]; images: string[]; appointment?: string | undefined; picked_up_at?: string | null };

function tasksFrom(data: DashboardData): Task[] {
  return [
    ...data.orders.map(o => ({ kind: "orders" as const, id: o.id, store_id: o.store_id, status: o.status, amount: Number(o.total), commission: Number(o.commission_amount), created_at: o.created_at, phone: o.phone, detail: "طلب مشتريات", address: o.address, notes: o.notes, items: [], images: [], picked_up_at: (o as any).picked_up_at ?? null })),
    ...data.bookings.map(o => ({ kind: "bookings" as const, id: o.id, store_id: o.store_id, status: o.status, amount: Number(o.fee), commission: Number(o.commission_amount), created_at: o.created_at, phone: o.phone, detail: o.patient_name, address: "", notes: o.notes, items: [], images: [], appointment: `${o.booking_date} • ${o.booking_time}` })),
    ...data.services.map(o => ({ kind: "service_requests" as const, id: o.id, store_id: o.store_id, status: o.status, amount: Number(o.quoted_price ?? 0), commission: Number(o.commission_amount), created_at: o.created_at, phone: o.phone, detail: o.description, address: o.address, notes: null, items: [], images: o.image_paths, appointment: o.preferred_date ?? undefined })),
  ].sort((a,b) => b.created_at.localeCompare(a.created_at));
}

export function Dashboard({ admin, search, onSearch, tab, onTab }: { admin: boolean; search: string; onSearch: (s: string) => void; tab: string; onTab: (s: string) => void }) {
  const { data } = useSuspenseQuery(dashboardQuery(admin));
  const client = useQueryClient();
  const [selectedStore, setSelectedStore] = useState("");
  const store = data.stores.find(s => s.id === selectedStore) ?? data.stores[0];
  const [storeEdit, setStoreEdit] = useState<StoreRow | "new" | null>(null);
  const [productEdit, setProductEdit] = useState<ProductRow | "new" | null>(null);
  const [approval, setApproval] = useState<StoreRow | null>(null);
  const [transferTarget, setTransferTarget] = useState<StoreRow | null>(null);
  const [targetEmail, setTargetEmail] = useState("");
  const [detail, setDetail] = useState<Task | null>(null);
  const [chatOrderId, setChatOrderId] = useState<string | null>(null);
  const [remove, setRemove] = useState<ProductRow | null>(null);
  const [busy, setBusy] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const doSaveStore = useServerFn(saveStore);
  const doSaveProduct = useServerFn(saveProduct);
  const doDelete = useServerFn(deleteProduct);
  const doApproval = useServerFn(approveStore);
  const doTransfer = useServerFn(transferStoreOwnership);
  const doUpdate = useServerFn(updateRequest);

  async function execute(action: () => Promise<unknown>, close: () => void) {
    setBusy(true);
    try {
      await action();
      await Promise.all([
        client.invalidateQueries({ queryKey: ["dashboard"] }),
        client.invalidateQueries({ queryKey: ["catalog"] }),
        client.invalidateQueries({ queryKey: ["store-details"] }),
      ]);
      close();
      toast.success("تم حفظ التغييرات بنجاح");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر حفظ التغييرات");
    } finally {
      setBusy(false);
    }
  }

  const [period, setPeriod] = useState<"today" | "week" | "month" | "year" | "all">("all");
  const productQuery = useQuery({ ...dashboardProductsQuery(store?.id ?? ''), enabled: !!store && (tab === 'products' || catalogOpen || productEdit !== null) });
  const itemQuery = useQuery({ ...dashboardOrderItemsQuery(detail?.id ?? '', admin), enabled: detail?.kind === 'orders' });
  const allProducts = productQuery.data ?? [];
  const allTasks = tasksFrom(data);
  const tasks = allTasks.filter(t => admin || t.store_id === store?.id);
  const totals = earnings(tasks);
  const pending = tasks.filter(t => !["delivered", "completed", "cancelled"].includes(t.status)).length;
  const stores = data.stores.filter(s => `${s.name} ${s.phone ?? ""} ${(s as any).owner_email ?? ""}`.includes(search));
  const products = allProducts.filter(p => p.store_id === store?.id && p.name.includes(search));
  const visibleTasks = tasks.filter(t => `${t.id} ${t.phone} ${t.detail} ${data.stores.find(s => s.id === t.store_id)?.name}`.includes(search));
  const storeName = (id: string) => data.stores.find(s => s.id === id)?.name ?? "متجر";
  const selectedDetail = detail ? tasks.find(t => t.id === detail.id && t.kind === detail.kind) ?? detail : null;
  const currentDetail = selectedDetail?.kind === "orders" ? { ...selectedDetail, items: itemQuery.data ?? [] } : selectedDetail;

  // 1. حساب تقارير الأرباح والدخل حسب الفترة المحددة (يومي / أسبوعي / شهري / سنوي)
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).getTime();
  const startOfMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).getTime();
  const startOfYear = new Date(now.getFullYear(), 0, 1).getTime();

  const periodTasks = tasks.filter(t => {
    if (period === "all") return true;
    const taskTime = new Date(t.created_at).getTime();
    if (period === "today") return taskTime >= startOfToday;
    if (period === "week") return taskTime >= startOfWeek;
    if (period === "month") return taskTime >= startOfMonth;
    if (period === "year") return taskTime >= startOfYear;
    return true;
  });
  const periodTotals = earnings(periodTasks);

  // 2. حساب المطاعم والخدمات الأكثر طلباً
  const storeOrderCounts = data.orders.reduce((acc, order) => {
    acc[order.store_id] = (acc[order.store_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topOrderedStores = [...data.stores]
    .map(s => ({
      ...s,
      orderCount: storeOrderCounts[s.id] || 0,
      deliveredCount: data.orders.filter(o => o.store_id === s.id && o.status === "delivered").length,
      grossSales: data.orders.filter(o => o.store_id === s.id && o.status === "delivered").reduce((sum, o) => sum + Number(o.total), 0),
    }))
    .filter(s => s.orderCount > 0)
    .sort((a, b) => b.orderCount - a.orderCount)
    .slice(0, 5);

  // 3. حساب متوسط وقت التحضير للمطعم (من وقت إنشاء / قبول الطلب حتى تم التحضير)
  const preparedOrders = data.orders.filter(o => (admin ? o.store_id === store?.id : o.store_id === store?.id) && o.picked_up_at && o.created_at);
  const avgPrepMinutes = preparedOrders.length > 0
    ? Math.round(
        preparedOrders.reduce((sum, o) => {
          const diff = Math.max(5, Math.round((new Date(o.picked_up_at!).getTime() - new Date(o.created_at).getTime()) / (1000 * 60)));
          return sum + diff;
        }, 0) / preparedOrders.length,
      )
    : 18;

  function submitStore(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    execute(
      () =>
        doSaveStore({
          data: {
            id: storeEdit && storeEdit !== "new" ? storeEdit.id : undefined,
            name: String(form.get("name")),
            category: String(form.get("category")),
            area_id: Number(form.get("area_id")) || null,
            description: String(form.get("description")),
            phone: String(form.get("phone")),
            address: String(form.get("address")),
            specialty: String(form.get("specialty")),
            delivery_fee: Number(form.get("delivery_fee")),
            booking_fee: Number(form.get("booking_fee")),
            is_open: form.has("is_open"),
            logo_url: String(form.get("logo_url") ?? ""),
            banner_url: String(form.get("banner_url") ?? ""),
            owner_email: admin ? (form.get("owner_email") ? String(form.get("owner_email")).trim() : undefined) : undefined,
          },
        }),
      () => setStoreEdit(null),
    );
  }

  function submitProduct(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!store) return;
    const form = new FormData(e.currentTarget);
    execute(
      () =>
        doSaveProduct({
          data: {
            id: productEdit && productEdit !== "new" ? productEdit.id : undefined,
            store_id: store.id,
            name: String(form.get("name")),
            description: String(form.get("description")),
            price: Number(form.get("price")),
            is_available: form.has("is_available"),
            image_url: String(form.get("image_url") ?? ""),
            stock_qty: form.get("stock_qty") === "" ? null : Number(form.get("stock_qty")),
          },
        }),
      () => setProductEdit(null),
    );
  }

  const editedStore = storeEdit && storeEdit !== "new" ? storeEdit : undefined;
  const editedProduct = productEdit && productEdit !== "new" ? productEdit : undefined;

  function toggleStoreOpen() {
    if (!store) return;
    execute(
      () =>
        doSaveStore({
          data: {
            id: store.id,
            name: store.name,
            category: store.category,
            area_id: store.area_id,
            description: store.description,
            phone: store.phone ?? "",
            address: store.address ?? "",
            specialty: store.specialty ?? "",
            delivery_fee: store.delivery_fee,
            booking_fee: store.booking_fee,
            is_open: !store.is_open,
            logo_url: store.logo_url ?? "",
            banner_url: store.banner_url ?? "",
          },
        }),
      () => {
        toast.success(!store.is_open ? "المتجر مفتوح الآن وجاهز لاستقبال الطلبات!" : "تم إغلاق المتجر مؤقتًا أمام الطلبات الجديدة");
      },
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-7 md:px-6 md:py-10">
      {/* شريط العنوان والتحديث */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            {admin ? <ShieldCheck size={16} className="text-purple-600" /> : <Store size={16} className="text-primary" />} خدمات الحسينية / {admin ? "لوحة الإدارة السحابية" : "بوابة التاجر والمحل"}
          </div>
          <h1 className="text-2xl font-bold">{admin ? "لوحة الإدارة والتحكم" : store?.name ?? "إدارة المتجر"}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" aria-label="تحديث البيانات" title="تحديث البيانات" onClick={() => client.invalidateQueries({ queryKey: ["dashboard"] })}>
            <RefreshCw className="size-4" />
          </Button>
          {admin && (
            <Button onClick={() => setStoreEdit("new")} className="gap-1 font-bold">
              <Plus className="size-4" /> إضافة خدمة / متجر
            </Button>
          )}
        </div>
      </div>

      <Tabs dir="rtl" value={tab} onValueChange={onTab}>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b pb-4">
          <TabsList className="h-auto max-w-full flex-wrap bg-transparent p-0">
            <TabsTrigger value="stores">
              {admin ? <ShieldCheck className="ml-2 size-4" /> : <Store className="ml-2 size-4" />}
              {admin ? "المتاجر والخدمات" : "المتجر"}
            </TabsTrigger>
            <TabsTrigger value="products">
              <Package className="ml-2 size-4" />
              {admin ? "إدارة المنيو" : "المنتجات والمنيو"}
            </TabsTrigger>
            <TabsTrigger value="orders">
              <ClipboardList className="ml-2 size-4" />
              الطلبات
            </TabsTrigger>
            <TabsTrigger value="earnings">
              <Wallet className="ml-2 size-4" />
              الأرباح
            </TabsTrigger>
          </TabsList>
          <div className="relative w-full sm:w-64">
            <Search className="absolute right-3 top-3 size-4 text-muted-foreground" />
            <Input aria-label="بحث في اللوحة" placeholder="بحث بالاسم أو البريد أو الهاتف..." className="pr-9" value={search} onChange={e => onSearch(e.target.value)} />
          </div>
        </div>

        <TabsContent value="stores">
          {admin ? (
            <>
              {/* قسم المطاعم والخدمات الأكثر طلباً */}
              {topOrderedStores.length > 0 && (
                <div className="mb-8 rounded-2xl border bg-card p-5 shadow-soft">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="grid size-9 place-items-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                        <Flame className="size-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base">المطاعم والخدمات الأكثر طلباً</h3>
                        <p className="text-xs text-muted-foreground">ترتيب الأنشطة التجارية وفقاً لعدد الطلبات وإجمالي المبيعات</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {topOrderedStores.map((ts, index) => (
                      <div key={ts.id} className="relative rounded-xl border bg-muted/20 p-4 transition-all hover:border-primary/40">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className={`inline-flex items-center justify-center size-6 rounded-full text-xs font-bold ${
                            index === 0 ? "bg-amber-500 text-white" : index === 1 ? "bg-slate-300 text-slate-800" : index === 2 ? "bg-amber-700/60 text-white" : "bg-muted text-muted-foreground"
                          }`}>
                            #{index + 1}
                          </span>
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${ts.is_open ? "bg-emerald-500/10 text-emerald-600" : "bg-destructive/10 text-destructive"}`}>
                            {ts.is_open ? "يعمل الآن" : "مغلق"}
                          </span>
                        </div>

                        <h4 className="font-bold text-sm text-foreground">{ts.name}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">{data.categories.find(c => c.slug === ts.category)?.name}</p>

                        <div className="mt-3 flex items-center justify-between border-t pt-2 text-xs">
                          <span className="text-muted-foreground">إجمالي الطلبات:</span>
                          <strong className="text-primary font-bold">{ts.orderCount} طلب</strong>
                        </div>
                        <div className="flex items-center justify-between text-xs mt-1">
                          <span className="text-muted-foreground">المبيعات المكتملة:</span>
                          <strong className="text-success font-bold">{money(ts.grossSales)}</strong>
                        </div>

                        <div className="mt-3 flex gap-1.5 pt-2 border-t">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 h-7 text-xs"
                            onClick={() => {
                              setSelectedStore(ts.id);
                              onTab("products");
                            }}
                          >
                            <Package className="size-3 ml-1" />
                            المنيو
                          </Button>
                          <Button asChild size="sm" variant="ghost" className="h-7 text-xs px-2" title="معاينة كعميل">
                            <Link to="/stores/$storeId" params={{ storeId: ts.id }} target="_blank">
                              <ExternalLink className="size-3.5" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <h2 className="mb-4 text-lg font-bold">
                كافة المتاجر ومقدمو الخدمات <span className="text-sm font-normal text-muted-foreground">({stores.length})</span>
              </h2>
              <div className="divide-y border-y">
                {stores.map(s => {
                  const ownerEmail = (s as any).owner_email as string | null | undefined;
                  const ownerName = (s as any).owner_name as string | null | undefined;
                  return (
                    <div key={s.id} className="flex flex-wrap items-center justify-between gap-4 py-5">
                      <div className="flex items-center gap-3">
                        <div className="grid size-11 place-items-center rounded-lg bg-secondary text-primary">
                          <Store size={22} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-sans font-semibold text-base">{s.name}</h3>
                            <span className={`inline-block size-2 rounded-full ${s.is_open ? "bg-emerald-500 animate-pulse" : "bg-destructive"}`} title={s.is_open ? "مفتوح" : "مغلق"} />
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {data.categories.find(c => c.slug === s.category)?.name} • {data.areas.find(a => a.id === s.area_id)?.name ?? "بدون منطقة"}
                          </p>
                          <p className="text-xs text-muted-foreground">{s.phone ?? ""}</p>
                          {ownerEmail ? (
                            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-primary font-medium">
                              <UserCheck className="size-3.5 shrink-0" />
                              <span>المالك: {ownerName ? `${ownerName} (${ownerEmail})` : ownerEmail}</span>
                            </div>
                          ) : (
                            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
                              <UserX className="size-3.5 shrink-0" />
                              <span>بدون صاحب (خدمة غير معينة / عامة)</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {/* زر تبديل حالة المطعم مباشرة من الإدارة: يعمل / مغلق */}
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busy}
                          onClick={() => {
                            execute(
                              () =>
                                doSaveStore({
                                  data: {
                                    id: s.id,
                                    name: s.name,
                                    category: s.category,
                                    area_id: s.area_id,
                                    description: s.description,
                                    phone: s.phone ?? "",
                                    address: s.address ?? "",
                                    specialty: s.specialty ?? "",
                                    delivery_fee: s.delivery_fee,
                                    booking_fee: s.booking_fee,
                                    is_open: !s.is_open,
                                    logo_url: s.logo_url ?? "",
                                    banner_url: s.banner_url ?? "",
                                  },
                                }),
                              () => {
                                toast.success(s.is_open ? `تم إغلاق متجر «${s.name}»` : `تم فتح متجر «${s.name}» لاستقبال الطلبات`);
                              },
                            );
                          }}
                          className={`h-8 gap-1.5 text-xs font-semibold ${
                            s.is_open
                              ? "border-emerald-500/40 text-emerald-600 bg-emerald-500/10 hover:bg-emerald-500/20"
                              : "border-destructive/40 text-destructive bg-destructive/10 hover:bg-destructive/20"
                          }`}
                        >
                          <span className={`size-2 rounded-full ${s.is_open ? "bg-emerald-500" : "bg-destructive"}`} />
                          {s.is_open ? "يعمل الآن" : "مغلق"}
                        </Button>

                        {/* زر معاينة المتجر كعميل */}
                        <Button asChild size="sm" variant="ghost" className="h-8 gap-1 text-xs" title="معاينة المتجر كعميل">
                          <Link to="/stores/$storeId" params={{ storeId: s.id }} target="_blank">
                            <ExternalLink className="size-3.5" />
                            معاينة
                          </Link>
                        </Button>

                        {/* زر إدارة المنيو */}
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1 text-xs"
                          onClick={() => {
                            setSelectedStore(s.id);
                            onTab("products");
                          }}
                        >
                          <Package className="size-3.5" />
                          المنيو
                        </Button>

                        {/* زر نقل / تعيين الملكية */}
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1.5 text-xs"
                          onClick={() => {
                            setTransferTarget(s);
                            setTargetEmail(ownerEmail ?? "");
                          }}
                        >
                          <ArrowRightLeft className="size-3.5" />
                          {s.owner_id ? "نقل الملكية" : "تعيين المالك"}
                        </Button>

                        {/* زر الاعتماد والعمولة */}
                        <Button size="sm" variant="outline" className="h-8 gap-1 text-xs" onClick={() => setApproval(s)}>
                          {s.is_active ? <Pencil className="size-3" /> : <Check className="size-3" />}
                          {s.is_active ? "العمولة" : "اعتماد"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
              {!stores.length && <Empty text="لا توجد متاجر مطابقة للبحث" />}
            </>
          ) : store ? (
            <div className="space-y-6">
              {/* شريط المتجر وحالة العمل والتعديل السريع */}
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-4 shadow-soft">
                <div className="flex items-center gap-3">
                  <div className="grid size-12 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Store />
                  </div>
                  <div>
                    <select
                      aria-label="المتجر الحالي"
                      className="max-w-64 bg-transparent text-lg font-bold"
                      value={store.id}
                      onChange={e => {
                        setSelectedStore(e.target.value);
                        onSearch("");
                      }}
                    >
                      {data.stores.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-muted-foreground">
                      {store.is_active ? "متجر معتمد ونشط" : "بانتظار اعتماد الإدارة"} • عمولة {store.commission_rate}٪
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={busy}
                    onClick={toggleStoreOpen}
                    className={`text-xs gap-1.5 font-bold ${
                      store.is_open
                        ? "border-emerald-500/40 text-emerald-600 bg-emerald-500/10 hover:bg-emerald-500/20"
                        : "border-destructive/40 text-destructive bg-destructive/10 hover:bg-destructive/20"
                    }`}
                  >
                    <span className={`size-2 rounded-full ${store.is_open ? "bg-emerald-500 animate-pulse" : "bg-destructive"}`} />
                    {store.is_open ? "المتجر مفتوح للطلبات" : "المتجر مغلق حاليًا"}
                  </Button>
                  <Button asChild variant="ghost" size="sm" className="gap-1.5 text-xs font-semibold">
                    <Link to="/stores/$storeId" params={{ storeId: store.id }} target="_blank">
                      <ExternalLink className="size-3.5" />
                      معاينة كعميل
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setStoreEdit(store)} className="gap-1.5 text-xs font-semibold">
                    <Pencil className="size-3.5" /> تعديل بيانات المتجر
                  </Button>
                </div>
              </div>

              {/* بطاقة تفاصيل المتجر ومتوسط وقت التحضير */}
              <div className="grid gap-6 md:grid-cols-2 rounded-xl border bg-card p-5 shadow-soft">
                <div>
                  <h3 className="mb-4 text-base font-bold">بيانات المتجر والاتصال</h3>
                  <dl className="space-y-3.5 text-sm">
                    {[
                      ["الاسم", store.name],
                      ["القسم", data.categories.find(c => c.slug === store.category)?.name],
                      ["المنطقة", data.areas.find(a => a.id === store.area_id)?.name],
                      ["العنوان", store.address],
                      ["الهاتف", store.phone],
                      ["حالة العمل", store.is_open ? "مفتوح للطلبات" : "مغلق مؤقتاً"],
                    ].map(([label, value]) => (
                      <div key={label} className="flex justify-between gap-4 border-b pb-2.5">
                        <dt className="text-muted-foreground">{label}</dt>
                        <dd className="max-w-[65%] break-words text-left font-medium">{value || "—"}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
                <div>
                  <h3 className="mb-4 text-base font-bold">الرسوم والاعتماد ومعدل التحضير</h3>
                  <div className="space-y-3 text-sm">
                    {/* مؤشر متوسط وقت التحضير في لوحة المطعم */}
                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Timer className="size-5 text-primary" />
                        <div>
                          <strong className="block text-xs text-muted-foreground">متوسط وقت تحضير الوجبات</strong>
                          <span className="text-xs text-muted-foreground">من وقت قبول الطلب إلى جاهزيته للتسليم</span>
                        </div>
                      </div>
                      <span className="text-base font-bold text-primary">{avgPrepMinutes} دقيقة</span>
                    </div>

                    <p>رسوم التوصيل المقررة: <strong>{money(store.delivery_fee)}</strong></p>
                    <p>رسوم الحجز (إن وجد): <strong>{money(store.booking_fee)}</strong></p>
                    <p>نسبة العمولة: <strong>{store.commission_rate}٪</strong></p>
                    <div className="rounded-lg border-r-4 border-primary bg-primary/5 p-3 text-xs leading-relaxed">
                      {store.is_active ? "تم اعتماد المتجر بالكامل ويمكن للعملاء الطلب منه." : "متجرك محفوظ وبانتظار مراجعة الإدارة قبل ظهوره للعملاء."}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Empty text="لم تضف متجرك بعد" action={<Button onClick={() => setStoreEdit("new")}><Plus /> إضافة متجر</Button>} />
          )}
        </TabsContent>

        <TabsContent value="products">
          {/* محدد المتجر للمدير العام حتى يتمكن من إدارة منيو أي متجر في المنظومة */}
          {admin && (
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4 shadow-soft">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Store className="size-5" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block font-medium">المتجر المحدد لإدارة المنيو والمنتجات:</label>
                  <select
                    className="bg-transparent text-base font-bold text-foreground focus:outline-none"
                    value={store?.id ?? ""}
                    onChange={e => {
                      setSelectedStore(e.target.value);
                      onSearch("");
                    }}
                  >
                    {data.stores.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({data.categories.find(c => c.slug === s.category)?.name})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {store && (
                  <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs font-semibold">
                    <Link to="/stores/$storeId" params={{ storeId: store.id }} target="_blank">
                      <ExternalLink className="size-3.5" />
                      معاينة كعميل
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          )}

          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">قائمة المنتجات والمنيو ({products.length})</h2>
              {store && <p className="text-xs text-muted-foreground">متجر: {store.name}</p>}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" disabled={!store || !productQuery.data} onClick={() => setCatalogOpen(true)}>
                <ClipboardList className="size-4 ml-1" /> من الكتالوج الجاهز
              </Button>
              <Button disabled={!store} onClick={() => setProductEdit("new")}>
                <Plus className="size-4 ml-1" /> إضافة منتج
              </Button>
            </div>
          </div>
          <div className="divide-y border-y">
            {products.map(p => (
              <div className="flex flex-wrap items-center justify-between gap-3 py-4" key={p.id}>
                <div className="flex items-center gap-3">
                  {p.image_url ? (
                    <img src={p.image_url} alt="" loading="lazy" className="size-12 rounded object-cover" />
                  ) : (
                    <div className="grid size-12 place-items-center rounded bg-muted">
                      <Package className="size-5 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-sans font-semibold">{p.name}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{p.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold">{money(p.price)}</span>
                  <span className={`text-xs font-bold ${p.is_available ? "text-success" : "text-muted-foreground"}`}>{p.is_available ? "متاح" : "غير متاح"}</span>
                  <Button variant="ghost" size="icon" title="تعديل المنتج" aria-label={`تعديل ${p.name}`} onClick={() => setProductEdit(p)}>
                    <Pencil />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive" title="حذف المنتج" aria-label={`حذف ${p.name}`} onClick={() => setRemove(p)}>
                    <Trash2 />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          {productQuery.isPending ? (
            <p role="status" className="py-8 text-center text-muted-foreground">
              جاري تحميل المنتجات...
            </p>
          ) : productQuery.isError ? (
            <div role="alert" className="py-8 text-center">
              <p>تعذر تحميل المنتجات</p>
              <Button variant="outline" onClick={() => productQuery.refetch()}>
                إعادة المحاولة
              </Button>
            </div>
          ) : (
            !products.length && <Empty text="لا توجد منتجات مسجلة لهذا المتجر حتى الآن" />
          )}
        </TabsContent>

        <TabsContent value="orders">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold">{admin ? "جميع طلبات وحجوزات المنظومة" : `طلبات وحجوزات متجر ${store?.name ?? ""}`} ({visibleTasks.length})</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                طلبات قيد التنفيذ: <span className="font-bold text-primary">{pending}</span> • طلبات مكتملة: <span className="font-bold text-success">{tasks.filter(t => ["delivered", "completed"].includes(t.status)).length}</span>
              </p>
            </div>

            {/* مؤشر متوسط وقت التحضير في لوحة المطعم */}
            <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5 shadow-soft">
              <div className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground">
                <Timer className="size-5" />
              </div>
              <div>
                <span className="text-xs text-muted-foreground block font-medium">متوسط وقت التحضير</span>
                <strong className="text-base font-bold text-primary">{avgPrepMinutes} دقيقة</strong>
              </div>
            </div>
          </div>

          <div className="divide-y border-y">
            {visibleTasks.map(t => (
              <div key={`${t.kind}-${t.id}`} className="flex flex-wrap items-center justify-between gap-4 py-5">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{t.kind === "orders" ? "مشتريات" : t.kind === "bookings" ? "حجز موعد" : "خدمة منزلية"}</span>
                    <span dir="ltr" className="font-mono text-xs">#{t.id.slice(0, 8)}</span>
                  </div>
                  <h3 className="font-sans text-sm font-semibold">{admin ? storeName(t.store_id) : t.detail.slice(0, 70)}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{dateAr(t.created_at)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={t.status} />
                  <span className="text-sm font-semibold">{money(t.amount)}</span>
                  {t.kind === "orders" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5 text-xs font-bold text-primary border-primary/30 hover:bg-primary/10"
                      onClick={() => setChatOrderId(t.id)}
                      title="محادثة العميل"
                    >
                      <MessageCircle className="size-3.5" />
                      محادثة العميل
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => setDetail(t)}>
                    التفاصيل <ArrowLeft />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          {!visibleTasks.length && <Empty text="لا توجد طلبات مطابقة للبحث" />}
        </TabsContent>

        <TabsContent value="earnings">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold">
                {admin ? "التقرير المالي للدخل العام للمنظومة (الخزينة)" : `التقرير المالي للدخل الخاص بمتجر «${store?.name ?? ""}»`}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">طلبات مكتملة فقط • مبالغ محاسبية مسجلة</p>
            </div>

            {/* أزرار الفلترة الزمنية للتقارير المالية: يومي، أسبوعي، شهري، سنوي، الكل */}
            <div className="flex flex-wrap items-center rounded-xl border bg-muted/40 p-1 text-xs font-semibold gap-1">
              {[
                { id: "today", label: "يومي (اليوم)" },
                { id: "week", label: "أسبوعي (7 أيام)" },
                { id: "month", label: "شهري (30 يوم)" },
                { id: "year", label: "سنوي (العام الحالي)" },
                { id: "all", label: "الإجمالي (الكل)" },
              ].map(p => (
                <button
                  key={p.id}
                  onClick={() => setPeriod(p.id as any)}
                  className={`rounded-lg px-3 py-1.5 transition-all ${
                    period === p.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* بطاقات الإحصائيات المالية المخصصة للأرباح حسب الفترة (تغيير خانة بانتظار الاعتماد إلى المتاجر النشطة) */}
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              {
                label: admin ? "إجمالي مبيعات المنظومة" : "صافي أرباح المتجر",
                value: money(admin ? periodTotals.gross : periodTotals.net),
                icon: Wallet,
              },
              {
                label: admin ? "المتاجر النشطة" : "إجمالي المبيعات المكتملة",
                value: admin ? data.stores.filter(s => s.is_active).length : money(periodTotals.gross),
                icon: admin ? CheckCircle2 : TrendingUp,
              },
              {
                label: admin ? "عمولات المنصة المحصلة" : "عمولات التطبيق المستقطعة",
                value: money(periodTotals.commission),
                icon: Store,
              },
              {
                label: admin ? "صافي مستحقات المتاجر" : "العمليات المكتملة",
                value: admin ? money(periodTotals.net) : periodTotals.count,
                icon: Package,
              },
            ].map((metric, i) => (
              <div key={metric.label} className={`rounded-xl border p-4 shadow-soft ${i === 0 ? "bg-primary text-primary-foreground" : "bg-card"}`}>
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="text-xs font-medium">{metric.label}</span>
                  <metric.icon className="size-4 opacity-75" />
                </div>
                <strong className="break-words text-xl md:text-2xl font-bold">{metric.value}</strong>
              </div>
            ))}
          </div>

          <div className="rounded-xl border bg-card p-5 shadow-soft">
            <h3 className="mb-4 text-base font-bold">سجل العمليات المكتملة ({periodTotals.count})</h3>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-right text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    {["رقم الطلب", "المتجر", "القيمة الإجمالية", "العمولة", "الصافي المستحق"].map(h => (
                      <th className="p-3 font-semibold text-xs" key={h}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {periodTasks
                    .filter(t => earnings([t]).count > 0)
                    .map(t => (
                      <tr key={t.id} className="hover:bg-muted/30">
                        <td className="p-3 font-mono text-xs">#{t.id.slice(0, 8)}</td>
                        <td className="p-3 font-medium">{storeName(t.store_id)}</td>
                        <td className="p-3 font-bold">{money(t.amount)}</td>
                        <td className="p-3 text-primary font-medium">{money(t.commission)}</td>
                        <td className="p-3 text-success font-bold">{money(t.amount - t.commission)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            {!periodTotals.count && <Empty text="لم تكتمل أي عمليات بيع خلال الفترة المحددة" />}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Store Dialog */}
      <Dialog
        open={storeEdit !== null}
        onOpenChange={open => {
          if (!open && !busy) setStoreEdit(null);
        }}
      >
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogTitle>{editedStore ? "تعديل بيانات المتجر" : "إضافة متجر"}</DialogTitle>
          <DialogDescription>بيانات مقدم الخدمة</DialogDescription>
          <form key={editedStore?.id ?? "new"} onSubmit={submitStore} className="grid gap-4 sm:grid-cols-2">
            <Field name="name" label="اسم المتجر" value={editedStore?.name} required />
            <Field name="phone" label="رقم الهاتف" value={editedStore?.phone ?? ""} required />
            <SelectField label="القسم" name="category" value={editedStore?.category}>
              {data.categories.map(c => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </SelectField>
            <SelectField label="المنطقة" name="area_id" value={String(editedStore?.area_id ?? "")}>
              <option value="">اختر المنطقة</option>
              {data.areas.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </SelectField>
            <Field name="address" label="العنوان" value={editedStore?.address} required />
            <Field name="specialty" label="التخصص (للأطباء والخدمات)" value={editedStore?.specialty ?? ""} />
            <Field name="description" label="وصف المتجر" value={editedStore?.description} />
            <Field name="delivery_fee" label="رسوم التوصيل (ج.م)" type="number" value={editedStore?.delivery_fee ?? 0} />
            <Field name="booking_fee" label="رسوم الحجز (ج.م)" type="number" value={editedStore?.booking_fee ?? 0} />
            {admin && (
              <div className="sm:col-span-2">
                <Field
                  name="owner_email"
                  label="البريد الإلكتروني لصاحب المتجر (اختياري - اتركه فارغاً لجعله بدون صاحب)"
                  value={(editedStore as any)?.owner_email ?? ""}
                  placeholder="مثال: user@example.com"
                />
              </div>
            )}
            <ImageUploadField name="logo_url" label="لوجو المتجر" value={editedStore?.logo_url} />
            <ImageUploadField name="banner_url" label="صورة البانر" wide value={editedStore?.banner_url} />
            <ToggleField name="is_open" label="المتجر مفتوح" checked={editedStore?.is_open ?? true} />
            <Button type="submit" disabled={busy} className="sm:col-span-2">
              <Save />
              {busy ? "جاري الحفظ..." : "حفظ المتجر"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Transfer / Assign Store Ownership Dialog */}
      <Dialog
        open={transferTarget !== null}
        onOpenChange={open => {
          if (!open && !busy) setTransferTarget(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="size-5 text-primary" />
            <span>{transferTarget?.owner_id ? "نقل ملكية المتجر / الخدمة" : "تعيين صاحب للمتجر / الخدمة"}</span>
          </DialogTitle>
          <DialogDescription>
            {transferTarget?.name} • {data.categories.find(c => c.slug === transferTarget?.category)?.name}
          </DialogDescription>
          {transferTarget && (
            <div className="space-y-4 pt-2">
              <div className="rounded-lg border bg-muted/40 p-3 text-sm">
                <p className="mb-1 text-xs text-muted-foreground">الوضع الحالي للملكية:</p>
                {(transferTarget as any).owner_email ? (
                  <div className="flex items-center gap-2 font-medium text-primary">
                    <UserCheck className="size-4 shrink-0" />
                    <span>
                      المالك الحالي: {(transferTarget as any).owner_name ? `${(transferTarget as any).owner_name} (${(transferTarget as any).owner_email})` : (transferTarget as any).owner_email}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 font-medium text-amber-600 dark:text-amber-400">
                    <UserX className="size-4 shrink-0" />
                    <span>هذه الخدمة حالياً بدون صاحب (متجر عام)</span>
                  </div>
                )}
              </div>

              <form
                className="space-y-4"
                onSubmit={e => {
                  e.preventDefault();
                  if (!targetEmail.trim()) {
                    toast.error("يرجى إدخال البريد الإلكتروني للمستخدم");
                    return;
                  }
                  execute(
                    () => doTransfer({ data: { store_id: transferTarget.id, email: targetEmail.trim() } }),
                    () => setTransferTarget(null),
                  );
                }}
              >
                <div className="space-y-2">
                  <label className="text-sm font-medium">البريد الإلكتروني للمالك الجديد</label>
                  <Input
                    type="email"
                    required
                    dir="ltr"
                    placeholder="user@example.com"
                    value={targetEmail}
                    onChange={e => setTargetEmail(e.target.value)}
                    list="registered-users-list"
                    className="font-mono text-left"
                  />
                  {(data as any).registeredUsers && (data as any).registeredUsers.length > 0 && (
                    <datalist id="registered-users-list">
                      {(data as any).registeredUsers.map((u: any) => (
                        <option key={u.id} value={u.email}>
                          {u.name ? `${u.name} (${u.email})` : u.email}
                        </option>
                      ))}
                    </datalist>
                  )}
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    اكتب البريد الإلكتروني للمستخدم المراد تسليمه المتجر (أو اختر من المسجلين). سيتم ربط المتجر بحسابه وإعطاؤه صلاحيات مقدم الخدمة لتظهر لوحة الإدارة في حسابه فوراً.
                  </p>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <Button type="submit" disabled={busy} className="gap-2">
                    <ArrowRightLeft className="size-4" />
                    <span>{busy ? "جاري التعيين..." : "تأكيد نقل / تعيين الملكية"}</span>
                  </Button>

                  {transferTarget.owner_id && (
                    <Button
                      type="button"
                      variant="outline"
                      disabled={busy}
                      className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => {
                        if (confirm(`هل تريد إلغاء تعيين المالك لـ «${transferTarget.name}» وجعله متجراً عاماً بدون صاحب؟`)) {
                          execute(
                            () => doTransfer({ data: { store_id: transferTarget.id, unassign: true } }),
                            () => setTransferTarget(null),
                          );
                        }
                      }}
                    >
                      <UserX className="size-4" />
                      <span>إلغاء تعيين المالك (جعله بدون صاحب)</span>
                    </Button>
                  )}
                </div>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {store && <CatalogPicker storeId={store.id} existing={allProducts.filter(p => p.store_id === store.id)} open={catalogOpen} onOpenChange={setCatalogOpen} />}

      <Dialog
        open={productEdit !== null}
        onOpenChange={open => {
          if (!open && !busy) setProductEdit(null);
        }}
      >
        <DialogContent>
          <DialogTitle>{editedProduct ? "تعديل المنتج" : "إضافة منتج"}</DialogTitle>
          <DialogDescription>{store?.name}</DialogDescription>
          <form key={editedProduct?.id ?? "new"} onSubmit={submitProduct} className="space-y-4">
            <Field name="name" label="اسم المنتج" required value={editedProduct?.name} />
            <Field name="description" label="وصف المنتج" value={editedProduct?.description} />
            <ImageUploadField name="image_url" label="صورة المنتج" value={editedProduct?.image_url} />
            <Field name="price" label="السعر (ج.م)" type="number" required value={editedProduct?.price} />
            <Field name="stock_qty" label="الكمية المتاحة (اتركها فارغة لو متوفر دائمًا)" type="number" value={editedProduct?.stock_qty ?? ""} />
            <ToggleField name="is_available" label="متاح للطلب" checked={editedProduct?.is_available ?? true} />
            <Button type="submit" disabled={busy}>
              <Save />
              حفظ المنتج
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={approval !== null}
        onOpenChange={open => {
          if (!open && !busy) setApproval(null);
        }}
      >
        <DialogContent>
          <DialogTitle>مراجعة {approval?.name}</DialogTitle>
          <DialogDescription>
            {approval?.address} • {approval?.phone}
          </DialogDescription>
          {approval && (
            <form
              key={approval.id}
              className="space-y-4"
              onSubmit={e => {
                e.preventDefault();
                const form = new FormData(e.currentTarget);
                execute(
                  () => doApproval({ data: { id: approval.id, commission_rate: Number(form.get("commission_rate")), is_active: form.has("is_active") } }),
                  () => setApproval(null),
                );
              }}
            >
              <p className="text-sm">{approval.description || "لا يوجد وصف"}</p>
              <Field name="commission_rate" label="نسبة العمولة (٪)" type="number" required value={approval.commission_rate} />
              <ToggleField name="is_active" label="متجر معتمد ويظهر للعملاء" checked={approval.is_active} />
              <Button type="submit" disabled={busy}>
                <ShieldCheck />
                حفظ الاعتماد والعمولة
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={remove !== null}
        onOpenChange={open => {
          if (!open && !busy) setRemove(null);
        }}
      >
        <DialogContent>
          <DialogTitle>حذف المنتج</DialogTitle>
          <DialogDescription>هل تريد حذف «{remove?.name}»؟ لا يمكن التراجع عن الحذف.</DialogDescription>
          <Button
            variant="destructive"
            disabled={busy}
            onClick={() => {
              if (remove) execute(() => doDelete({ data: { id: remove.id, store_id: remove.store_id } }), () => setRemove(null));
            }}
          >
            <Trash2 />
            تأكيد الحذف
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog
        open={detail !== null}
        onOpenChange={open => {
          if (!open && !busy) setDetail(null);
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogTitle>تفاصيل الطلب #{currentDetail?.id.slice(0, 8)}</DialogTitle>
          <DialogDescription>{currentDetail && storeName(currentDetail.store_id)}</DialogDescription>
          {currentDetail && (
            <div className="space-y-4">
              <StatusBadge status={currentDetail.status} />
              <p className="text-sm">{currentDetail.detail}</p>
              {currentDetail.appointment && (
                <p className="flex items-center gap-2 text-sm">
                  <CalendarDays size={16} />
                  {currentDetail.appointment}
                </p>
              )}
              <p className="text-sm">العنوان: {cleanDisplayAddress(currentDetail.address) || "داخل العيادة"}</p>
              <p className="text-sm">
                الهاتف:{" "}
                <a dir="ltr" href={`tel:${currentDetail.phone}`} className="text-primary">
                  {currentDetail.phone}
                </a>
              </p>
              {cleanOrderNotes(currentDetail.notes) && (
                <p className="text-sm">ملاحظات: {cleanOrderNotes(currentDetail.notes)}</p>
              )}
              {currentDetail.kind === "orders" && (
                <div className="pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2 border-primary/30 text-primary hover:bg-primary/10 font-bold"
                    onClick={() => setChatOrderId(currentDetail.id)}
                  >
                    <MessageCircle className="size-4" />
                    محادثة العميل والكابتن
                  </Button>
                </div>
              )}
              {currentDetail.kind === "orders" && itemQuery.isPending && <p role="status" className="text-sm text-muted-foreground">جاري تحميل الأصناف...</p>}
              {currentDetail.kind === "orders" && itemQuery.isError && (
                <div role="alert">
                  <p>تعذر تحميل الأصناف</p>
                  <Button variant="outline" onClick={() => itemQuery.refetch()}>
                    إعادة المحاولة
                  </Button>
                </div>
              )}
              {currentDetail.items.map((i, index) => (
                <div className="flex justify-between border-b py-2 text-sm" key={index}>
                  <span>
                    {i.name} × {i.qty}
                  </span>
                  <span>{money(i.price * i.qty)}</span>
                </div>
              ))}
              {currentDetail.images.length > 0 && <p className="text-sm text-muted-foreground">صور مرفقة: {currentDetail.images.length}</p>}
              <p className="text-lg font-semibold">الإجمالي: {money(currentDetail.amount)}</p>
              {currentDetail.kind === "orders" && currentDetail.status === "preparing" && (
                <p className="rounded-md bg-primary/5 p-3 text-sm">الطلب جاهز وبانتظار استلام الدليفري</p>
              )}
              {currentDetail.kind === "orders" && currentDetail.status === "on_the_way" && (
                <p className="rounded-md bg-primary/5 p-3 text-sm">الطلب مع الدليفري في الطريق للعميل</p>
              )}
              {allowedNext(currentDetail.kind, currentDetail.status).length > 0 && (
                <form
                  key={`${currentDetail.id}-${currentDetail.status}`}
                  className="space-y-4 border-t pt-4"
                  onSubmit={e => {
                    e.preventDefault();
                    const form = new FormData(e.currentTarget);
                    execute(
                      () =>
                        doUpdate({
                          data: {
                            id: currentDetail.id,
                            kind: currentDetail.kind,
                            status: String(form.get("status")),
                            quoted_price: currentDetail.kind === "service_requests" ? Number(form.get("quoted_price")) : undefined,
                          },
                        }),
                      () => {},
                    );
                  }}
                >
                  <SelectField label="تحديث الحالة" name="status">
                    {allowedNext(currentDetail.kind, currentDetail.status).map(s => (
                      <option key={s} value={s}>
                        {STATUS_LABELS[s ?? ""]}
                      </option>
                    ))}
                  </SelectField>
                  {currentDetail.kind === "service_requests" && (
                    <Field name="quoted_price" type="number" label="السعر النهائي للخدمة (ج.م)" value={currentDetail.amount} required />
                  )}
                  <Button disabled={busy} type="submit">
                    <Save />
                    تحديث الطلب
                  </Button>
                </form>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* نافذة المحادثة الفورية للطلب */}
      <OrderChatDialog
        orderId={chatOrderId}
        open={!!chatOrderId}
        onOpenChange={(open) => !open && setChatOrderId(null)}
      />
    </div>
  );
}

function Empty({ text, action }: { text: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center text-muted-foreground">
      <ClipboardList className="size-10 opacity-40" />
      <p>{text}</p>
      {action}
    </div>
  );
}
