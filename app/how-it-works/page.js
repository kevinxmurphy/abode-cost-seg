import NavBar from "@/components/ui/NavBar";
import Footer from "@/components/ui/Footer";
import HowItWorksContent from "@/components/marketing/HowItWorksContent";

export const metadata = {
  title: "How It Works — Abode Cost Segregation",
  description:
    "Learn how Abode generates IRS-compliant cost segregation studies using AI in days, not weeks.",
};

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
