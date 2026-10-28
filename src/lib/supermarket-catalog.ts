// Reference supermarket catalog. Prices are suggestions only; each store sets its own.
export type CatalogGroup = { key: string; name: string; image: string };
export type CatalogItem = { key: string; group: string; name: string; size: string; price: number };

export const CATALOG_GROUPS: CatalogGroup[] = [
  { key: "dairy", name: "الألبان والبيض والأجبان", image: "/catalog/dairy.jpg" },
  { key: "pantry", name: "الزيوت والأرز والمكرونة والبقوليات", image: "/catalog/pantry.jpg" },
  { key: "canned", name: "المعلبات والصلصات والتوابل", image: "/catalog/canned.jpg" },
  { key: "drinks", name: "المشروبات والشاي والقهوة", image: "/catalog/drinks.jpg" },
  { key: "cleaning", name: "المنظفات والمناديل", image: "/catalog/cleaning.jpg" },
  { key: "snacks", name: "الشيبسي والبسكويت والشوكولاتة", image: "/catalog/snacks.jpg" },
];

const raw: [string, string, string, number][] = [
  ["dairy", "لبن كامل الدسم", "1 لتر", 45], ["dairy", "لبن خالي الدسم", "1 لتر", 45], ["dairy", "زبادي", "105 جم", 9],
  ["dairy", "جبنة بيضاء فيتا", "500 جم", 55], ["dairy", "جبنة رومي", "250 جم", 90], ["dairy", "جبنة مثلثات", "8 قطع", 40],
  ["dairy", "بيض أحمر", "طبق 30 بيضة", 165], ["dairy", "زبدة", "200 جم", 75], ["dairy", "قشطة", "200 جم", 30],
  ["pantry", "زيت عباد الشمس", "1 لتر", 85], ["pantry", "زيت خليط للقلي", "1.5 لتر", 110], ["pantry", "سمن نباتي", "1 كجم", 120],
  ["pantry", "أرز مصري", "1 كجم", 35], ["pantry", "مكرونة قلم", "400 جم", 15], ["pantry", "مكرونة اسباجتي", "400 جم", 15],
  ["pantry", "عدس أصفر", "1 كجم", 60], ["pantry", "فول مدمس معلب", "400 جم", 18], ["pantry", "سكر", "1 كجم", 35], ["pantry", "دقيق", "1 كجم", 30],
  ["canned", "صلصة طماطم", "350 جم", 20], ["canned", "تونة قطع", "185 جم", 60], ["canned", "مايونيز", "250 مل", 45],
  ["canned", "مرقة دجاج", "8 مكعبات", 20], ["canned", "كمون مطحون", "50 جم", 15], ["canned", "فلفل أسود", "50 جم", 20], ["canned", "ملح طعام", "700 جم", 8],
  ["drinks", "شاي أسود ناعم", "250 جم", 65], ["drinks", "شاي أكياس", "100 كيس", 90], ["drinks", "قهوة سريعة التحضير", "100 جم", 120],
  ["drinks", "بن محوج", "250 جم", 140], ["drinks", "عصير برتقال", "1 لتر", 40], ["drinks", "مياه معدنية", "1.5 لتر", 8], ["drinks", "مياه غازية", "1 لتر", 25],
  ["cleaning", "مسحوق غسيل أوتوماتيك", "2.5 كجم", 210], ["cleaning", "منظف أطباق", "1 لتر", 45], ["cleaning", "كلور", "1 لتر", 20],
  ["cleaning", "منظف أرضيات", "1 لتر", 40], ["cleaning", "مناديل وجه", "علبة 500", 35], ["cleaning", "مناديل مطبخ", "2 لفة", 40],
  ["snacks", "شيبسي", "كيس عائلي", 15], ["snacks", "بسكويت محشو", "علبة 12", 30], ["snacks", "شوكولاتة باللبن", "100 جم", 45],
  ["snacks", "ويفر", "قطعة", 5], ["snacks", "كيك", "قطعة", 7], ["snacks", "فول سوداني محمص", "100 جم", 20],
];

export const CATALOG_ITEMS: CatalogItem[] = raw.map(([group, name, size, price], i) => ({ key: `${group}-${i + 1}`, group, name, size, price }));
export const catalogItem = (key: string) => CATALOG_ITEMS.find(i => i.key === key);
export const catalogImage = (group: string) => CATALOG_GROUPS.find(g => g.key === group)?.image ?? null;
