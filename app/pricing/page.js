import NavBar from "@/components/ui/NavBar";
import Footer from "@/components/ui/Footer";
import PricingPageContent from "@/components/marketing/PricingPageContent";
import { STUDY_PRICE_DISPLAY } from "@/lib/pricing";

export const metadata = {
  title: `Cost Segregation Study Pricing — ${STUDY_PRICE_DISPLAY} Flat | Abode`,
  description: `Abode cost segregation studies start at ${STUDY_PRICE_DISPLAY} — a fraction of the $5,000–$15,000 engineering firms charge. Same IRS methodology. Minutes, not weeks. 90-day guarantee.`,
};

export default function PricingPage() {
  return (
    <>
      <NavBar />
      <main>
        <PricingPageContent />
      </main>
      <Footer />
    </>
  );
}
