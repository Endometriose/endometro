import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "@/components/Header";
import HeroCore from "@/components/HeroCore";
import ChartsSection from "@/components/ChartsSection";
import SurveyButton from "@/components/SurveyButton";
import EducativoSection from "@/components/EducativoSection";
import RelatosSection from "@/components/RelatosSection";
import Footer from "@/components/Footer";

import AboutEndometriometroSection from "@/components/AboutEndometriometroSection";

const Index = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      setTimeout(() => {
        const id = location.hash.replace("#", "");
        let targetId = id;
        if (id === "tratamentos") targetId = "tratamento";
        if (id === "duvidas") targetId = "relatos";
        if (id === "diagnostico") targetId = "investigacao";

        const element = document.getElementById(targetId) || document.getElementById(id);
        if (element) {
          const yOffset = -90;
          const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: "smooth" });
        }
      }, 150);
    }
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <HeroCore />
      <AboutEndometriometroSection />
      <ChartsSection />
      <SurveyButton />
      <EducativoSection />
      <RelatosSection />
      <Footer />
    </div>
  );
};


export default Index;
