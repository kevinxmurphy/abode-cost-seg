import { Suspense } from "react";
import NavBar from "@/components/ui/NavBar";
import Footer from "@/components/ui/Footer";
import BlogListingContent from "@/components/blog/BlogListingContent";

import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Learn — Cost Segregation Education for STR Investors | Abode",
  description: "Expert guides on cost segregation, bonus depreciation, STR tax strategy, and IRS compliance. Learn how to maximize your rental property deductions.",
  path: "/learn",
});

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
