import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { AlertCircle, Download, FileText, ArrowRight, Activity, CalendarDays, Brain, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const RelatorioIndividual = () => {
  const navigate = useNavigate();
  const reportRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [gerandoPdf, setGerandoPdf] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const fetchLastResponse = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate("/login");
          return;
        }

        setUserEmail(user.email || "");

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

  const handleBaixarPdf = async () => {
    if (!reportRef.current) return;
    setGerandoPdf(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#fff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = pdfWidth / imgWidth;
      const scaledHeight = imgHeight * ratio;

      let yPosition = 0;
      while (yPosition < scaledHeight) {
        if (yPosition > 0) pdf.addPage();
        pdf.addImage(
          imgData, "PNG",
          0, -yPosition,
          pdfWidth, scaledHeight
        );
        yPosition += pdfHeight;
      }

      const dataEmissao = new Date().toLocaleDateString("pt-BR").replace(/\//g, "-");
      pdf.save(`Relatorio_Individual_Endometriometro_${dataEmissao}.pdf`);
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

  const resultado = userData?.resultado || "";
  const estilos = getResultadoStyle(resultado);
  const sintomas: string[] = userData?.sintomas || [];
  const intensidadeDor = userData?.intensidadeDor ?? userData?.intensidade_dor ?? "—";
  const horasAusencia = userData?.horasAusencia ?? userData?.horas_ausencia ?? 0;
  const diasAtestado = userData?.diasAtestado ?? userData?.dias_atestado ?? 0;
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

            {/* Sintomas */}
            {sintomas.length > 0 && (
              <div>
                <h4 className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Sintomas que você relatou
                </h4>
                <div className="flex flex-wrap gap-2">
                  {sintomas.map((s: string) => (
                    <span key={s} className="bg-rose-50 text-secondary px-3 py-1.5 rounded-lg text-sm font-medium border border-rose-100">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

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
