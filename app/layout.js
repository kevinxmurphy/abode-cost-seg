import Script from "next/script";
import "./globals.css";
import CookieConsent from "@/components/ui/CookieConsent";
import AbbyWidget from "@/components/ui/AbbyWidget";
import PostHogProvider from "@/components/providers/PostHogProvider";

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

export const metadata = {
  title: "Cost Segregation Study for Airbnb & Short-Term Rentals | Abode",
  description:
    "Get an IRS-compliant cost segregation study for your Airbnb or short-term rental in minutes. STR owners typically identify $30K–$150K in first-year depreciation deductions. AI-powered, CPA-ready.",
  metadataBase: new URL("https://www.abodecostseg.com"),
  openGraph: {
    title: "Cost Segregation Study for Airbnb & Short-Term Rentals | Abode",
    description:
      "Get an IRS-compliant cost segregation study for your Airbnb or short-term rental in minutes. STR owners typically identify $30K–$150K in first-year depreciation deductions.",
    url: "https://www.abodecostseg.com",
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
    title: "Cost Segregation Study for Airbnb & STRs | Abode",
    description:
      "AI-powered, IRS-compliant cost segregation studies delivered in minutes. Typically $30K–$150K in first-year deductions.",
    images: ["/og-image.png"],
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Abode Cost Segregation",
  url: "https://www.abodecostseg.com",
  logo: "https://www.abodecostseg.com/logo.png",
  description:
    "AI-powered cost segregation studies for short-term rental investors. IRS-compliant, CPA-reviewed, delivered in minutes.",
  sameAs: [
    "https://www.linkedin.com/company/abode-cost-segregation",
    "https://twitter.com/abodecostseg",
  ],
  areaServed: { "@type": "Country", name: "US" },
  knowsAbout: [
    "Cost Segregation",
    "Bonus Depreciation",
    "Short-Term Rental Tax Strategy",
    "IRS Depreciation",
    "Real Estate Tax",
    "Airbnb Tax Deductions",
    "VRBO Tax Deductions",
  ],
};

const webSiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Abode Cost Segregation",
  url: "https://www.abodecostseg.com",
  publisher: { "@type": "Organization", name: "Abode Cost Segregation" },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://www.abodecostseg.com/learn?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* Google Tag Manager — noscript iframe */}
        {GTM_ID && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}

        <PostHogProvider>
          {children}
        </PostHogProvider>
        <CookieConsent />
        <AbbyWidget />
        {/* Google Tag Manager — head script */}
        {GTM_ID && (
          <Script
            id="gtm-script"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${GTM_ID}');`,
            }}
          />
        )}
        {/* Google Identity Services — async load, used for sign-in on results page */}
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="lazyOnload"
        />
        <Script
          id="org-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <Script
          id="website-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
        />
      </body>
    </html>
  );
}
