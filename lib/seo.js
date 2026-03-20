// ═══════════════════════════════════════════════════════
// ABODE — SEO Metadata Helper
// Generates consistent OG + Twitter card tags from page title/description.
// ═══════════════════════════════════════════════════════

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.abodecostseg.com";

/**
 * Build a complete metadata object with OG + Twitter card tags.
 * Use this on every page to ensure social shares show the correct title/description.
 *
 * @param {{ title: string, description: string, path?: string, noIndex?: boolean }} opts
 * @returns {import("next").Metadata}
 */
export function buildMetadata({ title, description, path = "", noIndex = false }) {
  const url = `${APP_URL}${path}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: "Abode Cost Segregation",
      locale: "en_US",
      type: "website",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: "Abode Cost Segregation — AI-powered cost seg studies for STR investors",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.png"],
    },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
    alternates: {
      canonical: url,
    },
  };
}
