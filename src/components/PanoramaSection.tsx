import { useState } from "react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer
} from "recharts";
import { Users, UserCheck, Percent, User, Building2, Briefcase, AlertCircle, Loader2, Maximize2, X, ChevronLeft, ChevronRight, Layers } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { usePanorama, useDistribuicao } from "@/hooks/usePanorama";

// Paleta oficial
const PALETTE = {
  dark:   "#7B2D40",
  medium: "#C96B82",
  light:  "#E8A0B0",
  pale:   "#F5CDD6",
  nude:   "#F0E4E0",
};
const DONUT_SIM  = [PALETTE.dark, PALETTE.pale];
const DONUT_ORIG = [PALETTE.medium, PALETTE.light];

// ----- Card Numérico -----
const KCard = ({ icon: Icon, value, label, color }: { icon: any; value: number | string; label: string; color: string }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-rose-100 flex flex-col items-center gap-1 hover:shadow-md transition-shadow">
    <div className="w-10 h-10 rounded-full flex items-center justify-center mb-1" style={{ backgroundColor: color + "22" }}>
      <Icon className="w-5 h-5" style={{ color }} />
    </div>
    <span className="text-3xl font-bold" style={{ color }}>{value}</span>
    <span className="text-xs text-center text-muted-foreground font-medium leading-tight">{label}</span>
  </div>
);

// ----- Donut Puro -----
const DonutInner = ({
  data, centerValue, centerLabel, colors = DONUT_SIM, isEnlarged = false
}: {
  data: { name: string; value: number }[];
  centerValue: string;
  centerLabel: string;
  colors?: string[];
  isEnlarged?: boolean;
}) => {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        Sem dados suficientes
      </div>
    );
  }
  const fontSize = isEnlarged ? 28 : 22;
  const subFontSize = isEnlarged ? 13 : 10;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={isEnlarged ? "50%" : "55%"}
          outerRadius={isEnlarged ? "75%" : "80%"}
          dataKey="value"
          startAngle={90}
          endAngle={-270}
          strokeWidth={2}
          stroke="#fff"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={colors[i % colors.length]} />
          ))}
        </Pie>
        <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize, fontWeight: 700, fill: PALETTE.dark }}>
          {centerValue}
        </text>
        <text x="50%" y="60%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: subFontSize, fill: "#888" }}>
          {centerLabel}
        </text>
        <RechartsTooltip
          contentStyle={{ borderRadius: "10px", border: "none", boxShadow: "0 4px 15px rgba(0,0,0,0.1)" }}
          formatter={(value: number, name: string) => [`${value} (${total > 0 ? Math.round((value / total) * 100) : 0}%)`, name]}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

// ----- Filtro com modal de expansão (mantido para B1/B2) -----
const FiltroDistribuicao = ({ titulo, origem }: { titulo: string; origem: "individual" | "empresa" }) => {
  const [dimensao, setDimensao] = useState<"bairro" | "faixa_etaria">("bairro");
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useDistribuicao(dimensao, origem);

  const chartData = (data || []).map(d => ({
    name: d.categoria,
    Pesquisadas: d.pesquisadas,
    "Com Sintomas": d.com_sintoma,
  }));

  const GraficoBarras = ({ height = 200 }: { height?: number }) => (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, left: -10, right: 10, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#fde4e8" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#7B2D40" }} angle={-30} textAnchor="end" interval={0} />
          <YAxis tick={{ fontSize: 11, fill: "#7B2D40" }} />
          <RechartsTooltip contentStyle={{ borderRadius: "10px", border: "none" }} />
          <Bar dataKey="Pesquisadas" fill={PALETTE.light} radius={[4, 4, 0, 0]} name="Pesquisadas" />
          <Bar dataKey="Com Sintomas" fill={PALETTE.dark} radius={[4, 4, 0, 0]} name="Com Sintomas" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <>
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-rose-100 hover:shadow-md transition-shadow group relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pr-10">
          <div>
            <h3 className="font-bold text-sm text-foreground">{titulo}</h3>
            <p className="text-xs text-muted-foreground">Grupos com menos de 5 são agrupados em "Demais".</p>
          </div>
          <select
            value={dimensao}
            onChange={e => setDimensao(e.target.value as "bairro" | "faixa_etaria")}
            className="text-sm border border-rose-200 rounded-xl px-3 py-2 bg-rose-50 text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-rose-300 cursor-pointer"
          >
            <option value="bairro">Por Bairro</option>
            <option value="faixa_etaria">Por Faixa Etária</option>
          </select>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="absolute top-4 right-4 p-2 rounded-full bg-rose-100/80 text-rose-dark group-hover:bg-primary group-hover:text-white transition-all shadow-sm"
          aria-label="Expandir gráfico"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="w-6 h-6 animate-spin text-rose-400" />
          </div>
        ) : !data || data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground text-sm">
            <AlertCircle className="w-6 h-6 mb-2 text-rose-300" />
            Dados insuficientes para esta visão.
          </div>
        ) : (
          <GraficoBarras height={220} />
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[94vw] lg:max-w-[85vw] h-[92vh] flex flex-col bg-white rounded-3xl p-6 md:p-8 border border-rose-200 shadow-2xl overflow-hidden pointer-events-auto">
          <DialogHeader className="flex flex-row justify-between items-center border-b border-rose-100 pb-4 shrink-0">
            <div>
              <span className="inline-block px-3 py-1 bg-rose-100 text-rose-dark text-xs font-bold rounded-full mb-1">
                📊 Gráfico Expandido na Tela Toda
              </span>
              <DialogTitle className="font-display text-2xl md:text-3xl font-bold text-foreground">
                {titulo}
              </DialogTitle>
              <div className="flex items-center gap-3 mt-2">
                <select
                  value={dimensao}
                  onChange={e => setDimensao(e.target.value as "bairro" | "faixa_etaria")}
                  className="text-sm border border-rose-200 rounded-xl px-3 py-1.5 bg-rose-50 font-medium focus:outline-none focus:ring-2 focus:ring-rose-300 cursor-pointer"
                >
                  <option value="bairro">Por Bairro</option>
                  <option value="faixa_etaria">Por Faixa Etária</option>
                </select>
              </div>
            </div>
          </DialogHeader>
          <div className="flex-1 w-full my-4 bg-pink-soft/20 rounded-2xl p-4 md:p-6 border border-rose-100 flex items-center justify-center min-h-0 relative">
            <div className="w-full h-full">
              <GraficoBarras height={undefined} />
            </div>
          </div>
          <div className="shrink-0 pt-3 border-t border-rose-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="bg-rose-50/80 p-3 rounded-xl border border-rose-100 text-xs md:text-sm text-foreground flex-1">
              💡 <strong>Análise dos Dados:</strong> Grupos com menos de 5 participantes são agrupados em "Demais" por segurança (k-anonymity).
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={() => setOpen(false)} className="bg-secondary hover:bg-secondary/90 text-white font-bold rounded-xl px-6">
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

// ===== COMPONENTE PRINCIPAL =====
interface PanoramaSectionProps {
  companyId?: string;
}

const PanoramaSection = ({ companyId }: PanoramaSectionProps = {}) => {
  const escopo = companyId ? "pesquisa" : "geral";
  const { data, isLoading, isError } = usePanorama(escopo, companyId);
  const [activeDonutIndex, setActiveDonutIndex] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="w-8 h-8 animate-spin text-rose-400" />
      </div>
    );
  }
  if (isError || !data) return null;

  const k1 = data.k1_total_pesquisadas;
  const k2 = data.k2_total_com_sintoma;
  const k3 = data.k3_percentual_sintoma;
  const k4 = data.k4_total_individual;
  const k5 = data.k5_total_empresa;
  const k6 = data.k6_total_empresas_pesq;
  const d4s = data.d4_individual_com_sintoma;
  const d5s = data.d5_empresa_com_sintoma;

  const DONUT_LIST = [
    {
      title: "Total de Mulheres Pesquisadas (Geral)", subtitle: "Distribuição Individual vs Empresa",
      data: [{ name: "Individuais", value: k4 }, { name: "Empresas", value: k5 }],
      centerValue: String(k1), centerLabel: "pesquisadas", colors: DONUT_ORIG,
      legend: [{ color: PALETTE.medium, label: "Individuais" }, { color: PALETTE.light, label: "Empresas" }],
      description: "Este gráfico exibe a proporção de mulheres que responderam à pesquisa na modalidade individual em comparação com as colaboradoras que responderam através do link institucional."
    },
    {
      title: "Total com Sintomas Relatados", subtitle: "Mulheres que relataram ao menos 1 sintoma",
      data: [{ name: "Com Sintomas", value: k2 }, { name: "Sem Sintomas", value: k1 - k2 }],
      centerValue: String(k2), centerLabel: "com sintomas", colors: DONUT_SIM,
      legend: [{ color: PALETTE.dark, label: "Com Sintomas" }, { color: PALETTE.pale, label: "Sem Sintomas" }],
      description: "Exibe a proporção geral de participantes que relataram ter ao menos um sintoma ou situação clínica associada à endometriose no questionário."
    },
    {
      title: "Percentual com Sintomas", subtitle: "Em relação ao total pesquisado",
      data: [{ name: "Com Sintomas", value: k3 }, { name: "Sem Sintomas", value: 100 - k3 }],
      centerValue: `${k3}%`, centerLabel: "com sintomas", colors: DONUT_SIM,
      legend: [{ color: PALETTE.dark, label: "Com Sintomas" }, { color: PALETTE.pale, label: "Sem Sintomas" }],
      description: "Apresenta a incidência percentual de relatos de sintomas na amostra geral para facilitar a compreensão imediata do quadro."
    },
    {
      title: "Pesquisa Individual", subtitle: `Total: ${k4} mulheres`,
      data: [{ name: "Com Sintomas", value: d4s }, { name: "Sem Sintomas", value: k4 - d4s }],
      centerValue: String(k4), centerLabel: `${k4 > 0 ? Math.round((d4s/k4)*100) : 0}% sintomas`, colors: DONUT_SIM,
      legend: [{ color: PALETTE.dark, label: "Com Sintomas" }, { color: PALETTE.pale, label: "Sem Sintomas" }],
      description: "Foca exclusivamente no grupo de pesquisas individuais públicas, mostrando a proporção daquelas que relataram sintomas em relação ao total do grupo."
    },
    {
      title: "Pesquisa em Empresas", subtitle: `Total: ${k5} colaboradoras`,
      data: [{ name: "Com Sintomas", value: d5s }, { name: "Sem Sintomas", value: k5 - d5s }],
      centerValue: String(k5), centerLabel: `${k5 > 0 ? Math.round((d5s/k5)*100) : 0}% sintomas`, colors: DONUT_SIM,
      legend: [{ color: PALETTE.dark, label: "Com Sintomas" }, { color: PALETTE.pale, label: "Sem Sintomas" }],
      description: "Foca exclusivamente no grupo corporativo, revelando a proporção de colaboradoras com sintomas nas empresas mapeadas pelo Endometriômetro."
    }
  ];

  const currentDonut = activeDonutIndex !== null ? DONUT_LIST[activeDonutIndex] : null;

  return (
    <div className="mb-8">
      {/* Slide 1: Geral */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        <KCard icon={Users}     value={k1}       label="Total de Mulheres Pesquisadas"  color={PALETTE.dark} />
        <KCard icon={UserCheck} value={k2}       label="Mulheres com Sintomas Relatados" color={PALETTE.medium} />
        <KCard icon={Percent}   value={`${k3}%`} label="Das Pesquisadas com Sintomas"   color={PALETTE.medium} />
        <KCard icon={User}      value={k4}       label="Pesquisas Individuais"           color={PALETTE.dark} />
        <KCard icon={Building2} value={k5}       label="Pesquisas em Empresas"           color={PALETTE.medium} />
        <KCard icon={Briefcase} value={k6}       label="Empresas Pesquisadas"            color={PALETTE.dark} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-5">
        {DONUT_LIST.slice(0, 3).map((d, i) => (
          <div key={i} onClick={() => setActiveDonutIndex(i)} className="bg-white rounded-2xl p-5 shadow-sm border border-rose-100 flex flex-col h-[300px] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative">
            <div className="flex justify-between items-start mb-2 pr-8">
              <div>
                <h3 className="font-bold text-sm text-foreground leading-tight">{d.title}</h3>
                <p className="text-xs text-muted-foreground">{d.subtitle}</p>
              </div>
            </div>
            <button className="absolute top-4 right-4 p-2 rounded-full bg-rose-100/80 text-rose-dark group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
              <Maximize2 className="w-4 h-4" />
            </button>
            <div className="flex-1 w-full pointer-events-none">
              <DonutInner data={d.data} centerValue={d.centerValue} centerLabel={d.centerLabel} colors={d.colors} />
            </div>
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-1">
              {d.legend.map((l, j) => (
                <span key={j} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: l.color }} />
                  {l.label}
                </span>
              ))}
            </div>
            <p className="text-center text-[10px] text-muted-foreground mt-1 italic">Sintomas relatados não equivalem a diagnóstico.</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10 max-w-2xl mx-auto">
        <div id="dados-individuais" className="scroll-mt-32 w-full h-full">
          {DONUT_LIST.slice(3, 4).map((d, i) => (
            <div key={i} onClick={() => setActiveDonutIndex(3)} className="bg-white rounded-2xl p-5 shadow-sm border border-rose-100 flex flex-col h-[300px] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative">
              <div className="flex justify-between items-start mb-2 pr-8">
                <div>
                  <h3 className="font-bold text-sm text-foreground leading-tight">{d.title}</h3>
                  <p className="text-xs text-muted-foreground">{d.subtitle}</p>
                </div>
              </div>
              <button className="absolute top-4 right-4 p-2 rounded-full bg-rose-100/80 text-rose-dark group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                <Maximize2 className="w-4 h-4" />
              </button>
              <div className="flex-1 w-full pointer-events-none">
                <DonutInner data={d.data} centerValue={d.centerValue} centerLabel={d.centerLabel} colors={d.colors} />
              </div>
              <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-1">
                {d.legend.map((l, j) => (
                  <span key={j} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: l.color }} />
                    {l.label}
                  </span>
                ))}
              </div>
              <p className="text-center text-[10px] text-muted-foreground mt-1 italic">Sintomas relatados não equivalem a diagnóstico.</p>
            </div>
          ))}
        </div>

        <div id="dados-empresas" className="scroll-mt-32 w-full h-full">
          {DONUT_LIST.slice(4, 5).map((d, i) => (
            <div key={i} onClick={() => setActiveDonutIndex(4)} className="bg-white rounded-2xl p-5 shadow-sm border border-rose-100 flex flex-col h-[300px] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative">
              <div className="flex justify-between items-start mb-2 pr-8">
                <div>
                  <h3 className="font-bold text-sm text-foreground leading-tight">{d.title}</h3>
                  <p className="text-xs text-muted-foreground">{d.subtitle}</p>
                </div>
              </div>
              <button className="absolute top-4 right-4 p-2 rounded-full bg-rose-100/80 text-rose-dark group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                <Maximize2 className="w-4 h-4" />
              </button>
              <div className="flex-1 w-full pointer-events-none">
                <DonutInner data={d.data} centerValue={d.centerValue} centerLabel={d.centerLabel} colors={d.colors} />
              </div>
              <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-1">
                {d.legend.map((l, j) => (
                  <span key={j} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: l.color }} />
                    {l.label}
                  </span>
                ))}
              </div>
              <p className="text-center text-[10px] text-muted-foreground mt-1 italic">Sintomas relatados não equivalem a diagnóstico.</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <FiltroDistribuicao titulo="Pesquisa Individual — Distribuição" origem="individual" />
        <FiltroDistribuicao titulo="Pesquisa em Empresas — Distribuição" origem="empresa" />
      </div>

      {/* Modal Centralizado para os Donuts */}
      <Dialog open={activeDonutIndex !== null} onOpenChange={(open) => !open && setActiveDonutIndex(null)}>
        <DialogContent className="sm:max-w-[94vw] lg:max-w-[85vw] h-[92vh] flex flex-col bg-white rounded-3xl p-6 md:p-8 border border-rose-200 shadow-2xl overflow-hidden pointer-events-auto">
          {currentDonut && (
            <>
              <DialogHeader className="flex flex-row justify-between items-center border-b border-rose-100 pb-4 shrink-0">
                <div>
                  <span className="inline-block px-3 py-1 bg-rose-100 text-rose-dark text-xs font-bold rounded-full mb-1">
                    📊 Gráfico Expandido na Tela Toda
                  </span>
                  <DialogTitle className="font-display text-2xl md:text-3xl font-bold text-foreground">
                    {currentDonut.title}
                  </DialogTitle>
                  <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                    {currentDonut.subtitle}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setActiveDonutIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : DONUT_LIST.length - 1))} className="rounded-xl gap-1 border-rose-200 hover:bg-rose-50">
                    <ChevronLeft className="w-4 h-4" /> Anterior
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setActiveDonutIndex((prev) => (prev !== null && prev < DONUT_LIST.length - 1 ? prev + 1 : 0))} className="rounded-xl gap-1 border-rose-200 hover:bg-rose-50">
                    Próximo <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </DialogHeader>

              <div className="flex-1 w-full my-4 bg-pink-soft/20 rounded-2xl p-4 md:p-6 border border-rose-100 flex items-center justify-center min-h-0 relative">
                <div className="w-full h-full">
                  <DonutInner data={currentDonut.data} centerValue={currentDonut.centerValue} centerLabel={currentDonut.centerLabel} colors={currentDonut.colors} isEnlarged />
                </div>
                {/* Legenda em Tela Cheia */}
                <div className="absolute bottom-6 left-0 w-full flex justify-center gap-6">
                  {currentDonut.legend.map((l, j) => (
                    <span key={j} className="flex items-center gap-2 text-sm text-foreground font-medium">
                      <span className="w-4 h-4 rounded-full inline-block" style={{ backgroundColor: l.color }} />
                      {l.label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="shrink-0 pt-3 border-t border-rose-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="bg-rose-50/80 p-3 rounded-xl border border-rose-100 text-xs md:text-sm text-foreground flex-1">
                  💡 <strong>Análise dos Dados:</strong> {currentDonut.description}
                </div>
                <div className="flex items-center gap-3">
                  <Button onClick={() => setActiveDonutIndex(null)} variant="outline" className="border-rose-300 text-rose-dark hover:bg-rose-50 rounded-xl">
                    <Layers className="w-4 h-4 mr-1.5" /> Ver Todos
                  </Button>
                  <Button onClick={() => setActiveDonutIndex(null)} className="bg-secondary hover:bg-secondary/90 text-white font-bold rounded-xl px-6">
                    Fechar
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PanoramaSection;
