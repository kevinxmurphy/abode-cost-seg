import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Complete Your Study | Abode Cost Segregation",
  description: "Finalize your cost segregation study details. Provide property information, upload photos, and get your IRS-compliant report.",
  path: "/quiz/study",
  noIndex: true,
});

export default function StudyLayout({ children }) {
  return children;
}
