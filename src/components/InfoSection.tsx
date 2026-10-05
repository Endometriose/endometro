import { useState } from "react";
import { Heart, Stethoscope, Brain, Baby, AlertCircle, Send, Briefcase } from "lucide-react";
import { toast } from "sonner";

const InfoSection = () => {
  const [nome, setNome] = useState("");
  const [relato, setRelato] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!relato.trim()) return;
    
    // Aqui seria a integração com o banco de dados (ex: Supabase)
    // Simulando o envio com um aviso de sucesso na tela:
    toast.success("Relato enviado com sucesso! Agradecemos por compartilhar sua história.");
    setNome("");
    setRelato("");
  };

  return (
    <section id="informacoes" className="py-16 px-4 bg-background">
      <div className="container mx-auto">
        {/* Title */}
        <div className="text-center mb-12">
          <span className="text-rose-light text-2xl">✿</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-2">
            O que é Endometriose?
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Fonte: Ministério da Saúde — gov.br
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: Official info */}
          <div className="space-y-6">
            <div className="bg-card rounded-xl p-8 shadow-md border border-border">
              <div className="flex items-center gap-3 mb-4">
                <Heart className="h-6 w-6 text-primary" />
                <h3 className="font-display text-xl font-bold text-foreground">
                  Definição
                </h3>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-4 text-justify">
                A <strong className="text-foreground">endometriose</strong> é uma doença caracterizada pelo desenvolvimento e crescimento de estroma e glândulas endometriais fora da cavidade uterina. Esse deslocamento do tecido pode provocar uma reação inflamatória crônica, com taxa de prevalência estimada entre <strong className="text-foreground">5% e 15%</strong> das mulheres em idade reprodutiva.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4 text-justify">
                As causas ainda não são completamente conhecidas. A literatura aponta hipóteses que envolvem fatores genéticos, hormonais e imunológicos, bem como a possibilidade de menstruação retrógrada.
              </p>
              <p className="text-muted-foreground leading-relaxed font-semibold text-sm text-justify">
                Principais tipos:
              </p>
              <ul className="mt-2 space-y-1 text-muted-foreground text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  Endometriose peritoneal superficial
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  Endometriose ovariana (endometrioma)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  Endometriose infiltrativa profunda
                </li>
              </ul>
            </div>

            {/* Symptoms */}
            <div className="bg-card rounded-xl p-8 shadow-md border border-border">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="h-6 w-6 text-primary" />
                <h3 className="font-display text-xl font-bold text-foreground">
                  Sintomas
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { icon: <Heart className="h-4 w-4" />, text: "Dismenorreia (cólica menstrual intensa)" },
                  { icon: <AlertCircle className="h-4 w-4" />, text: "Dor pélvica crônica" },
                  { icon: <Brain className="h-4 w-4" />, text: "Dispareunia (dor na relação sexual)" },
                  { icon: <Baby className="h-4 w-4" />, text: "Infertilidade" },
                  { icon: <Stethoscope className="h-4 w-4" />, text: "Queixas intestinais e urinárias cíclicas" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2 bg-rose-blush rounded-lg p-3 border border-border">
                    <span className="text-primary mt-0.5">{item.icon}</span>
                    <span className="text-muted-foreground text-sm">{item.text}</span>
                  </div>
                ))}
              </div>
              <p className="text-muted-foreground text-sm mt-4 leading-relaxed text-justify">
                A endometriose interfere em diversos aspectos da vida da mulher, incluindo saúde mental, vida sexual, relações pessoais, trabalho e renda.
              </p>
            </div>


            {/* Productivity at work */}
            <div className="bg-card rounded-xl p-8 shadow-md border border-border">
              <div className="flex items-center gap-3 mb-4">
                <Briefcase className="h-6 w-6 text-primary" />
                <h3 className="font-display text-xl font-bold text-foreground">
                  Impacto no Trabalho
                </h3>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-4 text-justify">
                A endometriose afeta severamente a produtividade das mulheres no ambiente de trabalho. Dores intensas, fadiga crônica e outros sintomas não apenas aumentam as taxas de <strong className="text-foreground">absenteísmo</strong> (ausência no trabalho), mas também de <strong className="text-foreground">presenteísmo</strong> (quando a mulher está fisicamente no trabalho, mas sua produtividade cai drasticamente devido à dor).
              </p>
              <p className="text-muted-foreground leading-relaxed text-justify">
                Empresas que adotam políticas flexíveis e oferecem suporte à saúde feminina observam uma melhora significativa na retenção de talentos e no bem-estar de suas equipes. A conscientização corporativa é o primeiro passo para um ambiente mais acolhedor.
              </p>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Diagnosis */}
            <div className="bg-card rounded-xl p-8 shadow-md border border-border">
              <div className="flex items-center gap-3 mb-4">
                <Stethoscope className="h-6 w-6 text-primary" />
                <h3 className="font-display text-xl font-bold text-foreground">
                  Diagnóstico
                </h3>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-4 text-justify">
                O diagnóstico da endometriose pode ser desafiador. A média entre o início dos sintomas e a confirmação da doença é de <strong className="text-foreground">sete anos</strong>. O processo inclui avaliação clínica e exames de imagem, como a ultrassonografia transvaginal com preparo intestinal ou a ressonância magnética de pelve com contraste.
              </p>
              <p className="text-muted-foreground leading-relaxed text-justify">
                Para mulheres periféricas, o diagnóstico é ainda mais difícil devido à falta de acesso a especialistas e centros de referência.
              </p>
            </div>

            {/* Treatment */}
            <div className="bg-card rounded-xl p-8 shadow-md border border-border">
              <div className="flex items-center gap-3 mb-4">
                <Brain className="h-6 w-6 text-primary" />
                <h3 className="font-display text-xl font-bold text-foreground">
                  Tratamento
                </h3>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-4 text-justify">
                O tratamento pode ser medicamentoso, cirúrgico ou combinado. A escolha depende da gravidade dos sintomas, extensão da doença, desejo de gravidez e idade da paciente.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4 text-justify">
                O <strong className="text-foreground">SUS</strong> oferece tratamentos clínicos e cirúrgicos, incluindo videolaparoscopia. A porta de entrada é a atenção primária à saúde (APS).
              </p>
              <p className="text-muted-foreground leading-relaxed text-justify">
                O acompanhamento psicológico é parte essencial do cuidado, especialmente diante do caráter crônico da doença.
              </p>
            </div>

            {/* Testimonials */}
            <div id="relatos" className="bg-card rounded-xl p-8 shadow-md border border-border">
              <h3 className="font-display text-1xl font-bold text-foreground mb-4">
                Relatos e Depoimentos
              </h3>
              <div className="space-y-3 mb-6">
                <div className="bg-rose-blush rounded-lg p-4 border border-border">
                  <p className="text-muted-foreground italic text-sm leading-relaxed text-justify">
                    "Passei 8 anos sentindo dores terríveis antes de ser diagnosticada. No trabalho, tinha medo de pedir folga e ser vista como preguiçosa."
                  </p>
                  <p className="text-foreground font-semibold text-xs mt-2">— Maria S., 28 anos</p>
                </div>
                <div className="bg-rose-blush rounded-lg p-4 border border-border">
                  <p className="text-muted-foreground italic text-sm leading-relaxed text-justify">
                    "Como gestora, não entendia por que minha funcionária faltava tanto. Depois que aprendi sobre endometriose, mudei toda a política da empresa."
                  </p>
                  <p className="text-foreground font-semibold text-xs mt-2">— Ana L., empresária</p>
                </div>
                <div className="bg-rose-blush rounded-lg p-4 border border-border">
                  <p className="text-muted-foreground italic text-sm leading-relaxed text-justify">
                    "A dor do presenteísmo é invisível. Eu estava no trabalho, mas minha mente estava lutando contra a dor."
                  </p>
                  <p className="text-foreground font-semibold text-xs mt-2">— Juliana R., 32 anos</p>
                </div>
              </div>

              {/* Form to submit a new story */}
              <div className="bg-muted/50 rounded-lg p-5 border border-border">
                <h4 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Send className="h-4 w-4 text-primary" />
                  Compartilhe sua história
                </h4>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <input 
                    type="text" 
                    placeholder="Seu nome (opcional)" 
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full text-sm p-2.5 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition" 
                  />
                  <textarea 
                    placeholder="Escreva seu relato aqui..." 
                    rows={4} 
                    value={relato}
                    onChange={(e) => setRelato(e.target.value)}
                    className="w-full text-sm p-2.5 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition resize-none" 
                    required
                  ></textarea>
                  <button 
                    type="submit" 
                    className="bg-primary text-primary-foreground text-sm font-semibold py-2.5 px-4 rounded-md hover:bg-primary/90 transition w-full shadow-sm"
                  >
                    Enviar Relato
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InfoSection;
