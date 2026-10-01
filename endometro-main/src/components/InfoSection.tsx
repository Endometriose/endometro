import { Heart, Stethoscope, Brain, Baby, AlertCircle } from "lucide-react";

const InfoSection = () => {
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
              <p className="text-muted-foreground leading-relaxed mb-4">
                A <strong className="text-foreground">endometriose</strong> é uma doença caracterizada pelo desenvolvimento e crescimento de estroma e glândulas endometriais fora da cavidade uterina. Esse deslocamento do tecido pode provocar uma reação inflamatória crônica, com taxa de prevalência estimada entre <strong className="text-foreground">5% e 15%</strong> das mulheres em idade reprodutiva.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                As causas ainda não são completamente conhecidas. A literatura aponta hipóteses que envolvem fatores genéticos, hormonais e imunológicos, bem como a possibilidade de menstruação retrógrada.
              </p>
              <p className="text-muted-foreground leading-relaxed font-semibold text-sm">
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
              <p className="text-muted-foreground text-sm mt-4 leading-relaxed">
                A endometriose interfere em diversos aspectos da vida da mulher, incluindo saúde mental, vida sexual, relações pessoais, trabalho e renda.
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
              <p className="text-muted-foreground leading-relaxed mb-4">
                O diagnóstico da endometriose pode ser desafiador. A média entre o início dos sintomas e a confirmação da doença é de <strong className="text-foreground">sete anos</strong>. O processo inclui avaliação clínica e exames de imagem, como a ultrassonografia transvaginal com preparo intestinal ou a ressonância magnética de pelve com contraste.
              </p>
              <p className="text-muted-foreground leading-relaxed">
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
              <p className="text-muted-foreground leading-relaxed mb-4">
                O tratamento pode ser medicamentoso, cirúrgico ou combinado. A escolha depende da gravidade dos sintomas, extensão da doença, desejo de gravidez e idade da paciente.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                O <strong className="text-foreground">SUS</strong> oferece tratamentos clínicos e cirúrgicos, incluindo videolaparoscopia. A porta de entrada é a atenção primária à saúde (APS).
              </p>
              <p className="text-muted-foreground leading-relaxed">
                O acompanhamento psicológico é parte essencial do cuidado, especialmente diante do caráter crônico da doença.
              </p>
            </div>

            {/* Testimonials */}
            <div id="relatos" className="bg-card rounded-xl p-8 shadow-md border border-border">
              <h3 className="font-display text-xl font-bold text-foreground mb-4">
                Relatos & Depoimentos
              </h3>
              <div className="space-y-3">
                <div className="bg-rose-blush rounded-lg p-4 border border-border">
                  <p className="text-muted-foreground italic text-sm leading-relaxed">
                    "Passei 8 anos sentindo dores terríveis antes de ser diagnosticada. No trabalho, tinha medo de pedir folga e ser vista como preguiçosa."
                  </p>
                  <p className="text-foreground font-semibold text-xs mt-2">— Maria S., 28 anos</p>
                </div>
                <div className="bg-rose-blush rounded-lg p-4 border border-border">
                  <p className="text-muted-foreground italic text-sm leading-relaxed">
                    "Como gestora, não entendia por que minha funcionária faltava tanto. Depois que aprendi sobre endometriose, mudei toda a política da empresa."
                  </p>
                  <p className="text-foreground font-semibold text-xs mt-2">— Ana L., empresária</p>
                </div>
                <div className="bg-rose-blush rounded-lg p-4 border border-border">
                  <p className="text-muted-foreground italic text-sm leading-relaxed">
                    "A dor do presenteísmo é invisível. Eu estava no trabalho, mas minha mente estava lutando contra a dor."
                  </p>
                  <p className="text-foreground font-semibold text-xs mt-2">— Juliana R., 32 anos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InfoSection;
