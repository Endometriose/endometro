import { HelpCircle, Building2, BarChart2, ShieldCheck } from "lucide-react";

const AboutEndometriometroSection = () => {
  return (
    <section id="oquee-endometriometro" className="py-20 px-4 bg-pink-soft/60 border-y border-rose-200">
      <div className="container mx-auto max-w-5xl">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-lg border border-rose-200">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-accent text-secondary font-bold text-xs uppercase tracking-wider mb-3">
              <HelpCircle className="w-4 h-4" /> Instrumento Digital de Pesquisa
            </span>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">
              O que é o Endometriômetro?
            </h2>
          </div>

          {/* CONTEÚDO RIGOROSAMENTE FIEL AO ANEXO A10 */}
          <div className="prose prose-rose max-w-none text-foreground leading-relaxed space-y-6 text-sm md:text-base">
            <div className="bg-rose-50/70 p-6 rounded-2xl border border-rose-100">
              <p className="text-base md:text-lg font-medium text-foreground">
                O <strong>ENDOMETRIÔMETRO</strong> é um instrumento digital de pesquisa desenvolvido para coletar, organizar e analisar informações relacionadas à endometriose. Por meio da plataforma, é possível realizar pesquisas com diferentes públicos e obter dados que podem contribuir para compreender melhor a realidade, as necessidades e as experiências relacionadas à endometriose.
              </p>
            </div>

            <div>
              <h3 className="font-display text-2xl font-bold text-foreground mb-3 flex items-center gap-2">
                <Building2 className="w-6 h-6 text-secondary" /> Para que serve?
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                A plataforma permite que prefeituras, empresas, hospitais, instituições de ensino, organizações de saúde e outras instituições possam solicitar ou realizar pesquisas, disponibilizando formulários por meio de links para os participantes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="p-6 rounded-2xl bg-white border border-rose-200 shadow-sm space-y-2">
                <h4 className="font-bold text-lg text-foreground flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-primary" /> Camada de Análise
                </h4>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                  Após a coleta das respostas, os dados podem ser organizados, apresentados em gráficos e utilizados na geração de relatórios, facilitando a visualização e a interpretação das informações obtidas. O Endometriômetro é o instrumento de pesquisa, enquanto os gráficos, indicadores e relatórios constituem a camada de análise e apresentação dos dados coletados.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-rose-200 shadow-sm space-y-2">
                <h4 className="font-bold text-lg text-foreground flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary" /> Apoio à Tomada de Decisão
                </h4>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                  Dessa forma, a plataforma pode ser utilizada para apoiar pesquisas, estudos, ações institucionais, planejamento e tomada de decisões, de acordo com os objetivos definidos por cada organização responsável pela pesquisa.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default AboutEndometriometroSection;
