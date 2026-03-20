import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Set New Password | Abode Cost Segregation",
  description: "Create a new password for your Abode account.",
  path: "/reset-password",
  noIndex: true,
});

export default function ResetPasswordLayout({ children }) {
  return children;
}
