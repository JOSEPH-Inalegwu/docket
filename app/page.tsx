import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Hero from "@/components/landing/hero";
import LandingNavbar from '@/components/navigation/landing-navbar'
import HowItWorks from "@/components/landing/how-it-works-section";
import FeaturesSection from "@/components/landing/features-section";
// import PricingSection from "@/components/landing/pricing-section"
import FaqISection from "@/components/landing/faq-section";
import Footer from "@/components/landing/footer";


export default async function LandingPage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <main>
        <LandingNavbar />
        <Hero />
        <HowItWorks />
        <FeaturesSection />
        {/* <PricingSection /> */}
        <FaqISection />
        <Footer />
    </main>
  );
}
