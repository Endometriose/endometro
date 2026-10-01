import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ClipboardList } from "lucide-react";

const SurveyButton = () => {
  const navigate = useNavigate();

  return (
    <section className="py-12 px-4 bg-rose-blush">
      <div className="container mx-auto text-center">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
          Participe da Nossa Pesquisa
        </h2>
        <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
          Sua resposta ajuda a atualizar os dados acima e dar visibilidade ao impacto da endometriose.
        </p>
        <Button
          size="lg"
          className="bg-primary text-primary-foreground hover:bg-rose-dark font-semibold text-base px-8 py-6 rounded-xl shadow-lg"
          onClick={() => navigate("/login")}
        >
          <ClipboardList className="mr-2 h-5 w-5" />
          Responder Questionário
        </Button>
      </div>
    </section>
  );
};

export default SurveyButton;
