export function pageMeta(title: string, description: string) {
  return { meta: [
    { title: `${title} | خدمات الحسينية` },
    { name: "description", content: description },
    { property: "og:title", content: `${title} | خدمات الحسينية` },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] };
}