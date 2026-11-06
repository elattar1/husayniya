import { Plus, Minus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import type { Catalog } from "@/lib/customer-queries";
import { money } from "@/lib/labels";
import { groupProductsBySection, type StoreSection } from "@/lib/product-sections";

type Product = {
  id: string;
  store_id: string;
  name: string;
  description: string;
  price: number;
  is_available: boolean;
  image_url: string | null;
  section_id: string | null;
};

export function StoreProducts({
  store,
  products,
  sections,
}: {
  store: Catalog["stores"][number];
  products: Product[];
  sections: StoreSection[];
}) {
  const cart = useCart();
  const groups = groupProductsBySection(products, sections);

  return (
    <div>
      <div className="mb-5 flex flex-wrap justify-between gap-3">
        <h2 className="text-xl">المنتجات</h2>
        <p className="text-sm text-muted-foreground">رسوم التوصيل: {money(store.delivery_fee)}</p>
      </div>
      {groups.length > 1 && (
        <nav aria-label="أقسام المنتجات" className="mb-7 flex gap-2 overflow-x-auto pb-2">
          {groups.map((group) => (
            <a
              key={group.id}
              href={`#product-section-${group.id}`}
              className="shrink-0 rounded-full border bg-card px-4 py-2 text-sm font-medium text-primary"
            >
              {group.name} ({group.products.length})
            </a>
          ))}
        </nav>
      )}
      <div className="space-y-9">
        {groups.map((group) => (
          <section key={group.id} id={`product-section-${group.id}`} className="scroll-mt-28">
            <div className="mb-4 flex items-center gap-3 border-b pb-3">
              <h3 className="text-lg font-semibold">{group.name}</h3>
              <span className="text-sm text-muted-foreground">{group.products.length} منتجات</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {group.products.map((product) => {
                const itemInCart = cart.items.find((i) => i.product_id === product.id);
                const qty = itemInCart?.qty ?? 0;
                return (
                  <article
                    className="flex min-w-0 items-center gap-4 rounded-xl border bg-card p-4 shadow-soft transition-all"
                    key={product.id}
                  >
                    {product.image_url && (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        loading="lazy"
                        className="size-20 shrink-0 rounded-lg object-cover"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <h4 className="break-words font-sans font-semibold text-base">{product.name}</h4>
                      <p className="my-1.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                      <p className="font-bold text-primary text-sm">{money(product.price)}</p>
                    </div>

                    {/* زر الإضافة أو عداد الكمية */}
                    <div className="shrink-0">
                      {qty === 0 ? (
                        <Button
                          size="icon"
                          className="size-9 rounded-xl shadow-sm transition-transform active:scale-95"
                          aria-label={`إضافة ${product.name} للسلة`}
                          title={`إضافة ${product.name}`}
                          disabled={!product.is_available || !store.is_open}
                          onClick={() => {
                            if (
                              cart.add(store, {
                                product_id: product.id,
                                name: product.name,
                                price: Number(product.price),
                              })
                            ) {
                              toast.success(`تمت إضافة ${product.name} للسلة`);
                            }
                          }}
                        >
                          <Plus className="size-4" />
                        </Button>
                      ) : (
                        <div className="flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/5 p-1 shadow-sm">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="size-7 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive active:scale-90 transition-transform"
                            aria-label="تقليل أو حذف"
                            title={qty === 1 ? "حذف من السلة" : "تقليل الكمية"}
                            onClick={() => {
                              cart.setQty(product.id, qty - 1);
                              if (qty === 1) {
                                toast.info(`تم حذف ${product.name} من السلة`);
                              }
                            }}
                          >
                            {qty === 1 ? <Trash2 className="size-3.5" /> : <Minus className="size-3.5" />}
                          </Button>
                          <span className="min-w-6 text-center font-bold text-sm text-primary tabular-nums">
                            {qty}
                          </span>
                          <Button
                            size="icon"
                            className="size-7 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 active:scale-90 transition-transform shadow-none"
                            aria-label="زيادة الكمية"
                            title="زيادة الكمية"
                            disabled={!product.is_available || !store.is_open}
                            onClick={() => {
                              cart.setQty(product.id, qty + 1);
                            }}
                          >
                            <Plus className="size-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>
      {!products.length && <p className="py-12 text-center text-muted-foreground">لا توجد منتجات بعد</p>}
    </div>
  );
}
