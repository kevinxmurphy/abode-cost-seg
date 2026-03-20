import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Create Account | Abode Cost Segregation",
  description: "Sign up for Abode to get an AI-powered cost segregation study for your short-term rental. Identify $30K–$150K in first-year depreciation deductions.",
  path: "/signup",
});

export default function SignupLayout({ children }) {
  return children;
}
