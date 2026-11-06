import { useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Layers3, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addSuggestedSections, saveSection } from "@/lib/dashboard.functions";
import { suggestedSectionsFor, type StoreSection } from "@/lib/product-sections";

export function StoreSections({
  storeId,
  category,
  sections,
  productCounts,
}: {
  storeId: string;
  category: string;
  sections: StoreSection[];
  productCounts: Map<string, number>;
}) {
  const [busy, setBusy] = useState(false);
  const client = useQueryClient();
  const createSection = useServerFn(saveSection);
  const createSuggestions = useServerFn(addSuggestedSections);
  const suggestions = suggestedSectionsFor(category);
  const missingSuggestions = suggestions.filter(name => !sections.some(section => section.name === name));

  async function refresh() {
    await Promise.all([
      client.invalidateQueries({ queryKey: ["dashboard"] }),
      client.invalidateQueries({ queryKey: ["store-details"] }),
    ]);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const name = String(new FormData(form).get("name") ?? "").trim();
    setBusy(true);
    try {
      await createSection({ data: { store_id: storeId, name, sort_order: (sections.length + 1) * 10 } });
      await refresh();
      form.reset();
      toast.success("تمت إضافة القسم");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر إضافة القسم");
    } finally {
      setBusy(false);
    }
  }

  async function addSuggestions() {
    setBusy(true);
    try {
      await createSuggestions({ data: { store_id: storeId } });
      await refresh();
      toast.success("تمت إضافة الأقسام المقترحة");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر إضافة الأقسام");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mb-6 rounded-lg border bg-card p-4" aria-labelledby="store-sections-title">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 id="store-sections-title" className="flex items-center gap-2 font-sans font-semibold">
            <Layers3 className="size-5 text-primary" /> تقسيمات المتجر
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">نظّم المنتجات في أقسام تظهر للعميل داخل صفحة المتجر.</p>
        </div>
        {missingSuggestions.length > 0 && (
          <Button type="button" variant="outline" size="sm" disabled={busy} onClick={addSuggestions}>
            <Sparkles /> إضافة الأقسام المقترحة ({missingSuggestions.length})
          </Button>
        )}
      </div>
      <form onSubmit={submit} className="mb-4 flex flex-col gap-2 sm:flex-row">
        <Input
          name="name"
          aria-label="اسم القسم الجديد"
          placeholder={category === "restaurants" ? "مثال: ساندوتشات أو وجبات" : "مثال: خضروات أو مستلزمات البيت"}
          required
          minLength={2}
          maxLength={80}
          disabled={busy}
        />
        <Button type="submit" variant="secondary" disabled={busy} className="shrink-0">
          <Plus /> إضافة قسم
        </Button>
      </form>
      {sections.length ? (
        <div className="flex flex-wrap gap-2">
          {sections.map(section => (
            <span key={section.id} className="rounded-full border bg-background px-3 py-1.5 text-sm">
              {section.name} <span className="text-muted-foreground">({productCounts.get(section.id) ?? 0})</span>
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">لا توجد أقسام بعد. أضف قسمًا ثم اختره عند إضافة أو تعديل المنتج.</p>
      )}
    </section>
  );
}
