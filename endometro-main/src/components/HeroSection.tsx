import heroBanner from "@/assets/hero-banner.jpg";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden">
      <img
        src={heroBanner}
        alt="Banner sobre endometriose"
        width={1920}
        height={800}
        className="w-full h-[400px] md:h-[500px] object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-rose-dark/60 to-rose-dark/30" />
    </section>
  );
};

export default HeroSection;
