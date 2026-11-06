import { Package, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { money } from "@/lib/labels";
import { groupProductsBySection, type StoreSection } from "@/lib/product-sections";
import type { DashboardProduct } from "./queries";

export function DashboardProductList({
  products,
  sections,
  onEdit,
  onRemove,
}: {
  products: DashboardProduct[];
  sections: StoreSection[];
  onEdit: (product: DashboardProduct) => void;
  onRemove: (product: DashboardProduct) => void;
}) {
  const groups = groupProductsBySection(products, sections);
  return (
    <div className="space-y-7">
      {groups.map(group => (
        <section key={group.id}>
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary">
            {group.name} <span className="font-normal text-muted-foreground">({group.products.length})</span>
          </h3>
          <div className="divide-y border-y">
            {group.products.map(product => (
              <div className="flex flex-wrap items-center justify-between gap-3 py-4" key={product.id}>
                <div className="flex min-w-0 items-center gap-3">
                  {product.image_url ? (
                    <img src={product.image_url} alt="" loading="lazy" className="size-12 rounded object-cover" />
                  ) : (
                    <div className="grid size-12 place-items-center rounded bg-muted">
                      <Package className="size-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h4 className="break-words font-sans font-semibold">{product.name}</h4>
                    <p className="mt-1 text-xs text-muted-foreground">{product.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold">{money(product.price)}</span>
                  <span className={`text-xs ${product.is_available ? "text-success" : "text-muted-foreground"}`}>
                    {product.is_available ? "متاح" : "غير متاح"}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="تعديل المنتج"
                    aria-label={`تعديل ${product.name}`}
                    onClick={() => onEdit(product)}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    title="حذف المنتج"
                    aria-label={`حذف ${product.name}`}
                    onClick={() => onRemove(product)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
