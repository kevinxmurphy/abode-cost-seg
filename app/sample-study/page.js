import NavBar from "@/components/ui/NavBar";
import Footer from "@/components/ui/Footer";
import SampleStudyContent from "@/components/marketing/SampleStudyContent";

export const metadata = {
  title: "Sample Study — Abode Cost Segregation",
  description:
    "See what an Abode cost segregation study looks like. Full asset breakdown, bonus depreciation, and CPA-ready deliverables.",
};

export default function SampleStudyPage() {
  return (
    <>
      <NavBar />
      <main>
        <SampleStudyContent />
      </main>
      <Footer />
    </>
  );
}
