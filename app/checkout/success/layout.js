import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Payment Successful | Abode Cost Segregation",
  description: "Your payment was successful. Your cost segregation study is being prepared.",
  path: "/checkout/success",
  noIndex: true,
});

export default function CheckoutSuccessLayout({ children }) {
  return children;
}
