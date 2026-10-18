import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
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
  CheckCircle2, FileText, ArrowRight, Building2, Link2, Copy,
  Mail, Eye, EyeOff, Download, Loader2, Lock, Calendar
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { gerarRelatorioIndividual } from "@/lib/relatorio-pdf/gerarPDF";
import { ParticipantLoginModal } from "@/components/ParticipantLoginModal";
import { ModalAcessoEmpresa } from "@/components/ModalAcessoEmpresa";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const UFS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

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

const DEFAULT_SURVEY_ID = "292959ec-4a14-424a-b36e-479ea2832a93";

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
  const queryClient = useQueryClient();

  // Ler aba da URL (?tab=triagem ou ?tab=empresa)
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<"triagem" | "empresa">(
    tabParam === "empresa" ? "empresa" : "triagem"
  );

  // Parâmetro de empresa via URL (token de vínculo institucional)
  const empresaToken = searchParams.get("token") || searchParams.get("empresa") || searchParams.get("c") || "";
  const empresaVinculada = empresaToken; // só via token, nunca texto livre
  const [empresaInfo, setEmpresaInfo] = useState<{ id: string; name: string } | null>(null);

  // Resolver dados da empresa vinculada se houver token na URL
  useEffect(() => {
    if (!empresaToken) {
      setEmpresaInfo(null);
      return;
    }
    const resolveEmpresa = async () => {
      try {
        // 1. Tentar achar por code_slug
        const { data: compBySlug } = await supabase
          .from("companies")
          .select("id, name, nome_empresa")
          .eq("code_slug", empresaToken)
          .limit(1)
          .maybeSingle();

        if (compBySlug) {
          setEmpresaInfo({
            id: compBySlug.id,
            name: compBySlug.name || compBySlug.nome_empresa || empresaToken,
          });
          return;
        }

        // 2. Tentar achar por id da empresa se for UUID
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(empresaToken);
        if (isUuid) {
          const { data: compById } = await supabase
            .from("companies")
            .select("id, name, nome_empresa")
            .eq("id", empresaToken)
            .limit(1)
            .maybeSingle();

          if (compById) {
            setEmpresaInfo({
              id: compById.id,
              name: compById.name || compById.nome_empresa || "Empresa",
            });
            return;
          }
        }

        // 3. Tentar achar por survey token
        const { data: survey } = await supabase
          .from("surveys")
          .select("company_id, title")
          .eq("token", empresaToken)
          .limit(1)
          .maybeSingle();

        if (survey?.company_id) {
          const { data: comp } = await supabase
            .from("companies")
            .select("id, name, nome_empresa")
            .eq("id", survey.company_id)
            .limit(1)
            .maybeSingle();

          if (comp) {
            setEmpresaInfo({
              id: comp.id,
              name: comp.name || comp.nome_empresa || survey.title,
            });
            return;
          }
        }

        const cleanName = decodeURIComponent(empresaToken).replace(/_/g, " ");
        setEmpresaInfo({ id: empresaToken, name: cleanName });
      } catch (err) {
        console.warn("Aviso ao resolver empresa:", err);
      }
    };
    resolveEmpresa();
  }, [empresaToken]);

  // Estados do Usuário e Carregamento de Dados Anteriores
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [hasExistingResponse, setHasExistingResponse] = useState(false);
  const [existingResponseId, setExistingResponseId] = useState<string | null>(null);

  // Estados do Questionário de Triagem
  const [currentStep, setCurrentStep] = useState(1);
  const [idade, setIdade] = useState("");
  // Localização estruturada (Passo 4 da Skill)
  const [cidade, setCidade] = useState("");
  const [bairro, setBairro] = useState("");
  const [uf, setUf] = useState("");
  const [emailParticipante, setEmailParticipante] = useState("");
  const [senhaParticipante, setSenhaParticipante] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [modoLoginParticipante, setModoLoginParticipante] = useState(false);
  // Consentimento LGPD bloqueante (Passo 4 da Skill)
  const [lgpdAceito, setLgpdAceito] = useState(false);
  const [diagnostico, setDiagnostico] = useState("");
  const [sintomasSelecionados, setSintomasSelecionados] = useState<string[]>([]);
  const [intensidadeDor, setIntensidadeDor] = useState<number>(6);
  const [trabalha, setTrabalha] = useState("");
  const [impactoTrabalho, setImpactoTrabalho] = useState("");
  const [horasAusencia, setHorasAusencia] = useState("");
  const [diasAtestado, setDiasAtestado] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [concluido, setConcluido] = useState(false);
  const [gerandoPdfConclusao, setGerandoPdfConclusao] = useState(false);
  const [statusEmail, setStatusEmail] = useState<"nao_enviado" | "enviado" | "pendente_configuracao">("nao_enviado");
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [dataHoraRealizacao, setDataHoraRealizacao] = useState<string>("");

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

  // Função central para verificar usuário autenticado e carregar dados gravados
  const checkUserAndLoadData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setCurrentUser(session.user);
      setEmailParticipante(session.user.email || "");

      let foundResponse: any = null;

      // 1. Tenta buscar no Supabase por user_id
      try {
        const { data: byUser } = await supabase
          .from("survey_responses")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (byUser) foundResponse = byUser;
      } catch (e) {
        console.warn("Erro ao buscar por user_id:", e);
      }

      // 2. Tenta buscar no Supabase por email
      if (!foundResponse && session.user.email) {
        try {
          const { data: byEmail } = await supabase
            .from("survey_responses")
            .select("*")
            .ilike("responses->>email", session.user.email)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (byEmail) foundResponse = byEmail;
        } catch (e) {
          console.warn("Erro ao buscar por email:", e);
        }
      }

      // 3. Fallback: buscar no localStorage persistente SOMENTE para este usuário específico
      if (!foundResponse && session.user.email) {
        try {
          const cached = localStorage.getItem(`survey_response_${session.user.email.toLowerCase()}`) ||
                         localStorage.getItem(`survey_response_${session.user.id}`);
          if (cached) {
            const parsed = JSON.parse(cached);
            const dataPayload = parsed.payload || parsed;
            foundResponse = { responses: dataPayload, id: `local_${session.user.id}`, created_at: dataPayload.data_realizacao || new Date().toISOString() };
          }
        } catch (e) {
          console.warn("Erro ao ler localStorage:", e);
        }
      }

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
        setConcluido(true);

        toast.info("Pesquisa registrada identificada!", {
          description: "Suas respostas foram carregadas em modo de visualização. Clique nos números das etapas para consultar os dados.",
        });
      } else {
        // Novo participante ou participante que ainda não respondeu: formulário limpo para responder à pesquisa
        setHasExistingResponse(false);
        setExistingResponseId(null);
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
        setConcluido(false);
        setCurrentStep(1);
      }
    } else {
      setCurrentUser(null);
      setHasExistingResponse(false);
      setExistingResponseId(null);
      setDataHoraRealizacao("");
      if (activeTab === "triagem" && !empresaToken) {
        setIsLoginModalOpen(true);
      }
    }
  };

  // Verificar se o participante já está autenticado e carregar dados gravados se existirem
  useEffect(() => {
    checkUserAndLoadData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        checkUserAndLoadData();
      } else {
        setCurrentUser(null);
        setHasExistingResponse(false);
        setExistingResponseId(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [activeTab, empresaToken]);

  // Estados da Área da Empresa (RH)
  const [nomeEmpresa, setNomeEmpresa] = useState("");
  const [cnpjEmpresa, setCnpjEmpresa] = useState("");
  const [emailRh, setEmailRh] = useState("");
  const [senhaEmpresa, setSenhaEmpresa] = useState("");
  const [showSenhaEmpresa, setShowSenhaEmpresa] = useState(false);
  const [modoLoginEmpresa, setModoLoginEmpresa] = useState(false);
  const [setorEmpresa, setSetorEmpresa] = useState("");
  const [linkGerado, setLinkGerado] = useState("");
  const [empresaCadastrada, setEmpresaCadastrada] = useState(false);
  const [showModalEmpresaSucesso, setShowModalEmpresaSucesso] = useState(false);
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

  // Atualizar aba se o parâmetro da URL mudar
  useEffect(() => {
    if (tabParam === "empresa") setActiveTab("empresa");
    else if (tabParam === "triagem") setActiveTab("triagem");
  }, [tabParam]);

  const toggleSintoma = (id: string) => {
    if (hasExistingResponse) return; // Bloqueado em modo de visualização de pesquisa concluída
    setSintomasSelecionados(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
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
        dataEmissao: new Date().toLocaleDateString("pt-BR"),
        temDadoTeste: false,
      });
      toast.success("PDF do Resumo Individual gerado com sucesso!");
    } catch (e) {
      toast.error("Erro ao gerar PDF.");
    } finally {
      setGerandoPdfConclusao(false);
    }
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
    if (hasExistingResponse) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
      return;
    }
    if (currentStep === 1) {
      if (!idade || !cidade || !uf) {
        toast.error("Preencha sua faixa etária, cidade e estado.");
        return;
      }
      if (!currentUser) {
        if (!emailParticipante || !senhaParticipante) {
          toast.error("E-mail e senha são obrigatórios para participar.");
          return;
        }
        if (senhaParticipante.length < 8) {
          toast.error("A senha deve ter no mínimo 8 caracteres.");
          return;
        }
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

  // Finalizar Questionário — Auth real + Gravação (Passo 3 da Skill)
  const handleFinalizarQuestionario = async () => {
    if (hasExistingResponse) {
      toast.info("Esta pesquisa já foi finalizada e não pode ser alterada.", {
        description: "Você pode baixar seu resumo oficial em PDF a qualquer momento.",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      let userId: string | null = null;

      // Verificar se já está logado
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (authUser) {
        userId = authUser.id;
      } else if (modoLoginParticipante) {
        // Modo Login: entrar com conta existente
        const { data: authData, error: loginError } = await supabase.auth.signInWithPassword({
          email: emailParticipante,
          password: senhaParticipante,
        });
        if (loginError) throw new Error("E-mail ou senha incorretos.");
        userId = authData.user?.id || null;
      } else {
        // Modo Cadastro: criar nova conta
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: emailParticipante,
          password: senhaParticipante,
        });
        if (signUpError) throw signUpError;
        userId = authData.user?.id || null;

        // Criar perfil com role 'participante' e company_id nulo
        if (userId) {
          await supabase.from("profiles").upsert([{
            id: userId,
            email: emailParticipante,
            role: "participante",
            company_id: null,
          }]);
        }
      }

      const targetCompanyId = empresaInfo?.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(empresaInfo.id)
        ? empresaInfo.id
        : null;

      if (userId) {
        await supabase.from("profiles").upsert([{
          id: userId,
          email: emailParticipante,
          role: "participante",
          company_id: targetCompanyId || null,
        }]);
      }

      const localidade = `${cidade}${bairro ? `, ${bairro}` : ""} / ${uf}`;
      const payload = {
        idade,
        cidade,
        bairro,
        uf,
        localidade,
        email: emailParticipante,
        empresa_token: empresaVinculada || null,
        company_id: targetCompanyId,
        empresa_nome: empresaInfo?.name || null,
        diagnostico,
        sintomas: sintomasSelecionados,
        intensidadeDor,
        trabalha,
        impactoTrabalho,
        horasAusencia,
        diasAtestado,
        resultado: calcularResultado().nivel,
        lgpd_aceito: true,
      };

      const trabalhaBool = trabalha === "Sim" || trabalha === true || String(trabalha).toLowerCase() === "sim";

      if (existingResponseId) {
        // Atualizar resposta existente
        const { error } = await supabase
          .from("survey_responses")
          .update({
            company_id: targetCompanyId,
            responses: payload,
            status: "concluida",
          })
          .eq("id", existingResponseId);

        if (error) console.warn("Aviso ao atualizar:", error.message);
      } else {
        const { data: insertedData, error } = await supabase.from("survey_responses").insert([{
          survey_id: DEFAULT_SURVEY_ID,
          company_id: targetCompanyId,
          user_id: userId,
          idade: idade || "25 - 34",
          cidade: cidade || "São Paulo",
          bairro: bairro || "",
          estado: uf || "SP",
          diagnostico: diagnostico || "Não",
          sintomas: sintomasSelecionados,
          intensidade_dor: Number(intensidadeDor) || 0,
          trabalha: trabalhaBool, // boolean no Supabase
          impacto_trabalho: impactoTrabalho || "Moderado",
          horas_ausencia: Number(horasAusencia) || 0,
          responses: payload,
          status: "concluida",
        }]).select("id").single();

        if (error) console.warn("Aviso ao gravar no Supabase:", error.message);
        if (insertedData) setExistingResponseId(insertedData.id);
      }

      // Salvar backup persistente no localStorage apenas para este participante
      if (emailParticipante) {
        localStorage.setItem(`survey_response_${emailParticipante.toLowerCase()}`, JSON.stringify(payload));
      }
      if (userId) {
        localStorage.setItem(`survey_response_${userId}`, JSON.stringify(payload));
      }

      // Invalidar cache de indicadores e panorama para atualizar os gráficos em tempo real
      queryClient.invalidateQueries({ queryKey: ["indicadores"] });
      queryClient.invalidateQueries({ queryKey: ["panorama"] });

      setConcluido(true);
      setHasExistingResponse(true);
      setDataHoraRealizacao(new Date().toISOString());
      setCurrentStep(5);
      toast.success(existingResponseId ? "Pesquisa atualizada com sucesso!" : "Pesquisa concluída com sucesso!");

      if (emailParticipante) {
        try {
          const { data, error: fnError } = await supabase.functions.invoke("send-thank-you-email", {
            body: { email: emailParticipante }
          });
          setStatusEmail(!fnError && data?.success ? "enviado" : "pendente_configuracao");
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

  const handleCadastrarEmpresa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeEmpresa || !emailRh || !senhaEmpresa) {
      toast.error("Preencha nome da empresa, e-mail e senha.");
      return;
    }
    if (senhaEmpresa.length < 8) {
      toast.error("A senha deve ter no mínimo 8 caracteres.");
      return;
    }
    setIsSubmitting(true);
    try {
      const cleanEmail = emailRh.trim().toLowerCase();
      let userId: string | null = null;

      // 1. Criar ou autenticar conta via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: senhaEmpresa,
        options: {
          data: {
            full_name: nomeEmpresa,
            role: "instituicao",
            tipo_usuario: "EMPRESA",
          },
        },
      });

      if (authError) {
        if (authError.message.includes("already registered") || authError.message.includes("already exists")) {
          // Tentar autenticar diretamente com a senha informada
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password: senhaEmpresa,
          });
          if (signInError) {
            throw new Error("Este e-mail já possui cadastro. Use o botão 'Já tenho conta → Entrar' ou verifique sua senha.");
          }
          userId = signInData.user?.id || null;
        } else {
          throw authError;
        }
      } else {
        userId = authData.user?.id || null;
      }

      if (!userId) throw new Error("Não foi possível identificar o usuário autenticado.");

      // 2. Criar ou atualizar perfil primeiro com role 'instituicao' para satisfazer chave estrangeira de companies.user_id
      await supabase.from("profiles").upsert([{
        id: userId,
        email: cleanEmail,
        full_name: nomeEmpresa,
        nome: nomeEmpresa,
        role: "instituicao",
        tipo_usuario: "EMPRESA",
      }]);

      // 3. Criar ou vincular registro na tabela companies
      const codSlug = encodeURIComponent(nomeEmpresa.trim().toLowerCase().replace(/\s+/g, "_")) + "_" + Date.now().toString().slice(-4);
      const cleanCnpj = cnpjEmpresa?.trim() || "";
      let slugToUse = codSlug;

      let existingCompQuery = supabase.from("companies").select("id, code_slug");
      if (cleanCnpj) {
        existingCompQuery = existingCompQuery.or(`cnpj.eq.${cleanCnpj},cnpj_or_identifier.eq.${cleanCnpj},contact_email.eq.${cleanEmail},user_id.eq.${userId}`);
      } else {
        existingCompQuery = existingCompQuery.or(`contact_email.eq.${cleanEmail},user_id.eq.${userId}`);
      }

      const { data: existingComp } = await existingCompQuery.limit(1).maybeSingle();
      let companyIdToUse: string | null = null;

      if (existingComp) {
        companyIdToUse = existingComp.id;
        if (existingComp.code_slug) slugToUse = existingComp.code_slug;

        await supabase.from("companies").update({
          user_id: userId,
          name: nomeEmpresa,
          nome_empresa: nomeEmpresa,
          cnpj: cleanCnpj || null,
          cnpj_or_identifier: cleanCnpj || null,
          setor: setorEmpresa || null,
          contact_email: cleanEmail,
        }).eq("id", existingComp.id);
      } else {
        const { data: companyData, error: companyError } = await supabase
          .from("companies")
          .insert([{
            user_id: userId,
            name: nomeEmpresa,
            nome_empresa: nomeEmpresa,
            cnpj: cleanCnpj || null,
            cnpj_or_identifier: cleanCnpj || null,
            contact_email: cleanEmail,
            setor: setorEmpresa || null,
            code_slug: codSlug,
          }])
          .select("id, code_slug")
          .single();

        if (companyData) {
          companyIdToUse = companyData.id;
          if (companyData.code_slug) slugToUse = companyData.code_slug;
        } else if (companyError) {
          console.warn("Recuperando empresa por CNPJ:", companyError.message);
          if (cleanCnpj) {
            const { data: compByCnpj } = await supabase
              .from("companies")
              .select("id, code_slug")
              .or(`cnpj.eq.${cleanCnpj},cnpj_or_identifier.eq.${cleanCnpj}`)
              .limit(1)
              .maybeSingle();
            if (compByCnpj) {
              companyIdToUse = compByCnpj.id;
              if (compByCnpj.code_slug) slugToUse = compByCnpj.code_slug;
              await supabase.from("companies").update({ user_id: userId }).eq("id", compByCnpj.id);
            }
          }
        }
      }

      if (companyIdToUse) {
        await supabase.from("profiles").update({ company_id: companyIdToUse, role: "instituicao", tipo_usuario: "EMPRESA" }).eq("id", userId);
        try {
          sessionStorage.setItem("empresa_ativa", JSON.stringify({ id: companyIdToUse, name: nomeEmpresa, code_slug: slugToUse }));
        } catch (e) {}
      }

      const generatedUrl = `${window.location.origin}/pesquisa?empresa=${slugToUse}`;
      setLinkGerado(generatedUrl);
      setEmpresaCadastrada(true);
      setShowModalEmpresaSucesso(true);
      toast.success("Empresa cadastrada com sucesso! Abrindo opções de acesso.");
    } catch (err: any) {
      toast.error(err.message || "Erro ao cadastrar empresa.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginEmpresa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailRh || !senhaEmpresa) {
      toast.error("Informe seu e-mail e senha da empresa.");
      return;
    }
    setIsSubmitting(true);
    try {
      const cleanEmail = emailRh.trim().toLowerCase();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: senhaEmpresa,
      });
      if (error) throw new Error("E-mail ou senha incorretos.");
      toast.success("Login realizado com sucesso!");
      navigate("/banco-de-dados");
    } catch (err: any) {
      toast.error(err.message || "Erro ao fazer login.");
    } finally {
      setIsSubmitting(false);
    }
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
                  <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-rose-100 text-secondary font-bold text-xs mb-3 border border-rose-200">
                    <Building2 className="w-3.5 h-3.5" /> Pesquisa Vinculada à Empresa: {empresaInfo?.name || empresaVinculada.replace(/_/g, " ")}
                  </span>
                )}
                <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
                  Questionário ENDOMETRIÔMETRO
                </h2>
                <p className="text-muted-foreground text-sm max-w-lg mx-auto">
                  Apresentação da pesquisa: responda de forma individual para contribuir com a construção de dados estatísticos sobre a endometriose e seus reflexos no trabalho.
                </p>
              </div>

              {/* Alerta de Modo de Visualização Bloqueado */}
              {hasExistingResponse && (
                <div className="mb-8 p-5 rounded-3xl bg-amber-50/90 border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-fade-in">
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 bg-amber-100 text-amber-800 rounded-2xl shrink-0 mt-0.5">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-amber-950 text-base flex items-center gap-2">
                        Pesquisa Registrada — Modo Somente Leitura
                      </h3>
                      <p className="text-xs md:text-sm text-amber-800/90 mt-1 leading-relaxed">
                        Suas respostas já foram protocoladas no banco de pesquisa e não podem ser alteradas. Navegue pelas etapas para consultar seus dados ou gere seu resumo oficial em PDF.
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={handleGerarPdf}
                    disabled={gerandoPdfConclusao}
                    className="bg-primary hover:bg-rose-dark text-white font-bold rounded-xl gap-2 text-xs md:text-sm shrink-0 shadow-sm w-full sm:w-auto"
                  >
                    {gerandoPdfConclusao ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    Baixar Resumo em PDF
                  </Button>
                </div>
              )}

              {/* Progresso Stepper */}
              <div className="flex items-center justify-between mb-10 relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted rounded-full z-0"></div>
                <div 
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full z-0 transition-all duration-500"
                  style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
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
                    <span className={`absolute -bottom-6 text-[11px] whitespace-nowrap font-medium transition-colors ${
                      currentStep === step.id ? "text-primary font-bold" : "text-muted-foreground group-hover:text-foreground"
                    }`}>
                      {step.title}
                    </span>
                  </button>
                ))}
              </div>

              <form onSubmit={(e) => e.preventDefault()} className="mt-12 space-y-8">
                
                {/* ETAPA 1: Apresentação e Dados */}
                {currentStep === 1 && (
                  <div className="space-y-6">

                    <div>
                      <Label className="text-base font-bold text-foreground">Sua Faixa Etária *</Label>
                      <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3">
                        {["Menos de 18", "18 - 24", "25 - 34", "35 - 44", "45 - 54", "55+"].map(opt => {
                          const isSelected = idade === opt;
                          return (
                            <div
                              key={opt}
                              onClick={() => !hasExistingResponse && setIdade(opt)}
                              className={`flex items-center justify-center p-3.5 border rounded-2xl font-bold text-sm transition-all select-none ${
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

                    {/* Localização Estruturada (Passo 4 da Skill) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-1">
                        <Label htmlFor="cidade" className="text-base font-bold text-foreground">Cidade *</Label>
                        <Input 
                          id="cidade" 
                          value={cidade} 
                          onChange={e => setCidade(e.target.value)} 
                          disabled={hasExistingResponse} 
                          placeholder="Ex: São Paulo" 
                          className="mt-2 rounded-xl disabled:bg-rose-50/70 disabled:text-foreground disabled:font-bold disabled:border-rose-300 disabled:opacity-100" 
                          required 
                        />
                      </div>
                      <div className="md:col-span-1">
                        <Label htmlFor="bairro" className="text-base font-bold text-foreground">Bairro</Label>
                        <Input 
                          id="bairro" 
                          value={bairro} 
                          onChange={e => setBairro(e.target.value)} 
                          disabled={hasExistingResponse} 
                          placeholder="Ex: Vila Madalena" 
                          className="mt-2 rounded-xl disabled:bg-rose-50/70 disabled:text-foreground disabled:font-bold disabled:border-rose-300 disabled:opacity-100" 
                        />
                      </div>
                      <div className="md:col-span-1">
                        <Label htmlFor="uf" className="text-base font-bold text-foreground">Estado *</Label>
                        <select
                          id="uf"
                          value={uf}
                          onChange={e => setUf(e.target.value)}
                          disabled={hasExistingResponse}
                          className="mt-2 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:bg-rose-50/70 disabled:text-foreground disabled:font-bold disabled:border-rose-300 disabled:opacity-100"
                          required
                        >
                          <option value="">Selecione</option>
                          {UFS.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Identificação do Participante */}
                    {currentUser ? (
                      <div className="p-4 rounded-2xl bg-pink-soft/80 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <span className="text-xs font-bold text-muted-foreground block">
                            Participante Autenticada:
                          </span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-sm font-extrabold text-secondary">
                              {currentUser.email}
                            </span>
                            <button
                              type="button"
                              onClick={async () => {
                                await supabase.auth.signOut();
                                setCurrentUser(null);
                                setHasExistingResponse(false);
                                setExistingResponseId(null);
                                setIsLoginModalOpen(true);
                              }}
                              className="text-xs text-primary hover:underline font-bold ml-2"
                            >
                              (Trocar conta)
                            </button>
                          </div>
                        </div>
                        {hasExistingResponse && (
                          <span className="text-xs font-bold bg-amber-600 text-white px-3 py-1 rounded-full self-start sm:self-auto shadow-xs flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5" /> Pesquisa Concluída (Somente Leitura)
                          </span>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="emailPart" className="text-base font-bold text-foreground">Seu E-mail *</Label>
                            <Input id="emailPart" type="email" value={emailParticipante} onChange={e => setEmailParticipante(e.target.value)} placeholder="seu@email.com" className="mt-2 rounded-xl" required />
                          </div>
                          <div>
                            <Label htmlFor="senhaPart" className="text-base font-bold text-foreground">
                              {modoLoginParticipante ? "Senha *" : "Criar Senha * (mín. 8 caracteres)"}
                            </Label>
                            <div className="relative mt-2">
                              <Input
                                id="senhaPart"
                                type={showSenha ? "text" : "password"}
                                value={senhaParticipante}
                                onChange={e => setSenhaParticipante(e.target.value)}
                                placeholder="••••••••"
                                className="rounded-xl pr-10"
                                minLength={8}
                                required
                              />
                              <button type="button" onClick={() => setShowSenha(!showSenha)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-secondary">
                                {showSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                              </button>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setModoLoginParticipante(!modoLoginParticipante)}
                          className="text-xs font-bold text-secondary hover:underline"
                        >
                          {modoLoginParticipante ? "Não tenho conta ainda → Criar conta" : "Já participei antes? → Entrar com minha conta"}
                        </button>
                      </>
                    )}

                    {/* Checkbox LGPD obrigatório (Passo 4 da Skill) */}
                    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-pink-soft border border-rose-200">
                      <input
                        type="checkbox"
                        id="lgpd-triagem"
                        checked={lgpdAceito}
                        disabled={hasExistingResponse}
                        onChange={e => !hasExistingResponse && setLgpdAceito(e.target.checked)}
                        className="mt-1 accent-primary h-4 w-4 cursor-pointer disabled:cursor-not-allowed"
                      />
                      <label htmlFor="lgpd-triagem" className="text-xs text-muted-foreground leading-snug cursor-pointer">
                        <strong>Consentimento LGPD *</strong> — Li e concordo com os Termos de Consentimento para uso dos meus dados de saúde nesta pesquisa. Compreendo que minhas respostas serão mantidas em sigilo e utilizadas de forma agregada para pesquisas médicas e científicas.
                      </label>
                    </div>

                    <div>
                      <Label className="text-base font-bold text-foreground">Já possui diagnóstico formal prévio de endometriose?</Label>
                      <div className="mt-3 flex gap-3">
                        {["Sim", "Em investigação", "Não"].map(opt => {
                          const isSelected = diagnostico === opt;
                          return (
                            <div
                              key={opt}
                              onClick={() => !hasExistingResponse && setDiagnostico(opt)}
                              className={`flex-1 flex items-center justify-center p-3.5 border rounded-2xl text-sm font-bold transition-all select-none ${
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

                {/* ETAPA 2: Sintomas Diagnósticos */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <Label className="text-base font-bold text-foreground">
                          Marque abaixo todas as situações e sintomas que você vivencia: *
                        </Label>
                        {hasExistingResponse && (
                          <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Bloqueado
                          </span>
                        )}
                      </div>
                      <div className="space-y-2.5">
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
                              <span className="text-sm leading-relaxed">{s.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border">
                      <div className="flex justify-between items-center mb-2">
                        <Label className="text-base font-bold text-foreground">Intensidade média das dores menstruais (0 a 10)</Label>
                        <span className="font-extrabold text-white text-xl px-4 py-1 bg-secondary rounded-xl shadow-xs">{intensidadeDor}</span>
                      </div>
                      <input 
                        type="range" min="0" max="10" 
                        value={intensidadeDor} 
                        disabled={hasExistingResponse}
                        onChange={(e) => !hasExistingResponse && setIntensidadeDor(parseInt(e.target.value))}
                        className="w-full accent-secondary h-2.5 rounded-lg cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
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
                      <div className="flex items-center justify-between mb-3">
                        <Label className="text-base font-bold text-foreground">Você trabalha atualmente?</Label>
                        {hasExistingResponse && (
                          <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Bloqueado
                          </span>
                        )}
                      </div>
                      <div className="mt-3 flex gap-4">
                        {["Sim", "Não"].map(opt => {
                          const isSelected = trabalha === opt;
                          return (
                            <div
                              key={opt}
                              onClick={() => !hasExistingResponse && setTrabalha(opt)}
                              className={`flex-1 flex items-center justify-center p-3.5 border rounded-2xl text-sm font-bold transition-all select-none ${
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
                      <div className="space-y-6 pt-4 border-t border-border">
                        <div>
                          <Label className="text-base font-bold text-foreground">Grau de impacto das dores na rotina de trabalho:</Label>
                          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                            {["Leve", "Moderado", "Alto", "Incapacitante"].map(opt => {
                              const isSelected = impactoTrabalho === opt;
                              return (
                                <div
                                  key={opt}
                                  onClick={() => !hasExistingResponse && setImpactoTrabalho(opt)}
                                  className={`flex items-center justify-center p-3 border rounded-2xl text-xs font-bold transition-all select-none ${
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="horas" className="text-sm font-bold text-foreground block mb-2">
                              Média de horas/mês com dor intensa durante o trabalho:
                            </Label>
                            <Input
                              id="horas"
                              type="number"
                              value={horasAusencia}
                              disabled={hasExistingResponse}
                              onChange={e => setHorasAusencia(e.target.value)}
                              placeholder="Ex: 20 horas"
                              className="rounded-xl disabled:bg-rose-50/70 disabled:text-foreground disabled:font-bold disabled:border-rose-300 disabled:opacity-100"
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

                {/* ETAPA 4: RESULTADO DA TRIAGEM */}
                {currentStep === 4 && (
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

                    <div className="text-center pt-4">
                      {hasExistingResponse ? (
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                          <Button
                            type="button"
                            onClick={handleGerarPdf}
                            disabled={gerandoPdfConclusao}
                            className="w-full sm:w-auto bg-primary hover:bg-rose-dark text-white font-bold py-6 px-8 rounded-2xl shadow-lg text-base gap-2"
                          >
                            {gerandoPdfConclusao ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                            Baixar meu Resumo em PDF
                          </Button>
                          <Button
                            type="button"
                            onClick={() => setCurrentStep(5)}
                            className="w-full sm:w-auto bg-secondary hover:bg-secondary/90 text-white font-bold py-6 px-8 rounded-2xl shadow-md text-base gap-2"
                          >
                            Ver Conclusão (Quadro 5) <ChevronRight className="w-5 h-5" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          onClick={handleFinalizarQuestionario}
                          disabled={isSubmitting}
                          className="bg-primary hover:bg-rose-dark text-white font-bold py-6 px-10 rounded-2xl shadow-lg text-base"
                        >
                          {isSubmitting ? "Finalizando e Gravando..." : "Finalizar Pesquisa e Registrar Resposta"}
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* ETAPA 5: CARD DE CONCLUSÃO OFICIAL */}
                {currentStep === 5 && (
                  <div className="space-y-6 text-center animate-fade-in py-6">
                    <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>

                    <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                      Pesquisa concluída e registrada!
                    </h2>

                    {/* Data e Hora da Pesquisa Realizada */}
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 max-w-md mx-auto text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-2.5 shadow-xs">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary shrink-0" />
                        <span className="font-semibold text-foreground">Data e hora da pesquisa realizada:</span>
                      </div>
                      <span className="font-extrabold text-secondary text-sm">{formatarDataHora(dataHoraRealizacao)}</span>
                    </div>

                    <p className="text-muted-foreground text-base md:text-lg max-w-lg mx-auto leading-relaxed">
                      Agradecemos sua participação no ENDOMETRIÔMETRO. Suas respostas contribuem para ampliar o conhecimento sobre a endometriose e seus impactos na rotina de trabalho.
                    </p>

                    {emailParticipante && (
                      <div className="p-4 rounded-2xl bg-pink-soft border border-rose-200 max-w-md mx-auto text-xs text-muted-foreground flex items-center gap-3">
                        <Mail className="w-5 h-5 text-secondary shrink-0" />
                        <div className="text-left">
                          <p className="font-bold text-foreground">Confirmação de Resposta:</p>
                          <p>
                            Sua resposta está protocolada no sistema e computada nas estatísticas consolidadas.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* BOTÃO PDF PESSOAL — o mesmo botão para gerar o PDF */}
                    <div className="bg-white border border-rose-200 rounded-3xl p-6 max-w-md mx-auto text-left shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-5 h-5 text-primary" />
                        <p className="font-bold text-foreground text-base">Baixe seu Resumo Pessoal em PDF</p>
                      </div>
                      <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                        Documento oficial com suas respostas registradas, pontuação de triagem e orientações médicas.
                      </p>
                      <Button
                        type="button"
                        disabled={gerandoPdfConclusao}
                        onClick={handleGerarPdf}
                        className="w-full bg-primary hover:bg-rose-dark text-white font-bold rounded-xl gap-2 py-6 text-base shadow-md"
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
                        className="rounded-xl font-semibold gap-2"
                      >
                        <ChevronLeft className="w-4 h-4" /> Voltar ao Resultado (Quadro 4)
                      </Button>
                      <Button
                        type="button"
                        onClick={async () => {
                          await supabase.auth.signOut();
                          navigate("/");
                        }}
                        className="bg-secondary hover:bg-secondary/90 text-white font-bold py-6 px-10 rounded-2xl shadow-md text-base"
                      >
                        Voltar para o início
                      </Button>
                    </div>
                  </div>
                )}

                {/* Botões de Navegação entre Etapas */}
                {currentStep < 5 && (
                  <div className="flex items-center justify-between pt-6 border-t border-border mt-8">
                    {currentStep > 1 ? (
                      <Button type="button" variant="outline" onClick={prevStep} className="flex items-center gap-2 rounded-xl">
                        <ChevronLeft className="w-4 h-4" /> Voltar
                      </Button>
                    ) : <div></div>}

                    {currentStep < 3 ? (
                      <Button
                        type="button"
                        onClick={nextStep}
                        disabled={!hasExistingResponse && currentStep === 1 && !lgpdAceito}
                        className="flex items-center gap-2 bg-secondary hover:bg-secondary/90 text-white rounded-xl px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Próximo <ChevronRight className="w-4 h-4" />
                      </Button>
                    ) : currentStep === 3 ? (
                      <Button type="button" onClick={nextStep} className="flex items-center gap-2 bg-primary hover:bg-rose-dark text-white rounded-xl px-8 font-bold shadow-md">
                        Ver Resultado da Triagem <ArrowRight className="w-4 h-4" />
                      </Button>
                    ) : currentStep === 4 && hasExistingResponse ? (
                      <Button type="button" onClick={() => setCurrentStep(5)} className="flex items-center gap-2 bg-secondary hover:bg-secondary/90 text-white rounded-xl px-8 font-bold shadow-md">
                        Ir para Conclusão (Quadro 5) <ChevronRight className="w-4 h-4" />
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

                {/* Alternância Login/Cadastro Empresa (Passo 3 da Skill) */}
                <div className="flex justify-center mb-4">
                  <div className="bg-muted/60 p-1 rounded-2xl inline-flex gap-1">
                    <button type="button" onClick={() => setModoLoginEmpresa(false)} className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${!modoLoginEmpresa ? "bg-white shadow text-secondary" : "text-muted-foreground"}`}>Cadastrar Empresa</button>
                    <button type="button" onClick={() => setModoLoginEmpresa(true)} className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${modoLoginEmpresa ? "bg-white shadow text-secondary" : "text-muted-foreground"}`}>Já tenho conta → Entrar</button>
                  </div>
                </div>

                <form onSubmit={modoLoginEmpresa ? handleLoginEmpresa : handleCadastrarEmpresa} className="space-y-5 max-w-2xl mx-auto">
                  {!modoLoginEmpresa && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="nomeEmp" className="font-bold text-sm text-foreground">Nome da Empresa *</Label>
                        <Input id="nomeEmp" value={nomeEmpresa} onChange={e => setNomeEmpresa(e.target.value)} placeholder="Ex: Tech Solutions S.A." className="mt-1.5 rounded-xl" required />
                      </div>
                      <div>
                        <Label htmlFor="cnpj" className="font-bold text-sm text-foreground">CNPJ da Empresa</Label>
                        <Input id="cnpj" value={cnpjEmpresa} onChange={e => handleCnpjChange(e.target.value)} placeholder="00.000.000/0001-00" maxLength={18} className="mt-1.5 rounded-xl" />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="emailRhInput" className="font-bold text-sm text-foreground">E-mail do RH / Responsável *</Label>
                      <Input id="emailRhInput" type="email" value={emailRh} onChange={e => setEmailRh(e.target.value)} placeholder="rh@empresa.com.br" className="mt-1.5 rounded-xl" required />
                    </div>
                    <div>
                      <Label htmlFor="senhaEmp" className="font-bold text-sm text-foreground">
                        {modoLoginEmpresa ? "Senha *" : "Criar Senha * (mín. 8 caracteres)"}
                      </Label>
                      <div className="relative mt-1.5">
                        <Input
                          id="senhaEmp"
                          type={showSenhaEmpresa ? "text" : "password"}
                          value={senhaEmpresa}
                          onChange={e => setSenhaEmpresa(e.target.value)}
                          placeholder="••••••••"
                          className="rounded-xl pr-10"
                          minLength={8}
                          required
                        />
                        <button type="button" onClick={() => setShowSenhaEmpresa(!showSenhaEmpresa)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-secondary">
                          {showSenhaEmpresa ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {!modoLoginEmpresa && (
                    <div>
                      <Label htmlFor="setor" className="font-bold text-sm text-foreground">Setor de Atuação</Label>
                      <Input id="setor" value={setorEmpresa} onChange={e => setSetorEmpresa(e.target.value)} placeholder="Ex: Tecnologia / Indústria / Serviços" className="mt-1.5 rounded-xl" />
                    </div>
                  )}

                  <Button type="submit" disabled={isSubmitting} className="w-full bg-secondary hover:bg-secondary/90 text-white font-bold py-6 rounded-xl shadow-md text-base mt-4">
                    <Building2 className="w-5 h-5 mr-2" />
                    {isSubmitting ? "Aguarde..." : modoLoginEmpresa ? "Entrar no Painel" : "Cadastrar Empresa e Gerar Link de Acesso"}
                  </Button>
                </form>

                {empresaCadastrada && linkGerado && (
                  <div className="mt-8 p-6 rounded-2xl bg-pink-soft border border-rose-200 text-left space-y-4 max-w-2xl mx-auto animate-fade-in">
                    <div className="flex items-center gap-2 text-secondary font-bold text-base">
                      <Link2 className="w-5 h-5" /> Link Exclusivo para Enviar às Colaboradoras:
                    </div>
                    <div className="flex items-center gap-2 bg-white p-3 rounded-xl border border-rose-200">
                      <Input value={linkGerado} readOnly className="border-none shadow-none text-xs md:text-sm font-mono text-foreground" />
                      <Button onClick={copiarLink} className="bg-primary hover:bg-rose-dark text-white shrink-0 gap-1.5 rounded-lg">
                        <Copy className="w-4 h-4" /> Copiar Link
                      </Button>
                    </div>
                    <div className="pt-2 flex justify-end">
                      <Button onClick={() => navigate("/banco-de-dados")} className="bg-secondary hover:bg-secondary/90 text-white font-bold rounded-xl gap-2 w-full md:w-auto">
                        <Building2 className="w-4 h-4" /> Acessar Painel da Empresa (Banco de Dados)
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </main>

      <ParticipantLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={() => {
          setIsLoginModalOpen(false);
          checkUserAndLoadData();
        }}
      />

      {/* Modal de Acesso e Confirmação da Empresa */}
      <ModalAcessoEmpresa
        isOpen={showModalEmpresaSucesso}
        onClose={() => setShowModalEmpresaSucesso(false)}
        empresaNome={nomeEmpresa}
        linkExclusivo={linkGerado}
        onAcessarPainel={() => {
          setShowModalEmpresaSucesso(false);
          navigate("/banco-de-dados");
        }}
      />

      <Footer />
    </div>
  );
};

export default Pesquisa;
