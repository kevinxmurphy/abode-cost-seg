import QuizGate from "@/components/quiz/QuizGate";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Free Estimate — Abode Cost Segregation",
  description: "Get a free estimate of your potential cost segregation tax savings in under 2 minutes.",
  path: "/quiz",
});

export default function QuizPage() {
  return <QuizGate />;
}
