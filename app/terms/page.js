import Link from "next/link";
import NavBar from "@/components/ui/NavBar";
import Footer from "@/components/ui/Footer";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Terms of Service — Abode Cost Segregation",
  description: "Terms of Service for Abode Cost Segregation services.",
  path: "/terms",
});

export default function TermsOfServicePage() {
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
            Terms of Service
          </h1>
          <p className="mono" style={{ color: "var(--dust)", marginBottom: "var(--space-6)" }}>
            Effective Date: {effectiveDate}
          </p>

          <div className="legal-content" style={{ fontSize: "14px", lineHeight: 1.8, color: "var(--ink-mid)" }}>
            <LegalSection title="1. Acceptance of Terms">
              <p>
                By accessing or using the Abode Cost Segregation website, platform, tools, or
                services (collectively, the &ldquo;Service&rdquo;), you (&ldquo;User,&rdquo;
                &ldquo;you,&rdquo; or &ldquo;your&rdquo;) agree to be bound by these Terms of
                Service (&ldquo;Terms&rdquo;). If you do not agree to these Terms, you may not
                access or use the Service. These Terms constitute a legally binding agreement
                between you and Abode Cost Segregation (&ldquo;Abode,&rdquo; &ldquo;we,&rdquo;
                &ldquo;us,&rdquo; or &ldquo;our&rdquo;).
              </p>
              <p>
                We reserve the right to update or modify these Terms at any time. Your continued
                use of the Service after any such changes constitutes your acceptance of the
                revised Terms. We will notify registered users of material changes via email or
                in-app notification.
              </p>
            </LegalSection>

            <LegalSection title="2. Description of Service">
              <p>
                Abode provides AI-powered cost segregation studies for real estate properties,
                primarily short-term rental (STR) investments. The Service generates reports that
                classify property assets into IRS depreciation categories based on information
                provided by the User.
              </p>
              <p>
                <strong>
                  The Service is a software tool that generates informational reports. Abode is
                  not an accounting firm, engineering firm, tax advisory firm, or law firm. The
                  Service does not provide tax advice, legal advice, financial advice, or
                  engineering services.
                </strong>
              </p>
            </LegalSection>

            <LegalSection title="3. User Responsibilities and Data Accuracy">
              <p>
                <strong>
                  You are solely responsible for the accuracy, completeness, and truthfulness of
                  all information you provide to Abode, including but not limited to: property
                  details, purchase price, acquisition date, property characteristics, amenities,
                  square footage, improvements, and any other data submitted through the Service.
                </strong>
              </p>
              <p>
                You represent and warrant that:
              </p>
              <ul>
                <li>All information you provide is accurate and complete to the best of your knowledge;</li>
                <li>You have the legal right and authority to provide such information;</li>
                <li>You are the owner or authorized representative of the property for which the study is requested;</li>
                <li>You will not provide false, misleading, or fraudulent information;</li>
                <li>You understand that the accuracy of the study output is directly dependent on the accuracy of the information you provide.</li>
              </ul>
              <p>
                <strong>
                  Abode relies entirely on User-provided data to generate its reports. We do not
                  independently verify, audit, or inspect any property or data submitted by
                  Users. Any errors, omissions, or inaccuracies in the data you provide may
                  result in an inaccurate study.
                </strong>
              </p>
            </LegalSection>

            <LegalSection title="4. No Tax, Legal, or Professional Advice">
              <p>
                <strong>
                  THE SERVICE DOES NOT CONSTITUTE TAX ADVICE, LEGAL ADVICE, FINANCIAL ADVICE,
                  ACCOUNTING ADVICE, OR ENGINEERING SERVICES. ALL REPORTS, ESTIMATES, SAVINGS
                  CALCULATIONS, AND STUDY OUTPUTS ARE FOR INFORMATIONAL PURPOSES ONLY.
                </strong>
              </p>
              <p>
                You acknowledge and agree that:
              </p>
              <ul>
                <li>You should consult with a qualified Certified Public Accountant (CPA), tax attorney, or other licensed tax professional before making any tax decisions based on the Service output;</li>
                <li>You are solely responsible for determining how to use the information provided by the Service in your tax filings;</li>
                <li>Tax laws and regulations are subject to change and vary by jurisdiction;</li>
                <li>Abode makes no guarantees regarding IRS acceptance of any study or the tax savings you may or may not realize;</li>
                <li>The Service is a tool to assist your tax professional — it is not a substitute for professional tax advice.</li>
              </ul>
            </LegalSection>

            <LegalSection title="5. Limitation of Liability">
              <p>
                <strong>
                  TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, ABODE, ITS OFFICERS,
                  DIRECTORS, EMPLOYEES, AGENTS, AFFILIATES, AND LICENSORS SHALL NOT BE LIABLE
                  FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, PUNITIVE, OR EXEMPLARY
                  DAMAGES, INCLUDING BUT NOT LIMITED TO DAMAGES FOR LOSS OF PROFITS, GOODWILL,
                  DATA, TAX SAVINGS, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:
                </strong>
              </p>
              <ul>
                <li>Your use of or inability to use the Service;</li>
                <li>Any errors, inaccuracies, or omissions in the study output, whether caused by User-provided data or the Service&apos;s analysis;</li>
                <li>Any IRS audit, tax assessment, penalty, interest, or adverse tax outcome arising from or related to the use of the Service;</li>
                <li>Any reliance on the Service output without independent verification by a qualified tax professional;</li>
                <li>Any unauthorized access to or alteration of your data;</li>
                <li>Any changes in tax law, IRS regulations, or depreciation rules that affect the applicability of a study.</li>
              </ul>
              <p>
                <strong>
                  IN NO EVENT SHALL ABODE&apos;S TOTAL AGGREGATE LIABILITY TO YOU FOR ALL CLAIMS
                  ARISING OUT OF OR RELATED TO THE SERVICE EXCEED THE AMOUNT YOU PAID TO ABODE
                  FOR THE SPECIFIC STUDY GIVING RISE TO THE CLAIM. THIS CAP APPLIES REGARDLESS
                  OF THE FORM OF ACTION, WHETHER IN CONTRACT, TORT, STRICT LIABILITY, OR
                  OTHERWISE.
                </strong>
              </p>
            </LegalSection>

            <LegalSection title="6. Audit Disclaimer and Hold Harmless">
              <p>
                <strong>
                  YOU ACKNOWLEDGE AND AGREE THAT IF YOU OR YOUR PROPERTY IS SUBJECT TO AN IRS
                  AUDIT, TAX EXAMINATION, OR ANY GOVERNMENT INQUIRY RELATED TO A COST
                  SEGREGATION STUDY GENERATED BY THE SERVICE:
                </strong>
              </p>
              <ul>
                <li>Abode is not responsible for defending you in any audit or tax proceeding;</li>
                <li>Abode does not provide audit defense, representation, or support unless separately agreed to in writing;</li>
                <li>The accuracy of the study is contingent upon the accuracy of the information you provided;</li>
                <li>Abode makes no warranty or guarantee that any study will withstand IRS scrutiny;</li>
                <li>You are solely responsible for any taxes, penalties, interest, or fees resulting from an audit.</li>
              </ul>
              <p>
                <strong>
                  You agree to indemnify, defend, and hold harmless Abode and its officers,
                  directors, employees, and agents from and against any and all claims, damages,
                  losses, costs, and expenses (including reasonable attorneys&apos; fees) arising
                  from or related to: (a) your use of the Service; (b) any inaccuracy in the
                  data you provided; (c) any tax filing or decision you make based on the
                  Service output; or (d) any violation of these Terms.
                </strong>
              </p>
            </LegalSection>

            <LegalSection title="7. Disclaimer of Warranties">
              <p>
                <strong>
                  THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo;
                  WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT
                  LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
                  PURPOSE, ACCURACY, COMPLETENESS, AND NON-INFRINGEMENT.
                </strong>
              </p>
              <p>
                Without limiting the foregoing, Abode does not warrant that:
              </p>
              <ul>
                <li>The Service will meet your specific requirements or expectations;</li>
                <li>The Service will be uninterrupted, timely, secure, or error-free;</li>
                <li>The results or outputs obtained from the Service will be accurate, reliable, or complete;</li>
                <li>Any errors in the Service will be corrected;</li>
                <li>The study will result in any specific amount of tax savings.</li>
              </ul>
            </LegalSection>

            <LegalSection title="8. Payment and Refund Policy">
              <p>
                The Service is offered at a per-property, one-time fee as displayed at the time
                of purchase. All fees are non-refundable once a study has been initiated, except
                as required by applicable law.
              </p>
              <p>
                You agree to pay all fees associated with the Service. By providing payment
                information, you authorize Abode to charge your payment method for the agreed-upon
                amount. All prices are in U.S. Dollars (USD).
              </p>
              <p>
                If a study cannot be completed due to insufficient or invalid data provided by
                you, Abode may, at its sole discretion, offer a partial refund or credit toward a
                future study.
              </p>
            </LegalSection>

            <LegalSection title="9. Intellectual Property">
              <p>
                All content, software, algorithms, reports, templates, designs, and materials
                provided through the Service are the intellectual property of Abode or its
                licensors and are protected by copyright, trademark, and other intellectual
                property laws.
              </p>
              <p>
                Upon payment, you are granted a limited, non-exclusive, non-transferable license
                to use the study generated for your property solely for your personal tax
                planning purposes. You may not resell, redistribute, publish, or sublicense any
                study or report generated by the Service.
              </p>
            </LegalSection>

            <LegalSection title="10. Account Termination">
              <p>
                We reserve the right to suspend or terminate your account at any time, for any
                reason, including but not limited to: violation of these Terms, suspected
                fraudulent activity, or misuse of the Service. Upon termination, your right to
                access the Service will immediately cease.
              </p>
            </LegalSection>

            <LegalSection title="11. Dispute Resolution and Arbitration">
              <p>
                <strong>
                  Any dispute, claim, or controversy arising out of or relating to these Terms
                  or the Service shall be resolved through binding arbitration administered by
                  the American Arbitration Association (AAA) in accordance with its Commercial
                  Arbitration Rules.
                </strong>
              </p>
              <p>
                You agree that:
              </p>
              <ul>
                <li>Arbitration shall take place in the state where Abode is incorporated or, at Abode&apos;s discretion, remotely via video conference;</li>
                <li>The arbitrator&apos;s decision shall be final and binding;</li>
                <li>You waive any right to participate in a class action lawsuit or class-wide arbitration;</li>
                <li>Each party shall bear its own costs and attorneys&apos; fees unless the arbitrator determines otherwise.</li>
              </ul>
              <p>
                For claims under $10,000, the parties agree to resolve the dispute through
                informal negotiation before initiating arbitration.
              </p>
            </LegalSection>

            <LegalSection title="12. Governing Law">
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the
                State of California, without regard to its conflict of law provisions.
              </p>
            </LegalSection>

            <LegalSection title="13. Severability">
              <p>
                If any provision of these Terms is found to be unenforceable or invalid, that
                provision shall be limited or eliminated to the minimum extent necessary, and the
                remaining provisions shall remain in full force and effect.
              </p>
            </LegalSection>

            <LegalSection title="14. Entire Agreement">
              <p>
                These Terms, together with the{" "}
                <Link href="/privacy" style={{ color: "var(--turq)" }}>Privacy Policy</Link> and{" "}
                <Link href="/disclaimers" style={{ color: "var(--turq)" }}>Disclaimers</Link>,
                constitute the entire agreement between you and Abode regarding the Service and
                supersede all prior agreements, understandings, and communications.
              </p>
            </LegalSection>

            <LegalSection title="15. Contact Information">
              <p>
                If you have questions about these Terms, please contact us at:
              </p>
              <p>
                <strong>Abode Cost Segregation</strong><br />
                Email: legal@abodecostseg.com<br />
                Support: support@abodecostseg.com
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
