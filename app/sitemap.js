import { articles } from "@/lib/blogData";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.abodecostseg.com";

export default function sitemap() {
  const now = new Date().toISOString();

  // Core pages
  const corePages = [
    { url: `${BASE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/quiz`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/how-it-works`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/learn`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/disclaimers`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  // All blog articles — dynamically generated from article data
  const articlePages = articles.map((article) => {
    // Pillar articles get highest priority
    const isPillar = article.isPillar;
    // State/city/glossary guides get medium priority
    const isGuide =
      article.slug.startsWith("str-taxes-") ||
      article.slug.startsWith("str-investing-") ||
      article.slug.startsWith("what-is-");

    const priority = isPillar ? 0.85 : isGuide ? 0.7 : 0.75;

    return {
      url: `${BASE_URL}/learn/${article.slug}`,
      lastModified: article.updatedAt
        ? new Date(article.updatedAt).toISOString()
        : new Date(article.publishedAt).toISOString(),
      changeFrequency: isPillar ? "monthly" : "yearly",
      priority,
    };
  });

  return [...corePages, ...articlePages];
}
