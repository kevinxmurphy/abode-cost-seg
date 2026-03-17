import NavBar from "@/components/ui/NavBar";
import Footer from "@/components/ui/Footer";
import ForCPAsContent from "@/components/marketing/ForCPAsContent";

export const metadata = {
  title: "For CPAs & Tax Professionals — Partner with Abode",
  description:
    "Refer clients, white-label the platform, or offer certified CPA reviews. Three ways to bring AI-powered cost segregation to your STR client base.",
};

export default function ForCPAsPage() {
  return (
    <>
      <NavBar />
      <main>
        <ForCPAsContent />
      </main>
      <Footer />
    </>
  );
}
