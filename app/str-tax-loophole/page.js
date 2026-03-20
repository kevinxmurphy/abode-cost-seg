import NavBar from "@/components/ui/NavBar";
import Footer from "@/components/ui/Footer";
import STRLoopholeContent from "@/components/marketing/STRLoopholeContent";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "The Short-Term Rental Tax Loophole — Complete 2025–2026 Guide | Abode",
  description: "The STR tax loophole lets Airbnb and VRBO owners use rental losses against W-2 income. Combined with cost segregation and 100% bonus depreciation, it's the most powerful tax strategy available to STR investors.",
  path: "/str-tax-loophole",
});

export default function STRLoopholePage() {
  return (
    <>
      <NavBar />
      <main>
        <STRLoopholeContent />
      </main>
      <Footer />
    </>
  );
}
