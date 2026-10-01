import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ChartsSection from "@/components/ChartsSection";
import SurveyButton from "@/components/SurveyButton";
import InfoSection from "@/components/InfoSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <HeroSection />
      <ChartsSection />
      <SurveyButton />
      <InfoSection />
      <Footer />
    </div>
  );
};

export default Index;
