import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UserCheck, Building2 } from "lucide-react";

const SurveyButton = () => {
  const navigate = useNavigate();

  return (
    <section id="participe" className="py-16 px-4 bg-rose-blush/80 border-y border-rose-200">
      <div className="container mx-auto max-w-5xl text-center">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
          Participe do ENDOMETRIÔMETRO
        </h2>
        <p className="text-muted-foreground mb-10 max-w-xl mx-auto text-sm md:text-base">
          Escolha abaixo a opção que melhor se adapta a você ou à sua organização:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          {/* Card 1 — Pesquisa Individual */}
          <div className="bg-white rounded-3xl p-8 border border-rose-200 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-pink-soft flex items-center justify-center mb-5 text-secondary">
                <UserCheck className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-2xl text-foreground mb-3">
                Pesquisa Individual
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Responda à pesquisa de forma individual e contribua para a construção de dados sobre a endometriose, seus sintomas e seus impactos na rotina de trabalho.
              </p>
            </div>
            <Button
              size="lg"
              className="w-full bg-secondary hover:bg-secondary/90 text-white font-bold text-base py-6 rounded-xl shadow-md"
              onClick={() => navigate("/pesquisa")}
            >
              <UserCheck className="mr-2 h-5 w-5" />
              Participar da pesquisa
            </Button>
          </div>

          {/* Card 2 — Pesquisa para Empresas e Instituições */}
          <div className="bg-white rounded-3xl p-8 border border-rose-200 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-pink-soft flex items-center justify-center mb-5 text-secondary">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-2xl text-foreground mb-3">
                Pesquisa para Empresas e Instituições
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Sua empresa ou instituição precisa compreender melhor a realidade da endometriose? Crie uma pesquisa, convide participantes e acompanhe os dados de forma organizada.
              </p>
            </div>
            <Button
              size="lg"
              className="w-full bg-primary hover:bg-rose-dark text-white font-bold text-base py-6 rounded-xl shadow-md"
              onClick={() => navigate("/login?tipo=instituicao")}
            >
              <Building2 className="mr-2 h-5 w-5" />
              Acessar área da instituição
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SurveyButton;
