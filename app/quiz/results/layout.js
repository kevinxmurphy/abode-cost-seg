import { buildMetadata } from "@/lib/seo";

export const metadata = {
  ...buildMetadata({
    title: "Your Cost Segregation Estimate | Abode",
    description: "See your personalized cost segregation estimate. Discover how much you could save in first-year depreciation deductions on your short-term rental property.",
    path: "/quiz/results",
  }),
  openGraph: {
    title: "My Cost Segregation Estimate | Abode",
    description: "I just got my cost segregation estimate from Abode — see how much STR investors are saving in tax deductions.",
    url: "https://www.abodecostseg.com/quiz/results",
    siteName: "Abode Cost Segregation",
    locale: "en_US",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Abode Cost Segregation — AI-powered cost seg studies for STR investors" }],
  },
};

export default function QuizResultsLayout({ children }) {
  return children;
}
