import { useState } from "react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, Legend
} from "recharts";
import { Maximize2, ChevronLeft, ChevronRight, AlertCircle, RefreshCw, Loader2, FlaskConical } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useIndicadores } from "@/hooks/useIndicadores";
import PanoramaSection from "@/components/PanoramaSection";

// Cores suaves, delicadas e elegantes (Paleta Rosa Soft Pastel)
const PALETTE = {
  dark:   "#7B2D40",
  medium: "#C96B82",
  light:  "#E8A0B0",
  pale:   "#F5CDD6",
  nude:   "#F0E4E0",
};

const COLORS_ROSE = ["#E8828F", "#F0A6B1", "#F7C5CC", "#FDE2E6"];
const COLORS_BARS = ["#E06D7D", "#E8828F", "#F09CA8", "#F5B6C0", "#F9CBD2", "#FDE2E6"];

const SINTOMAS_MAP: Record<string, string> = {
  "colica_intensa": "Cólica incapacitante",
  "dor_relacao": "Dor na relação sexual",
  "dor_pelvica_cronica": "Dor pélvica crônica",
  "dor_intestino": "Dor intestinal",
  "dor_xixi": "Dor ao urinar",
  "historico_familiar": "Histórico familiar",
  "dificuldade_engravidar": "Dif. p/ engravidar",
  "dor_lombar_pernas": "Dor lombar/pernas",
  "uso_analgesicos": "Uso de analgésicos fortes",
  "historico_cistos": "Histórico de cistos",
  "fadiga_extrema": "Fadiga crônica",
  "ansiedade_dor": "Ansiedade pela dor"
};

interface ChartsSectionProps {
  companyId?: string;
}

type ChartKey = 'prevalence' | 'symptoms' | 'productivity';

const ChartsSection = ({ companyId }: ChartsSectionProps = {}) => {
  const escopo = companyId ? 'pesquisa' : 'geral';
  const { data, isLoading, isError, error, refetch, isRefetching } = useIndicadores(escopo, companyId);
  const [isAgeModalOpen, setIsAgeModalOpen] = useState(false);
  const [activeChartKey, setActiveChartKey] = useState<ChartKey | null>(null);

  if (isError) {
    return (
      <section id="graficos" className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-6xl text-center">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Erro ao carregar gráficos</h2>
          <p className="text-muted-foreground mb-2">Não foi possível conectar ao banco de dados.</p>
          {import.meta.env.DEV && error && (
            <pre className="text-xs text-left bg-rose-950 text-rose-200 p-4 rounded-lg mb-4 max-w-2xl mx-auto overflow-auto">
              {String((error as Error)?.message || error)}
            </pre>
          )}
          <Button onClick={() => refetch()} className="bg-secondary text-white">Tentar Novamente</Button>
        </div>
      </section>
    );
  }

  const chartDataIdade = data?.idade || [];

  const renderInsufficientData = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-6 border-2 border-dashed border-rose-200 rounded-xl bg-rose-50/50">
      <AlertCircle className="w-8 h-8 text-rose-400 mb-3" />
      <p className="text-sm font-medium text-rose-800">
        Ainda não há respostas suficientes para exibir este indicador (mínimo de 5).
      </p>
    </div>
  );

  const renderPrevalenceChart = (isEnlarged = false) => {
    if (!data?.suficiente) return renderInsufficientData();
    const chartData = data.prevalencia || [];
    const total = chartData.reduce((acc, curr) => acc + curr.value, 0);
    const diag = chartData.find(d => d.name.toLowerCase().includes('diagnóstico formal'))?.value || 0;
    const pct = total > 0 ? Math.round((diag / total) * 100) : 0;

    return (
      <div className="w-full h-full flex flex-col items-center">
        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={isEnlarged ? "60%" : "60%"}
                outerRadius={isEnlarged ? "80%" : "85%"}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((d, i) => (
                  <Cell key={i} fill={d.name.toLowerCase().includes('diagnóstico') ? PALETTE.dark : PALETTE.pale} />
                ))}
              </Pie>
              <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central">
                <tspan x="50%" dy="-0.2em" fontSize={isEnlarged ? "36" : "28"} fontWeight="bold" fill={PALETTE.dark}>
                  {pct}%
                </tspan>
                <tspan x="50%" dy="1.5em" fontSize={isEnlarged ? "14" : "11"} fill={PALETTE.medium}>
                  diagnóstico
                </tspan>
              </text>
              <RechartsTooltip contentStyle={{ borderRadius: "10px", border: "none" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-4 mt-1 shrink-0 pb-1">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: PALETTE.dark }}></span>
            <span className="text-[10px] sm:text-xs text-foreground">Com diagnóstico</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: PALETTE.pale }}></span>
            <span className="text-[10px] sm:text-xs text-foreground">S/ diagnóstico</span>
          </div>
        </div>
      </div>
    );
  };

  const renderSymptomsChart = (isEnlarged = false) => {
    if (!data?.suficiente) return renderInsufficientData();
    const chartData = (data.sintomas || []).map(s => ({
      name: SINTOMAS_MAP[s.name] || s.name,
      pct: Math.round((s.total / data.total_concluidas) * 100)
    }));
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ left: isEnlarged ? 130 : 100, right: 30 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f4d2d5" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} tick={{ fill: "#5c2228", fontSize: isEnlarged ? 13 : 11 }} unit="%" />
          <YAxis type="category" dataKey="name" width={isEnlarged ? 180 : 140} tick={{ fill: "#5c2228", fontSize: isEnlarged ? 12 : 10 }} />
          <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none' }} formatter={(val) => [`${val}%`, 'Incidência']} />
          <Bar dataKey="pct" radius={[0, 4, 4, 0]} barSize={isEnlarged ? 24 : 16} label={{ position: 'right', fill: PALETTE.dark, fontSize: isEnlarged ? 12 : 10, formatter: (val: number) => `${val}%` }}>
            {chartData.map((_, i) => <Cell key={i} fill={PALETTE.medium} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderProductivityChart = (isEnlarged = false) => {
    if (!data?.suficiente) return renderInsufficientData();
    const chartData = data.produtividade || [];
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, bottom: isEnlarged ? 20 : 40, left: 10, right: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f4d2d5" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: "#5c2228", fontSize: isEnlarged ? 12 : 10 }}
            interval={0}
            angle={isEnlarged ? 0 : -15}
            textAnchor={isEnlarged ? "middle" : "end"}
          />
          <YAxis tick={{ fill: "#5c2228", fontSize: isEnlarged ? 13 : 11 }} />
          <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none' }} formatter={(val) => [`${val}`, 'Média']} />
          <Bar dataKey="valor" name="Média Reportada" radius={[8, 8, 0, 0]} barSize={isEnlarged ? 60 : 40} label={{ position: 'top', fill: PALETTE.dark, fontSize: isEnlarged ? 14 : 12, fontWeight: 'bold' }}>
            {chartData.map((_, i) => <Cell key={i} fill={PALETTE.light} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const CHARTS_LIST = [
    {
      key: 'prevalence' as ChartKey,
      title: 'Prevalência de Diagnóstico',
      subtitle: 'Composição das Participantes',
      description: 'Percentual de mulheres com diagnóstico formal de endometriose em comparação com as que não têm ou estão em investigação.',
      render: (enlarged: boolean) => renderPrevalenceChart(enlarged)
    },
    {
      key: 'symptoms' as ChartKey,
      title: 'Frequência dos Sintomas (%)',
      subtitle: 'Sinais Clínicos mais Frequentes',
      description: 'Porcentagem de participantes que assinalaram cada sintoma ou situação clínica listada no formulário de triagem.',
      render: (enlarged: boolean) => renderSymptomsChart(enlarged)
    },
    {
      key: 'productivity' as ChartKey,
      title: 'Impacto Médio no Trabalho',
      subtitle: 'Presenteísmo vs Absenteísmo',
      description: 'Média de horas mensais trabalhando com dor (Presenteísmo) e média de dias de atestado médico por dores no ano (Absenteísmo).',
      render: (enlarged: boolean) => renderProductivityChart(enlarged)
    },
  ];

  const currentSingleChart = CHARTS_LIST.find(c => c.key === activeChartKey);
  const currentChartIndex = CHARTS_LIST.findIndex(c => c.key === activeChartKey);

  const handlePrevChart = () => setActiveChartKey(CHARTS_LIST[currentChartIndex > 0 ? currentChartIndex - 1 : CHARTS_LIST.length - 1].key);
  const handleNextChart = () => setActiveChartKey(CHARTS_LIST[currentChartIndex < CHARTS_LIST.length - 1 ? currentChartIndex + 1 : 0].key);

  return (
    <section id="graficos" className="py-20 px-4 bg-background pb-32">
      <div className="container mx-auto max-w-6xl">
        
        {/* Cabeçalho da Seção */}
        <div className="text-center mb-6 relative">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-1">
            DADOS E ESTATÍSTICAS DA ENDOMETRIOSE
          </h2>
          <p className="font-display text-foreground font-semibold text-lg md:text-xl mb-0">
            Transformando respostas em dados para compreender realidades
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground font-medium">Carregando painel de estatísticas...</p>
          </div>
        ) : (
          <>
            {/* PANORAMA: Cards K1-K6 + Donuts D1-D5 + Filtros B1/B2 */}
            <PanoramaSection companyId={companyId} />

            {/* 3 Gráficos principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {CHARTS_LIST.map((item) => (
                <div key={item.key} onClick={() => setActiveChartKey(item.key)} className="bg-white rounded-2xl p-5 shadow-sm border border-rose-100 flex flex-col h-[340px] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative">
                  <div className="flex justify-between items-start mb-2 pr-8">
                    <div>
                      <h3 className="font-display text-sm md:text-base font-bold text-foreground leading-tight">{item.title}</h3>
                      <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                    </div>
                  </div>
                  <button className="absolute top-4 right-4 p-2 rounded-full bg-rose-500/80 text-white group-hover:bg-primary transition-all shadow-sm">
                    <Maximize2 className="w-4 h-4" />
                  </button>
                  <div className="flex-1 w-full relative pointer-events-none mb-2">
                    {item.render(false)}
                  </div>
                  <div className="pt-2 text-center border-t border-rose-50/50 mt-1">
                    <p className="text-[10px] text-muted-foreground italic mb-0">
                      {item.key === 'prevalence' ? 'Valores referem-se à proporção da amostra.' : item.key === 'symptoms' ? 'Sintomas relatados não equivalem a diagnóstico.' : 'Médias baseadas nas respostas válidas.'}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Distribuição por Faixa Etária — estilo moderno igual ao de empresa */}
            {data?.suficiente && chartDataIdade.length > 0 && (
              <div className="mb-16 max-w-2xl mx-auto">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-rose-100 hover:shadow-md transition-shadow group relative">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pr-10">
                    <div>
                      <h3 className="font-bold text-sm text-foreground">Distribuição Geral — Por Faixa Etária</h3>
                      <p className="text-xs text-muted-foreground">Idades de todas as participantes pesquisadas.</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsAgeModalOpen(true)}
                    className="absolute top-4 right-4 p-2 rounded-full bg-rose-100/80 text-rose-dark group-hover:bg-primary group-hover:text-white transition-all shadow-sm"
                    aria-label="Expandir gráfico"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>

                  <div style={{ height: 220 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartDataIdade} margin={{ top: 10, left: -10, right: 10, bottom: 30 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#fde4e8" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: PALETTE.dark }} angle={-30} textAnchor="end" interval={0} />
                        <YAxis tick={{ fontSize: 11, fill: PALETTE.dark }} />
                        <RechartsTooltip contentStyle={{ borderRadius: "10px", border: "none" }} formatter={(val) => [`${val} pessoas`, "Quantidade"]} />
                        <Bar dataKey="value" fill={PALETTE.medium} radius={[4, 4, 0, 0]} name="Participantes" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* SELOS E BOTÕES */}
            <div className="flex flex-col items-center justify-center gap-4 mb-8">
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-sm">
                <span className="px-4 py-2 bg-rose-50 text-rose-800 font-bold rounded-lg border border-rose-100">
                  n = {data?.total_concluidas || 0} respostas válidas
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => refetch()} 
                  disabled={isRefetching || isLoading}
                  className="rounded-lg gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} /> 
                  {isRefetching ? 'Atualizando...' : 'Atualizar Dados'}
                </Button>
                {data?.atualizado_em && (
                  <span className="text-muted-foreground text-xs font-medium">
                    Última atualização: {new Date(data.atualizado_em).toLocaleTimeString()}
                  </span>
                )}
              </div>
              
              {data?.incluiu_teste && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 border-2 border-amber-300 text-amber-800 font-bold text-sm">
                  <FlaskConical className="w-4 h-4" />
                  Dados de teste incluídos — não representam respostas reais
                </div>
              )}
            </div>

            {/* Modal: Gráficos Principais */}
            <Dialog open={activeChartKey !== null} onOpenChange={(open) => !open && setActiveChartKey(null)}>
              <DialogContent className="sm:max-w-[94vw] lg:max-w-[85vw] h-[92vh] flex flex-col bg-white rounded-3xl p-6 md:p-8 border border-rose-200 shadow-2xl overflow-hidden pointer-events-auto">
                {currentSingleChart && (
                  <>
                    <DialogHeader className="flex flex-row justify-between items-center border-b border-rose-100 pb-4 shrink-0">
                      <div>
                        <span className="inline-block px-3 py-1 bg-rose-100 text-rose-dark text-xs font-bold rounded-full mb-1">📊 Gráfico Expandido na Tela Toda</span>
                        <DialogTitle className="font-display text-2xl md:text-3xl font-bold text-foreground">{currentSingleChart.title}</DialogTitle>
                        <p className="text-xs md:text-sm text-muted-foreground mt-0.5">{currentSingleChart.subtitle}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handlePrevChart} className="rounded-xl gap-1 border-rose-200 hover:bg-rose-50"><ChevronLeft className="w-4 h-4" /> Anterior</Button>
                        <Button variant="outline" size="sm" onClick={handleNextChart} className="rounded-xl gap-1 border-rose-200 hover:bg-rose-50">Próximo <ChevronRight className="w-4 h-4" /></Button>
                      </div>
                    </DialogHeader>
                    <div className="flex-1 w-full my-4 bg-pink-soft/20 rounded-2xl p-4 md:p-6 border border-rose-100 flex items-center justify-center min-h-0">
                      <div className="w-full h-full">{currentSingleChart.render(true)}</div>
                    </div>
                    <div className="shrink-0 pt-3 border-t border-rose-100 flex flex-col md:flex-row justify-between items-center gap-4">
                      <div className="bg-rose-50/80 p-3 rounded-xl border border-rose-100 text-xs md:text-sm text-foreground flex-1">💡 <strong>Análise dos Dados:</strong> {currentSingleChart.description}</div>
                      <Button onClick={() => setActiveChartKey(null)} className="bg-secondary hover:bg-secondary/90 text-white font-bold rounded-xl px-6">Fechar</Button>
                    </div>
                  </>
                )}
              </DialogContent>
            </Dialog>

            {/* Modal: Faixa Etária */}
            <Dialog open={isAgeModalOpen} onOpenChange={setIsAgeModalOpen}>
              <DialogContent className="sm:max-w-[94vw] lg:max-w-[85vw] h-[92vh] flex flex-col bg-white rounded-3xl p-6 md:p-8 border border-rose-200 shadow-2xl overflow-hidden pointer-events-auto">
                <DialogHeader className="flex flex-row justify-between items-center border-b border-rose-100 pb-4 shrink-0">
                  <div>
                    <span className="inline-block px-3 py-1 bg-rose-100 text-rose-dark text-xs font-bold rounded-full mb-1">📊 Gráfico Expandido na Tela Toda</span>
                    <DialogTitle className="font-display text-2xl md:text-3xl font-bold text-foreground">Distribuição Geral — Por Faixa Etária</DialogTitle>
                  </div>
                </DialogHeader>
                <div className="flex-1 w-full my-4 bg-pink-soft/20 rounded-2xl p-4 md:p-6 border border-rose-100 flex items-center justify-center min-h-0">
                  <div className="w-full h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartDataIdade} margin={{ top: 10, left: -10, right: 10, bottom: 30 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#fde4e8" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: PALETTE.dark }} angle={-30} textAnchor="end" interval={0} />
                        <YAxis tick={{ fontSize: 11, fill: PALETTE.dark }} />
                        <RechartsTooltip contentStyle={{ borderRadius: "10px", border: "none" }} formatter={(val) => [`${val} pessoas`, "Quantidade"]} />
                        <Bar dataKey="value" fill={PALETTE.medium} radius={[4, 4, 0, 0]} name="Participantes" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="shrink-0 pt-3 border-t border-rose-100 flex justify-end">
                  <Button onClick={() => setIsAgeModalOpen(false)} className="bg-secondary hover:bg-secondary/90 text-white font-bold rounded-xl px-6">Fechar</Button>
                </div>
              </DialogContent>
            </Dialog>

          </>
        )}
      </div>
    </section>
  );
};

export default ChartsSection;
