import Link from "next/link";
import NavBar from "@/components/ui/NavBar";
import Footer from "@/components/ui/Footer";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Privacy Policy — Abode Cost Segregation",
  description: "Privacy Policy and CCPA disclosure for Abode Cost Segregation.",
  path: "/privacy",
});

export default function PrivacyPolicyPage() {
  const effectiveDate = "March 13, 2026";

  return (
    <>
      <NavBar />
      <main
        style={{
          paddingTop: "var(--space-16)",
          paddingBottom: "var(--space-10)",
          background: "var(--bg)",
        }}
      >
        <div className="container" style={{ maxWidth: "780px" }}>
          <div className="eyebrow" style={{ color: "var(--turq)", marginBottom: "var(--space-1)" }}>
            Legal
          </div>
          <h1 className="h1-hero" style={{ marginBottom: "var(--space-2)" }}>
            Privacy Policy
          </h1>
          <p className="mono" style={{ color: "var(--dust)", marginBottom: "var(--space-6)" }}>
            Effective Date: {effectiveDate}
          </p>

          <div className="legal-content" style={{ fontSize: "14px", lineHeight: 1.8, color: "var(--ink-mid)" }}>
            <LegalSection title="1. Introduction">
              <p>
                Abode Cost Segregation (&ldquo;Abode,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo;
                or &ldquo;our&rdquo;) is committed to protecting your privacy. This Privacy
                Policy explains how we collect, use, disclose, and safeguard your information
                when you visit our website, use our platform, or interact with our services
                (collectively, the &ldquo;Service&rdquo;).
              </p>
              <p>
                By using the Service, you consent to the data practices described in this policy.
                If you do not agree with this policy, please do not use the Service.
              </p>
            </LegalSection>

            <LegalSection title="2. Information We Collect">
              <h3 style={{ fontWeight: 600, fontSize: "15px", color: "var(--ink)", marginBottom: "var(--space-1)" }}>
                2.1 Information You Provide Directly
              </h3>
              <ul>
                <li><strong>Account information:</strong> name, email address, and password when you create an account;</li>
                <li><strong>Property information:</strong> property location (state), purchase price, year built, property type, amenities, prior cost segregation history, and federal tax bracket;</li>
                <li><strong>Payment information:</strong> credit card or payment details processed through our third-party payment processor (we do not store full payment card numbers);</li>
                <li><strong>Communications:</strong> any messages, emails, or inquiries you send to us.</li>
              </ul>

              <h3 style={{ fontWeight: 600, fontSize: "15px", color: "var(--ink)", marginTop: "var(--space-3)", marginBottom: "var(--space-1)" }}>
                2.2 Information Collected Automatically
              </h3>
              <ul>
                <li><strong>Device and browser information:</strong> IP address, browser type, operating system, device identifiers;</li>
                <li><strong>Usage data:</strong> pages viewed, time spent on pages, clicks, referring URLs;</li>
                <li><strong>Cookies and tracking technologies:</strong> we use cookies, web beacons, and similar technologies to collect usage data and improve the Service (see Section 7).</li>
              </ul>

              <h3 style={{ fontWeight: 600, fontSize: "15px", color: "var(--ink)", marginTop: "var(--space-3)", marginBottom: "var(--space-1)" }}>
                2.3 Information from Third Parties
              </h3>
              <ul>
                <li><strong>Authentication providers:</strong> if you sign in via Google or another OAuth provider, we receive your name and email address from that provider;</li>
                <li><strong>Analytics providers:</strong> we may receive aggregated analytics data from third-party services.</li>
              </ul>
            </LegalSection>

            <LegalSection title="3. How We Use Your Information">
              <p>We use the information we collect to:</p>
              <ul>
                <li>Provide, maintain, and improve the Service;</li>
                <li>Generate cost segregation studies based on your property data;</li>
                <li>Process payments and send transaction confirmations;</li>
                <li>Send you study results, account updates, and service-related communications;</li>
                <li>Send marketing communications (only with your opt-in consent);</li>
                <li>Respond to your inquiries and support requests;</li>
                <li>Detect and prevent fraud, abuse, or security incidents;</li>
                <li>Comply with legal obligations;</li>
                <li>Analyze usage patterns to improve user experience.</li>
              </ul>
            </LegalSection>

            <LegalSection title="4. How We Share Your Information">
              <p>
                We do not sell your personal information. We may share your information in the
                following circumstances:
              </p>
              <ul>
                <li><strong>Service providers:</strong> third-party vendors who assist us in operating the Service (e.g., payment processors, email services, cloud hosting, analytics providers). These providers are contractually obligated to protect your data;</li>
                <li><strong>Legal compliance:</strong> when required by law, regulation, subpoena, court order, or governmental request;</li>
                <li><strong>Business transfers:</strong> in connection with a merger, acquisition, reorganization, or sale of assets, your information may be transferred as part of that transaction;</li>
                <li><strong>With your consent:</strong> we may share information for other purposes with your explicit consent.</li>
              </ul>
            </LegalSection>

            <LegalSection title="5. Data Retention">
              <p>
                We retain your personal information for as long as your account is active or as
                needed to provide the Service. We may retain certain information as necessary to
                comply with legal obligations, resolve disputes, enforce agreements, and for
                legitimate business purposes.
              </p>
              <p>
                Study reports and associated property data are retained for the duration of your
                account. You may request deletion of your account and associated data at any time
                (see Section 6).
              </p>
            </LegalSection>

            <LegalSection title="6. Your Rights and Choices">
              <h3 style={{ fontWeight: 600, fontSize: "15px", color: "var(--ink)", marginBottom: "var(--space-1)" }}>
                6.1 All Users
              </h3>
              <ul>
                <li><strong>Access:</strong> you may request a copy of the personal information we hold about you;</li>
                <li><strong>Correction:</strong> you may request that we correct inaccurate or incomplete information;</li>
                <li><strong>Deletion:</strong> you may request that we delete your personal information, subject to legal retention requirements;</li>
                <li><strong>Marketing opt-out:</strong> you may unsubscribe from marketing emails at any time by clicking the unsubscribe link or contacting us;</li>
                <li><strong>Account deletion:</strong> you may request full account deletion by contacting support@abodecostseg.com.</li>
              </ul>

              <h3 style={{ fontWeight: 600, fontSize: "15px", color: "var(--ink)", marginTop: "var(--space-3)", marginBottom: "var(--space-1)" }}>
                6.2 California Residents — CCPA / CPRA Rights
              </h3>
              <p>
                If you are a California resident, the California Consumer Privacy Act (CCPA), as
                amended by the California Privacy Rights Act (CPRA), provides you with the
                following additional rights:
              </p>
              <ul>
                <li>
                  <strong>Right to Know:</strong> you have the right to request that we disclose
                  the categories and specific pieces of personal information we have collected
                  about you, the categories of sources, the business purpose for collecting the
                  information, and the categories of third parties with whom we share it;
                </li>
                <li>
                  <strong>Right to Delete:</strong> you have the right to request that we delete
                  your personal information, subject to certain exceptions;
                </li>
                <li>
                  <strong>Right to Correct:</strong> you have the right to request correction of
                  inaccurate personal information;
                </li>
                <li>
                  <strong>Right to Opt-Out of Sale/Sharing:</strong> we do not sell your personal
                  information. If this changes, we will provide a &ldquo;Do Not Sell or Share My
                  Personal Information&rdquo; link;
                </li>
                <li>
                  <strong>Right to Non-Discrimination:</strong> we will not discriminate against
                  you for exercising your CCPA/CPRA rights.
                </li>
              </ul>
              <p>
                To exercise any of these rights, please contact us at privacy@abodecostseg.com
                or call us at the number listed below. We will verify your identity before
                processing any request and respond within 45 days as required by law.
              </p>

              <h3 style={{ fontWeight: 600, fontSize: "15px", color: "var(--ink)", marginTop: "var(--space-3)", marginBottom: "var(--space-1)" }}>
                6.3 Categories of Personal Information Collected (CCPA Disclosure)
              </h3>
              <p>In the preceding 12 months, we have collected the following categories of personal information:</p>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", marginTop: "var(--space-2)" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid var(--border)" }}>
                      <th style={{ textAlign: "left", padding: "8px", fontWeight: 600, color: "var(--ink)" }}>Category</th>
                      <th style={{ textAlign: "left", padding: "8px", fontWeight: 600, color: "var(--ink)" }}>Examples</th>
                      <th style={{ textAlign: "left", padding: "8px", fontWeight: 600, color: "var(--ink)" }}>Sold?</th>
                    </tr>
                  </thead>
                  <tbody>
                    <CCPARow category="Identifiers" examples="Name, email address, IP address" sold="No" />
                    <CCPARow category="Financial Information" examples="Purchase price of property, tax bracket (self-reported)" sold="No" />
                    <CCPARow category="Commercial Information" examples="Records of services purchased, property details" sold="No" />
                    <CCPARow category="Internet Activity" examples="Browsing history, interactions with our website" sold="No" />
                    <CCPARow category="Geolocation" examples="State-level location (from property info)" sold="No" />
                  </tbody>
                </table>
              </div>
            </LegalSection>

            <LegalSection title="7. Cookies and Tracking Technologies">
              <p>
                We use cookies and similar tracking technologies to collect and track information
                and to improve the Service. You can instruct your browser to refuse all cookies
                or to indicate when a cookie is being sent.
              </p>
              <p>Types of cookies we use:</p>
              <ul>
                <li><strong>Essential cookies:</strong> necessary for the Service to function (e.g., authentication, security);</li>
                <li><strong>Analytics cookies:</strong> help us understand how visitors interact with the Service;</li>
                <li><strong>Marketing cookies:</strong> used to deliver relevant advertisements (only with consent).</li>
              </ul>
              <p>
                You may manage your cookie preferences at any time through the cookie consent
                banner displayed on your first visit or through your browser settings.
              </p>
            </LegalSection>

            <LegalSection title="8. Data Security">
              <p>
                We implement appropriate technical and organizational security measures to protect
                your personal information against unauthorized access, alteration, disclosure, or
                destruction. However, no method of transmission over the Internet or electronic
                storage is 100% secure, and we cannot guarantee absolute security.
              </p>
            </LegalSection>

            <LegalSection title="9. Children's Privacy">
              <p>
                The Service is not directed to individuals under the age of 18. We do not
                knowingly collect personal information from children. If you are a parent or
                guardian and believe your child has provided us with personal information, please
                contact us and we will delete such information.
              </p>
            </LegalSection>

            <LegalSection title="10. Third-Party Links">
              <p>
                The Service may contain links to third-party websites or services. We are not
                responsible for the privacy practices of those third parties. We encourage you to
                review the privacy policies of any third-party services you access through our
                platform.
              </p>
            </LegalSection>

            <LegalSection title="11. Changes to This Policy">
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any
                material changes by posting the new policy on this page and updating the
                &ldquo;Effective Date.&rdquo; We will also notify registered users via email for
                material changes.
              </p>
            </LegalSection>

            <LegalSection title="12. Contact Us">
              <p>
                If you have questions about this Privacy Policy, your data, or wish to exercise
                your privacy rights, contact us at:
              </p>
              <p>
                <strong>Abode Cost Segregation</strong><br />
                Email: privacy@abodecostseg.com<br />
                Support: support@abodecostseg.com
              </p>
              <p>
                For CCPA/CPRA requests, you may also email privacy@abodecostseg.com with the
                subject line &ldquo;CCPA Request.&rdquo;
              </p>
            </LegalSection>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function LegalSection({ title, children }) {
  return (
    <div style={{ marginBottom: "var(--space-5)" }}>
      <h2
        style={{
          fontWeight: 600,
          fontSize: "18px",
          color: "var(--ink)",
          marginBottom: "var(--space-2)",
        }}
      >
        {title}
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        {children}
      </div>
    </div>
  );
}

function CCPARow({ category, examples, sold }) {
  return (
    <tr style={{ borderBottom: "1px solid var(--border)" }}>
      <td style={{ padding: "8px", fontWeight: 500 }}>{category}</td>
      <td style={{ padding: "8px" }}>{examples}</td>
      <td style={{ padding: "8px" }}>{sold}</td>
    </tr>
  );
}
