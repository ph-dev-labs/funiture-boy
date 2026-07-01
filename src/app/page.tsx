import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import StatsBar from '@/components/landing/StatsBar';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import Footer from '@/components/landing/Footer';
import InvestmentPopup from '@/components/landing/InvestmentPopup';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0a0b10] overflow-hidden">
      <Navbar />
      <HeroSection />
      <StatsBar />
      <TestimonialsSection />
      <Footer />
      {/* Social proof investment popup */}
      <InvestmentPopup />
    </main>
  );
}

