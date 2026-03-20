import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Reset Password | Abode Cost Segregation",
  description: "Reset your Abode account password.",
  path: "/forgot-password",
  noIndex: true,
});

export default function ForgotPasswordLayout({ children }) {
  return children;
}
