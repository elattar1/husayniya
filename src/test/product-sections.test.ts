import { describe, expect, it } from "vitest";
import { groupProductsBySection, suggestedSectionsFor } from "@/lib/product-sections";
import { productInput, sectionInput } from "@/lib/dashboard-rules";

describe("store product sections", () => {
  it("groups products under their store section and puts unassigned products last", () => {
    const sections = [
      { id: "drinks", store_id: "store", name: "المشروبات", sort_order: 20 },
      { id: "meals", store_id: "store", name: "الوجبات", sort_order: 10 },
      { id: "empty", store_id: "store", name: "الحلويات", sort_order: 30 },
    ];
    const products = [
      { id: "tea", section_id: "drinks" },
      { id: "rice", section_id: "meals" },
      { id: "other", section_id: null },
    ];

    expect(groupProductsBySection(products, sections)).toEqual([
      { id: "meals", name: "الوجبات", products: [products[1]] },
      { id: "drinks", name: "المشروبات", products: [products[0]] },
      { id: "other", name: "منتجات أخرى", products: [products[2]] },
    ]);
  });

  it("offers different suggested sections for supermarkets and restaurants", () => {
    expect(suggestedSectionsFor("supermarkets")).toContain("المنظفات والمناديل");
    expect(suggestedSectionsFor("restaurants")).toContain("الساندوتشات");
    expect(suggestedSectionsFor("pharmacies")).toEqual([]);
  });

  it("accepts a blank product section as unassigned and validates section names", () => {
    const base = {
      store_id: "11111111-1111-4111-8111-111111111111",
      name: "شاي",
      description: "",
      price: 10,
      is_available: true,
      image_url: "",
      stock_qty: null,
    };
    expect(productInput.parse({ ...base, section_id: "" }).section_id).toBeNull();
    expect(sectionInput.safeParse({ ...base, name: "أ" }).success).toBe(false);
    expect(sectionInput.parse({ store_id: base.store_id, name: "المشروبات", sort_order: 20 }).name).toBe("المشروبات");
  });
});
