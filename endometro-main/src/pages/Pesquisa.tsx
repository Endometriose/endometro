import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const NOTIFY_EMAIL = "projeto.endometriose.tcc@gmail.com";

const sintomas = [
  "Dor pélvica",
  "Cólica intensa",
  "Fadiga crônica",
  "Dor nas relações sexuais",
  "Sangramento irregular",
  "Dificuldade para engravidar",
  "Dor ao urinar ou evacuar",
  "Náusea",
];

const Pesquisa = () => {
  const navigate = useNavigate();
  const [temEndo, setTemEndo] = useState("");
  const [trabalha, setTrabalha] = useState("");
  const [sintomasSelecionados, setSintomasSelecionados] = useState<string[]>([]);
  const [horasFalta, setHorasFalta] = useState("");
  const [horasPresenteismo, setHorasPresenteismo] = useState("");
  const [tipo, setTipo] = useState("");

  const toggleSintoma = (s: string) => {
    setSintomasSelecionados(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("https://formsubmit.co/ajax/" + NOTIFY_EMAIL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: "[Endometriose] Nova resposta do questionário",
          tipo,
          diagnostico: temEndo,
          trabalhando: trabalha,
          sintomas: sintomasSelecionados.join(", "),
          horas_ausencia: horasFalta,
          horas_presenca_improdutiva: horasPresenteismo,
        }),
      });
    } catch (e) {
      console.error("Erro ao enviar:", e);
    }
    toast.success("Obrigada por participar! Seus dados ajudarão nossa pesquisa.");
    setTimeout(() => navigate("/"), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12 px-4 bg-rose-blush">
        <div className="container mx-auto max-w-2xl">
          <div className="bg-card rounded-xl shadow-lg border border-border p-8">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground text-center mb-2">
              Questionário de Pesquisa
            </h2>
            <p className="text-muted-foreground text-center mb-8 text-sm">
              Suas respostas são anônimas e ajudam a atualizar os dados do nosso estudo.
            </p>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <Label className="text-base font-semibold text-foreground">Você está respondendo como:</Label>
                <RadioGroup value={tipo} onValueChange={setTipo} className="mt-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="mulher" id="tipo-mulher" />
                    <Label htmlFor="tipo-mulher">Mulher/Pessoa com endometriose</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="empresa" id="tipo-empresa" />
                    <Label htmlFor="tipo-empresa">Representante de empresa</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label className="text-base font-semibold text-foreground">Possui diagnóstico de endometriose?</Label>
                <RadioGroup value={temEndo} onValueChange={setTemEndo} className="mt-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="sim" id="endo-sim" />
                    <Label htmlFor="endo-sim">Sim</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="nao" id="endo-nao" />
                    <Label htmlFor="endo-nao">Não</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="suspeita" id="endo-suspeita" />
                    <Label htmlFor="endo-suspeita">Suspeita / Em investigação</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label className="text-base font-semibold text-foreground">Atualmente está trabalhando?</Label>
                <RadioGroup value={trabalha} onValueChange={setTrabalha} className="mt-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="sim" id="trab-sim" />
                    <Label htmlFor="trab-sim">Sim</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="nao" id="trab-nao" />
                    <Label htmlFor="trab-nao">Não</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label className="text-base font-semibold text-foreground mb-2 block">
                  Quais sintomas você sente? (marque todos que se aplicam)
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                  {sintomas.map(s => (
                    <div key={s} className="flex items-center gap-2">
                      <Checkbox
                        id={`sintoma-${s}`}
                        checked={sintomasSelecionados.includes(s)}
                        onCheckedChange={() => toggleSintoma(s)}
                      />
                      <Label htmlFor={`sintoma-${s}`} className="text-sm">{s}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="horas-falta" className="text-base font-semibold text-foreground">
                    Horas de ausência
                  </Label>
                  <Input
                    id="horas-falta"
                    type="number"
                    min="0"
                    value={horasFalta}
                    onChange={e => setHorasFalta(e.target.value)}
                    placeholder="Ex: 8"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="horas-pres" className="text-base font-semibold text-foreground">
                    Horas de presença improdutiva
                  </Label>
                  <Input
                    id="horas-pres"
                    type="number"
                    min="0"
                    value={horasPresenteismo}
                    onChange={e => setHorasPresenteismo(e.target.value)}
                    placeholder="Ex: 20"
                    className="mt-1"
                  />
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full bg-primary text-primary-foreground hover:bg-rose-dark font-semibold text-base rounded-xl"
              >
                Enviar Pesquisa
              </Button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Pesquisa;
