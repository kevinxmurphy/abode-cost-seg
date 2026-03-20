import NavBar from "@/components/ui/NavBar";
import Footer from "@/components/ui/Footer";
import BonusDepreciationContent from "@/components/marketing/BonusDepreciationContent";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "100% Bonus Depreciation for STR Investors — 2025 OBBBA Guide | Abode",
  description: "The One Big Beautiful Bill Act permanently reinstated 100% bonus depreciation for property acquired after January 19, 2025. Here's what it means for your Airbnb and how cost segregation makes it explosive.",
  path: "/bonus-depreciation",
});

export default function BonusDepreciationPage() {
  return (
    <>
      <NavBar />
      <main>
        <BonusDepreciationContent />
      </main>
      <Footer />
    </>
  );
}
