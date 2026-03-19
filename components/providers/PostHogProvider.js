"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect } from "react";
import { captureUtmParams } from "@/lib/utm";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

export default function PostHogProvider({ children }) {
  useEffect(() => {
    if (!POSTHOG_KEY) return;

    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      person_profiles: "identified_only",
      capture_pageview: false, // we handle manually below
      capture_pageleave: true,
      loaded: (ph) => {
        // Respect cookie consent
        const consent = localStorage.getItem("abode_cookie_consent");
        if (consent === "declined") {
          ph.opt_out_capturing();
        }
      },
    });
  }, []);

  // Capture UTM params on first landing
  useEffect(() => {
    captureUtmParams();
  }, []);

  // Capture page views on route changes
  useEffect(() => {
    if (!POSTHOG_KEY || typeof window === "undefined") return;

    const handleRouteChange = () => posthog.capture("$pageview");

    // Capture initial page view
    handleRouteChange();

    // Listen for Next.js App Router navigation via popstate
    window.addEventListener("popstate", handleRouteChange);
    return () => window.removeEventListener("popstate", handleRouteChange);
  }, []);

  if (!POSTHOG_KEY) return children;

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
