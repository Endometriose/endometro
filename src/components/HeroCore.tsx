import { useState, useEffect } from "react";

const HeroCore = () => {
  const [activeStage, setActiveStage] = useState<1 | 2>(1);

  // Alterna o vídeo 3D em loop contínuo e suave a cada 4 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStage((prev) => (prev === 1 ? 2 : 1));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full h-[calc(100vh-70px)] sm:h-[90vh] min-h-[550px] overflow-hidden flex flex-col items-center justify-center bg-pink-soft border-b border-rose-100">
      
      {/* VÍDEO 3D DO ÚTERO EM TELA CHEIA COMPLETA */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden bg-pink-soft">
        
        {/* Imagem 1: Útero Anatômico 3D em Tela Cheia */}
        <div 
          className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out transform flex items-center justify-center ${
            activeStage === 1 ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-105 pointer-events-none'
          }`}
        >
          <img 
            src="/uterus_stage1.jpg" 
            alt="Vídeo 3D Útero Anatômico Tela Cheia" 
            className="w-full h-full object-cover object-center filter brightness-[1.02] contrast-[1.04] drop-shadow-2xl"
          />
        </div>

        {/* Imagem 2: Mapeamento de Lesões 3D em Tela Cheia */}
        <div 
          className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out transform flex items-center justify-center ${
            activeStage === 2 ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-105 pointer-events-none'
          }`}
        >
          <img 
            src="/uterus_stage2.jpg" 
            alt="Vídeo 3D Mapeamento de Lesões Tela Cheia" 
            className="w-full h-full object-cover object-center filter brightness-[1.02] contrast-[1.04] drop-shadow-2xl"
          />
        </div>

        {/* Suave degradê no topo e rodapé para contraste perfeito */}
        <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-pink-soft/80 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-background via-background/70 to-transparent z-10 pointer-events-none"></div>
      </div>

      {/* CONTEÚDO PRINCIPAL (TÍTULO E SUBTÍTULO LEVES SOBRE O VÍDEO 3D) */}
      <div className="relative z-20 w-full max-w-4xl px-4 flex flex-col items-center justify-center text-center animate-fade-in pointer-events-none">
        
        <h1 className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-widest text-white uppercase drop-shadow-[0_4px_20px_rgba(158,59,70,0.85)] text-center leading-tight">
          ENDOMETRIÔMETRO
        </h1>
        
        <p className="mt-4 text-center text-secondary font-body text-sm sm:text-base md:text-xl max-w-xl font-bold leading-relaxed shadow-sm bg-white/85 backdrop-blur-md py-2.5 px-6 rounded-full border border-rose-200/80">
          A informação é o primeiro passo para o acolhimento e a qualidade de vida.
        </p>

      </div>
    </section>
  );
};

export default HeroCore;






