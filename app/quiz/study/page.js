"use client";

import { Suspense } from "react";
import StudyWizardPage from "@/components/quiz/StudyWizardPage";

export default function QuizStudyPage() {
  return (
    <Suspense
      fallback={
        <div className="quiz-shell">
          <div
            className="quiz-body"
            style={{
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Loading study wizard...
          </div>
        </div>
      }
    >
      <StudyWizardPage />
    </Suspense>
  );
}
