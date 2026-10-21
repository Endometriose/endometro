import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  ChevronRight, ChevronLeft, Check, Stethoscope, AlertTriangle, 
  CheckCircle2, FileText, ArrowRight, Mail, Download, Loader2, Lock, Calendar
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { gerarRelatorioIndividual } from "@/lib/relatorio-pdf/gerarPDF";

const UFS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

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

const DEFAULT_SURVEY_ID = "292959ec-4a14-424a-b36e-479ea2832a93";

interface QuestionarioIndividualModalProps {
  isOpen: boolean;
  onClose: () => void;
  empresaToken?: string;
}

export const QuestionarioIndividualModal = ({
  isOpen,
  onClose,
  empresaToken = "",
}: QuestionarioIndividualModalProps) => {
  const queryClient = useQueryClient();

  // Estados do Usuário e Carregamento
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [hasExistingResponse, setHasExistingResponse] = useState(false);
  const [existingResponseId, setExistingResponseId] = useState<string | null>(null);
  const [dataHoraRealizacao, setDataHoraRealizacao] = useState<string>("");
  const [targetCompanyId, setTargetCompanyId] = useState<string | null>(null);
  const [targetCompanyName, setTargetCompanyName] = useState<string>("");

  // Resolver empresa vinculada (pelo token da prop ou da URL)
  useEffect(() => {
    const resolveEmpresa = async () => {
      const search = typeof window !== "undefined" ? window.location.search : "";
      const searchParams = new URLSearchParams(search);
      const token = empresaToken || searchParams.get("empresa") || searchParams.get("token") || searchParams.get("c") || "";
      if (!token) return;

      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token);
        if (isUuid) {
          const { data: c } = await supabase.from("companies").select("id, name, nome_empresa").eq("id", token).maybeSingle();
          if (c) {
            setTargetCompanyId(c.id);
            setTargetCompanyName(c.name || c.nome_empresa || "Empresa");
            return;
          }
        }
        const { data: cBySlug } = await supabase.from("companies").select("id, name, nome_empresa").eq("code_slug", token).maybeSingle();
        if (cBySlug) {
          setTargetCompanyId(cBySlug.id);
          setTargetCompanyName(cBySlug.name || cBySlug.nome_empresa || token);
          return;
        }
        const { data: s } = await supabase.from("surveys").select("id, company_id, title").eq("token", token).maybeSingle();
        if (s?.company_id) {
          const { data: c } = await supabase.from("companies").select("id, name, nome_empresa").eq("id", s.company_id).maybeSingle();
          if (c) {
            setTargetCompanyId(c.id);
            setTargetCompanyName(c.name || c.nome_empresa || s.title);
            return;
          }
        }
        setTargetCompanyId(token);
        setTargetCompanyName(token);
      } catch (err) {
        console.warn("Aviso ao resolver empresa no modal:", err);
      }
    };

    resolveEmpresa();
  }, [empresaToken, isOpen]);

  // Estados do Questionário de Triagem
  const [currentStep, setCurrentStep] = useState(1);
  const [idade, setIdade] = useState("");
  const [cidade, setCidade] = useState("");
  const [bairro, setBairro] = useState("");
  const [uf, setUf] = useState("");
  const [emailParticipante, setEmailParticipante] = useState("");
  const [lgpdAceito, setLgpdAceito] = useState(false);
  const [diagnostico, setDiagnostico] = useState("");
  const [sintomasSelecionados, setSintomasSelecionados] = useState<string[]>([]);
  const [intensidadeDor, setIntensidadeDor] = useState<number>(6);
  const [trabalha, setTrabalha] = useState("");
  const [impactoTrabalho, setImpactoTrabalho] = useState("");
  const [horasAusencia, setHorasAusencia] = useState("");
  const [diasAtestado, setDiasAtestado] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gerandoPdfConclusao, setGerandoPdfConclusao] = useState(false);

  // Formatação amigável de Data e Hora
  const formatarDataHora = (iso: string) => {
    if (!iso) {
      const now = new Date();
      return `${now.toLocaleDateString("pt-BR")} às ${now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
    }
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return iso;
      return `${d.toLocaleDateString("pt-BR")} às ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
    } catch {
      return iso;
    }
  };

  // Carregar dados salvos sempre que o modal for aberto
  useEffect(() => {
    if (!isOpen) return;

    const loadData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (user) {
        setCurrentUser(user);
        setEmailParticipante(user.email || "");

        let foundResponse: any = null;

        // 1. Tenta buscar no Supabase por user_id
        try {
          const { data: byUser } = await supabase
            .from("survey_responses")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (byUser) {
            foundResponse = byUser;
          }
        } catch (e) {
          console.warn("Erro ao buscar por user_id no Supabase:", e);
        }

        // 2. Se não encontrou, busca no Supabase por email
        if (!foundResponse && user.email) {
          try {
            const { data: byEmail } = await supabase
              .from("survey_responses")
              .select("*")
              .eq("responses->>email", user.email)
              .order("created_at", { ascending: false })
              .limit(1)
              .maybeSingle();

            if (byEmail) {
              foundResponse = byEmail;
            }
          } catch (e) {
            console.warn("Erro ao buscar por email no Supabase:", e);
          }
        }

        // 3. Fallback: buscar no localStorage persistente SOMENTE para este usuário específico
        if (!foundResponse && user.email) {
          try {
            const cached = localStorage.getItem(`survey_response_${user.email.toLowerCase()}`) ||
                           localStorage.getItem(`survey_response_${user.id}`);
            if (cached) {
              const parsed = JSON.parse(cached);
              const dataPayload = parsed.payload || parsed;
              foundResponse = { responses: dataPayload, id: `local_${user.id}`, created_at: dataPayload.data_realizacao || new Date().toISOString() };
            }
          } catch (e) {
            console.warn("Erro ao ler localStorage:", e);
          }
        }

        // Se encontrou dados anteriores deste usuário específico, preenche os campos com os valores marcados
        if (foundResponse) {
          const resp = foundResponse.responses || foundResponse;
          setHasExistingResponse(true);
          setExistingResponseId(foundResponse.id || null);

          const iso = resp.data_realizacao || resp.data_pesquisa || foundResponse.completed_at || foundResponse.created_at || new Date().toISOString();
          setDataHoraRealizacao(iso);

          if (resp.idade) setIdade(resp.idade);
          if (resp.cidade) setCidade(resp.cidade);
          if (resp.bairro) setBairro(resp.bairro);
          if (resp.uf || resp.estado) setUf(resp.uf || resp.estado);
          if (resp.diagnostico) setDiagnostico(resp.diagnostico);
          if (resp.sintomas && Array.isArray(resp.sintomas)) setSintomasSelecionados(resp.sintomas);
          if (resp.intensidadeDor !== undefined && resp.intensidadeDor !== null) {
            setIntensidadeDor(Number(resp.intensidadeDor) || 6);
          } else if (resp.intensidade_dor !== undefined && resp.intensidade_dor !== null) {
            setIntensidadeDor(Number(resp.intensidade_dor) || 6);
          }
          const trabalhaRaw = resp.trabalha ?? foundResponse.trabalha;
          const trabalhaVal = (trabalhaRaw === true || trabalhaRaw === "Sim" || String(trabalhaRaw).toLowerCase() === "sim") ? "Sim" : "Não";
          setTrabalha(trabalhaVal);

          if (resp.impactoTrabalho || resp.impacto_trabalho) setImpactoTrabalho(resp.impactoTrabalho || resp.impacto_trabalho);
          if (resp.horasAusencia || resp.horas_ausencia) setHorasAusencia(String(resp.horasAusencia || resp.horas_ausencia));
          if (resp.diasAtestado || resp.dias_atestado) setDiasAtestado(String(resp.diasAtestado || resp.dias_atestado));

          setLgpdAceito(true);

          toast.info("Pesquisa registrada identificada!", {
            description: "Suas respostas foram carregadas em modo de visualização. Clique nos números das etapas para consultar os dados.",
          });
        } else {
          // Novo participante ou participante que ainda não respondeu: formulário limpo para responder à pesquisa
          setHasExistingResponse(false);
          setExistingResponseId(null);
          setCurrentStep(1);
          setDataHoraRealizacao("");
          setIdade("");
          setCidade("");
          setBairro("");
          setUf("");
          setDiagnostico("");
          setSintomasSelecionados([]);
          setIntensidadeDor(6);
          setTrabalha("");
          setImpactoTrabalho("");
          setHorasAusencia("");
          setDiasAtestado("");
          setLgpdAceito(false);
        }
      }
    };

    loadData();
  }, [isOpen]);

  const toggleSintoma = (id: string) => {
    if (hasExistingResponse) return; // Bloqueado em modo de visualização
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

  const handleGerarPdf = async () => {
    setGerandoPdfConclusao(true);
    try {
      const res = calcularResultado();
      await gerarRelatorioIndividual({
        resultado: res.nivel,
        sintomas: sintomasSelecionados,
        intensidadeDor: intensidadeDor,
        horasAusencia: horasAusencia || 0,
        diasAtestado: diasAtestado || 0,
        trabalha: trabalha,
        impactoTrabalho: impactoTrabalho,
        diagnostico: diagnostico,
        idade: idade,
        cidade: cidade,
        bairro: bairro,
        uf: uf,
        dataEmissao: formatarDataHora(dataHoraRealizacao),
        temDadoTeste: false,
      });
      toast.success("PDF do Resumo Individual gerado com sucesso!");
    } catch (e) {
      toast.error("Erro ao gerar PDF.");
    } finally {
      setGerandoPdfConclusao(false);
    }
  };

  const nextStep = () => {
    if (hasExistingResponse) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
      return;
    }
    if (currentStep === 1) {
      if (!idade || !cidade || !uf) {
        toast.error("Preencha sua faixa etária, cidade e estado.");
        return;
      }
      if (!lgpdAceito) {
        toast.error("Você precisa aceitar os Termos de Consentimento LGPD para continuar.");
        return;
      }
    }
    if (currentStep === 2 && sintomasSelecionados.length === 0) {
      toast.error("Selecione pelo menos um sintoma ou situação.");
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
  };

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleFinalizarQuestionario = async () => {
    if (hasExistingResponse) {
      toast.info("Esta pesquisa já foi gravada e não permite alterações.", {
        description: "Você pode baixar seu resumo oficial em PDF.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || currentUser?.id;
      const userEmail = user?.email || currentUser?.email || emailParticipante;

      if (!userId) {
        throw new Error("Usuário não autenticado. Faça login novamente.");
      }

      const nowIso = new Date().toISOString();

      // 1. Garantir perfil
      await supabase.from("profiles").upsert([{
        id: userId,
        email: userEmail,
        role: "participante",
      }]);

      const localidade = `${cidade}${bairro ? `, ${bairro}` : ""} / ${uf}`;
      const payload = {
        idade,
        cidade,
        bairro,
        uf,
        localidade,
        email: userEmail,
        empresa_token: empresaToken || null,
        company_id: targetCompanyId || null,
        empresa_nome: targetCompanyName || null,
        diagnostico,
        sintomas: sintomasSelecionados,
        intensidadeDor,
        trabalha,
        impactoTrabalho,
        horasAusencia,
        diasAtestado,
        resultado: calcularResultado().nivel,
        lgpd_aceito: true,
        data_realizacao: nowIso,
      };

      const trabalhaBool = trabalha === "Sim" || trabalha === true || String(trabalha).toLowerCase() === "sim";
      let insertedId: string | null = null;

      // 2. Gravar no Supabase via RPC SECURITY DEFINER (compatível com RLS)
      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc("submit_survey_response", {
          p_survey_id: DEFAULT_SURVEY_ID,
          p_company_id: targetCompanyId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetCompanyId) ? targetCompanyId : null,
          p_responses: payload,
        });

        if (!rpcError && rpcData?.response_id) {
          insertedId = rpcData.response_id;
        }
      } catch (err) {
        console.warn("Aviso na chamada RPC submit_survey_response:", err);
      }

      // Tentar também insert direto complementar
      try {
        const { data: directData } = await supabase
          .from("survey_responses")
          .insert([{
            survey_id: DEFAULT_SURVEY_ID,
            company_id: targetCompanyId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetCompanyId) ? targetCompanyId : null,
            user_id: userId,
            idade: idade || "25 - 34",
            cidade: cidade || "São Paulo",
            bairro: bairro || "",
            estado: uf || "SP",
            diagnostico: diagnostico || "Não",
            sintomas: sintomasSelecionados,
            intensidade_dor: Number(intensidadeDor) || 0,
            trabalha: trabalhaBool,
            impacto_trabalho: impactoTrabalho || "Moderado",
            horas_ausencia: Number(horasAusencia) || 0,
            responses: payload,
            status: "concluida",
          }])
          .select("id")
          .maybeSingle();

        if (directData?.id) insertedId = directData.id;
      } catch (insertErr) {
        console.warn("Aviso insert direto survey_responses:", insertErr);
      }

      // 3. Salvar no localStorage da participante
      if (userEmail) {
        localStorage.setItem(`survey_response_${userEmail.toLowerCase()}`, JSON.stringify(payload));
      }
      localStorage.setItem(`survey_response_${userId}`, JSON.stringify(payload));

      // 4. Salvar e sincronizar no repositório compartilhado da empresa para atualização imediata dos relatórios
      if (targetCompanyId) {
        try {
          const colabEntry = {
            id: insertedId || `colab_${Date.now()}`,
            nome: userEmail ? userEmail.split("@")[0].replace(/[._]/g, " ") : "Colaboradora",
            email: userEmail || "colaboradora@empresa.com",
            idade: idade || "25 - 34",
            diagnosticoPrevio: diagnostico,
            resultado: calcularResultado().nivel,
            nivelProbabilidade: calcularResultado().nivel.toLowerCase().includes("alta") ? "Alto" : calcularResultado().nivel.toLowerCase().includes("mod") ? "Moderado" : "Baixo",
            intensidadeDor: intensidadeDor,
            sintomas: sintomasSelecionados,
            impactoTrabalho: impactoTrabalho,
            horasAusencia: horasAusencia,
            diasAtestado: diasAtestado,
            dataResposta: nowIso,
            company_id: targetCompanyId,
            responses: payload,
          };

          const key = `respostas_empresa_${targetCompanyId}`;
          const currentList = JSON.parse(localStorage.getItem(key) || "[]");
          currentList.unshift(colabEntry);
          localStorage.setItem(key, JSON.stringify(currentList));

          // Notificar abas abertas e componentes de relatório
          window.dispatchEvent(new CustomEvent("nova_resposta_empresa", { detail: colabEntry }));
          window.dispatchEvent(new Event("empresa_atualizada"));
        } catch (e) {
          console.warn("Aviso ao sincronizar resposta da empresa:", e);
        }
      }
      localStorage.setItem(`survey_response_${userId}`, JSON.stringify(payload));

      queryClient.invalidateQueries({ queryKey: ["indicadores"] });
      queryClient.invalidateQueries({ queryKey: ["panorama"] });

      setHasExistingResponse(true);
      setDataHoraRealizacao(nowIso);
      setExistingResponseId(insertedData?.id || `local_${userId}`);
      setCurrentStep(5);
      toast.success("Pesquisa concluída com sucesso!");
    } catch (e: any) {
      toast.error(e.message || "Erro ao gravar respostas.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resultado = calcularResultado();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-[96vw] max-h-[92vh] overflow-y-auto p-5 sm:p-8 md:p-10 bg-white rounded-3xl border border-rose-200/90 shadow-2xl">
        <DialogTitle className="sr-only">Questionário ENDOMETRIÔMETRO</DialogTitle>
        <DialogDescription className="sr-only">
          Questionário de avaliação individual da endometriose
        </DialogDescription>

        {/* Header do Modal */}
        <div className="text-center max-w-xl mx-auto mb-4">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent text-secondary font-bold text-xs uppercase tracking-wider mb-2">
            Pesquisa Geral Individual
          </span>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            Questionário ENDOMETRIÔMETRO
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1.5">
            Apresentação da pesquisa: responda de forma individual para contribuir com a construção de dados estatísticos sobre a endometriose e seus reflexos no trabalho.
          </p>
        </div>

        {/* Alerta de Modo Somente Leitura com Data e Hora */}
        {hasExistingResponse && (
          <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-amber-50/90 border border-amber-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 shadow-xs animate-fade-in">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl shrink-0 mt-0.5">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-amber-950 text-sm sm:text-base flex items-center gap-2">
                  Pesquisa Registrada — Modo Somente Leitura
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-amber-900 font-medium">
                  <span className="flex items-center gap-1 font-bold bg-amber-200/70 px-2.5 py-0.5 rounded-full">
                    <Calendar className="w-3.5 h-3.5" /> Realizada em: {formatarDataHora(dataHoraRealizacao)}
                  </span>
                  <span>• Navegue pelos números de 1 a 5 para consultar suas respostas.</span>
                </div>
              </div>
            </div>
            <Button
              type="button"
              onClick={handleGerarPdf}
              disabled={gerandoPdfConclusao}
              className="bg-primary hover:bg-rose-dark text-white font-bold rounded-xl gap-2 text-xs sm:text-sm shrink-0 shadow-sm w-full sm:w-auto"
            >
              {gerandoPdfConclusao ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Baixar Resumo em PDF
            </Button>
          </div>
        )}

        {/* Stepper Clicável com Numeração 1, 2, 3, 4, 5 */}
        <div className="flex items-center justify-between mb-10 relative px-2 sm:px-6">
          <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-muted rounded-full z-0"></div>
          <div 
            className="absolute left-6 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full z-0 transition-all duration-300"
            style={{ width: `calc(${((currentStep - 1) / (STEPS.length - 1)) * 100}% - 12px)` }}
          ></div>
          
          {STEPS.map((step) => (
            <button
              key={step.id}
              type="button"
              onClick={() => setCurrentStep(step.id)}
              className="relative z-10 flex flex-col items-center group cursor-pointer focus:outline-none"
              title={`Ir para etapa ${step.id}: ${step.title}`}
            >
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all ${
                currentStep === step.id 
                  ? "bg-primary text-white shadow-md ring-4 ring-primary/20 scale-110" 
                  : currentStep > step.id 
                    ? "bg-secondary text-white shadow-xs" 
                    : "bg-muted text-muted-foreground group-hover:bg-rose-100 group-hover:text-primary"
              }`}>
                {step.id}
              </div>
              <span className={`absolute -bottom-6 text-[10px] sm:text-[11px] whitespace-nowrap font-medium transition-colors ${
                currentStep === step.id ? "text-primary font-bold" : "text-muted-foreground group-hover:text-foreground"
              }`}>
                {step.title}
              </span>
            </button>
          ))}
        </div>

        {/* Formulário do Questionário */}
        <div className="mt-8 space-y-6">

          {/* QUADRO 1: Apresentação e Dados */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <Label className="text-sm sm:text-base font-bold text-foreground">Sua Faixa Etária *</Label>
                <div className="mt-2.5 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {["Menos de 18", "18 - 24", "25 - 34", "35 - 44", "45 - 54", "55+"].map(opt => {
                    const isSelected = idade === opt;
                    return (
                      <div
                        key={opt}
                        onClick={() => !hasExistingResponse && setIdade(opt)}
                        className={`flex items-center justify-center p-3 border rounded-2xl font-bold text-xs sm:text-sm transition-all select-none ${
                          isSelected
                            ? "bg-secondary text-white border-secondary shadow-md ring-2 ring-secondary/30 scale-102"
                            : hasExistingResponse
                              ? "bg-muted/20 border-border text-muted-foreground/50 opacity-60 cursor-default"
                              : "border-border hover:border-primary/40 cursor-pointer text-foreground"
                        }`}
                      >
                        <span>{opt} anos {isSelected && " ✓"}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Localização Estruturada */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="sm:col-span-1">
                  <Label htmlFor="modal-cidade" className="text-xs sm:text-sm font-bold text-foreground">Cidade *</Label>
                  <Input 
                    id="modal-cidade" 
                    value={cidade} 
                    onChange={e => setCidade(e.target.value)} 
                    disabled={hasExistingResponse} 
                    placeholder="Ex: São Paulo" 
                    className="mt-1.5 rounded-xl disabled:bg-rose-50/70 disabled:text-foreground disabled:font-bold disabled:border-rose-300 disabled:opacity-100" 
                    required 
                  />
                </div>
                <div className="sm:col-span-1">
                  <Label htmlFor="modal-bairro" className="text-xs sm:text-sm font-bold text-foreground">Bairro</Label>
                  <Input 
                    id="modal-bairro" 
                    value={bairro} 
                    onChange={e => setBairro(e.target.value)} 
                    disabled={hasExistingResponse} 
                    placeholder="Ex: Vila Madalena" 
                    className="mt-1.5 rounded-xl disabled:bg-rose-50/70 disabled:text-foreground disabled:font-bold disabled:border-rose-300 disabled:opacity-100" 
                  />
                </div>
                <div className="sm:col-span-1">
                  <Label htmlFor="modal-uf" className="text-xs sm:text-sm font-bold text-foreground">Estado *</Label>
                  <select
                    id="modal-uf"
                    value={uf}
                    onChange={e => setUf(e.target.value)}
                    disabled={hasExistingResponse}
                    className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:bg-rose-50/70 disabled:text-foreground disabled:font-bold disabled:border-rose-300 disabled:opacity-100"
                    required
                  >
                    <option value="">Selecione</option>
                    {UFS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              {/* Identificação do Participante */}
              {currentUser && (
                <div className="p-3.5 rounded-2xl bg-pink-soft/80 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div>
                    <span className="text-[11px] font-bold text-muted-foreground block">
                      Participante Autenticada:
                    </span>
                    <span className="text-xs sm:text-sm font-extrabold text-secondary">
                      {currentUser.email}
                    </span>
                  </div>
                  {hasExistingResponse ? (
                    <span className="text-[11px] font-bold bg-amber-600 text-white px-3 py-1 rounded-full self-start sm:self-auto shadow-xs flex items-center gap-1.5">
                      <Lock className="w-3 h-3" /> Respostas Gravadas (Modo Leitura)
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold bg-secondary text-white px-3 py-1 rounded-full self-start sm:self-auto shadow-xs">
                      Pronta para responder
                    </span>
                  )}
                </div>
              )}

              {/* Checkbox LGPD */}
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-pink-soft border border-rose-200">
                <input
                  type="checkbox"
                  id="modal-lgpd"
                  checked={lgpdAceito}
                  disabled={hasExistingResponse}
                  onChange={e => !hasExistingResponse && setLgpdAceito(e.target.checked)}
                  className="mt-0.5 accent-primary h-4 w-4 cursor-pointer disabled:cursor-not-allowed"
                />
                <label htmlFor="modal-lgpd" className="text-xs text-muted-foreground leading-snug cursor-pointer font-medium">
                  <strong>Consentimento LGPD *</strong> — Li e concordo com os Termos de Consentimento para uso dos meus dados de saúde nesta pesquisa. Compreendo que minhas respostas serão mantidas em sigilo e utilizadas de forma agregada para pesquisas médicas e científicas.
                </label>
              </div>

              <div>
                <Label className="text-xs sm:text-sm font-bold text-foreground">Já possui diagnóstico formal prévio de endometriose?</Label>
                <div className="mt-2.5 flex gap-2.5">
                  {["Sim", "Em investigação", "Não"].map(opt => {
                    const isSelected = diagnostico === opt;
                    return (
                      <div
                        key={opt}
                        onClick={() => !hasExistingResponse && setDiagnostico(opt)}
                        className={`flex-1 flex items-center justify-center p-3 border rounded-2xl text-xs sm:text-sm font-bold transition-all select-none ${
                          isSelected
                            ? "bg-secondary text-white border-secondary shadow-md ring-2 ring-secondary/30"
                            : hasExistingResponse
                              ? "border-border text-muted-foreground/50 opacity-60 bg-muted/20 cursor-default"
                              : "border-border hover:border-primary/40 cursor-pointer text-foreground"
                        }`}
                      >
                        <span>{opt} {isSelected && " ✓"}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* QUADRO 2: Sintomas Diagnósticos */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-xs sm:text-sm font-bold text-foreground">
                    Marque abaixo todas as situações e sintomas que você vivencia: *
                  </Label>
                  {hasExistingResponse && (
                    <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Bloqueado
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  {sintomasTriagem.map(s => {
                    const isChecked = sintomasSelecionados.includes(s.id);
                    return (
                      <div 
                        key={s.id} 
                        onClick={() => toggleSintoma(s.id)}
                        className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all ${
                          hasExistingResponse ? "cursor-default" : "cursor-pointer"
                        } ${isChecked 
                          ? "bg-rose-100/90 border-secondary text-foreground font-bold shadow-xs ring-1 ring-secondary/30" 
                          : hasExistingResponse 
                            ? "bg-card border-border/60 opacity-50 text-muted-foreground" 
                            : "bg-card border-border hover:border-primary/30 text-foreground"}`}
                      >
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border ${
                          isChecked ? "bg-secondary border-secondary text-white" : "border-muted-foreground/40 bg-white"
                        }`}>
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <span className="text-xs sm:text-sm leading-relaxed">{s.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-border">
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-xs sm:text-sm font-bold text-foreground">Intensidade média das dores menstruais (0 a 10)</Label>
                  <span className="font-extrabold text-white text-lg sm:text-xl px-3.5 py-1 bg-secondary rounded-xl shadow-xs">{intensidadeDor}</span>
                </div>
                <input 
                  type="range" min="0" max="10" 
                  value={intensidadeDor} 
                  disabled={hasExistingResponse}
                  onChange={(e) => !hasExistingResponse && setIntensidadeDor(parseInt(e.target.value))}
                  className="w-full accent-secondary h-2.5 rounded-lg cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                />
                <div className="flex justify-between text-[11px] text-muted-foreground mt-1 font-medium">
                  <span>0 - Sem Dor</span>
                  <span>5 - Dor Moderada</span>
                  <span>10 - Incapacitante</span>
                </div>
              </div>
            </div>
          )}

          {/* QUADRO 3: Impacto Profissional */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs sm:text-sm font-bold text-foreground">Você trabalha atualmente?</Label>
                  {hasExistingResponse && (
                    <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Bloqueado
                    </span>
                  )}
                </div>
                <div className="mt-2 flex gap-3">
                  {["Sim", "Não"].map(opt => {
                    const isSelected = trabalha === opt;
                    return (
                      <div
                        key={opt}
                        onClick={() => !hasExistingResponse && setTrabalha(opt)}
                        className={`flex-1 flex items-center justify-center p-3 border rounded-2xl text-xs sm:text-sm font-bold transition-all select-none ${
                          isSelected
                            ? "bg-secondary text-white border-secondary shadow-md ring-2 ring-secondary/30"
                            : hasExistingResponse
                              ? "border-border text-muted-foreground/50 opacity-60 bg-muted/20 cursor-default"
                              : "border-border hover:border-primary/40 cursor-pointer text-foreground"
                        }`}
                      >
                        <span>{opt} {isSelected && " ✓"}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {trabalha === "Sim" && (
                <div className="space-y-4 pt-3 border-t border-border">
                  <div>
                    <Label className="text-xs sm:text-sm font-bold text-foreground">Grau de impacto das dores na rotina de trabalho:</Label>
                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {["Leve", "Moderado", "Alto", "Incapacitante"].map(opt => {
                        const isSelected = impactoTrabalho === opt;
                        return (
                          <div
                            key={opt}
                            onClick={() => !hasExistingResponse && setImpactoTrabalho(opt)}
                            className={`flex items-center justify-center p-2.5 border rounded-2xl text-xs font-bold transition-all select-none ${
                              isSelected
                                ? "bg-secondary text-white border-secondary shadow-md ring-2 ring-secondary/30"
                                : hasExistingResponse
                                  ? "border-border text-muted-foreground/50 opacity-60 bg-muted/20 cursor-default"
                                  : "border-border hover:border-primary/40 cursor-pointer text-foreground"
                            }`}
                          >
                            <span>{opt} {isSelected && " ✓"}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <Label htmlFor="modal-horas" className="text-xs sm:text-sm font-bold text-foreground block mb-1">
                        Média de horas/mês com dor intensa no trabalho:
                      </Label>
                      <Input
                        id="modal-horas"
                        type="number"
                        value={horasAusencia}
                        disabled={hasExistingResponse}
                        onChange={e => setHorasAusencia(e.target.value)}
                        placeholder="Ex: 20 horas"
                        className="rounded-xl disabled:bg-rose-50/70 disabled:text-foreground disabled:font-bold disabled:border-rose-300 disabled:opacity-100"
                      />
                    </div>

                    <div>
                      <Label htmlFor="modal-atestado" className="text-xs sm:text-sm font-bold text-foreground block mb-1">
                        Dias de atestado médico nos últimos 12 meses por dores:
                      </Label>
                      <Input
                        id="modal-atestado"
                        type="number"
                        value={diasAtestado}
                        disabled={hasExistingResponse}
                        onChange={e => setDiasAtestado(e.target.value)}
                        placeholder="Ex: 4 dias"
                        className="rounded-xl disabled:bg-rose-50/70 disabled:text-foreground disabled:font-bold disabled:border-rose-300 disabled:opacity-100"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* QUADRO 4: RESULTADO DA TRIAGEM */}
          {currentStep === 4 && (
            <div className="space-y-5 animate-fade-in">
              <div className={`p-5 sm:p-7 rounded-3xl border-2 text-left space-y-3.5 ${resultado.cor}`}>
                <div className="flex items-center gap-3.5">
                  {resultado.icone}
                  <div>
                    <span className={`inline-block px-3 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wide mb-1 ${resultado.badgeColor}`}>
                      Resultado da Triagem
                    </span>
                    <h3 className="font-display text-xl sm:text-2xl font-bold leading-tight">
                      {resultado.nivel}
                    </h3>
                  </div>
                </div>

                <p className="text-xs sm:text-sm leading-relaxed font-medium pt-2 border-t border-current/20">
                  {resultado.mensagem}
                </p>

                <div className="bg-white/80 p-3.5 rounded-2xl border border-current/20 space-y-1.5 text-xs sm:text-sm text-foreground">
                  <p className="font-bold flex items-center gap-1.5 text-secondary">
                    <FileText className="w-4 h-4" /> Recomendação de Próximos Passos Médicos:
                  </p>
                  <p className="leading-relaxed">{resultado.recomendacao}</p>
                </div>
              </div>

              {/* SINTOMAS RELATADOS NO QUESTIONÁRIO (Exibição idêntica ao questionário) */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-rose-200 shadow-sm space-y-3 text-left">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-rose-100 pb-2 gap-1">
                  <h4 className="font-bold text-xs sm:text-sm text-foreground flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" /> Sintomas e Situações Relatadas no Questionário ({sintomasSelecionados.length})
                  </h4>
                  <span className="text-[11px] text-secondary font-bold bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200 self-start sm:self-auto">
                    Formato original da pesquisa
                  </span>
                </div>
                {sintomasSelecionados.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">Nenhum sintoma específico marcado.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {sintomasSelecionados.map((sId) => {
                      const item = sintomasTriagem.find(x => x.id === sId);
                      const label = item?.label || sId;
                      return (
                        <div key={sId} className="flex items-start gap-2 p-2.5 rounded-xl bg-rose-50/70 border border-rose-200 text-xs text-foreground font-medium shadow-xs">
                          <span className="w-3.5 h-3.5 rounded-full bg-secondary text-white flex items-center justify-center shrink-0 mt-0.5 text-[9px] font-bold">✓</span>
                          <span className="leading-snug">{label}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Data e Hora da Pesquisa Realizada */}
              {hasExistingResponse && (
                <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm">
                  <div className="flex items-center gap-2 text-foreground font-semibold">
                    <Calendar className="w-4 h-4 text-primary shrink-0" />
                    <span>Data e Hora da Pesquisa Realizada:</span>
                    <span className="font-extrabold text-secondary">{formatarDataHora(dataHoraRealizacao)}</span>
                  </div>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full text-xs flex items-center gap-1 shadow-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Protocolado no sistema
                  </span>
                </div>
              )}

              {/* Botões do Quadro 4 */}
              <div className="text-center pt-2">
                {hasExistingResponse ? (
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Button
                      type="button"
                      onClick={handleGerarPdf}
                      disabled={gerandoPdfConclusao}
                      className="w-full sm:w-auto bg-primary hover:bg-rose-dark text-white font-bold py-5 px-8 rounded-2xl shadow-lg text-sm sm:text-base gap-2"
                    >
                      {gerandoPdfConclusao ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                      Baixar meu Resumo em PDF
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setCurrentStep(5)}
                      className="w-full sm:w-auto bg-secondary hover:bg-secondary/90 text-white font-bold py-5 px-8 rounded-2xl shadow-md text-sm sm:text-base gap-2"
                    >
                      Ver Conclusão <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    onClick={handleFinalizarQuestionario}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto bg-primary hover:bg-rose-dark text-white font-bold py-5 px-8 rounded-2xl shadow-lg text-sm sm:text-base"
                  >
                    {isSubmitting ? "Finalizando e Gravando..." : "Finalizar Pesquisa e Registrar Resposta"}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* QUADRO 5: CONCLUSÃO */}
          {currentStep === 5 && (
            <div className="space-y-6 text-center animate-fade-in py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                  Pesquisa concluída e registrada!
                </h2>
                <p className="text-muted-foreground text-xs sm:text-sm max-w-md mx-auto mt-2 leading-relaxed">
                  Agradecemos sua participação no ENDOMETRIÔMETRO. Suas respostas contribuem para ampliar o conhecimento sobre a endometriose e seus reflexos no trabalho.
                </p>
              </div>

              {/* Data e Hora da Pesquisa Realizada */}
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 max-w-md mx-auto text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-2.5 shadow-xs">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary shrink-0" />
                  <span className="font-semibold text-foreground">Data e hora da pesquisa realizada:</span>
                </div>
                <span className="font-extrabold text-secondary text-sm">{formatarDataHora(dataHoraRealizacao)}</span>
              </div>

              {emailParticipante && (
                <div className="p-3.5 rounded-2xl bg-pink-soft border border-rose-200 max-w-md mx-auto text-xs text-muted-foreground flex items-center gap-3">
                  <Mail className="w-5 h-5 text-secondary shrink-0" />
                  <div className="text-left">
                    <p className="font-bold text-foreground">Confirmação de Resposta:</p>
                    <p>
                      Sua resposta está protocolada no sistema e computada nas estatísticas consolidadas.
                    </p>
                  </div>
                </div>
              )}

              {/* Botão de Download do PDF (o mesmo botão que existe quando o usuário faz a pesquisa) */}
              <div className="bg-white border border-rose-200 rounded-3xl p-5 sm:p-6 max-w-md mx-auto text-left shadow-sm">
                <div className="flex items-center gap-2 mb-1.5">
                  <FileText className="w-5 h-5 text-primary" />
                  <p className="font-bold text-foreground text-sm sm:text-base">Baixe seu Resumo Pessoal em PDF</p>
                </div>
                <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                  Documento com o relatório completo dos seus sintomas, classificação diagnóstica e orientações médicas.
                </p>
                <Button
                  type="button"
                  disabled={gerandoPdfConclusao}
                  onClick={handleGerarPdf}
                  className="w-full bg-primary hover:bg-rose-dark text-white font-bold rounded-2xl gap-2 text-sm sm:text-base py-6 shadow-md"
                >
                  {gerandoPdfConclusao ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                  {gerandoPdfConclusao ? "Gerando PDF..." : "Baixar meu Resumo em PDF"}
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(4)}
                  className="w-full sm:w-auto rounded-xl gap-2 text-xs sm:text-sm font-semibold"
                >
                  <ChevronLeft className="w-4 h-4" /> Voltar ao Resultado (Quadro 4)
                </Button>
                <Button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto bg-secondary hover:bg-secondary/90 text-white font-bold py-3 px-8 rounded-xl shadow-md text-xs sm:text-sm"
                >
                  Concluir e Fechar
                </Button>
              </div>
            </div>
          )}

          {/* Botões de Navegação entre Etapas */}
          {currentStep < 5 && (
            <div className="flex items-center justify-between pt-4 border-t border-border mt-6">
              {currentStep > 1 ? (
                <Button type="button" variant="outline" onClick={prevStep} className="flex items-center gap-2 rounded-xl text-xs sm:text-sm">
                  <ChevronLeft className="w-4 h-4" /> Voltar
                </Button>
              ) : <div></div>}

              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={!hasExistingResponse && currentStep === 1 && !lgpdAceito}
                  className="flex items-center gap-2 bg-secondary hover:bg-secondary/90 text-white rounded-xl px-5 sm:px-6 text-xs sm:text-sm"
                >
                  Próximo <ChevronRight className="w-4 h-4" />
                </Button>
              ) : currentStep === 3 ? (
                <Button type="button" onClick={nextStep} className="flex items-center gap-2 bg-primary hover:bg-rose-dark text-white rounded-xl px-6 font-bold shadow-md text-xs sm:text-sm">
                  Ver Resultado da Triagem <ArrowRight className="w-4 h-4" />
                </Button>
              ) : currentStep === 4 && hasExistingResponse ? (
                <Button type="button" onClick={() => setCurrentStep(5)} className="flex items-center gap-2 bg-secondary hover:bg-secondary/90 text-white rounded-xl px-6 font-bold shadow-md text-xs sm:text-sm">
                  Ir para Conclusão (Quadro 5) <ChevronRight className="w-4 h-4" />
                </Button>
              ) : null}
            </div>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
};
