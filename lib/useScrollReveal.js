"use client";

import { useEffect, useRef } from "react";

export function useScrollReveal(options = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const targets = [];
    const children = el.querySelectorAll(".reveal");
    if (children.length > 0) {
      children.forEach((child) => targets.push(child));
    } else if (el.classList.contains("reveal")) {
      targets.push(el);
    }

    if (targets.length === 0) return;

    // Use rAF to ensure layout is settled before observing
    const rafId = requestAnimationFrame(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("visible");
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: options.threshold || 0.05,
          rootMargin: options.rootMargin || "0px 0px 50px 0px",
        }
      );

      targets.forEach((target) => observer.observe(target));
      el._scrollRevealObserver = observer;
    });

    return () => {
      cancelAnimationFrame(rafId);
      if (el._scrollRevealObserver) {
        el._scrollRevealObserver.disconnect();
      }
    };
  }, [options.threshold, options.rootMargin]);

  return ref;
}
