import NavBar from "@/components/ui/NavBar";
import Footer from "@/components/ui/Footer";
import GlossaryContent from "@/components/marketing/GlossaryContent";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "STR Tax Glossary — Cost Seg, Bonus Depreciation & More | Abode",
  description: "Plain-English definitions of every term STR investors encounter when researching cost segregation, bonus depreciation, the STR loophole, material participation, and more.",
  path: "/glossary",
});

export default function GlossaryPage() {
  return (
    <>
      <NavBar />
      <main>
        <GlossaryContent />
      </main>
      <Footer />
    </>
  );
}
