import heroBanner from "@/assets/hero-banner.jpg";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden h-[400px] md:h-[500px]">
      <video
        autoPlay
        loop
        muted
        playsInline
        poster={heroBanner}
        className="absolute inset-0 w-full h-full object-cover"
      >
        {/* O arquivo hero-video.mp4 precisará ser colocado na pasta public/ do projeto */}
        <source src="/hero-video.mp4" type="video/mp4" />
        Seu navegador não suporta a reprodução de vídeos.
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-rose-dark/60 to-rose-dark/30" />
    </section>
  );
};

export default HeroSection;
