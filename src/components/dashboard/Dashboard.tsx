import { useState, type FormEvent } from "react";
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

type StoreRow = DashboardData["stores"][number];
type ProductRow = DashboardProduct;
type Task = LedgerRow & { id: string; phone: string; detail: string; address: string; notes: string | null; items: { name: string; qty: number; price: number }[]; images: string[]; appointment?: string | undefined };

function tasksFrom(data: DashboardData): Task[] {
  return [
    ...data.orders.map(o => ({ kind: "orders" as const, id: o.id, store_id: o.store_id, status: o.status, amount: Number(o.total), commission: Number(o.commission_amount), created_at: o.created_at, phone: o.phone, detail: "طلب مشتريات", address: o.address, notes: o.notes, items: [], images: [] })),
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

  const productQuery = useQuery({ ...dashboardProductsQuery(store?.id ?? ''), enabled: !admin && !!store && (tab === 'products' || catalogOpen || productEdit !== null) });
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

  return (
    <div className="mx-auto max-w-6xl px-4 py-7 md:px-6 md:py-10">
      <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            {admin ? <ShieldCheck size={16} /> : <Store size={16} />} خدمات الحسينية / {admin ? "الإدارة" : "مقدم الخدمة"}
          </div>
          <h1 className="text-2xl md:text-3xl">{admin ? "لوحة الإدارة" : "إدارة متجرك"}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" aria-label="تحديث البيانات" title="تحديث البيانات" onClick={() => client.invalidateQueries({ queryKey: ["dashboard"] })}>
            <RefreshCw />
          </Button>
          <Button onClick={() => setStoreEdit("new")}>
            <Plus /> {admin ? "إضافة خدمة / متجر" : "إضافة متجر"}
          </Button>
        </div>
      </div>

      {!admin && store && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b pb-5">
          <div className="flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-lg bg-primary/10 text-primary">
              <Store />
            </div>
            <div>
              <select
                aria-label="المتجر الحالي"
                className="max-w-64 bg-transparent text-lg font-semibold"
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
              <p className="text-sm text-muted-foreground">
                {store.is_active ? "متجر معتمد" : "بانتظار اعتماد الإدارة"} • عمولة {store.commission_rate}٪
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={() => setStoreEdit(store)}>
            <Pencil /> بيانات المتجر
          </Button>
        </div>
      )}

      <div className="mb-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: admin ? "إجمالي المتاجر" : "طلبات قيد التنفيذ", value: admin ? data.stores.length : pending, icon: Store },
          { label: admin ? "بانتظار الاعتماد" : "إجمالي المبيعات المكتملة", value: admin ? data.stores.filter(s => !s.is_active).length : money(totals.gross), icon: ClipboardList },
          { label: "العمولات المستحقة", value: money(totals.commission), icon: Wallet },
          { label: admin ? "المبيعات المكتملة" : "صافي مستحقات المتجر", value: money(admin ? totals.gross : totals.net), icon: Package },
        ].map((metric, i) => (
          <div key={metric.label} className={`rounded-lg border p-4 ${i === 2 ? "bg-primary text-primary-foreground" : "bg-card"}`}>
            <div className="mb-4 flex items-center justify-between gap-2">
              <span className="text-xs md:text-sm">{metric.label}</span>
              <metric.icon className="size-4 opacity-70" />
            </div>
            <strong className="break-words text-xl md:text-2xl">{metric.value}</strong>
          </div>
        ))}
      </div>

      <Tabs dir="rtl" value={tab} onValueChange={onTab}>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b pb-4">
          <TabsList className="h-auto max-w-full flex-wrap bg-transparent p-0">
            <TabsTrigger value="stores">
              {admin ? <ShieldCheck className="ml-2 size-4" /> : <Store className="ml-2 size-4" />}
              {admin ? "المتاجر والخدمات" : "المتجر"}
            </TabsTrigger>
            {!admin && (
              <TabsTrigger value="products">
                <Package className="ml-2 size-4" />
                المنتجات
              </TabsTrigger>
            )}
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
              <h2 className="mb-4 text-lg">
                المتاجر ومقدمو الخدمات <span className="text-sm text-muted-foreground">({stores.length})</span>
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
                          <h3 className="font-sans font-semibold">{s.name}</h3>
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
                      <div className="flex flex-wrap items-center gap-3">
                        <span className={`text-xs ${s.is_active ? "text-success" : "text-warning"}`}>
                          {s.is_active ? "معتمد" : "بانتظار الاعتماد"}
                        </span>
                        <span className="text-sm">عمولة {s.commission_rate}٪</span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5"
                          onClick={() => {
                            setTransferTarget(s);
                            setTargetEmail(ownerEmail ?? "");
                          }}
                        >
                          <ArrowRightLeft className="size-3.5" />
                          {s.owner_id ? "نقل الملكية" : "تعيين المالك"}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setApproval(s)}>
                          {s.is_active ? <Pencil /> : <Check />}
                          {s.is_active ? "إدارة" : "مراجعة واعتماد"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
              {!stores.length && <Empty text="لا توجد متاجر مطابقة" />}
            </>
          ) : store ? (
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h2 className="mb-4 text-lg">بيانات المتجر</h2>
                <dl className="space-y-4 text-sm">
                  {[
                    ["الاسم", store.name],
                    ["القسم", data.categories.find(c => c.slug === store.category)?.name],
                    ["المنطقة", data.areas.find(a => a.id === store.area_id)?.name],
                    ["العنوان", store.address],
                    ["الهاتف", store.phone],
                    ["حالة العمل", store.is_open ? "مفتوح" : "مغلق"],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-4 border-b pb-3">
                      <dt className="text-muted-foreground">{label}</dt>
                      <dd className="max-w-[65%] break-words text-left">{value || "—"}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div>
                <h2 className="mb-4 text-lg">الرسوم والاعتماد</h2>
                <p className="mb-3 text-sm">رسوم التوصيل: {money(store.delivery_fee)}</p>
                <p className="mb-3 text-sm">رسوم الحجز: {money(store.booking_fee)}</p>
                <p className="mb-3 text-sm">نسبة العمولة: {store.commission_rate}٪</p>
                <div className="border-r-2 border-primary bg-primary/5 p-4 text-sm">
                  {store.is_active ? "تم اعتماد المتجر ويمكن للعملاء الوصول إليه." : "متجرك محفوظ وبانتظار مراجعة الإدارة قبل ظهوره للعملاء."}
                </div>
              </div>
            </div>
          ) : (
            <Empty text="لم تضف متجرك بعد" action={<Button onClick={() => setStoreEdit("new")}><Plus /> إضافة متجر</Button>} />
          )}
        </TabsContent>

        {!admin && (
          <TabsContent value="products">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg">المنتجات ({products.length})</h2>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" disabled={!store || !productQuery.data} onClick={() => setCatalogOpen(true)}>
                  <ClipboardList /> من الكتالوج الجاهز
                </Button>
                <Button disabled={!store} onClick={() => setProductEdit("new")}>
                  <Plus /> إضافة منتج
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
                    <span className={`text-xs ${p.is_available ? "text-success" : "text-muted-foreground"}`}>{p.is_available ? "متاح" : "غير متاح"}</span>
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
              !products.length && <Empty text="لا توجد منتجات" />
            )}
          </TabsContent>
        )}

        <TabsContent value="orders">
          <h2 className="mb-4 text-lg">الطلبات والحجوزات والخدمات ({visibleTasks.length})</h2>
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
                <div className="flex items-center gap-3">
                  <StatusBadge status={t.status} />
                  <span className="text-sm font-semibold">{money(t.amount)}</span>
                  <Button variant="outline" size="sm" onClick={() => setDetail(t)}>
                    التفاصيل <ArrowLeft />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          {!visibleTasks.length && <Empty text="لا توجد طلبات مطابقة" />}
        </TabsContent>

        <TabsContent value="earnings">
          <h2 className="mb-2 text-lg">كشف الأرباح والعمولات</h2>
          <p className="mb-6 text-sm text-muted-foreground">طلبات مكتملة فقط • مبالغ محاسبية، وليست تحويلات مالية</p>
          <div className="mb-6 grid grid-cols-2 gap-5 border-y py-5 md:grid-cols-4">
            {[
              ["عدد العمليات", totals.count],
              ["إجمالي القيمة", money(totals.gross)],
              ["عمولة المنصة", money(totals.commission)],
              ["مستحقات المتاجر", money(totals.net)],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="mb-2 text-xs text-muted-foreground">{label}</p>
                <strong className="text-lg">{value}</strong>
              </div>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-right text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  {["الطلب", "المتجر", "القيمة", "العمولة", "الصافي"].map(h => (
                    <th className="p-3 font-medium" key={h}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tasks
                  .filter(t => earnings([t]).count > 0)
                  .map(t => (
                    <tr className="border-b" key={t.id}>
                      <td className="p-3 font-mono">{t.id.slice(0, 8)}</td>
                      <td className="p-3">{storeName(t.store_id)}</td>
                      <td className="p-3">{money(t.amount)}</td>
                      <td className="p-3 text-primary">{money(t.commission)}</td>
                      <td className="p-3">{money(t.amount - t.commission)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          {!totals.count && <Empty text="لم تكتمل أي عمليات بعد" />}
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
              <p className="text-sm">العنوان: {currentDetail.address || "داخل العيادة"}</p>
              <p className="text-sm">
                الهاتف:{" "}
                <a dir="ltr" href={`tel:${currentDetail.phone}`} className="text-primary">
                  {currentDetail.phone}
                </a>
              </p>
              {currentDetail.notes && <p className="text-sm">ملاحظات: {currentDetail.notes}</p>}
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
