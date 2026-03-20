import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Property Details | Abode Cost Segregation",
  description: "Review and confirm your property details for your cost segregation study.",
  path: "/quiz/details",
});

export default function DetailsLayout({ children }) {
  return children;
}
