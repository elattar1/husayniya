import { useEffect, useState } from 'react';
import { MapPin, Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type Saved = { id: string; label: string; phone: string; address: string; area_id: number | null; is_default: boolean };
type Area = { id: number; name: string };

/** Renders form inputs named area / address / phone (+ label, save) so existing forms keep working. */
export function AddressPicker({ areas, defaultArea, showArea = true }: { areas: Area[]; defaultArea?: number | null; showArea?: boolean }) {
  const [saved, setSaved] = useState<Saved[] | null>(null);
  const [selected, setSelected] = useState<string>('new');

  async function load() {
    const { data } = await supabase.from('customer_addresses').select('id,label,phone,address,area_id,is_default').order('is_default', { ascending: false }).order('created_at', { ascending: false });
    const rows = data ?? [];
    setSaved(rows);
    setSelected(s => (s !== 'new' && rows.some(r => r.id === s)) ? s : rows[0]?.id ?? 'new');
  }
  useEffect(() => { void load(); }, []);

  async function remove(id: string) {
    await supabase.from('customer_addresses').delete().eq('id', id);
    void load();
  }

  if (saved === null) return <p className="text-sm text-muted-foreground">جاري تحميل عناوينك...</p>;
  const current = saved.find(s => s.id === selected);

  return <div className="space-y-3">
    {saved.length > 0 && <div className="space-y-2">
      <p className="text-sm">عناويني المحفوظة</p>
      {saved.map(s => <label key={s.id} className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 text-sm ${selected === s.id ? 'border-primary bg-primary/5' : ''}`}>
        <input type="radio" name="saved_address" className="mt-1" checked={selected === s.id} onChange={() => setSelected(s.id)} />
        <span className="min-w-0 flex-1"><span className="flex items-center gap-1 font-semibold"><MapPin size={14} />{s.label}</span><span className="block break-words text-muted-foreground">{s.address}{s.area_id ? ` • ${areas.find(a => a.id === s.area_id)?.name ?? ''}` : ''}</span><span dir="ltr" className="block text-right text-muted-foreground">{s.phone}</span></span>
        <Button type="button" size="icon" variant="ghost" aria-label={`حذف ${s.label}`} onClick={e => { e.preventDefault(); void remove(s.id); }}><Trash2 /></Button>
      </label>)}
      <label className={`flex cursor-pointer items-center gap-3 rounded-md border p-3 text-sm ${selected === 'new' ? 'border-primary bg-primary/5' : ''}`}>
        <input type="radio" name="saved_address" checked={selected === 'new'} onChange={() => setSelected('new')} /><Plus size={15} />إضافة عنوان ورقم جديد
      </label>
    </div>}
    {current ? <>
      <input type="hidden" name="address" value={current.address} />
      <input type="hidden" name="phone" value={current.phone} />
      {showArea && <input type="hidden" name="area" value={current.area_id ?? defaultArea ?? ''} />}
    </> : <div className="space-y-3">
      {showArea && <label className="block space-y-2 text-sm">المنطقة<select name="area" required className="h-10 w-full rounded-md border bg-card px-3" defaultValue={defaultArea ?? ''}><option value="">اختر المنطقة</option>{areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select></label>}
      <label className="block space-y-2 text-sm">العنوان بالتفصيل<Input name="address" required minLength={3} placeholder="الشارع، رقم المنزل، علامة مميزة" /></label>
      <label className="block space-y-2 text-sm">رقم الهاتف<Input name="phone" type="tel" required minLength={6} /></label>
      <label className="block space-y-2 text-sm">اسم العنوان<Input name="address_label" placeholder="المنزل، الشغل..." defaultValue={saved.length ? '' : 'المنزل'} /></label>
      <p className="text-xs text-muted-foreground">هيتحفظ العنوان والرقم عشان تختارهم المرة الجاية.</p>
    </div>}
  </div>;
}

/** Save the address used in a submitted form (no-op if it already exists). */
export async function rememberAddress(form: FormData) {
  if (!form.has('address_label')) return;
  const address = String(form.get('address') ?? '').trim();
  const phone = String(form.get('phone') ?? '').trim();
  if (address.length < 3 || phone.length < 6) return;
  const areaId = Number(form.get('area')) || null;
  const label = String(form.get('address_label') ?? '').trim() || 'عنوان';
  const { count } = await supabase.from('customer_addresses').select('id', { count: 'exact', head: true });
  await supabase.from('customer_addresses').upsert({ address, phone, area_id: areaId, label, is_default: !count }, { onConflict: 'user_id,phone,address', ignoreDuplicates: true });
}
