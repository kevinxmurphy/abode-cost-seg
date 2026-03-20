import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Log In | Abode Cost Segregation",
  description: "Sign in to your Abode account to view your cost segregation studies and manage your properties.",
  path: "/login",
});

export default function LoginLayout({ children }) {
  return children;
}
