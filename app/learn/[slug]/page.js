import NavBar from "@/components/ui/NavBar";
import Footer from "@/components/ui/Footer";
import BlogArticleContent from "@/components/blog/BlogArticleContent";
import { getArticleBySlug, getAllSlugs } from "@/lib/blogData";
import { notFound } from "next/navigation";
import Script from "next/script";

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return {};

  return {
    title: `${article.title} | Abode`,
    description: article.description,
    openGraph: {
      title: article.seo.ogTitle,
      description: article.seo.ogDescription,
      url: article.seo.canonical,
      type: "article",
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt || article.publishedAt,
      authors: [article.author.name],
    },
    alternates: {
      canonical: article.seo.canonical,
    },
  };
}

export default async function ArticlePage({ params }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  // Auto-generate FAQPage schema from faq content blocks if not already present
  const faqBlocks = (article.content || []).filter((b) => b.type === "faq");
  const sd = article.seo.structuredData;
  const sdArray = Array.isArray(sd) ? sd : sd?.["@graph"] ? sd["@graph"] : sd ? [sd] : [];
  const hasFaqSchema = sdArray.some((s) => s["@type"] === "FAQPage");
  const hasArticleSchema = sdArray.some((s) => s["@type"] === "Article" || s["@type"] === "BlogPosting");
  const hasBreadcrumbSchema = sdArray.some((s) => s["@type"] === "BreadcrumbList");
  const faqSchema =
    faqBlocks.length > 0 && !hasFaqSchema
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqBlocks.map((b) => ({
            "@type": "Question",
            name: b.question,
            acceptedAnswer: { "@type": "Answer", text: b.answer },
          })),
        }
      : null;

  // Auto-inject Article schema when absent (e.g. newer articles that only have FAQPage)
  const articleSchema = !hasArticleSchema
    ? {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: article.title,
        description: article.description,
        author: {
          "@type": "Organization",
          name: "Abode Cost Segregation",
          url: "https://www.abodecostseg.com",
        },
        publisher: {
          "@type": "Organization",
          name: "Abode Cost Segregation",
          url: "https://www.abodecostseg.com",
          logo: {
            "@type": "ImageObject",
            url: "https://www.abodecostseg.com/logo.png",
          },
        },
        datePublished: article.publishedAt,
        dateModified: article.updatedAt || article.publishedAt,
        mainEntityOfPage: article.seo.canonical,
      }
    : null;

  const breadcrumbSchema = !hasBreadcrumbSchema ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://www.abodecostseg.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Learn",
        item: "https://www.abodecostseg.com/learn",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: article.title,
        item: article.seo.canonical,
      },
    ],
  } : null;

  return (
    <>
      <NavBar />
      <main>
        <article>
          <BlogArticleContent slug={slug} />
        </article>
      </main>
      <Footer />
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(article.seo.structuredData),
        }}
      />
      {breadcrumbSchema && (
        <Script
          id="breadcrumb-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}
      {articleSchema && (
        <Script
          id="article-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        />
      )}
      {faqSchema && (
        <Script
          id="faq-structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
    </>
  );
}
