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
            className="w-full h-full object-cover object-[center_25%] filter brightness-[1.02] contrast-[1.04] drop-shadow-2xl"
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
            className="w-full h-full object-cover object-[center_25%] filter brightness-[1.02] contrast-[1.04] drop-shadow-2xl"
          />
        </div>

        {/* Suave degradê no topo e rodapé para contraste perfeito */}
        <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-pink-soft/80 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-background via-background/70 to-transparent z-10 pointer-events-none"></div>
      </div>

      {/* CONTEÚDO PRINCIPAL (TÍTULO E SUBTÍTULO LEVES SOBRE O VÍDEO 3D) */}
      <div className="relative z-20 w-full max-w-4xl px-4 flex flex-col items-center justify-end h-full pb-6 sm:pb-10 text-center animate-fade-in pointer-events-none">
        
        <h1
          className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-widest uppercase text-center leading-tight text-white drop-shadow-lg mt-auto"
          style={{
            textShadow: "0 4px 24px rgba(120,20,40,0.9), 0 2px 10px rgba(0,0,0,0.7)",
          }}
        >
          ENDOMETRIÔMETRO
        </h1>
        
        <p className="mt-2 text-center text-white font-body text-sm sm:text-base md:text-xl font-bold leading-relaxed drop-shadow-md sm:whitespace-nowrap"
           style={{ textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>
          A informação é o primeiro passo para o acolhimento e a qualidade de vida.
        </p>

      </div>
    </section>
  );
};

export default HeroCore;






