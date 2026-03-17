import NavBar from "@/components/ui/NavBar";
import Footer from "@/components/ui/Footer";
import GlossaryContent from "@/components/marketing/GlossaryContent";

export const metadata = {
  title: "STR Tax Glossary — Cost Seg, Bonus Depreciation & More | Abode",
  description:
    "Plain-English definitions of every term STR investors encounter when researching cost segregation, bonus depreciation, the STR loophole, material participation, and more.",
};

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
