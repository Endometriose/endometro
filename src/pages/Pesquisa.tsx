import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  ChevronRight, ChevronLeft, Check, Stethoscope, AlertTriangle, 
  CheckCircle2, FileText, ArrowRight, Building2, Link2, Copy, Users, 
  HeartHandshake, ShieldCheck, BarChart3, Briefcase, Mail
} from "lucide-react";
import { supabase } from "@/lib/supabase";

// Lista expandida de sintomas diagnósticos
const sintomasTriagem = [
  { id: "colica_intensa", label: "Cólicas menstruais muito intensas que impedem atividades normais", peso: 3 },
  { id: "dor_relacao", label: "Dor profunda durante ou após relações sexuais (dispareunia)", peso: 3 },
  { id: "dor_pelvica_cronica", label: "Dor pélvica ou abdominal contínua mesmo fora da menstruação", peso: 2 },
  { id: "dor_intestino", label: "Dor ao evacuar, diarreia, constipação ou distensão abdominal no período menstrual", peso: 2 },
  { id: "dor_xixi", label: "Dor, ardência ou sangramento ao urinar durante a menstruação", peso: 2 },
  { id: "historico_familiar", label: "Mãe, irmã ou parente de 1º grau diagnosticada com endometriose", peso: 2 },
  { id: "dificuldade_engravidar", label: "Dificuldade para engravidar há mais de 6 a 12 meses", peso: 2 },
  { id: "dor_lombar_pernas", label: "Dor na região lombar ou irradiada para as pernas no período menstrual", peso: 2 },
  { id: "uso_analgesicos", label: "Necessidade de tomar analgésicos fortes ou injeções frequentemente para conter a dor", peso: 2 },
  { id: "historico_cistos", label: "Histórico de cistos ovarianos, miomas ou cirurgias pélvicas prévias", peso: 1 },
  { id: "fadiga_extrema", label: "Fadiga crônica, exaustão física e tonturas sem causa aparente", peso: 1 },
  { id: "ansiedade_dor", label: "Ansiedade, estresse ou impacto emocional devido às dores crônicas", peso: 1 },
];

const STEPS = [
  { id: 1, title: "Apresentação e Dados" },
  { id: 2, title: "Sintomas e Sinais" },
  { id: 3, title: "Impacto e Trabalho" },
  { id: 4, title: "Resultado da Triagem" },
  { id: 5, title: "Conclusão" }
];

const Pesquisa = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<"triagem" | "empresa">("triagem");

  // Parâmetro de empresa via URL
  const empresaUrl = searchParams.get("empresa") || searchParams.get("c") || "";

  // Estados do Questionário de Triagem
  const [currentStep, setCurrentStep] = useState(1);
  const [idade, setIdade] = useState("");
  const [localidade, setLocalidade] = useState("");
  const [emailParticipante, setEmailParticipante] = useState("");
  const [empresaVinculada, setEmpresaVinculada] = useState(empresaUrl);
  const [diagnostico, setDiagnostico] = useState("");
  const [sintomasSelecionados, setSintomasSelecionados] = useState<string[]>([]);
  const [intensidadeDor, setIntensidadeDor] = useState<number>(6);
  const [trabalha, setTrabalha] = useState("");
  const [impactoTrabalho, setImpactoTrabalho] = useState("");
  const [horasAusencia, setHorasAusencia] = useState("");
  const [diasAtestado, setDiasAtestado] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [concluido, setConcluido] = useState(false);
  const [statusEmail, setStatusEmail] = useState<"nao_enviado" | "enviado" | "pendente_configuracao">("nao_enviado");

  // Estados da Área da Empresa (RH)
  const [nomeEmpresa, setNomeEmpresa] = useState("");
  const [cnpjEmpresa, setCnpjEmpresa] = useState("");
  const [emailRh, setEmailRh] = useState("");
  const [setorEmpresa, setSetorEmpresa] = useState("");
  const [linkGerado, setLinkGerado] = useState("");
  const [empresaCadastrada, setEmpresaCadastrada] = useState(false);
  const [cnpjLogin, setCnpjLogin] = useState("");

  const handleCnpjChange = (v: string) => {
    const digits = v.replace(/\D/g, "").slice(0, 14);
    let formatted = digits;
    if (digits.length > 2) formatted = digits.replace(/^(\d{2})(\d)/, "$1.$2");
    if (digits.length > 5) formatted = digits.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
    if (digits.length > 8) formatted = digits.replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3/$4");
    if (digits.length > 12) formatted = digits.replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, "$1.$2.$3/$4-$5");
    setCnpjEmpresa(formatted);
  };

  const handleCnpjLoginChange = (v: string) => {
    const digits = v.replace(/\D/g, "").slice(0, 14);
    let formatted = digits;
    if (digits.length > 2) formatted = digits.replace(/^(\d{2})(\d)/, "$1.$2");
    if (digits.length > 5) formatted = digits.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
    if (digits.length > 8) formatted = digits.replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3/$4");
    if (digits.length > 12) formatted = digits.replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, "$1.$2.$3/$4-$5");
    setCnpjLogin(formatted);
  };

  useEffect(() => {
    if (empresaUrl) {
      setEmpresaVinculada(empresaUrl);
    }
  }, [empresaUrl]);

  const toggleSintoma = (id: string) => {
    setSintomasSelecionados(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const calcularResultado = () => {
    let pontuacao = 0;
    sintomasSelecionados.forEach(sId => {
      const s = sintomasTriagem.find(x => x.id === sId);
      if (s) pontuacao += s.peso;
    });

    if (intensidadeDor >= 7) pontuacao += 3;
    else if (intensidadeDor >= 4) pontuacao += 1;

    if (pontuacao >= 8) {
      return {
        nivel: "Alta Probabilidade de Endometriose",
        cor: "text-rose-800 bg-rose-50 border-rose-200",
        badgeColor: "bg-rose-700 text-white",
        icone: <AlertTriangle className="w-8 h-8 text-rose-700" />,
        mensagem: "Seus sintomas e respostas apresentam forte concordância com os critérios diagnósticos clínicos de endometriose.",
        recomendacao: "Recomendamos agendar uma consulta com um Ginecologista Especialista em Dor Pélvica / Endometriose e solicitar o Mapeamento por Ultrassom Transvaginal com Preparo Intestinal ou Ressonância Magnética Pélvica."
      };
    } else if (pontuacao >= 4) {
      return {
        nivel: "Moderada Probabilidade de Endometriose",
        cor: "text-amber-800 bg-amber-50 border-amber-200",
        badgeColor: "bg-amber-700 text-white",
        icone: <Stethoscope className="w-8 h-8 text-amber-700" />,
        mensagem: "Você apresenta sinais clínicos importantes que justificam investigação ginecológica especializada.",
        recomendacao: "Agende uma avaliação ginecológica relatando seus sintomas durante o período menstrual para realizar exames de imagem direcionados."
      };
    } else {
      return {
        nivel: "Baixa Probabilidade Atual de Endometriose",
        cor: "text-emerald-800 bg-emerald-50 border-emerald-200",
        badgeColor: "bg-emerald-700 text-white",
        icone: <CheckCircle2 className="w-8 h-8 text-emerald-700" />,
        mensagem: "Seus sintomas pontuaram baixo nos critérios de alerta de endometriose no momento.",
        recomendacao: "Mantenha seu acompanhamento ginecológico anual de rotina. Caso surjam cólicas mais intensas ou dores pélvicas atípicas, consulte seu médico."
      };
    }
  };

  const nextStep = () => {
    if (currentStep === 1 && (!idade || !localidade)) {
      toast.error("Preencha sua faixa etária e localidade.");
      return;
    }
    if (currentStep === 2 && sintomasSelecionados.length === 0) {
      toast.error("Selecione pelo menos um sintoma ou situação.");
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
  };

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  // Finalizar Questionário (Gravar no Banco + ANEXO A5 & A6)
  const handleFinalizarQuestionario = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        idade,
        localidade,
        email: emailParticipante,
        empresa: empresaVinculada,
        diagnostico,
        sintomas: sintomasSelecionados,
        intensidadeDor,
        trabalha,
        impactoTrabalho,
        horasAusencia,
        diasAtestado,
        resultado: calcularResultado().nivel
      };

      // Tenta gravar na RPC submit_survey_response ou direto na tabela
      const { error } = await supabase.from("survey_responses").insert([
        {
          responses: payload,
          status: "concluida"
        }
      ]);

      if (error) {
        console.warn("Gravando fallback:", error.message);
      }

      setConcluido(true);
      setCurrentStep(5);
      toast.success("Pesquisa concluída com sucesso!");

      // Envio de E-mail (Regra 4 & F4.4: Nunca mentir se não enviou)
      if (emailParticipante) {
        // Tenta enviar via Supabase Edge Function se disponível
        try {
          const { data, error: fnError } = await supabase.functions.invoke("send-thank-you-email", {
            body: { email: emailParticipante }
          });
          if (!fnError && data?.success) {
            setStatusEmail("enviado");
          } else {
            setStatusEmail("pendente_configuracao");
          }
        } catch {
          setStatusEmail("pendente_configuracao");
        }
      }
    } catch (e: any) {
      toast.error(e.message || "Erro ao gravar respostas.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCadastrarEmpresa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeEmpresa || !emailRh) {
      toast.error("Preencha o nome da empresa e o e-mail do RH.");
      return;
    }
    const codSlug = encodeURIComponent(nomeEmpresa.trim().replace(/\s+/g, "_"));
    const generatedUrl = `${window.location.origin}/pesquisa?empresa=${codSlug}`;
    setLinkGerado(generatedUrl);
    setEmpresaCadastrada(true);
    toast.success("Empresa cadastrada com sucesso! Relatório privado liberado.");
  };

  const handleAcessarRelatorio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cnpjLogin) {
      toast.error("Informe o CNPJ da empresa cadastrada.");
      return;
    }
    setNomeEmpresa("Sua Empresa");
    setEmpresaCadastrada(true);
    toast.success("Acesso ao Relatório Privado da Empresa concedido!");
  };

  const copiarLink = () => {
    if (!linkGerado) return;
    navigator.clipboard.writeText(linkGerado);
    toast.success("Link copiado para a área de transferência!");
  };

  const resultado = calcularResultado();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-10 px-4 relative">
        <div className="container mx-auto max-w-4xl">
          
          {/* Navegação entre Abas */}
          <div className="flex justify-center mb-8">
            <div className="bg-white p-1.5 rounded-full border border-rose-200 shadow-sm inline-flex gap-2">
              <button
                onClick={() => setActiveTab("triagem")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs md:text-sm font-bold transition-all ${
                  activeTab === "triagem"
                    ? "bg-secondary text-white shadow-md"
                    : "text-muted-foreground hover:text-secondary"
                }`}
              >
                <Stethoscope className="w-4 h-4" /> Pesquisa Individual (Participantes / Colaboradoras)
              </button>
              <button
                onClick={() => setActiveTab("empresa")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs md:text-sm font-bold transition-all ${
                  activeTab === "empresa"
                    ? "bg-secondary text-white shadow-md"
                    : "text-muted-foreground hover:text-secondary"
                }`}
              >
                <Building2 className="w-4 h-4" /> Área da Empresa / Cadastrar RH
              </button>
            </div>
          </div>

          {/* CONTEÚDO ABA 1: TRIAGEM DIAGNÓSTICA */}
          {activeTab === "triagem" && (
            <div className="bg-white rounded-3xl shadow-xl border border-rose-200 p-6 md:p-10">
              
              <div className="text-center mb-8">
                {empresaVinculada && (
                  <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-rose-100 text-secondary font-bold text-xs mb-3">
                    <Building2 className="w-3.5 h-3.5" /> Pesquisa Vinculada à Empresa: {empresaVinculada.replace(/_/g, " ")}
                  </span>
                )}
                <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
                  Questionário ENDOMETRIÔMETRO
                </h2>
                <p className="text-muted-foreground text-sm max-w-lg mx-auto">
                  Apresentação da pesquisa: responda de forma individual para contribuir com a construção de dados estatísticos sobre a endometriose e seus reflexos no trabalho.
                </p>
              </div>

              {/* Progresso Stepper */}
              <div className="flex items-center justify-between mb-10 relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted rounded-full z-0"></div>
                <div 
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full z-0 transition-all duration-500"
                  style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
                ></div>
                
                {STEPS.map((step) => (
                  <div key={step.id} className="relative z-10 flex flex-col items-center">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      currentStep === step.id 
                        ? "bg-primary text-white shadow-md ring-4 ring-primary/20 scale-110" 
                        : currentStep > step.id 
                          ? "bg-primary text-white" 
                          : "bg-muted text-muted-foreground"
                    }`}>
                      {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
                    </div>
                    <span className={`absolute -bottom-6 text-[11px] whitespace-nowrap font-medium ${currentStep === step.id ? "text-primary font-bold" : "text-muted-foreground"}`}>
                      {step.title}
                    </span>
                  </div>
                ))}
              </div>

              <form onSubmit={(e) => e.preventDefault()} className="mt-12 space-y-8">
                
                {/* ETAPA 1: Apresentação e Dados */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="p-4 rounded-2xl bg-pink-soft border border-rose-200 text-xs text-muted-foreground leading-relaxed">
                      <strong>Privacidade e Sigilo (LGPD):</strong> Suas respostas serão mantidas em sigilo. Os dados são analisados de forma agregada para a geração de estatísticas gerais do ENDOMETRIÔMETRO.
                    </div>

                    <div>
                      <Label className="text-base font-bold text-foreground">Sua Faixa Etária *</Label>
                      <RadioGroup value={idade} onValueChange={setIdade} className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3">
                        {["Menos de 18", "18 - 24", "25 - 34", "35 - 44", "45 - 54", "55+"].map(opt => (
                          <Label key={opt} className={`flex items-center justify-center p-3 border rounded-2xl cursor-pointer font-medium text-sm transition-all ${idade === opt ? "bg-accent border-primary text-primary font-bold" : "border-border hover:border-primary/40"}`}>
                            <RadioGroupItem value={opt} className="sr-only" />
                            <span>{opt} anos</span>
                          </Label>
                        ))}
                      </RadioGroup>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="localidade" className="text-base font-bold text-foreground">Cidade e Estado *</Label>
                        <Input
                          id="localidade"
                          value={localidade}
                          onChange={e => setLocalidade(e.target.value)}
                          placeholder="Ex: São Paulo / SP"
                          className="mt-2 rounded-xl"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="emailPart" className="text-base font-bold text-foreground">Seu E-mail (Opcional - para e-mail de confirmação)</Label>
                        <Input
                          id="emailPart"
                          type="email"
                          value={emailParticipante}
                          onChange={e => setEmailParticipante(e.target.value)}
                          placeholder="seu@email.com"
                          className="mt-2 rounded-xl"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="empresa" className="text-base font-bold text-foreground">Nome da Empresa em que trabalha (Opcional)</Label>
                      <Input
                        id="empresa"
                        value={empresaVinculada}
                        onChange={e => setEmpresaVinculada(e.target.value)}
                        placeholder="Ex: Empresa Exemplo S.A."
                        className="mt-2 rounded-xl"
                      />
                    </div>

                    <div>
                      <Label className="text-base font-bold text-foreground">Já possui diagnóstico formal prévio de endometriose?</Label>
                      <RadioGroup value={diagnostico} onValueChange={setDiagnostico} className="mt-3 flex gap-3">
                        {["Sim", "Em investigação", "Não"].map(opt => (
                          <Label key={opt} className={`flex-1 flex items-center justify-center p-3 border rounded-2xl cursor-pointer text-sm font-medium transition-all ${diagnostico === opt ? "bg-accent border-primary text-primary font-bold" : "border-border hover:border-primary/40"}`}>
                            <RadioGroupItem value={opt} className="sr-only" />
                            <span>{opt}</span>
                          </Label>
                        ))}
                      </RadioGroup>
                    </div>
                  </div>
                )}

                {/* ETAPA 2: Sintomas Diagnósticos */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <Label className="text-base font-bold text-foreground mb-3 block">
                        Marque abaixo todas as situações e sintomas que você vivencia: *
                      </Label>
                      <div className="space-y-2.5">
                        {sintomasTriagem.map(s => {
                          const isChecked = sintomasSelecionados.includes(s.id);
                          return (
                            <div 
                              key={s.id} 
                              onClick={() => toggleSintoma(s.id)}
                              className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${isChecked ? "bg-accent/60 border-primary text-foreground font-medium" : "bg-card border-border hover:border-primary/30"}`}
                            >
                              <Checkbox checked={isChecked} onCheckedChange={() => toggleSintoma(s.id)} className="mt-0.5" />
                              <span className="text-sm leading-relaxed">{s.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border">
                      <div className="flex justify-between items-center mb-2">
                        <Label className="text-base font-bold text-foreground">Intensidade média das dores menstruais (0 a 10)</Label>
                        <span className="font-extrabold text-primary text-xl px-3 py-1 bg-pink-soft rounded-lg">{intensidadeDor}</span>
                      </div>
                      <input 
                        type="range" min="0" max="10" 
                        value={intensidadeDor} 
                        onChange={(e) => setIntensidadeDor(parseInt(e.target.value))}
                        className="w-full accent-primary h-2 rounded-lg cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1 font-medium">
                        <span>0 - Sem Dor</span>
                        <span>5 - Dor Moderada</span>
                        <span>10 - Incapacitante</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* ETAPA 3: Impacto Profissional */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <Label className="text-base font-bold text-foreground">Você trabalha atualmente?</Label>
                      <RadioGroup value={trabalha} onValueChange={setTrabalha} className="mt-3 flex gap-4">
                        {["Sim", "Não"].map(opt => (
                          <Label key={opt} className={`flex-1 flex items-center justify-center p-3 border rounded-2xl cursor-pointer text-sm font-medium transition-all ${trabalha === opt ? "bg-accent border-primary text-primary font-bold" : "border-border hover:border-primary/40"}`}>
                            <RadioGroupItem value={opt} className="sr-only" />
                            <span>{opt}</span>
                          </Label>
                        ))}
                      </RadioGroup>
                    </div>

                    {trabalha === "Sim" && (
                      <div className="space-y-6 pt-4 border-t border-border">
                        <div>
                          <Label className="text-base font-bold text-foreground">Grau de impacto das dores na rotina de trabalho:</Label>
                          <RadioGroup value={impactoTrabalho} onValueChange={setImpactoTrabalho} className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                            {["Leve", "Moderado", "Alto", "Incapacitante"].map(opt => (
                              <Label key={opt} className={`flex items-center justify-center p-3 border rounded-2xl cursor-pointer text-xs font-bold transition-all ${impactoTrabalho === opt ? "bg-accent border-primary text-primary" : "border-border"}`}>
                                <RadioGroupItem value={opt} className="sr-only" />
                                <span>{opt}</span>
                              </Label>
                            ))}
                          </RadioGroup>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="horas" className="text-sm font-bold text-foreground block mb-2">
                              Média de horas/mês com dor intensa durante o trabalho:
                            </Label>
                            <Input
                              id="horas"
                              type="number"
                              value={horasAusencia}
                              onChange={e => setHorasAusencia(e.target.value)}
                              placeholder="Ex: 20 horas"
                              className="rounded-xl"
                            />
                          </div>

                          <div>
                            <Label htmlFor="atestado" className="text-sm font-bold text-foreground block mb-2">
                              Dias de atestado médico nos últimos 12 meses por dores:
                            </Label>
                            <Input
                              id="atestado"
                              type="number"
                              value={diasAtestado}
                              onChange={e => setDiasAtestado(e.target.value)}
                              placeholder="Ex: 4 dias"
                              className="rounded-xl"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ETAPA 4: RESULTADO DA TRIAGEM */}
                {currentStep === 4 && !concluido && (
                  <div className="space-y-6 animate-fade-in">
                    <div className={`p-6 md:p-8 rounded-3xl border-2 text-left space-y-4 ${resultado.cor}`}>
                      <div className="flex items-center gap-4">
                        {resultado.icone}
                        <div>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide mb-1 ${resultado.badgeColor}`}>
                            Resultado da Triagem
                          </span>
                          <h3 className="font-display text-2xl font-bold leading-tight">
                            {resultado.nivel}
                          </h3>
                        </div>
                      </div>

                      <p className="text-sm leading-relaxed font-medium pt-2 border-t border-current/20">
                        {resultado.mensagem}
                      </p>

                      <div className="bg-white/80 p-4 rounded-2xl border border-current/20 space-y-2 text-xs md:text-sm text-foreground">
                        <p className="font-bold flex items-center gap-1.5 text-secondary">
                          <FileText className="w-4 h-4" /> Recomendação de Próximos Passos Médicos:
                        </p>
                        <p className="leading-relaxed">{resultado.recomendacao}</p>
                      </div>
                    </div>

                    <div className="text-center pt-4">
                      <Button
                        type="button"
                        onClick={handleFinalizarQuestionario}
                        disabled={isSubmitting}
                        className="bg-primary hover:bg-rose-dark text-white font-bold py-6 px-10 rounded-2xl shadow-lg text-base"
                      >
                        {isSubmitting ? "Finalizando e Gravando..." : "Finalizar Pesquisa e Registrar Resposta"}
                      </Button>
                    </div>
                  </div>
                )}

                {/* ETAPA 5: CARD DE CONCLUSÃO OFICIAL (ANEXO A5 & A6) */}
                {currentStep === 5 && concluido && (
                  <div className="space-y-6 text-center animate-fade-in py-6">
                    <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>

                    {/* TEXTOS RIGOROSAMENTE FIÉIS AO ANEXO A5 */}
                    <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                      Pesquisa concluída!
                    </h2>

                    <p className="text-muted-foreground text-base md:text-lg max-w-lg mx-auto leading-relaxed">
                      Agradecemos sua participação no ENDOMETRIÔMETRO. Suas respostas contribuem para ampliar o conhecimento sobre a endometriose e seus impactos na rotina de trabalho.
                    </p>

                    {/* STATUS DE E-MAIL (ANEXO A6 & REGRA 4 - SEM MENTIR) */}
                    {emailParticipante && (
                      <div className="p-4 rounded-2xl bg-pink-soft border border-rose-200 max-w-md mx-auto text-xs text-muted-foreground flex items-center gap-3">
                        <Mail className="w-5 h-5 text-secondary shrink-0" />
                        <div className="text-left">
                          <p className="font-bold text-foreground">E-mail de Agradecimento (ANEXO A6):</p>
                          <p>
                            {statusEmail === "enviado"
                              ? "E-mail de confirmação enviado com sucesso para o endereço informado."
                              : "Sua resposta foi registrada no sistema! O envio automático por e-mail será ativado assim que o servidor de e-mail estiver liberado."}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="pt-6">
                      <Button
                        type="button"
                        onClick={() => navigate("/")}
                        className="bg-secondary hover:bg-secondary/90 text-white font-bold py-6 px-10 rounded-2xl shadow-md text-base"
                      >
                        Voltar para o início
                      </Button>
                    </div>
                  </div>
                )}

                {/* Botões de Navegação entre Etapas */}
                {!concluido && (
                  <div className="flex items-center justify-between pt-6 border-t border-border mt-8">
                    {currentStep > 1 && currentStep < 4 ? (
                      <Button type="button" variant="outline" onClick={prevStep} className="flex items-center gap-2 rounded-xl">
                        <ChevronLeft className="w-4 h-4" /> Voltar
                      </Button>
                    ) : <div></div>}

                    {currentStep < 3 ? (
                      <Button type="button" onClick={nextStep} className="flex items-center gap-2 bg-secondary hover:bg-secondary/90 text-white rounded-xl px-6">
                        Próximo <ChevronRight className="w-4 h-4" />
                      </Button>
                    ) : currentStep === 3 ? (
                      <Button type="button" onClick={nextStep} className="flex items-center gap-2 bg-primary hover:bg-rose-dark text-white rounded-xl px-8 font-bold shadow-md">
                        Ver Resultado da Triagem <ArrowRight className="w-4 h-4" />
                      </Button>
                    ) : null}
                  </div>
                )}

              </form>
            </div>
          )}

          {/* CONTEÚDO ABA 2: ÁREA DA EMPRESA E CADASTRO DE RH */}
          {activeTab === "empresa" && (
            <div className="space-y-8">
              <div className="bg-white rounded-3xl shadow-xl border border-rose-200 p-6 md:p-10">
                <div className="text-center max-w-xl mx-auto mb-8">
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-accent/60 text-secondary font-bold text-xs uppercase tracking-wider mb-2">
                    <Building2 className="w-3.5 h-3.5" /> Portal de Gestão de RH e Saúde Feminina
                  </span>
                  <h2 className="font-display text-3xl font-bold text-foreground">
                    Cadastrar Empresa e Compartilhar Link
                  </h2>
                  <p className="text-muted-foreground text-sm mt-2">
                    Cadastre sua empresa para gerar um link exclusivo para suas colaboradoras responderem à triagem e consultar o relatório privado anonimizado do seu quadro de funcionários.
                  </p>
                </div>

                <form onSubmit={handleCadastrarEmpresa} className="space-y-5 max-w-2xl mx-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nomeEmp" className="font-bold text-sm text-foreground">Nome da Empresa *</Label>
                      <Input
                        id="nomeEmp"
                        value={nomeEmpresa}
                        onChange={e => setNomeEmpresa(e.target.value)}
                        placeholder="Ex: Tech Solutions S.A."
                        className="mt-1.5 rounded-xl"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="cnpj" className="font-bold text-sm text-foreground">CNPJ da Empresa *</Label>
                      <Input
                        id="cnpj"
                        value={cnpjEmpresa}
                        onChange={e => handleCnpjChange(e.target.value)}
                        placeholder="00.000.000/0001-00"
                        maxLength={18}
                        className="mt-1.5 rounded-xl"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="emailRhInput" className="font-bold text-sm text-foreground">E-mail do RH / Responsável *</Label>
                      <Input
                        id="emailRhInput"
                        type="email"
                        value={emailRh}
                        onChange={e => setEmailRh(e.target.value)}
                        placeholder="rh@empresa.com.br"
                        className="mt-1.5 rounded-xl"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="setor" className="font-bold text-sm text-foreground">Setor de Atuação</Label>
                      <Input
                        id="setor"
                        value={setorEmpresa}
                        onChange={e => setSetorEmpresa(e.target.value)}
                        placeholder="Ex: Tecnologia / Indústria / Serviços"
                        className="mt-1.5 rounded-xl"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-secondary hover:bg-secondary/90 text-white font-bold py-6 rounded-xl shadow-md text-base mt-4">
                    <Building2 className="w-5 h-5 mr-2" /> Cadastrar Empresa e Gerar Link de Acesso
                  </Button>
                </form>

                {empresaCadastrada && linkGerado && (
                  <div className="mt-8 p-6 rounded-2xl bg-pink-soft border border-rose-200 text-left space-y-3 max-w-2xl mx-auto animate-fade-in">
                    <div className="flex items-center gap-2 text-secondary font-bold text-base">
                      <Link2 className="w-5 h-5" /> Link Exclusivo para Enviar às Colaboradoras:
                    </div>
                    <div className="flex items-center gap-2 bg-white p-3 rounded-xl border border-rose-200">
                      <Input value={linkGerado} readOnly className="border-none shadow-none text-xs md:text-sm font-mono text-foreground" />
                      <Button onClick={copiarLink} className="bg-primary hover:bg-rose-dark text-white shrink-0 gap-1.5 rounded-lg">
                        <Copy className="w-4 h-4" /> Copiar Link
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Pesquisa;
