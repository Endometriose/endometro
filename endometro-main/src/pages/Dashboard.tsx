import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChartsSection from "@/components/ChartsSection";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-rose-blush">
        <div className="container mx-auto py-8 px-4">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
              Painel de Resultados
            </h1>
            <p className="text-muted-foreground mb-4">
              Veja os dados coletados pela pesquisa sobre endometriose no trabalho.
            </p>
            <Button
              onClick={() => navigate("/pesquisa")}
              className="bg-primary text-primary-foreground hover:bg-rose-dark"
            >
              Responder Questionário
            </Button>
          </div>
        </div>
        <ChartsSection />
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
