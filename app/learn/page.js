import { Suspense } from "react";
import NavBar from "@/components/ui/NavBar";
import Footer from "@/components/ui/Footer";
import BlogListingContent from "@/components/blog/BlogListingContent";

export const metadata = {
  title: "Learn — Cost Segregation Education for STR Investors | Abode",
  description:
    "Expert guides on cost segregation, bonus depreciation, STR tax strategy, and IRS compliance. Learn how to maximize your rental property deductions.",
  openGraph: {
    title: "Learn — Cost Segregation Education | Abode",
    description:
      "Expert guides on cost segregation, bonus depreciation, and STR tax strategy.",
    url: "https://www.abodecostseg.com/learn",
  },
  alternates: {
    canonical: "https://www.abodecostseg.com/learn",
  },
};

export default function LearnPage() {
  return (
    <>
      <NavBar />
      <main>
        <Suspense fallback={<div style={{ minHeight: "60vh" }} />}>
          <BlogListingContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
