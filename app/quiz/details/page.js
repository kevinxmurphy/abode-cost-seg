"use client";

import { Suspense } from "react";
import PropertyDetailsContent from "@/components/quiz/PropertyDetailsContent";

export default function QuizDetailsPage() {
  return (
    <Suspense fallback={<div className="quiz-shell"><div className="quiz-body" style={{ alignItems: "center", justifyContent: "center" }}>Loading...</div></div>}>
      <PropertyDetailsContent />
    </Suspense>
  );
}
