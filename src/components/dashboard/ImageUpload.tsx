import { useState } from "react";
import { toast } from "sonner";
import { ImagePlus, LoaderCircle, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

// Uploads to the private store-media bucket under the owner's folder and returns a long-lived signed URL.
export async function uploadStoreImage(file: File) {
  if (!file.type.startsWith("image/")) throw new Error("الملف يجب أن يكون صورة");
  if (file.size > 5 * 1024 * 1024) throw new Error("أقصى حجم للصورة 5 ميجا");
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) throw new Error("سجّل الدخول أولاً");
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${u.user.id}/${crypto.randomUUID()}.${ext}`;
  const up = await supabase.storage.from("store-media").upload(path, file, { contentType: file.type });
  if (up.error) throw new Error("تعذر رفع الصورة");
  const signed = await supabase.storage.from("store-media").createSignedUrl(path, TEN_YEARS);
  if (signed.error || !signed.data) throw new Error("تعذر تجهيز رابط الصورة");
  return signed.data.signedUrl;
}

export function ImageUploadField({ label, name, value, wide = false }: { label: string; name: string; value?: string | null | undefined; wide?: boolean }) {
  const [url, setUrl] = useState(value ?? "");
  const [busy, setBusy] = useState(false);
  async function pick(file?: File) {
    if (!file) return;
    setBusy(true);
    try { setUrl(await uploadStoreImage(file)); } catch (e) { toast.error(e instanceof Error ? e.message : "تعذر رفع الصورة"); }
    finally { setBusy(false); }
  }
  return <div className="space-y-2">
    <span className="text-sm font-medium">{label}</span>
    <input type="hidden" name={name} value={url} />
    <div className="flex items-center gap-3">
      <div className={`grid shrink-0 place-items-center overflow-hidden rounded-lg border bg-muted ${wide ? "h-20 w-36" : "size-20"}`}>
        {busy ? <LoaderCircle className="animate-spin text-muted-foreground" /> : url ? <img src={url} alt={label} className="size-full object-cover" /> : <ImagePlus className="text-muted-foreground" />}
      </div>
      <div className="flex flex-col gap-2">
        <label className="cursor-pointer rounded-md border px-3 py-1.5 text-sm hover:bg-muted">{url ? "تغيير الصورة" : "رفع صورة"}<input type="file" accept="image/*" className="hidden" disabled={busy} onChange={e => { void pick(e.target.files?.[0]); e.target.value = ""; }} /></label>
        {url && <Button type="button" variant="ghost" size="sm" onClick={() => setUrl("")}><X /> إزالة</Button>}
      </div>
    </div>
  </div>;
}
