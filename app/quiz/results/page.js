"use client";

import { Suspense } from "react";
import QuizResults from "@/components/quiz/QuizResults";

export default function QuizResultsPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--bg)",
          }}
        >
          <div className="pulse" style={{ color: "var(--dust)" }}>
            Calculating your savings...
          </div>
        </div>
      }
    >
      <QuizResults />
    </Suspense>
  );
}
