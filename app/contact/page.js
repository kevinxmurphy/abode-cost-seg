import NavBar from "@/components/ui/NavBar";
import Footer from "@/components/ui/Footer";
import ContactContent from "@/components/marketing/ContactContent";

export const metadata = {
  title: "Contact — Abode Cost Segregation",
  description:
    "Get in touch with the Abode team. Questions about your study, your property, or the platform — we respond to every message within one business day.",
};

export default function ContactPage() {
  return (
    <>
      <NavBar />
      <main>
        <ContactContent />
      </main>
      <Footer />
    </>
  );
}
