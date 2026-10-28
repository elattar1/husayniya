import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CATALOG_GROUPS, CATALOG_ITEMS } from "@/lib/supermarket-catalog";
import { importCatalogProducts } from "@/lib/dashboard.functions";

type Pick = { price: string; qty: string };
type Existing = { catalog_key: string | null; price: number; stock_qty: number | null };

export function CatalogPicker({ storeId, existing, open, onOpenChange }: { storeId: string; existing: Existing[]; open: boolean; onOpenChange: (o: boolean) => void }) {
  const client = useQueryClient();
  const doImport = useServerFn(importCatalogProducts);
  const owned = useMemo(() => new Map(existing.filter(p => p.catalog_key).map(p => [p.catalog_key as string, p])), [existing]);
  const [group, setGroup] = useState(CATALOG_GROUPS[0]!.key);
  const [picks, setPicks] = useState<Record<string, Pick>>({});
  const [busy, setBusy] = useState(false);
  const selected = Object.keys(picks);

  function toggle(key: string, price: number) {
    setPicks(p => {
      const next = { ...p };
      if (next[key]) delete next[key];
      else { const o = owned.get(key); next[key] = { price: String(o?.price ?? price), qty: o?.stock_qty != null ? String(o.stock_qty) : "" }; }
      return next;
    });
  }
  async function submit() {
    const items = selected.map(key => ({ key, price: Number(picks[key]!.price), stock_qty: picks[key]!.qty === "" ? null : Number(picks[key]!.qty) }));
    if (items.some(i => !(i.price >= 0) || (i.stock_qty !== null && !(Number.isInteger(i.stock_qty) && i.stock_qty >= 0)))) return toast.error("راجع الأسعار والكميات");
    setBusy(true);
    try {
      const r = await doImport({ data: { store_id: storeId, items } });
      await client.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success(`تمت إضافة/تحديث ${r.count} منتج`);
      setPicks({}); onOpenChange(false);
    } catch (e) { toast.error(e instanceof Error ? e.message : "تعذر الحفظ"); }
    finally { setBusy(false); }
  }

  const current = CATALOG_GROUPS.find(g => g.key === group)!;
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto">
      <DialogTitle>كتالوج السوبر ماركت الجاهز</DialogTitle>
      <DialogDescription>اختر السلع المتوفرة عندك وحدد سعرك والكمية. اترك الكمية فارغة لو متوفرة باستمرار.</DialogDescription>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {CATALOG_GROUPS.map(g => { const n = CATALOG_ITEMS.filter(i => i.group === g.key && picks[i.key]).length; return (
          <button key={g.key} type="button" onClick={() => setGroup(g.key)} className={`relative overflow-hidden rounded-lg border-2 text-xs ${group === g.key ? "border-primary" : "border-transparent"}`}>
            <img src={g.image} alt={g.name} width={400} height={400} loading="lazy" className="aspect-square w-full object-cover" />
            <span className="block bg-card p-1 leading-tight">{g.name}</span>
            {n > 0 && <span className="absolute left-1 top-1 rounded-full bg-primary px-2 text-primary-foreground">{n}</span>}
          </button>); })}
      </div>
      <h3 className="mt-2 font-semibold">{current.name}</h3>
      <div className="divide-y border-y">
        {CATALOG_ITEMS.filter(i => i.group === group).map(item => { const pick = picks[item.key]; const has = owned.has(item.key); return (
          <div key={item.key} className="py-3">
            <label className="flex cursor-pointer items-center gap-3">
              <input type="checkbox" className="size-5 accent-primary" checked={!!pick} onChange={() => toggle(item.key, item.price)} />
              <img src={current.image} alt="" width={48} height={48} loading="lazy" className="size-12 rounded object-cover" />
              <div className="flex-1"><div className="font-medium">{item.name}</div><div className="text-xs text-muted-foreground">{item.size} • سعر مقترح {item.price} ج.م</div></div>
              {has && <span className="flex items-center gap-1 text-xs text-success"><Check className="size-3" /> في متجرك</span>}
            </label>
            {pick && <div className="mt-2 grid grid-cols-2 gap-2 pr-8">
              <label className="text-xs">سعر البيع (ج.م)<Input type="number" min={0} step="0.5" value={pick.price} onChange={e => setPicks(p => ({ ...p, [item.key]: { ...pick, price: e.target.value } }))} /></label>
              <label className="text-xs">الكمية المتاحة<Input type="number" min={0} step={1} placeholder="متوفر دائمًا" value={pick.qty} onChange={e => setPicks(p => ({ ...p, [item.key]: { ...pick, qty: e.target.value } }))} /></label>
            </div>}
          </div>); })}
      </div>
      <div className="sticky bottom-0 flex items-center justify-between gap-3 bg-background pt-3">
        <span className="text-sm text-muted-foreground">المحدد: {selected.length}</span>
        <Button disabled={!selected.length || busy} onClick={submit}>{busy && <LoaderCircle className="animate-spin" />} إضافة المنتجات المحددة لمتجري</Button>
      </div>
    </DialogContent>
  </Dialog>;
}
