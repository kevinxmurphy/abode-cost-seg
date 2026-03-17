"use client";

import { useState, useEffect, useRef } from "react";
import { TrendingUp, ChevronUp, ChevronDown } from "lucide-react";
import { calculateEstimate } from "@/lib/estimateEngine";

/**
 * RunningEstimate — persistent widget that shows a live updating deduction estimate
 * as the user progresses through the quiz. Appears after purchase price is entered.
 */
export default function RunningEstimate({ answers, currentStepId }) {
  const [expanded, setExpanded] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [visible, setVisible] = useState(false);
  const prevEstimateRef = useRef(null);

  const estimate = calculateEstimate(answers);

  // Show/hide based on whether we have enough data
  useEffect(() => {
    if (estimate && !visible) {
      const t = setTimeout(() => setVisible(true), 300);
      return () => clearTimeout(t);
    }
    if (!estimate && visible) {
      setVisible(false);
    }
  }, [estimate, visible]);

  // Pulse animation when estimate changes
  useEffect(() => {
    if (!estimate) return;
    const prev = prevEstimateRef.current;
    if (prev && prev.firstYearDeduction !== estimate.firstYearDeduction) {
      setAnimate(true);
      const t = setTimeout(() => setAnimate(false), 600);
      return () => clearTimeout(t);
    }
    prevEstimateRef.current = estimate;
  }, [estimate]);

  useEffect(() => {
    prevEstimateRef.current = estimate;
  });

  if (!estimate || !visible) return null;

  const formattedDeduction = `$${estimate.firstYearDeduction.toLocaleString()}`;

  return (
    <div className={`running-estimate ${visible ? "visible" : ""} ${animate ? "pulse" : ""}`}>
      <button
        className="running-estimate-toggle"
        onClick={() => setExpanded(!expanded)}
        type="button"
        aria-expanded={expanded}
        aria-label="Toggle estimate details"
      >
        <div className="running-estimate-icon">
          <TrendingUp size={14} strokeWidth={2.5} />
        </div>
        <div className="running-estimate-summary">
          <span className="running-estimate-label">Est. deduction</span>
          <span className={`running-estimate-value ${animate ? "flash" : ""}`}>
            {formattedDeduction}
          </span>
        </div>
        <div className="running-estimate-chevron">
          {expanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </div>
      </button>

      {expanded && (
        <div className="running-estimate-detail">
          <div className="running-estimate-range">
            <div className="running-estimate-range-item">
              <span className="running-estimate-range-label">Conservative</span>
              <span className="running-estimate-range-value">
                ${estimate.conservative.toLocaleString()}
              </span>
            </div>
            <div className="running-estimate-range-item highlight">
              <span className="running-estimate-range-label">Likely</span>
              <span className="running-estimate-range-value">{formattedDeduction}</span>
            </div>
            <div className="running-estimate-range-item">
              <span className="running-estimate-range-label">Optimistic</span>
              <span className="running-estimate-range-value">
                ${estimate.optimistic.toLocaleString()}
              </span>
            </div>
          </div>
          <p className="running-estimate-hint">
            This is your estimated deduction range. We&apos;ll refine it with property details after the quiz.
          </p>
        </div>
      )}
    </div>
  );
}
