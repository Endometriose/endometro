import { useState } from "react";
import { Send, Quote, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

const RelatosSection = () => {
  const [titulo, setTitulo] = useState("");
  const [relato, setRelato] = useState("");
  const [anonimo, setAnonimo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Relatos simulados temporariamente até ter relatos aprovados do banco
  const relatosAprovados = [
    {
      id: 1,
      relato: "Passei 8 anos sentindo dores terríveis antes de ser diagnosticada. No trabalho, tinha medo de pedir folga e ser vista como preguiçosa.",
      autor: "Maria S., 28 anos",
    },
    {
      id: 2,
      relato: "Como gestora, não entendia por que minha funcionária faltava tanto. Depois que aprendi sobre endometriose, mudei toda a política da empresa.",
      autor: "Ana L., empresária",
    },
    {
      id: 3,
      relato: "A dor do presenteísmo é invisível. Eu estava no trabalho, mas minha mente estava lutando contra a dor.",
      autor: "Juliana R., 32 anos",
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!relato.trim() || !titulo.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      // Como o usuário pode estar deslogado na home, simularemos o envio para fins de teste
      // Num fluxo real onde exigiria login, seria algo como:
      /*
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
         toast.error("Você precisa estar logado para enviar um relato.");
         return;
      }
      await supabase.from('testimonials').insert({
         user_id: user.id,
         titulo,
         relato,
         anonimo
      });
      */

      // Simulação visual de sucesso (aguardar banco real)
      setTimeout(() => {
        toast.success("Seu relato foi enviado e passará por moderação. Obrigada por compartilhar!");
        setTitulo("");
        setRelato("");
        setAnonimo(false);
        setIsSubmitting(false);
      }, 1000);
      
    } catch (error) {
      toast.error("Ocorreu um erro. Tente novamente.");
      setIsSubmitting(false);
    }
  };

  return (
    <section id="relatos" className="py-16 px-4 bg-background border-t border-border">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            Vozes e Relatos
          </h2>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
            Histórias reais de quem convive com a endometriose. Compartilhar experiências é uma forma de cura e acolhimento.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Lado Esquerdo: Lista de Relatos */}
          <div className="space-y-6">
            <h3 className="font-display text-2xl font-semibold text-foreground flex items-center gap-2">
              <Quote className="h-6 w-6 text-primary" />
              Depoimentos Recentes
            </h3>
            
            <div className="space-y-4">
              {relatosAprovados.map((item) => (
                <div key={item.id} className="bg-card rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition">
                  <p className="text-muted-foreground italic leading-relaxed">"{item.relato}"</p>
                  <p className="text-foreground font-semibold mt-4 text-sm">— {item.autor}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Lado Direito: Formulário de Envio */}
          <div className="bg-rose-pale/30 rounded-2xl p-6 md:p-8 border border-border h-fit sticky top-24">
            <h3 className="font-display text-2xl font-semibold text-foreground mb-6">
              Conte a sua história
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Título do relato</label>
                <input 
                  type="text" 
                  placeholder="Ex: Minha jornada até o diagnóstico" 
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  className="w-full p-3 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition" 
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Seu relato</label>
                <textarea 
                  placeholder="Como a endometriose impactou sua vida, seu trabalho..." 
                  rows={5} 
                  value={relato}
                  onChange={(e) => setRelato(e.target.value)}
                  className="w-full p-3 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition resize-none" 
                  required
                ></textarea>
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="anonimo"
                  checked={anonimo}
                  onChange={(e) => setAnonimo(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                />
                <label htmlFor="anonimo" className="text-sm text-foreground cursor-pointer">
                  Desejo que meu relato seja publicado anonimamente
                </label>
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-secondary hover:bg-secondary/90 text-white font-semibold py-3 px-4 rounded-lg transition shadow-md flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isSubmitting ? "Enviando..." : (
                    <>
                      <Send className="h-5 w-5" />
                      Enviar Relato para Moderação
                    </>
                  )}
                </button>
                <p className="text-xs text-muted-foreground text-center mt-3">
                  Seu relato será avaliado antes de aparecer publicamente no site.
                </p>
              </div>
            </form>
          </div>

        </div>

        {/* SEÇÃO DE DÚVIDAS FREQUENTES (FAQ) - ID "duvidas" */}
        <div id="duvidas" className="scroll-mt-28 mt-20 pt-16 border-t border-rose-200/80">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-rose-100 text-secondary font-bold text-xs uppercase tracking-wider mb-2">
              <HelpCircle className="w-3.5 h-3.5" /> Esclarecimentos Importantes
            </span>
            <h3 className="font-display text-3xl font-bold text-foreground">
              Dúvidas Frequentes sobre a Pesquisa
            </h3>
            <p className="text-muted-foreground text-sm max-w-xl mx-auto mt-1">
              Confira as respostas para as perguntas mais comuns de participantes e instituições parceiras.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl p-6 border border-rose-200/80 shadow-xs hover:shadow-md transition">
              <h4 className="font-display font-bold text-base text-foreground mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">1</span>
                As respostas da colaboradora são anônimas para a empresa?
              </h4>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Sim! Em cumprimento à LGPD e à metodologia científica, os dados apresentados à diretoria e ao público no painel da empresa são consolidados em indicadores coletivos (k-anonymity mínimo de 5). Somente a própria funcionária tem acesso ao seu relatório de triagem individual completo.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-rose-200/80 shadow-xs hover:shadow-md transition">
              <h4 className="font-display font-bold text-base text-foreground mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">2</span>
                O Endometriômetro substitui consulta médica?
              </h4>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Não. O Endometriômetro é uma ferramenta de triagem clínica, acolhimento e conscientização. Ele calcula a probabilidade e o risco a partir dos sintomas declarados para orientar a colaboradora a procurar especialistas em endometriose.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-rose-200/80 shadow-xs hover:shadow-md transition">
              <h4 className="font-display font-bold text-base text-foreground mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">3</span>
                Como a colaboradora faz o cadastro dentro da empresa?
              </h4>
              <p className="text-muted-foreground text-sm leading-relaxed">
                A empresa gera o link exclusivo ou o QR Code no painel institucional. Ao abrir, a colaboradora cria seu cadastro de participante vinculado à empresa, responde ao formulário e tem seus relatórios gerados instantaneamente.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-rose-200/80 shadow-xs hover:shadow-md transition">
              <h4 className="font-display font-bold text-base text-foreground mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">4</span>
                O que a empresa recebe com a pesquisa?
              </h4>
              <p className="text-muted-foreground text-sm leading-relaxed">
                A instituição tem acesso a relatórios executivos em PDF com métricas de presenteísmo e absenteísmo, cálculo do impacto produtivo e diretrizes corporativas para implementar programas de acolhimento e suporte à saúde feminina.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RelatosSection;
