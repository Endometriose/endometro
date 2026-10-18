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
    <section className="relative w-full h-screen min-h-[600px] overflow-hidden flex flex-col items-center justify-end bg-pink-soft border-b border-rose-100">
      
      {/* VÍDEO / IMAGEM 3D DO ÚTERO PREENCHENDO TODA A TELA */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        
        {/* Imagem 1: Útero Anatômico 3D Completo em Tela Cheia */}
        <div 
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
            activeStage === 1 ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img 
            src="/hero_stage1_fullscreen.jpg" 
            alt="Útero Anatômico Saudável 3D Completo" 
            className="w-full h-full object-cover object-center filter brightness-[1.01] contrast-[1.02]"
          />
        </div>

        {/* Imagem 2: Mapeamento de Lesões 3D Completo em Tela Cheia */}
        <div 
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
            activeStage === 2 ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img 
            src="/hero_stage2_fullscreen.jpg" 
            alt="Mapeamento de Lesões de Endometriose 3D Completo" 
            className="w-full h-full object-cover object-center filter brightness-[1.01] contrast-[1.02]"
          />
        </div>

        {/* Degradê superior suave para contraste com o cabeçalho */}
        <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-black/25 via-black/10 to-transparent z-10 pointer-events-none" />
        
        {/* Degradê inferior sutil para destacar perfeitamente o título na base */}
        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-black/50 via-black/20 to-transparent z-10 pointer-events-none" />
      </div>

      {/* CONTEÚDO PRINCIPAL (TÍTULO E SUBTÍTULO POSICIONADOS NA BASE COM ALTA LEGIBILIDADE) */}
      <div className="relative z-20 w-full max-w-5xl px-4 flex flex-col items-center justify-end pb-5 sm:pb-7 md:pb-8 text-center animate-fade-in pointer-events-none">
        
        <h1
          className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-widest uppercase text-center leading-tight text-white"
          style={{
            textShadow: "0 3px 20px rgba(120, 20, 40, 0.95), 0 2px 10px rgba(0, 0, 0, 0.8)",
          }}
        >
          ENDOMETRIÔMETRO
        </h1>
        
        <p 
          className="mt-1 sm:mt-2 text-center text-white font-body text-xs sm:text-sm md:text-base font-bold leading-relaxed max-w-xl mx-auto drop-shadow-md"
          style={{
            textShadow: "0 2px 8px rgba(0, 0, 0, 0.9)",
          }}
        >
          A informação é o primeiro passo para o acolhimento e a qualidade de vida.
        </p>

      </div>
    </section>
  );
};

export default HeroCore;






