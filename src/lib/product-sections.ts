export const STORE_SECTION_SUGGESTIONS = {
  supermarkets: [
    "الألبان والبيض والأجبان",
    "الزيوت والأرز والمكرونة والبقوليات",
    "المعلبات والصلصات والتوابل",
    "المشروبات والشاي والقهوة",
    "المنظفات والمناديل",
    "الشيبسي والبسكويت والشوكولاتة",
  ],
  restaurants: ["الوجبات الرئيسية", "المشويات", "الساندوتشات", "المشروبات", "الحلويات"],
} as const;

export type StoreSection = {
  id: string;
  store_id: string;
  name: string;
  sort_order: number;
};

export type SectionedProduct = {
  id: string;
  section_id: string | null;
};

export function suggestedSectionsFor(category: string): string[] {
  const suggestions = STORE_SECTION_SUGGESTIONS[category as keyof typeof STORE_SECTION_SUGGESTIONS];
  return suggestions ? [...suggestions] : [];
}

export function groupProductsBySection<T extends SectionedProduct>(
  products: T[],
  sections: StoreSection[],
) {
  const orderedSections = [...sections].sort(
    (a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name, "ar"),
  );
  const groups = orderedSections
    .map(section => ({
      id: section.id,
      name: section.name,
      products: products.filter(product => product.section_id === section.id),
    }))
    .filter(group => group.products.length > 0);
  const sectionIds = new Set(orderedSections.map(section => section.id));
  const unsectioned = products.filter(
    product => !product.section_id || !sectionIds.has(product.section_id),
  );
  if (unsectioned.length) {
    groups.push({ id: "other", name: groups.length ? "منتجات أخرى" : "كل المنتجات", products: unsectioned });
  }
  return groups;
}
