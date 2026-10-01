import { useState } from "react";
import { Send, Quote } from "lucide-react";
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
      </div>
    </section>
  );
};

export default RelatosSection;
