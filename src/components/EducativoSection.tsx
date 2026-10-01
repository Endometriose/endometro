import { useState } from "react";
import { Heart, AlertCircle, Brain, Stethoscope, Activity, Briefcase, BookOpen, ExternalLink, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const temas = [
  {
    id: "oquee",
    icon: <Heart className="h-6 w-6 text-primary" />,
    title: "O que é Endometriose",
    summary: "Tecido semelhante ao endométrio crescendo fora do útero, gerando inflamação crônica e aderências pélvicas.",
    detailedTitle: "Entenda a Endometriose em Detalhes",
    details: `A endometriose é uma doença inflamatória crônica caracterizada pela presença de tecido histologicamente semelhante ao endométrio (camada glandular que reveste o interior do útero) fora da cavidade uterina.

Durante o ciclo menstrual regular, sob estímulo de estrogênio, o endométrio se espessa para receber uma gestação e, quando ela não ocorre, descama em forma de menstruação. Na mulher com endometriose, os focos ectópicos de tecido reagem da mesma forma aos hormônios, mas não têm por onde sair.

Isso causa um processo inflamatório contínuo, sangramento interno microscópico, cicatrização fibrosa e a formação de aderências entre órgãos como ovários, trompas, bexiga, intestino e peritônio. Acomete cerca de 10% a 15% das mulheres em idade fértil (mais de 7 milhões no Brasil).`
  },
  {
    id: "sintomas",
    icon: <AlertCircle className="h-6 w-6 text-primary" />,
    title: "Sintomas e Sinais",
    summary: "Cólica incapacitante, dor pélvica crônica, dor na relação sexual (dispareunia) e alterações no ciclo.",
    detailedTitle: "Quais são os Sintomas e Sinais de Alerta?",
    details: `Os sintomas da endometriose variam de acordo com a localização e profundidade dos focos. É fundamental destacar que a intensidade da dor NÃO se relaciona diretamente com a extensão das lesões!

Principais Sintomas:
• Dismenorreia Severa: Cólicas menstruais intensas que não melhoram com analgésicos comuns e incapacitam para o trabalho/estudo.
• Dispareunia de Profundidade: Dor intensa durante ou após o ato sexual.
• Dor Pélvica Crônica: Dor persistente na região abdominal inferior fora do período menstrual.
• Sintomas Intestinais: Dor ao evacuar, diarreia, constipação ou distensão abdominal ("endo belly") durante a menstruação.
• Sintomas Urinários: Dor ou queimação ao urinar no período menstrual.
• Fadiga Crônica e Exaustão: Causadas pela inflamação sistêmica constante.`
  },
  {
    id: "causas",
    icon: <Brain className="h-6 w-6 text-primary" />,
    title: "Origem e Causas",
    summary: "Combinação de fatores genéticos, imunológicos, hormonais e menstruação retrógrada.",
    detailedTitle: "Causas e Fatores de Risco",
    details: `A etiologia exata da endometriose é multifatorial e envolve uma interação complexa entre imunologia, genética e endocrinologia:

• Menstruação Retrógrada (Teoria de Sampson): Durante a menstruação, parte do sangue flui em sentido inverso pelas trompas uterinas até a cavidade abdominal.
• Disfunção Imunológica: O sistema imunológico da mulher falha em reconhecer e eliminar as células endometriais ectópicas, permitindo que elas se fixem e vascularizem.
• Predisposição Genética: Mulheres com parentes de primeiro grau afetadas (mãe ou irmãs) têm até 7 a 10 vezes mais chances de desenvolver a doença.
• Metaplasia Celular e Fatores Ambientais: Alterações em células embrionárias e exposição a desreguladores endócrinos.`
  },
  {
    id: "investigacao",
    icon: <Stethoscope className="h-6 w-6 text-primary" />,
    title: "Como Descobrir (Diagnóstico)",
    summary: "Ultrassonografia transvaginal com preparo intestinal e Ressonância Magnética Pélvica especializada.",
    detailedTitle: "Protocolo Diagnóstico Preciso",
    details: `O diagnóstico precoce é crucial para interromper a progressão das lesões e preservar a fertilidade e a qualidade de vida. O atraso diagnóstico médio no Brasil ainda varia de 7 a 10 anos devido ao mito de que 'cólica forte é normal'.

Exames Específicos Necessários:
1. Mapeamento por Ultrassom Transvaginal com Preparo Intestinal: Realizado por radiologista especializado, identifica focos profundos no retrocérvix, retossigmoide, bexiga e ureteres.
2. Ressonância Magnética Pélvica com Protocolo para Endometriose: Excelente acurácia para estadiamento completo da doença e planejamento cirúrgico.
3. Exame Clínico Ginecológico Especializado: Toque vaginal e retal com palpação dos ligamentos uterossacros.`
  },
  {
    id: "tratamento",
    icon: <Activity className="h-6 w-6 text-primary" />,
    title: "Opções de Tratamento",
    summary: "Abordagem multidisciplinar: hormônios, fisioterapia pélvica, cirurgia de excisão e estilo de vida.",
    detailedTitle: "Estratégias Terapêuticas Modernas",
    details: `Não existe uma cura definitiva única; o tratamento visa aliviar a dor, controlar os focos inflamatórios e preservar ou restaurar a fertilidade.

1. Tratamento Clínico e Hormonal:
   • Progestágenos contínuos, DIU hormonal de levonorgestrel, anticoncepcionais combinados contínuos ou análogos do GnRH para induzir anovulação e amenorreia.

2. Tratamento Cirúrgico (Laparoscopia / Robótica):
   • Excisão completa de todos os focos visíveis e liberação de aderências. A técnica de excisão (remoção da raiz da lesão) é superior à cauterização superficial.

3. Abordagem Multidisciplinar:
   • Fisioterapia Pélvica para relaxamento do assoalho pélvico hipertônico.
   • Dieta Anti-inflamatória com nutricionista.
   • Suporte Psicológico para manejo de dor crônica.`
  },
  {
    id: "trabalho",
    icon: <Briefcase className="h-6 w-6 text-primary" />,
    title: "Impacto no Trabalho e RH",
    summary: "Acomodação laboral, flexibilidade corporativa e garantias legais para a saúde da trabalhadora.",
    detailedTitle: "Acolhimento Corporativo e Direitos da Trabalhadora",
    details: `A endometriose afeta gravemente a produtividade e a saúde mental das mulheres no ambiente corporativo:

• Presenteísmo e Absenteísmo: Estima-se que crises intensas gerem uma perda média de 10 a 30 horas de produtividade por mês por trabalhadora afetada.
• Direitos e Garantias Legais: Atestados médicos para consultas e períodos incapacitantes são válidos. Em casos severos de endometriose profunda com laudo, pode-se requerer auxílio incapacidade no INSS.
• Boas Práticas para Empresas: Implementação de regimes de trabalho flexíveis/híbridos nos dias do ciclo, licença para saúde feminina, salas de descanso e apoio no RH.`
  }
];

const EducativoSection = () => {
  const [selectedTema, setSelectedTema] = useState<typeof temas[0] | null>(null);

  return (
    <section id="sobre" className="py-20 px-4 bg-white relative overflow-hidden">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-accent/60 text-secondary font-bold text-xs uppercase tracking-wider mb-3">
            <BookOpen className="w-3.5 h-3.5" /> Guia Educativo
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">
            Entendendo a Endometriose
          </h2>
          <p className="text-muted-foreground mt-3 text-base md:text-lg max-w-xl mx-auto">
            Clique em qualquer card abaixo para abrir a explicação completa e detalhada sobre o assunto.
          </p>
        </div>

        {/* Grid de Cards Interativos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {temas.map((tema) => (
            <div 
              key={tema.id} 
              id={tema.id}
              onClick={() => setSelectedTema(tema)}
              className="bg-pink-soft/40 rounded-2xl p-6 border border-rose-200/80 shadow-sm hover:shadow-lg hover:border-primary/50 transition-all duration-300 cursor-pointer group flex flex-col items-center text-center relative overflow-hidden"
            >
              <div className="w-14 h-14 rounded-2xl bg-white shadow-md flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 border border-rose-100">
                {tema.icon}
              </div>
              <h3 className="font-display font-bold text-xl text-foreground mb-3 flex items-center gap-1.5 group-hover:text-primary transition-colors">
                {tema.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                {tema.summary}
              </p>
              
              <span className="mt-auto inline-flex items-center gap-1 text-xs font-bold text-primary group-hover:underline pt-2">
                Clique para ler a explicação completa <ExternalLink className="w-3 h-3" />
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de Detalhamento do Tema Clicado */}
      <Dialog open={!!selectedTema} onOpenChange={(open) => !open && setSelectedTema(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto bg-white border border-rose-200 rounded-3xl p-6 md:p-8">
          {selectedTema && (
            <div>
              <DialogHeader className="mb-4 text-left border-b border-rose-100 pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-pink-soft rounded-xl border border-rose-200">
                    {selectedTema.icon}
                  </div>
                  <div>
                    <DialogTitle className="font-display text-2xl md:text-3xl font-bold text-foreground">
                      {selectedTema.detailedTitle}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground mt-1">
                      Informações atualizadas com diretrizes médicas oficiais
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="prose prose-rose max-w-none text-foreground text-sm leading-relaxed whitespace-pre-line space-y-4">
                {selectedTema.details}
              </div>

              <div className="mt-8 pt-4 border-t border-rose-100 flex justify-end">
                <button
                  onClick={() => setSelectedTema(null)}
                  className="px-6 py-2.5 bg-secondary text-white font-bold text-sm rounded-full hover:bg-secondary/90 transition shadow-md"
                >
                  Entendi / Fechar
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default EducativoSection;

