import Script from "next/script";
import "./globals.css";
import CookieConsent from "@/components/ui/CookieConsent";
import AbbyWidget from "@/components/ui/AbbyWidget";

export const metadata = {
  title: "Cost Segregation Study for Airbnb & Short-Term Rentals | Abode",
  description:
    "Get an IRS-compliant cost segregation study for your Airbnb or short-term rental in minutes. STR owners typically identify $30K–$150K in first-year depreciation deductions. AI-powered, CPA-ready.",
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
        {children}
        <CookieConsent />
        <AbbyWidget />
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
