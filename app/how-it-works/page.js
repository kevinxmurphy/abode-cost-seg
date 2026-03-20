import NavBar from "@/components/ui/NavBar";
import Footer from "@/components/ui/Footer";
import HowItWorksContent from "@/components/marketing/HowItWorksContent";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "How It Works — Abode Cost Segregation",
  description: "Learn how Abode generates IRS-compliant cost segregation studies using AI in days, not weeks.",
  path: "/how-it-works",
});

export default function HowItWorksPage() {
  return (
    <>
      <NavBar />
      <main>
        <HowItWorksContent />
      </main>
      <Footer />
    </>
  );
}
