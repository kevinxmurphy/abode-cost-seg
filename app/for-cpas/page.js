import NavBar from "@/components/ui/NavBar";
import Footer from "@/components/ui/Footer";
import ForCPAsContent from "@/components/marketing/ForCPAsContent";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "For CPAs & Tax Professionals — Partner with Abode",
  description: "Refer clients, white-label the platform, or offer certified CPA reviews. Three ways to bring AI-powered cost segregation to your STR client base.",
  path: "/for-cpas",
});

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
