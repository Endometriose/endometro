import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { AlertCircle, Download, FileText, ArrowRight, Activity, CalendarDays, Brain } from "lucide-react";

const RelatorioIndividual = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const fetchLastResponse = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate("/login");
          return;
        }

        // Busca a última resposta da mulher
        const { data, error } = await supabase
          .from('survey_responses')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error || !data) {
          // Se não tem dados, manda pra pesquisa
          navigate("/pesquisa");
          return;
        }

        setUserData(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchLastResponse();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-muted-foreground">Gerando seu relatório...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-12 px-4 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-0 right-0 w-full h-96 bg-gradient-to-b from-rose-pale to-transparent z-0 pointer-events-none"></div>

        <div className="container mx-auto max-w-4xl relative z-10">
          
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                Seu Relatório Pessoal
              </h1>
              <p className="text-muted-foreground mt-1">
                Baseado nas suas respostas do questionário.
              </p>
            </div>
            <Button variant="outline" className="flex items-center gap-2 border-primary/20 text-foreground hover:bg-rose-pale">
              <Download className="w-4 h-4" /> Baixar PDF
            </Button>
          </div>

          {/* ALERTA DE ISENÇÃO DE DIAGNÓSTICO */}
          <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-xl shadow-sm mb-8 flex gap-4 items-start">
            <AlertCircle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-amber-800 text-lg mb-1">Aviso Importante Médico</h3>
              <p className="text-amber-700/80 leading-relaxed text-sm">
                Este relatório é um espelho das informações que você forneceu e <strong>NÃO substitui uma consulta médica, diagnóstico ou aconselhamento profissional</strong>. A endometriose só pode ser diagnosticada por médicos especialistas através de avaliação clínica e exames de imagem específicos. 
                Se você está sofrendo com dores intensas, procure um ginecologista especializado.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Card Intensidade da Dor */}
            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 rounded-full bg-rose-blush flex items-center justify-center mb-4">
                <Activity className="w-8 h-8 text-primary" />
              </div>
              <p className="text-muted-foreground text-sm font-medium mb-1">Intensidade Média da Dor</p>
              <div className="flex items-baseline gap-1">
                <span className="font-display text-5xl font-bold text-foreground">{userData?.intensidade_dor}</span>
                <span className="text-xl text-muted-foreground">/10</span>
              </div>
            </div>

            {/* Card Sintomas */}
            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 rounded-full bg-rose-blush flex items-center justify-center mb-4">
                <Brain className="w-8 h-8 text-primary" />
              </div>
              <p className="text-muted-foreground text-sm font-medium mb-1">Sintomas Relatados</p>
              <div className="flex items-baseline gap-1">
                <span className="font-display text-5xl font-bold text-foreground">{userData?.sintomas?.length || 0}</span>
                <span className="text-xl text-muted-foreground">tipos</span>
              </div>
            </div>

            {/* Card Impacto Trabalho */}
            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 rounded-full bg-rose-blush flex items-center justify-center mb-4">
                <CalendarDays className="w-8 h-8 text-primary" />
              </div>
              <p className="text-muted-foreground text-sm font-medium mb-1">Horas Mensais Perdidas</p>
              <div className="flex flex-col items-center mt-1">
                <span className="font-display text-3xl font-bold text-foreground">
                  {(userData?.horas_ausencia || 0) + (userData?.horas_presenteismo || 0)}h
                </span>
                <span className="text-xs text-muted-foreground mt-1">Ausência + Presenteísmo</span>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-8 shadow-sm border border-border">
            <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <FileText className="text-primary w-6 h-6" /> Resumo das Suas Respostas
            </h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-border pb-6">
                <div>
                  <h4 className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-1">Status de Diagnóstico</h4>
                  <p className="text-foreground font-medium text-lg">{userData?.diagnostico}</p>
                </div>
                <div>
                  <h4 className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-1">Tratamento Atual</h4>
                  <p className="text-foreground font-medium text-lg">{userData?.tratamento}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-3">Sintomas que afetam você</h4>
                <div className="flex flex-wrap gap-2">
                  {userData?.sintomas?.map((sintoma: string) => (
                    <span key={sintoma} className="bg-rose-pale text-secondary px-3 py-1.5 rounded-lg text-sm font-medium">
                      {sintoma}
                    </span>
                  ))}
                </div>
              </div>

              {userData?.trabalha && (
                <div className="pt-6 border-t border-border">
                  <h4 className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-4">Como a Endometriose impacta seu trabalho</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-muted/50 p-4 rounded-xl">
                      <span className="block text-xs text-muted-foreground mb-1">Nível de Impacto</span>
                      <span className="font-semibold text-foreground">{userData?.impacto_trabalho || "Não informado"}</span>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-xl">
                      <span className="block text-xs text-muted-foreground mb-1">Horas de Ausência</span>
                      <span className="font-semibold text-foreground">{userData?.horas_ausencia || 0} horas/mês</span>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-xl">
                      <span className="block text-xs text-muted-foreground mb-1">Presença Improdutiva</span>
                      <span className="font-semibold text-foreground">{userData?.horas_presenteismo || 0} horas/mês</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-10 pt-6 border-t border-border flex flex-col md:flex-row gap-4 justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Seus dados foram anonimizados e agora fazem parte das estatísticas globais do projeto.
              </p>
              <Button onClick={() => navigate("/")} className="bg-primary hover:bg-rose-dark text-white flex items-center gap-2">
                Ver Gráficos Gerais <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RelatorioIndividual;
