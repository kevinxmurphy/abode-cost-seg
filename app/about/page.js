import NavBar from "@/components/ui/NavBar";
import Footer from "@/components/ui/Footer";
import AboutContent from "@/components/marketing/AboutContent";
import Script from "next/script";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "About Abode — AI Cost Segregation for STR Investors",
  description: "Cost segregation was kept from you on purpose. We built Abode to democratize access to one of the most powerful tax strategies in the code — for every short-term rental investor, not just the ones with expensive attorneys.",
  path: "/about",
});

const aboutSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Abode Cost Segregation",
  url: "https://www.abodecostseg.com",
  logo: "https://www.abodecostseg.com/logo.png",
  description:
    "Abode provides AI-powered cost segregation studies for short-term rental investors. IRS-compliant, CPA-reviewed, delivered in minutes — at a fraction of the cost of traditional engineering firms.",
  foundingDate: "2024",
  areaServed: { "@type": "Country", name: "US" },
  knowsAbout: [
    "Cost Segregation",
    "Bonus Depreciation",
    "Short-Term Rental Tax Strategy",
    "IRS Depreciation Rules",
    "MACRS Asset Classification",
    "Airbnb Tax Deductions",
    "VRBO Tax Deductions",
    "Real Estate Tax Planning",
    "Form 3115 Catch-Up Depreciation",
  ],
  sameAs: [
    "https://www.linkedin.com/company/abode-cost-segregation",
    "https://twitter.com/abodecostseg",
  ],
};

export default function AboutPage() {
  return (
    <>
      <Script
        id="about-org-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
      />
      <NavBar />
      <main>
        <AboutContent />
      </main>
      <Footer />
    </>
  );
}
