import { HeroSection } from "@/components/landing/hero";
import { HowItWorksSection } from "@/components/landing/how-it-works";
import { FeaturesSection } from "@/components/landing/features";
import { WhyStellarSection } from "@/components/landing/why-stellar";
import { FAQSection } from "@/components/landing/faq";
import { FeaturedCampaigns } from "@/components/landing/featured-campaigns";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedCampaigns />
      <HowItWorksSection />
      <FeaturesSection />
      <WhyStellarSection />
      <FAQSection />
    </>
  );
}
