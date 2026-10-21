import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { AlertCircle, Download, FileText, ArrowRight, Activity, CalendarDays, Brain, Loader2, CheckCircle2 } from "lucide-react";
import { gerarRelatorioIndividual } from "@/lib/relatorio-pdf/gerarPDF";

export const SINTOMAS_DETALHADOS = [
  { id: "colica_intensa", label: "Cólicas menstruais muito intensas que impedem atividades normais", peso: 3, categoria: "Dor Menstrual" },
  { id: "dor_relacao", label: "Dor profunda durante ou após relações sexuais (dispareunia)", peso: 3, categoria: "Sexualidade" },
  { id: "dor_pelvica_cronica", label: "Dor pélvica ou abdominal contínua mesmo fora da menstruação", peso: 2, categoria: "Dor Crônica" },
  { id: "dor_intestino", label: "Dor ao evacuar, diarreia, constipação ou distensão abdominal no período menstrual", peso: 2, categoria: "Intestinal" },
  { id: "dor_xixi", label: "Dor, ardência ou sangramento ao urinar durante a menstruação", peso: 2, categoria: "Urinário" },
  { id: "historico_familiar", label: "Mãe, irmã ou parente de 1º grau diagnosticada com endometriose", peso: 2, categoria: "Genético" },
  { id: "dificuldade_engravidar", label: "Dificuldade para engravidar há mais de 6 a 12 meses", peso: 2, categoria: "Fertilidade" },
  { id: "dor_lombar_pernas", label: "Dor na região lombar ou irradiada para as pernas no período menstrual", peso: 2, categoria: "Nervos / Lombar" },
  { id: "uso_analgesicos", label: "Necessidade de tomar analgésicos fortes ou injeções frequentemente para conter a dor", peso: 2, categoria: "Medicação" },
  { id: "historico_cistos", label: "Histórico de cistos ovarianos, miomas ou cirurgias pélvicas prévias", peso: 1, categoria: "Histórico Pélvico" },
  { id: "fadiga_extrema", label: "Fadiga crônica, exaustão física e tonturas sem causa aparente", peso: 1, categoria: "Sistêmico" },
  { id: "ansiedade_dor", label: "Ansiedade, estresse ou impacto emocional devido às dores crônicas", peso: 1, categoria: "Emocional" },
];

const RelatorioIndividual = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [gerandoPdf, setGerandoPdf] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const fetchLastResponse = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate("/login");
          return;
        }

        // Busca a última resposta da participante
        const { data, error } = await supabase
          .from("survey_responses")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (error || !data) {
          navigate("/pesquisa");
          return;
        }

        // Os dados ficam dentro do campo JSONB "responses"
        setUserData(data.responses || data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchLastResponse();
  }, [navigate]);

  const resultado = userData?.resultado || "";
  const sintomas: string[] = userData?.sintomas || [];
  const intensidadeDor = userData?.intensidadeDor ?? userData?.intensidade_dor ?? "—";
  const horasAusencia = userData?.horasAusencia ?? userData?.horas_ausencia ?? 0;
  const diasAtestado = userData?.diasAtestado ?? userData?.dias_atestado ?? 0;

  const handleBaixarPdf = async () => {
    setGerandoPdf(true);
    try {
      await gerarRelatorioIndividual({
        resultado: resultado,
        sintomas: sintomas,
        intensidadeDor: intensidadeDor,
        horasAusencia: horasAusencia,
        diasAtestado: diasAtestado,
        trabalha: userData?.trabalha,
        impactoTrabalho: userData?.impactoTrabalho,
        diagnostico: userData?.diagnostico,
        idade: userData?.idade,
        cidade: userData?.cidade,
        bairro: userData?.bairro,
        uf: userData?.uf,
        dataEmissao: new Date().toLocaleDateString("pt-BR"),
        temDadoTeste: false,
      });
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
    } finally {
      setGerandoPdf(false);
    }
  };

  const getResultadoStyle = (resultado: string) => {
    if (!resultado) return { cor: "text-muted-foreground bg-muted border-border", badge: "bg-muted text-foreground" };
    if (resultado.includes("Alta")) return { cor: "text-rose-800 bg-rose-50 border-rose-200", badge: "bg-rose-700 text-white" };
    if (resultado.includes("Moderada")) return { cor: "text-amber-800 bg-amber-50 border-amber-200", badge: "bg-amber-700 text-white" };
    return { cor: "text-emerald-800 bg-emerald-50 border-emerald-200", badge: "bg-emerald-700 text-white" };
  };

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

  const estilos = getResultadoStyle(resultado);
  const localidade = userData?.localidade || [userData?.cidade, userData?.bairro, userData?.uf].filter(Boolean).join(", ") || "—";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-12 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-96 bg-gradient-to-b from-rose-pale to-transparent z-0 pointer-events-none"></div>

        <div className="container mx-auto max-w-4xl relative z-10">

          {/* Ações */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">Seu Relatório Pessoal</h1>
              <p className="text-muted-foreground mt-1">Baseado nas suas respostas do questionário.</p>
            </div>
            <Button
              onClick={handleBaixarPdf}
              disabled={gerandoPdf}
              className="flex items-center gap-2 bg-primary hover:bg-rose-dark text-white font-bold shadow-md"
            >
              {gerandoPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {gerandoPdf ? "Gerando PDF..." : "Baixar PDF"}
            </Button>
          </div>

          {/* CONTEÚDO DO RELATÓRIO (capturado pelo html2canvas) */}
          <div ref={reportRef} className="bg-white rounded-3xl p-8 shadow-sm border border-rose-100 space-y-8">

            {/* Cabeçalho do PDF */}
            <div className="flex flex-col md:flex-row justify-between items-start border-b border-rose-100 pb-6 gap-2">
              <div>
                <span className="text-xs font-bold text-secondary uppercase tracking-wider block">ENDOMETRIÔMETRO</span>
                <h2 className="font-display text-2xl font-bold text-foreground">Relatório Individual de Triagem</h2>
              </div>
              <div className="text-xs text-muted-foreground text-right">
                <p><strong>Emissão:</strong> {new Date().toLocaleDateString("pt-BR")}</p>
                <p><strong>Participante:</strong> {userEmail}</p>
                {localidade !== "—" && <p><strong>Localidade:</strong> {localidade}</p>}
              </div>
            </div>

            {/* Aviso médico */}
            <div className="bg-amber-50 border-l-4 border-amber-500 p-5 rounded-r-xl flex gap-4 items-start">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-amber-700 text-sm leading-relaxed">
                <strong>Aviso Importante:</strong> Este relatório é um espelho das informações que você forneceu e <strong>NÃO substitui diagnóstico ou aconselhamento médico</strong>. A endometriose só pode ser diagnosticada por médicos especialistas.
              </p>
            </div>

            {/* Resultado da triagem */}
            {resultado && (
              <div className={`p-6 rounded-2xl border-2 ${estilos.cor}`}>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide mb-2 ${estilos.badge}`}>
                  Resultado da Triagem
                </span>
                <h3 className="font-display text-xl font-bold">{resultado}</h3>
              </div>
            )}

            {/* Cards de métricas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-rose-50 rounded-2xl p-5 flex flex-col items-center text-center border border-rose-100">
                <Activity className="w-7 h-7 text-primary mb-2" />
                <p className="text-muted-foreground text-xs font-medium mb-1">Intensidade Média da Dor</p>
                <span className="font-display text-4xl font-bold text-foreground">{intensidadeDor}</span>
                <span className="text-muted-foreground text-sm">/10</span>
              </div>

              <div className="bg-rose-50 rounded-2xl p-5 flex flex-col items-center text-center border border-rose-100">
                <Brain className="w-7 h-7 text-primary mb-2" />
                <p className="text-muted-foreground text-xs font-medium mb-1">Sintomas Relatados</p>
                <span className="font-display text-4xl font-bold text-foreground">{sintomas.length}</span>
                <span className="text-muted-foreground text-sm">tipos</span>
              </div>

              <div className="bg-rose-50 rounded-2xl p-5 flex flex-col items-center text-center border border-rose-100">
                <CalendarDays className="w-7 h-7 text-primary mb-2" />
                <p className="text-muted-foreground text-xs font-medium mb-1">Horas/mês Afastada</p>
                <span className="font-display text-4xl font-bold text-foreground">{horasAusencia}h</span>
                <span className="text-muted-foreground text-sm">{diasAtestado} dias de atestado/ano</span>
              </div>
            </div>

            {/* Sintomas e Situações Relatadas no Questionário */}
            <div>
              <div className="flex items-center justify-between mb-3 border-b border-rose-100 pb-2">
                <h4 className="text-sm text-foreground uppercase tracking-wider font-bold flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" /> Sintomas e Situações Relatadas no Questionário
                </h4>
                <span className="text-xs font-bold text-secondary bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                  {sintomas.length} {sintomas.length === 1 ? "sintoma relatado" : "sintomas relatados"}
                </span>
              </div>

              {sintomas.length === 0 ? (
                <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-100 text-xs text-muted-foreground italic">
                  Nenhum sintoma específico foi assinalado no questionário de triagem.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {sintomas.map((sId: string, idx: number) => {
                    const item = SINTOMAS_DETALHADOS.find(x => x.id === sId) || {
                      id: sId,
                      label: sId.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
                      peso: 1,
                      categoria: "Sintoma Relatado"
                    };

                    const isHighImpact = item.peso >= 3;
                    const isMediumImpact = item.peso === 2;

                    return (
                      <div 
                        key={sId || idx}
                        className="flex items-start gap-3 p-3.5 rounded-2xl bg-pink-soft/40 border border-rose-200/80 hover:bg-rose-50/70 transition-colors"
                      >
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          isHighImpact ? "bg-rose-700 text-white" : isMediumImpact ? "bg-primary text-white" : "bg-rose-200 text-secondary"
                        }`}>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-xs md:text-sm text-foreground leading-snug">
                            {item.label}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white border border-rose-200 text-secondary">
                              {item.categoria}
                            </span>
                            {isHighImpact && (
                              <span className="text-[10px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-md">
                                Critério Clínico de Maior Relevância
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Impacto no trabalho */}
            {userData?.trabalha === "Sim" && (
              <div className="pt-4 border-t border-rose-100">
                <h4 className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-4">Impacto no Trabalho</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-muted/50 p-4 rounded-xl">
                    <span className="block text-xs text-muted-foreground mb-1">Nível de Impacto</span>
                    <span className="font-semibold text-foreground">{userData?.impactoTrabalho || userData?.impacto_trabalho || "Não informado"}</span>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-xl">
                    <span className="block text-xs text-muted-foreground mb-1">Horas de Ausência/mês</span>
                    <span className="font-semibold text-foreground">{horasAusencia} horas</span>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-xl">
                    <span className="block text-xs text-muted-foreground mb-1">Dias de Atestado/ano</span>
                    <span className="font-semibold text-foreground">{diasAtestado} dias</span>
                  </div>
                </div>
              </div>
            )}

            {/* Rodapé do documento */}
            <div className="pt-6 border-t border-rose-100 text-xs text-muted-foreground text-center space-y-1">
              <p>Este documento foi gerado automaticamente pelo sistema <strong>ENDOMETRIÔMETRO</strong>.</p>
              <p>Os dados são de uso exclusivo da participante e não identificam terceiros. Proteção LGPD aplicada.</p>
            </div>
          </div>

          {/* Botão de navegação */}
          <div className="mt-8 flex justify-end">
            <Button onClick={() => navigate("/")} className="bg-primary hover:bg-rose-dark text-white flex items-center gap-2">
              Ver Gráficos Gerais <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RelatorioIndividual;
