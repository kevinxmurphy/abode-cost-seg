import Script from "next/script";
import NavBar from "@/components/ui/NavBar";
import Footer from "@/components/ui/Footer";
import HeroSection from "@/components/marketing/HeroSection";
import SocialProof from "@/components/marketing/SocialProof";
import TestimonialsSection from "@/components/marketing/TestimonialsSection";
import HowItWorksSection from "@/components/marketing/HowItWorksSection";
import PropertyTypesSection from "@/components/marketing/PropertyTypesSection";
import WhoItsForSection from "@/components/marketing/WhoItsForSection";
import ComparisonSection from "@/components/marketing/ComparisonSection";
import CPAGuideSection from "@/components/marketing/CPAGuideSection";
import PricingSection from "@/components/marketing/PricingSection";
import FAQSection from "@/components/marketing/FAQSection";
import QuizCTABanner from "@/components/marketing/QuizCTABanner";

function SectionDivider({ from, to }) {
  return (
    <div
      style={{
        height: "48px",
        background: from,
        position: "relative",
        overflow: "hidden",
        marginTop: "-1px",
      }}
    >
      <svg
        viewBox="0 0 1440 48"
        fill="none"
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          height: "100%",
        }}
      >
        <path
          d="M0 48h1440V16C1200 40 960 0 720 8S240 48 0 24v24z"
          fill={to}
        />
      </svg>
    </div>
  );
}

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Claim Cost Segregation Savings on Your Short-Term Rental",
  description:
    "Three steps to get an IRS-compliant cost segregation study for your STR and claim the tax savings institutional investors have used for decades.",
  totalTime: "PT3M",
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Tell us about your property",
      text: "Answer a few questions about your STR — purchase price, year built, renovations, amenities. Takes under 3 minutes. No engineering firm. No site visit.",
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "We find what the IRS owes you",
      text: "Abode's AI runs your property against IRS cost segregation methodology and produces a full asset classification report — PDF and Excel delivered in minutes, not weeks.",
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Hand it to your CPA. Keep the savings.",
      text: "Download your IRS-compliant study and fixed asset schedule. Your CPA files it exactly as they would from any engineering firm. Most clients identify more than they paid for the study in the first hour of review.",
    },
  ],
};

const homeFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is a cost segregation study?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A cost segregation study identifies and reclassifies personal property components from real property to shorter depreciation timelines. Instead of depreciating your entire property over 27.5 years, components like appliances, fixtures, landscaping, and specialty systems are depreciated over 5, 7, or 15 years — dramatically front-loading your deductions into the early years of ownership.",
      },
    },
    {
      "@type": "Question",
      name: "Can I do cost segregation on my Airbnb or VRBO property?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Cost segregation works for any income-producing property including Airbnb and VRBO short-term rentals. In fact, STR properties are among the best candidates because they contain more personal property (furniture, appliances, decor) and can qualify for non-passive treatment under the 7-day rule.",
      },
    },
    {
      "@type": "Question",
      name: "Is cost segregation only for commercial properties?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No — and this is the most common misconception. Cost segregation works for any income-producing real property, including short-term rentals. The reason most STR owners have never heard of it is that traditional engineering firm studies ($5K–$15K) made the math work only for large commercial properties. Abode's AI platform changes the economics for residential STR investors.",
      },
    },
    {
      "@type": "Question",
      name: "What is bonus depreciation and how does it apply to my rental property?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Bonus depreciation allows you to deduct a large percentage of qualifying asset costs in the first year. For 2025, the One Big Beautiful Bill Act (OBBBA) reinstated 100% bonus depreciation for qualifying property. This means the full value of your 5, 7, and 15-year personal property and land improvements can be deducted immediately — rather than spread over years.",
      },
    },
    {
      "@type": "Question",
      name: "What if I bought my property years ago? Can I still do cost segregation?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. You can file a catch-up deduction using IRS Form 3115 (Change in Accounting Method). This lets you claim all the missed accelerated depreciation in a single tax year — no amended returns needed. A retroactive cost segregation study is one of the most powerful one-time tax strategies available to long-time STR owners.",
      },
    },
    {
      "@type": "Question",
      name: "How long does it take to get a cost segregation study from Abode?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Your study is generated in minutes after you submit your property information — powered by AI. Traditional engineering-based studies typically take 4–8 weeks. Abode delivers an equivalent IRS-methodology study in under 10 minutes.",
      },
    },
  ],
};

export default function Home() {
  return (
    <>
      <Script
        id="howto-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <Script
        id="home-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeFaqSchema) }}
      />
      <NavBar />
      <main>
        <HeroSection />
        <SectionDivider from="var(--bg)" to="var(--surface-dark)" />
        <SocialProof />
        <SectionDivider from="var(--surface-dark-2)" to="var(--surface)" />
        <TestimonialsSection />
        <SectionDivider from="var(--surface)" to="var(--warm-white)" />
        <HowItWorksSection />
        <PropertyTypesSection />
        <SectionDivider from="var(--warm-white)" to="var(--surface)" />
        <WhoItsForSection />
        <SectionDivider from="var(--surface)" to="var(--warm-white)" />
        <ComparisonSection />
        <SectionDivider from="var(--surface)" to="var(--surface)" />
        <CPAGuideSection />
        <SectionDivider from="var(--surface)" to="var(--bg)" />
        <PricingSection />
        <FAQSection />
        <QuizCTABanner />
      </main>
      <Footer />
    </>
  );
}
