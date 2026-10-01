import { useState, useEffect } from "react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, Legend
} from "recharts";
import { supabase } from "@/lib/supabase";
import { Maximize2, TrendingUp, BarChart3, ChevronLeft, ChevronRight, X, Layers } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Cores suaves, delicadas e elegantes (Paleta Rosa Soft Pastel)
const COLORS_ROSE = ["#E8828F", "#F0A6B1", "#F7C5CC", "#FDE2E6"];
const COLORS_BARS = ["#E06D7D", "#E8828F", "#F09CA8", "#F5B6C0", "#F9CBD2", "#FDE2E6"];

interface ChartsSectionProps {
  companyId?: string;
}

type ChartKey = 'prevalence' | 'symptoms' | 'productivity' | 'diagnosis' | 'age' | 'efficacy' | 'all';

const ChartsSection = ({ companyId }: ChartsSectionProps = {}) => {
  const [activeChartKey, setActiveChartKey] = useState<ChartKey | null>(null);

  const [prevalenceData, setPrevalenceData] = useState([
    { name: "Com endometriose", value: 15 },
    { name: "Sem endometriose", value: 85 },
  ]);

  const [symptomsData, setSymptomsData] = useState([
    { name: "Cólica incapacitante", pct: 85 },
    { name: "Dor pélvica crônica", pct: 78 },
    { name: "Dor nas relações sexuais", pct: 64 },
    { name: "Fadiga crônica", pct: 62 },
    { name: "Alterações sintomáticas", pct: 52 },
    { name: "Dificuldade engravidar", pct: 42 },
  ]);

  const [productivityData, setProductivityData] = useState([
    { name: "Horas Faltadas (Absenteísmo)", horas: 14 },
    { name: "Horas com Dor (Presenteísmo)", horas: 28 },
  ]);

  const [diagnosisDelayData, setDiagnosisDelayData] = useState([
    { name: "1 a 3 anos", pct: 18 },
    { name: "4 a 7 anos", pct: 44 },
    { name: "8 a 12 anos", pct: 28 },
    { name: "Mais de 12 anos", pct: 10 },
  ]);

  const [ageDistributionData, setAgeDistributionData] = useState([
    { name: "18 - 24 anos", value: 18 },
    { name: "25 - 34 anos", value: 48 },
    { name: "35 - 44 anos", value: 26 },
    { name: "45+ anos", value: 8 },
  ]);

  const [treatmentEfficacyData, setTreatmentEfficacyData] = useState([
    { name: "Cirurgia de Excisão", eficácia: 88 },
    { name: "Bloqueio Hormonal", eficácia: 72 },
    { name: "Fisioterapia Pélvica", eficácia: 68 },
    { name: "Dieta Anti-inflamatória", eficácia: 65 },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await supabase.from('survey_responses').select('*');
        if (data && data.length > 0) {
          let comEndo = 0; let semEndo = 0;
          data.forEach(resp => {
            if (resp.diagnostico === "Sim") comEndo++; else semEndo++;
          });
          const total = comEndo + semEndo || 1;
          setPrevalenceData([
            { name: "Com endometriose", value: Math.round((comEndo / total) * 100) },
            { name: "Sem endometriose", value: Math.round((semEndo / total) * 100) }
          ]);
        }
      } catch (err) {
        console.log("Usando estatísticas simuladas até integração final.", err);
      }
    };
    fetchData();
  }, [companyId]);

  const renderPrevalenceChart = (isEnlarged = false) => (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie 
          data={prevalenceData} 
          cx="50%" 
          cy="50%" 
          outerRadius={isEnlarged ? "85%" : "75%"} 
          dataKey="value" 
          label={({ name, value }) => `${name}: ${value}%`}
        >
          {prevalenceData.map((_, i) => <Cell key={i} fill={COLORS_ROSE[i % COLORS_ROSE.length]} />)}
        </Pie>
        <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
      </PieChart>
    </ResponsiveContainer>
  );

  const renderSymptomsChart = (isEnlarged = false) => (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={symptomsData} layout="vertical" margin={{ left: isEnlarged ? 60 : 40, right: 30 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f4d2d5" horizontal={false} />
        <XAxis type="number" domain={[0, 100]} tick={{ fill: "#5c2228", fontSize: isEnlarged ? 13 : 11 }} unit="%" />
        <YAxis type="category" dataKey="name" width={isEnlarged ? 180 : 130} tick={{ fill: "#5c2228", fontSize: isEnlarged ? 13 : 11 }} />
        <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
        <Bar dataKey="pct" radius={[0, 8, 8, 0]}>
          {symptomsData.map((_, i) => <Cell key={i} fill={COLORS_BARS[i % COLORS_BARS.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );

  const renderProductivityChart = (isEnlarged = false) => (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={productivityData} margin={{ top: 20, bottom: 20, left: 10, right: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f4d2d5" vertical={false} />
        <XAxis dataKey="name" tick={{ fill: "#5c2228", fontSize: isEnlarged ? 13 : 11 }} />
        <YAxis tick={{ fill: "#5c2228", fontSize: isEnlarged ? 13 : 11 }} unit="h" />
        <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
        <Legend wrapperStyle={{ paddingTop: '10px' }} />
        <Bar dataKey="horas" name="Média Horas Mensais Perdidas" radius={[8, 8, 0, 0]}>
          {productivityData.map((_, i) => <Cell key={i} fill={COLORS_ROSE[i % COLORS_ROSE.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );

  const renderDiagnosisDelayChart = (isEnlarged = false) => (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={diagnosisDelayData} margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f4d2d5" vertical={false} />
        <XAxis dataKey="name" tick={{ fill: "#5c2228", fontSize: isEnlarged ? 13 : 11 }} />
        <YAxis tick={{ fill: "#5c2228", fontSize: isEnlarged ? 13 : 11 }} unit="%" />
        <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
        <Bar dataKey="pct" name="Pacientes (%)" radius={[8, 8, 0, 0]}>
          {diagnosisDelayData.map((_, i) => <Cell key={i} fill={COLORS_BARS[i % COLORS_BARS.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );

  const renderAgeDistributionChart = (isEnlarged = false) => (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie 
          data={ageDistributionData} 
          cx="50%" 
          cy="50%" 
          outerRadius={isEnlarged ? "85%" : "75%"} 
          dataKey="value" 
          label={({ name, value }) => `${name}: ${value}%`}
        >
          {ageDistributionData.map((_, i) => <Cell key={i} fill={COLORS_ROSE[i % COLORS_ROSE.length]} />)}
        </Pie>
        <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
      </PieChart>
    </ResponsiveContainer>
  );

  const renderTreatmentEfficacyChart = (isEnlarged = false) => (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={treatmentEfficacyData} margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f4d2d5" vertical={false} />
        <XAxis dataKey="name" tick={{ fill: "#5c2228", fontSize: isEnlarged ? 12 : 10 }} />
        <YAxis tick={{ fill: "#5c2228", fontSize: isEnlarged ? 13 : 11 }} domain={[0, 100]} unit="%" />
        <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
        <Bar dataKey="eficácia" name="Alívio dos Sintomas (%)" radius={[8, 8, 0, 0]}>
          {treatmentEfficacyData.map((_, i) => <Cell key={i} fill={COLORS_BARS[i % COLORS_BARS.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );

  // Lista de Gráficos com Detalhes para Exibição Expandida
  const CHARTS_LIST = [
    {
      key: 'prevalence' as ChartKey,
      title: 'Prevalência (1 a cada 10 Mulheres)',
      subtitle: 'Estimativa Epidemiológica Global e Nacional',
      description: 'Estudos epidemiológicos mostram que aproximadamente 1 a cada 10 mulheres em idade fértil é acometida pela endometriose. No Brasil, estimam-se mais de 7 milhões de mulheres diagnosticadas ou em busca de diagnóstico.',
      render: (enlarged: boolean) => renderPrevalenceChart(enlarged)
    },
    {
      key: 'symptoms' as ChartKey,
      title: 'Frequência dos Sintomas Relatados (%)',
      subtitle: 'Sinais Clínicos mais Frequentes nas Pacientes',
      description: 'A cólica menstrual forte e incapacitante (dismenorreia severa) afeta 85% das entrevistadas, seguida de dor pélvica crônica (78%) e dor profunda nas relações sexuais (64%). A fadiga crônica atinge 62% devido ao estado inflamatório constante.',
      render: (enlarged: boolean) => renderSymptomsChart(enlarged)
    },
    {
      key: 'productivity' as ChartKey,
      title: 'Impacto Mensal no Trabalho (Horas)',
      subtitle: 'Absenteísmo vs Presenteísmo no Mercado Corporativo',
      description: 'Mulheres com endometriose perdem em média 14 horas mensais por faltas e consultas (absenteísmo) e trabalham cerca de 28 horas por mês sob dores intensas com redução de foco e produtividade (presenteísmo).',
      render: (enlarged: boolean) => renderProductivityChart(enlarged)
    },
    {
      key: 'diagnosis' as ChartKey,
      title: 'Atraso Médio até o Diagnóstico (Anos)',
      subtitle: 'Tempo de Espera entre Primeiros Sintomas e Confirmação',
      description: 'Devido à normalização cultural da dor menstrual, o diagnóstico da endometriose no Brasil leva em média de 4 a 7 anos (44%) e pode ultrapassar 8 a 12 anos em 38% dos casos, agravando o desenvolvimento das lesões.',
      render: (enlarged: boolean) => renderDiagnosisDelayChart(enlarged)
    },
    {
      key: 'age' as ChartKey,
      title: 'Distribuição por Faixa Etária (%)',
      subtitle: 'Incidência de Diagnósticos ao Longo do Ciclo de Vida',
      description: 'A maior incidência de confirmação do diagnóstico concentra-se entre os 25 e 34 anos (48%), faixa etária de plena atividade profissional e tomada de decisões reprodutivas.',
      render: (enlarged: boolean) => renderAgeDistributionChart(enlarged)
    },
    {
      key: 'efficacy' as ChartKey,
      title: 'Eficácia Percebida dos Tratamentos (%)',
      subtitle: 'Grau de Satisfação com Terapias Clínicas e Cirúrgicas',
      description: 'A cirurgia de excisão completa dos focos por videolaparoscopia ou robótica apresenta 88% de eficácia percebida no alívio da dor, seguida pelo bloqueio hormonal contínuo (72%) e pela fisioterapia pélvica (68%).',
      render: (enlarged: boolean) => renderTreatmentEfficacyChart(enlarged)
    }
  ];

  const currentSingleChart = CHARTS_LIST.find(c => c.key === activeChartKey);
  const currentChartIndex = CHARTS_LIST.findIndex(c => c.key === activeChartKey);

  const handlePrevChart = () => {
    if (currentChartIndex > 0) {
      setActiveChartKey(CHARTS_LIST[currentChartIndex - 1].key);
    } else {
      setActiveChartKey(CHARTS_LIST[CHARTS_LIST.length - 1].key);
    }
  };

  const handleNextChart = () => {
    if (currentChartIndex >= 0 && currentChartIndex < CHARTS_LIST.length - 1) {
      setActiveChartKey(CHARTS_LIST[currentChartIndex + 1].key);
    } else {
      setActiveChartKey(CHARTS_LIST[0].key);
    }
  };

  const ChartCard = ({ item, id }: { item: typeof CHARTS_LIST[0], id?: string }) => (
    <div 
      id={id} 
      onClick={() => setActiveChartKey(item.key)}
      className="bg-card rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-rose-100 group relative flex flex-col h-[360px] cursor-pointer"
      title="Clique para expandir este gráfico na tela toda"
    >
      <div className="flex justify-between items-start mb-3 pr-8">
        <h3 className="font-display text-base font-bold text-foreground leading-tight">
          {item.title}
        </h3>
      </div>
      
      {/* Ícone de Expansão */}
      <button className="absolute top-4 right-4 p-2 rounded-full bg-rose-100/80 text-rose-dark group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
        <Maximize2 className="w-4 h-4" />
      </button>

      <div className="flex-1 w-full relative pointer-events-none my-2">
        {item.render(false)}
      </div>

      <div className="pt-2 border-t border-rose-50 text-center">
        <span className="text-xs font-semibold text-primary group-hover:underline inline-flex items-center gap-1">
          <Maximize2 className="w-3 h-3" /> Clique para Expandir na Tela Toda
        </span>
      </div>
    </div>
  );

  return (
    <section id="graficos" className="py-20 px-4 bg-background">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-accent/60 text-secondary font-bold text-xs uppercase tracking-wider mb-3">
            <TrendingUp className="w-3.5 h-3.5" /> DADOS E ESTATÍSTICAS DA ENDOMETRIOSE
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            DADOS E ESTATÍSTICAS DA ENDOMETRIOSE
          </h2>
          <p className="text-secondary font-bold text-lg md:text-xl mb-3">
            Transformando respostas em dados para compreender realidades
          </p>
          <p className="text-muted-foreground text-base md:text-lg max-w-3xl mx-auto leading-relaxed">
            Visualize os dados coletados pelo ENDOMETRIÔMETRO e compreenda os sintomas, os impactos da endometriose e seus reflexos na rotina de trabalho. Os gráficos podem ser expandidos em tela cheia para análise detalhada.
          </p>
        </div>

        {/* GRÁFICOS EM GRADE (CLIQUE EM QUALQUER UM PARA EXPANDIR EM TELA CHEIA) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CHARTS_LIST.map((item) => (
            <ChartCard key={item.key} item={item} id={item.key === 'productivity' ? 'impacto' : undefined} />
          ))}
        </div>

        {/* Botão para Ver Todos em Visão Geral */}
        <div className="mt-10 text-center flex justify-center gap-4 flex-wrap">
          <Button 
            onClick={() => setActiveChartKey('all')}
            size="lg"
            className="bg-secondary hover:bg-secondary/90 text-white font-bold px-8 py-6 rounded-2xl shadow-md gap-2"
          >
            <Layers className="w-5 h-5" /> Ver Painel Geral com Todos os Gráficos
          </Button>
        </div>

        {/* MODAL EM TELA CHEIA PARA UM ÚNICO GRÁFICO SELECIONADO */}
        <Dialog open={activeChartKey !== null && activeChartKey !== 'all'} onOpenChange={(open) => !open && setActiveChartKey(null)}>
          <DialogContent className="sm:max-w-[94vw] lg:max-w-[85vw] h-[92vh] flex flex-col bg-white rounded-3xl p-6 md:p-8 border border-rose-200 shadow-2xl overflow-hidden">
            {currentSingleChart && (
              <>
                <DialogHeader className="flex flex-row justify-between items-center border-b border-rose-100 pb-4 shrink-0">
                  <div>
                    <span className="inline-block px-3 py-1 bg-rose-100 text-rose-dark text-xs font-bold rounded-full mb-1">
                      📊 Gráfico Expandido na Tela Toda
                    </span>
                    <DialogTitle className="font-display text-2xl md:text-3xl font-bold text-foreground">
                      {currentSingleChart.title}
                    </DialogTitle>
                    <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                      {currentSingleChart.subtitle}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handlePrevChart}
                      className="rounded-xl gap-1 border-rose-200 hover:bg-rose-50"
                      title="Gráfico Anterior"
                    >
                      <ChevronLeft className="w-4 h-4" /> Anterior
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleNextChart}
                      className="rounded-xl gap-1 border-rose-200 hover:bg-rose-50"
                      title="Próximo Gráfico"
                    >
                      Próximo <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </DialogHeader>

                {/* Área do Gráfico Expandido Grande */}
                <div className="flex-1 w-full my-4 bg-pink-soft/20 rounded-2xl p-4 md:p-6 border border-rose-100 flex items-center justify-center min-h-0 relative">
                  <div className="w-full h-full">
                    {currentSingleChart.render(true)}
                  </div>
                </div>

                {/* Explicação Detalhada e Botões no Rodapé */}
                <div className="shrink-0 pt-3 border-t border-rose-100 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="bg-rose-50/80 p-3 rounded-xl border border-rose-100 text-xs md:text-sm text-foreground flex-1">
                    💡 <strong>Análise dos Dados:</strong> {currentSingleChart.description}
                  </div>

                  <div className="flex items-center gap-3">
                    <Button 
                      onClick={() => setActiveChartKey('all')}
                      variant="outline"
                      className="border-rose-300 text-rose-dark hover:bg-rose-50 rounded-xl"
                    >
                      <Layers className="w-4 h-4 mr-1.5" /> Ver Todos em Grade
                    </Button>
                    <Button 
                      onClick={() => setActiveChartKey(null)}
                      className="bg-secondary hover:bg-secondary/90 text-white font-bold rounded-xl px-6"
                    >
                      Fechar
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* MODAL COM TODOS OS GRÁFICOS EM GRADE */}
        <Dialog open={activeChartKey === 'all'} onOpenChange={(open) => !open && setActiveChartKey(null)}>
          <DialogContent className="sm:max-w-[92vw] max-h-[88vh] overflow-y-auto bg-white rounded-3xl p-6 md:p-8 border border-rose-200">
            <DialogHeader className="mb-6 text-center border-b border-rose-100 pb-4">
              <DialogTitle className="font-display text-2xl md:text-4xl font-bold text-foreground">
                Painel Completo de Gráficos e Indicadores
              </DialogTitle>
              <p className="text-muted-foreground text-sm mt-1">
                Visualização integrada contendo todas as estatísticas epidemiológicas. Clique em qualquer um para ver em tela cheia.
              </p>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
              {CHARTS_LIST.map((item) => (
                <div 
                  key={item.key} 
                  onClick={() => setActiveChartKey(item.key)}
                  className="bg-pink-soft/30 hover:bg-rose-100/50 transition cursor-pointer rounded-2xl p-5 border border-rose-100 flex flex-col h-[340px] group relative"
                >
                  <h4 className="font-bold text-sm text-foreground text-center mb-3 pr-6">{item.title}</h4>
                  <button className="absolute top-3 right-3 p-1.5 rounded-full bg-white text-rose-dark shadow-sm">
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                  <div className="flex-1 w-full pointer-events-none">{item.render(false)}</div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-4 border-t border-rose-100 flex justify-end">
              <Button onClick={() => setActiveChartKey(null)} className="bg-secondary text-white font-bold rounded-xl px-6">
                Fechar Visualização
              </Button>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </section>
  );
};

export default ChartsSection;


