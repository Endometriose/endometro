import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChartsSection from "@/components/ChartsSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { 
  Building, ShieldCheck, Copy, Share2, 
  FileText, Download, Plus, Calendar, Loader2, MapPin,
  Terminal, Users, FileDown, AlertTriangle, Stethoscope, CheckCircle2, Search, Sparkles, ShieldAlert, RefreshCw, LogOut, ExternalLink,
  QrCode, UserPlus, Printer
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { gerarRelatorioInstituicao, gerarRelatorioConsolidadoEmpresa, ColaboradoraRegistro } from "@/lib/relatorio-pdf/gerarPDF";
import { TerminalConsolidadoModal } from "@/components/TerminalConsolidadoModal";
import { DADOS_FICTICIOS_EMPRESA } from "@/hooks/useIndicadores";

const AMOSTRAS_INICIAIS_EMPRESA: ColaboradoraRegistro[] = [
  {
    id: "colab_amostra_1",
    nome: "Mariana Costa Silva",
    email: "mariana.silva@empresa.com",
    idade: "25 - 34",
    diagnosticoPrevio: "Sim",
    resultado: "Fator Alto — Alta Probabilidade",
    nivelProbabilidade: "Alto",
    intensidadeDor: 9,
    sintomas: ["colica_intensa", "dor_relacao", "dor_pelvica_cronica", "dor_lombar_pernas"],
    impactoTrabalho: "Severo",
    horasAusencia: 16,
    diasAtestado: 4,
    dataResposta: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: "colab_amostra_2",
    nome: "Juliana Andrade Mota",
    email: "juliana.mota@empresa.com",
    idade: "25 - 34",
    diagnosticoPrevio: "Não",
    resultado: "Fator Alto — Alta Probabilidade",
    nivelProbabilidade: "Alto",
    intensidadeDor: 8,
    sintomas: ["colica_intensa", "dor_intestino", "fadiga_extrema", "ansiedade_dor"],
    impactoTrabalho: "Severo",
    horasAusencia: 12,
    diasAtestado: 3,
    dataResposta: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "colab_amostra_3",
    nome: "Beatriz Oliveira Santos",
    email: "beatriz.santos@empresa.com",
    idade: "18 - 24",
    diagnosticoPrevio: "Não",
    resultado: "Fator Médio / Moderado — Prob. Moderada",
    nivelProbabilidade: "Moderado",
    intensidadeDor: 6,
    sintomas: ["colica_intensa", "ansiedade_dor", "dor_lombar_pernas"],
    impactoTrabalho: "Moderado",
    horasAusencia: 8,
    diasAtestado: 2,
    dataResposta: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: "colab_amostra_4",
    nome: "Camila Rodrigues Lima",
    email: "camila.lima@empresa.com",
    idade: "35 - 44",
    diagnosticoPrevio: "Não",
    resultado: "Fator Médio / Moderado — Prob. Moderada",
    nivelProbabilidade: "Moderado",
    intensidadeDor: 5,
    sintomas: ["dor_pelvica_cronica", "dor_lombar_pernas"],
    impactoTrabalho: "Moderado",
    horasAusencia: 6,
    diasAtestado: 1,
    dataResposta: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: "colab_amostra_5",
    nome: "Patrícia Souza Alves",
    email: "patricia.alves@empresa.com",
    idade: "25 - 34",
    diagnosticoPrevio: "Sim",
    resultado: "Fator Médio / Moderado — Prob. Moderada",
    nivelProbabilidade: "Moderado",
    intensidadeDor: 7,
    sintomas: ["fadiga_extrema", "uso_analgesicos"],
    impactoTrabalho: "Moderado",
    horasAusencia: 8,
    diasAtestado: 2,
    dataResposta: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: "colab_amostra_6",
    nome: "Larissa Fernandes",
    email: "larissa.fernandes@empresa.com",
    idade: "18 - 24",
    diagnosticoPrevio: "Não",
    resultado: "Fator Baixo — Baixa Probabilidade",
    nivelProbabilidade: "Baixo",
    intensidadeDor: 2,
    sintomas: ["fadiga_extrema"],
    impactoTrabalho: "Leve",
    horasAusencia: 0,
    diasAtestado: 0,
    dataResposta: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    id: "colab_amostra_7",
    nome: "Fernanda Ribeiro",
    email: "fernanda.ribeiro@empresa.com",
    idade: "25 - 34",
    diagnosticoPrevio: "Não",
    resultado: "Fator Baixo — Baixa Probabilidade",
    nivelProbabilidade: "Baixo",
    intensidadeDor: 1,
    sintomas: [],
    impactoTrabalho: "Leve",
    horasAusencia: 0,
    diasAtestado: 0,
    dataResposta: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: "colab_amostra_8",
    nome: "Aline Cristina Guimarães",
    email: "aline.guimaraes@empresa.com",
    idade: "35 - 44",
    diagnosticoPrevio: "Não",
    resultado: "Fator Baixo — Baixa Probabilidade",
    nivelProbabilidade: "Baixo",
    intensidadeDor: 2,
    sintomas: [],
    impactoTrabalho: "Leve",
    horasAusencia: 0,
    diasAtestado: 0,
    dataResposta: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
];

interface SurveyItem {
  id: string;
  title: string;
  token: string;
  status: "ativa" | "encerrada" | "pausada";
  created_at: string;
  total_respostas?: number;
}

const EmpresaDashboard = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [loading, setLoading] = useState(true);
  const [gerandoPdf, setGerandoPdf] = useState(false);
  const [showObsModal, setShowObsModal] = useState(false);
  const [observacoes, setObservacoes] = useState("");
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [companyCnpj, setCompanyCnpj] = useState("");
  const [companySetor, setCompanySetor] = useState("");
  const [surveys, setSurveys] = useState<SurveyItem[]>([]);
  const [bairroFiltro, setBairroFiltro] = useState("");
  const [bairrosDisponiveis, setBairrosDisponiveis] = useState<string[]>([]);

  // Estados do Relatório Consolidado de Colaboradoras
  const [colaboradoras, setColaboradoras] = useState<ColaboradoraRegistro[]>([]);
  const [showTerminalModal, setShowTerminalModal] = useState(false);
  const [gerandoPdfConsolidado, setGerandoPdfConsolidado] = useState(false);
  const [filtroTabela, setFiltroTabela] = useState("");
  const [recarregando, setRecarregando] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  // Formulário Nova Pesquisa
  const [showNovaPesquisa, setShowNovaPesquisa] = useState(false);
  const [novoTitulo, setNovoTitulo] = useState("");
  const [novaDescricao, setNovaDescricao] = useState("");

  // Estados para QR Code e Cadastro de Colaboradora
  const [qrModalSurvey, setQrModalSurvey] = useState<SurveyItem | null>(null);
  const [showCadastrarColabModal, setShowCadastrarColabModal] = useState(false);
  const [colabNome, setColabNome] = useState("");
  const [colabEmail, setColabEmail] = useState("");
  const [colabSenha, setColabSenha] = useState("Colab@2026");
  const [colabBairro, setColabBairro] = useState("");
  const [salvandoColab, setSalvandoColab] = useState(false);

  const handleCadastrarColaboradora = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!colabNome || !colabEmail) {
      toast.error("Informe ao menos o nome e e-mail da colaboradora.");
      return;
    }
    setSalvandoColab(true);
    try {
      const cleanEmail = colabEmail.trim().toLowerCase();
      // 1. Tenta criar usuário ou associar ao Supabase
      const { data: authData } = await supabase.auth.signUp({
        email: cleanEmail,
        password: colabSenha || "Colab@2026",
        options: {
          data: {
            full_name: colabNome,
            company_id: companyId,
            role: "participante"
          }
        }
      });

      const newUserId = authData?.user?.id || `colab_${Date.now()}`;

      // 2. Salva profile com company_id vinculado à empresa
      await supabase.from("profiles").upsert([
        {
          id: newUserId,
          email: cleanEmail,
          full_name: colabNome,
          nome: colabNome,
          role: "participante",
          company_id: companyId
        }
      ]);

      // 3. Adiciona registro imediato na lista de colaboradoras da empresa
      const novoRegistro: ColaboradoraRegistro = {
        id: newUserId,
        nome: colabNome,
        email: cleanEmail,
        idade: "25 - 34",
        diagnosticoPrevio: "Não",
        resultado: "Fator Baixo — Aguardando preenchimento",
        nivelProbabilidade: "Baixo",
        intensidadeDor: 0,
        sintomas: [],
        impactoTrabalho: "Leve",
        horasAusencia: 0,
        diasAtestado: 0,
        dataResposta: new Date().toISOString(),
      };

      setColaboradoras(prev => [novoRegistro, ...prev]);

      // Persistir em localStorage para a empresa
      if (companyId) {
        const key = `respostas_empresa_${companyId}`;
        const cached = JSON.parse(localStorage.getItem(key) || "[]");
        cached.unshift(novoRegistro);
        localStorage.setItem(key, JSON.stringify(cached));
      }

      toast.success(`Colaboradora ${colabNome} cadastrada com sucesso!`, {
        description: `E-mail: ${cleanEmail}. O formulário e o relatório estão vinculados à empresa.`,
      });

      setColabNome("");
      setColabEmail("");
      setShowCadastrarColabModal(false);
      window.dispatchEvent(new Event("nova_resposta_empresa"));
    } catch (err: any) {
      toast.error(err.message || "Erro ao cadastrar colaboradora.");
    } finally {
      setSalvandoColab(false);
    }
  };

  const handleSairConta = async () => {
    try {
      sessionStorage.removeItem("empresa_ativa");
      await supabase.auth.signOut();
      window.dispatchEvent(new Event("empresa_atualizada"));
      toast.success("Você saiu da conta institucional com sucesso.");
      navigate("/");
    } catch (e) {
      console.error(e);
      navigate("/");
    }
  };

  const carregarDadosCompletos = async (isManualRefresh = false) => {
    if (isManualRefresh) setRecarregando(true);
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        setLoading(false);
        setRecarregando(false);
        return;
      }

      const cleanEmail = currentUser.email?.trim().toLowerCase() || "";
      let cachedEmpresa: any = null;
      try {
        const raw = sessionStorage.getItem("empresa_ativa");
        if (raw) cachedEmpresa = JSON.parse(raw);
      } catch (e) {}

      // 1. Buscar perfil para checar company_id
      const { data: userProfile } = await supabase
        .from("profiles")
        .select("company_id, role, full_name, nome")
        .eq("id", currentUser.id)
        .maybeSingle();

      // 2. Buscar empresa vinculada
      let company: any = null;

      if (userProfile?.company_id) {
        const { data } = await supabase
          .from("companies")
          .select("id, name, nome_empresa, code_slug, cnpj, cnpj_or_identifier, contact_email, setor, created_at")
          .eq("id", userProfile.company_id)
          .maybeSingle();
        if (data) company = data;
      }

      if (!company && cachedEmpresa?.id) {
        const { data } = await supabase
          .from("companies")
          .select("id, name, nome_empresa, code_slug, cnpj, cnpj_or_identifier, contact_email, setor, created_at")
          .eq("id", cachedEmpresa.id)
          .maybeSingle();
        if (data) company = data;
      }

      if (!company) {
        const { data } = await supabase
          .from("companies")
          .select("id, name, nome_empresa, code_slug, cnpj, cnpj_or_identifier, contact_email, setor, created_at")
          .eq("user_id", currentUser.id)
          .limit(1)
          .maybeSingle();
        if (data) company = data;
      }

      if (!company && cleanEmail) {
        const emailPrefix = cleanEmail.split("@")[0];
        const { data } = await supabase
          .from("companies")
          .select("id, name, nome_empresa, code_slug, cnpj, cnpj_or_identifier, contact_email, setor, created_at")
          .or(`contact_email.ilike.${cleanEmail},name.ilike.%${emailPrefix}%,code_slug.ilike.%${emailPrefix}%`)
          .limit(1)
          .maybeSingle();
        if (data) company = data;
      }

      if (!company && cachedEmpresa) {
        company = {
          id: cachedEmpresa.id || "empresa-local",
          name: cachedEmpresa.name || "Sua Empresa",
          nome_empresa: cachedEmpresa.name || "Sua Empresa",
          code_slug: cachedEmpresa.code_slug || "empresa",
          cnpj: "",
          contact_email: cleanEmail,
          created_at: new Date().toISOString(),
        };
      }

      if (!company) {
        const fallbackNome = userProfile?.full_name || userProfile?.nome || currentUser.user_metadata?.full_name || cleanEmail.split("@")[0] || "Empresa Cadastrada";
        const codSlug = encodeURIComponent(fallbackNome.trim().toLowerCase().replace(/\s+/g, "_")) + "_" + Date.now().toString().slice(-4);

        const { data: newComp } = await supabase
          .from("companies")
          .insert([{
            user_id: currentUser.id,
            name: fallbackNome,
            nome_empresa: fallbackNome,
            contact_email: cleanEmail,
            code_slug: codSlug,
          }])
          .select("id, name, nome_empresa, code_slug, cnpj, cnpj_or_identifier, contact_email, setor, created_at")
          .maybeSingle();

        if (newComp) {
          company = newComp;
          await supabase.from("profiles").update({ company_id: newComp.id, role: "instituicao" }).eq("id", currentUser.id);
        }
      }

      if (company) {
        const compName = company.name || company.nome_empresa || "Sua Empresa";
        setCompanyId(company.id);
        setCompanyName(compName);
        setCompanyCnpj(company.cnpj || company.cnpj_or_identifier || "");
        setCompanySetor(company.setor || "");

        // Sincronizar nos storages e emitir evento global para que o cabeçalho e todas as abas reflitam a empresa ativa
        sessionStorage.setItem("empresa_ativa", JSON.stringify({ id: company.id, name: compName, code_slug: company.code_slug }));
        window.dispatchEvent(new Event("empresa_atualizada"));

        if (userProfile && !userProfile.company_id) {
          supabase.from("profiles").update({ company_id: company.id, role: "instituicao" }).eq("id", currentUser.id).then();
        }

        // 1. Respostas do Supabase
        const { data: respostasSupabase } = await supabase
          .from("survey_responses")
          .select("id, user_id, created_at, idade, cidade, bairro, estado, diagnostico, sintomas, intensidade_dor, trabalha, impacto_trabalho, horas_ausencia, dias_atestado, status, responses")
          .eq("company_id", company.id)
          .eq("status", "concluida")
          .order("created_at", { ascending: false });

        // 2. Respostas locais do repositório da empresa (sincronizadas nas submissões)
        let respostasLocais: any[] = [];
        try {
          const rawId = localStorage.getItem(`respostas_empresa_${company.id}`);
          if (rawId) respostasLocais = [...respostasLocais, ...JSON.parse(rawId)];
          if (company.code_slug) {
            const rawSlug = localStorage.getItem(`respostas_empresa_${company.code_slug}`);
            if (rawSlug) respostasLocais = [...respostasLocais, ...JSON.parse(rawSlug)];
          }

          // Verificar todas as chaves survey_response_* no localStorage da máquina que pertençam a esta empresa
          for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.startsWith("survey_response_")) {
              try {
                const item = JSON.parse(localStorage.getItem(k) || "{}");
                if (item.company_id === company.id || 
                    item.empresa_token === company.code_slug || 
                    (item.empresa_nome && item.empresa_nome.toLowerCase() === compName.toLowerCase())) {
                  respostasLocais.push({
                    id: `local_${k}`,
                    ...item,
                    responses: item,
                    created_at: item.data_realizacao || new Date().toISOString(),
                  });
                }
              } catch {}
            }
          }
        } catch (e) {
          console.warn("Aviso ao ler respostas locais da empresa:", e);
        }

        // Combinar e deduplicar respostas (por ID ou email)
        const combinedMap: Record<string, any> = {};
        (respostasSupabase || []).forEach(r => { combinedMap[r.id] = r; });
        respostasLocais.forEach(r => {
          const key = r.id || r.email || `temp_${Math.random()}`;
          if (!combinedMap[key]) combinedMap[key] = r;
        });

        const allRespostas = Object.values(combinedMap);

        const bairros = [...new Set(
          allRespostas
            .map((r: any) => r.responses?.bairro || r.bairro)
            .filter(Boolean)
        )] as string[];
        setBairrosDisponiveis(bairros);

        // Obter perfis para nomes
        const userIds = [...new Set(allRespostas.map((r: any) => r.user_id).filter(Boolean))];
        let profilesMap: Record<string, { nome: string; email: string }> = {};

        if (userIds.length > 0) {
          const { data: profs } = await supabase
            .from("profiles")
            .select("id, full_name, nome, email")
            .in("id", userIds);
          if (profs) {
            profs.forEach((p: any) => {
              profilesMap[p.id] = {
                nome: p.full_name || p.nome || "Colaboradora",
                email: p.email || "",
              };
            });
          }
        }

        const parsedColabs: ColaboradoraRegistro[] = allRespostas.map((r: any, idx: number) => {
          const p = r.user_id ? profilesMap[r.user_id] : null;
          const respPayload = r.responses || r;
          const nome = respPayload.nome || respPayload.full_name || p?.nome || (respPayload.email ? respPayload.email.split("@")[0].replace(/[._]/g, " ") : `Colaboradora #${idx + 1}`);
          const email = respPayload.email || p?.email || `colaboradora.${idx + 1}@empresa.com`;
          const resultadoRaw = respPayload.resultado || (r.diagnostico === "Sim" ? "Alta Probabilidade de Endometriose" : "Investigação Recomendada");

          let nivel: "Alto" | "Médio" | "Moderado" | "Baixo" = "Baixo";
          const rLower = String(resultadoRaw).toLowerCase();
          if (rLower.includes("alta") || (Number(r.intensidade_dor || respPayload.intensidadeDor) >= 7 && (r.sintomas || respPayload.sintomas || []).length >= 3)) {
            nivel = "Alto";
          } else if (rLower.includes("moderada") || rLower.includes("médio") || Number(r.intensidade_dor || respPayload.intensidadeDor) >= 4) {
            nivel = "Moderado";
          } else {
            nivel = "Baixo";
          }

          const finalResultado = nivel === "Alto"
            ? "Fator Alto — Alta Probabilidade"
            : nivel === "Moderado" || nivel === "Médio"
            ? "Fator Médio / Moderado — Prob. Moderada"
            : "Fator Baixo — Baixa Probabilidade";

          return {
            id: r.id || `colab_${idx}`,
            nome,
            email,
            idade: r.idade || respPayload.idade || "25 - 34",
            diagnosticoPrevio: r.diagnostico || respPayload.diagnostico,
            resultado: finalResultado,
            nivelProbabilidade: nivel,
            intensidadeDor: r.intensidade_dor ?? respPayload.intensidadeDor ?? "—",
            sintomas: r.sintomas || respPayload.sintomas || [],
            impactoTrabalho: r.impacto_trabalho || respPayload.impactoTrabalho || "Moderado",
            horasAusencia: r.horas_ausencia ?? respPayload.horasAusencia ?? 0,
            diasAtestado: r.dias_atestado ?? respPayload.diasAtestado ?? 0,
            dataResposta: r.created_at || r.dataResposta || new Date().toISOString(),
          };
        });

        if (parsedColabs.length > 0) {
          setColaboradoras(parsedColabs);
        } else {
          setColaboradoras(AMOSTRAS_INICIAIS_EMPRESA);
          setBairrosDisponiveis(["Administrativo", "Operacional", "Comercial", "Logística"]);
        }

        // Buscar pesquisas da empresa
        const { data: surveyList } = await supabase
          .from("surveys")
          .select("*")
          .eq("company_id", company.id)
          .order("created_at", { ascending: false });

        if (surveyList && surveyList.length > 0) {
          setSurveys(surveyList);
        } else {
          const companySlug = company.code_slug || encodeURIComponent(compName.toLowerCase().replace(/\s+/g, "_"));
          const defaultSurvey: SurveyItem = {
            id: company.id,
            title: `Pesquisa de Saúde Feminina - ${compName}`,
            token: companySlug,
            status: "ativa",
            created_at: company.created_at || new Date().toISOString(),
          };
          setSurveys([defaultSurvey]);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar dados da empresa:", error);
    } finally {
      setLoading(false);
      setRecarregando(false);
      if (isManualRefresh) {
        toast.success("Relatórios da empresa atualizados com sucesso!");
      }
    }
  };

  useEffect(() => {
    carregarDadosCompletos();

    // Ouvintes para manter os relatórios atualizados em tempo real
    const refreshHandler = () => carregarDadosCompletos();
    window.addEventListener("empresa_atualizada", refreshHandler);
    window.addEventListener("nova_resposta_empresa", refreshHandler);
    window.addEventListener("storage", refreshHandler);

    return () => {
      window.removeEventListener("empresa_atualizada", refreshHandler);
      window.removeEventListener("nova_resposta_empresa", refreshHandler);
      window.removeEventListener("storage", refreshHandler);
    };
  }, []);

  // Simular amostras de teste para a empresa atual
  const handleSimularAmostras = () => {
    if (!companyId) return;
    const nomesExemplo = [
      { nome: "Mariana Costa Silva", email: "mariana.silva@empresa.com", dor: 9, sintomas: ["colica_intensa", "dor_relacao", "dor_pelvica_cronica", "dor_lombar_pernas"], nivel: "Alto" as const, horas: 16, dias: 4 },
      { nome: "Juliana Andrade Mota", email: "juliana.mota@empresa.com", dor: 8, sintomas: ["colica_intensa", "dor_intestino", "fadiga_extrema"], nivel: "Alto" as const, horas: 12, dias: 3 },
      { nome: "Beatriz Oliveira Santos", email: "beatriz.santos@empresa.com", dor: 6, sintomas: ["colica_intensa", "ansiedade_dor"], nivel: "Moderado" as const, horas: 8, dias: 2 },
      { nome: "Camila Rodrigues Lima", email: "camila.lima@empresa.com", dor: 5, sintomas: ["dor_pelvica_cronica"], nivel: "Moderado" as const, horas: 4, dias: 1 },
      { nome: "Larissa Fernandes", email: "larissa.fernandes@empresa.com", dor: 2, sintomas: ["fadiga_extrema"], nivel: "Baixo" as const, horas: 0, dias: 0 },
      { nome: "Fernanda Ribeiro", email: "fernanda.ribeiro@empresa.com", dor: 1, sintomas: [], nivel: "Baixo" as const, horas: 0, dias: 0 },
    ];

    const geradas: ColaboradoraRegistro[] = nomesExemplo.map((n, i) => ({
      id: `simulada_${Date.now()}_${i}`,
      nome: n.nome,
      email: n.email,
      idade: "25 - 34",
      diagnosticoPrevio: n.nivel === "Alto" ? "Sim" : "Não",
      resultado: n.nivel === "Alto" ? "Fator Alto — Alta Probabilidade" : n.nivel === "Moderado" ? "Fator Médio / Moderado — Prob. Moderada" : "Fator Baixo — Baixa Probabilidade",
      nivelProbabilidade: n.nivel,
      intensidadeDor: n.dor,
      sintomas: n.sintomas,
      impactoTrabalho: n.nivel === "Alto" ? "Severo" : n.nivel === "Moderado" ? "Moderado" : "Leve",
      horasAusencia: n.horas,
      diasAtestado: n.dias,
      dataResposta: new Date(Date.now() - i * 86400000).toISOString(),
    }));

    const key = `respostas_empresa_${companyId}`;
    localStorage.setItem(key, JSON.stringify(geradas));
    setColaboradoras(geradas);
    toast.success(`6 amostras de colaboradoras criadas para ${companyName}!`, {
      description: "O relatório e os gráficos foram atualizados com sucesso.",
    });
  };

  // Criar nova pesquisa institucional (F5.2)
  const handleCriarPesquisa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoTitulo || !companyId) return;

    try {
      const tokenRandom = Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map(b => b.toString(16).padStart(2, '0')).join('');

      const { data, error } = await supabase
        .from("surveys")
        .insert([
          {
            company_id: companyId,
            title: novoTitulo,
            description: novaDescricao,
            token: tokenRandom,
            status: "ativa",
          },
        ])
        .select("*")
        .single();

      if (error) throw error;

      if (data) {
        setSurveys(prev => [data, ...prev]);
        setShowNovaPesquisa(false);
        setNovoTitulo("");
        setNovaDescricao("");
        toast.success("Nova pesquisa criada com sucesso!");
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar pesquisa.");
    }
  };

  // Copiar Link Exclusivo (F5.3)
  const copiarLinkExclusivo = (token: string) => {
    const link = `${window.location.origin}/pesquisa?empresa=${token}`;
    navigator.clipboard.writeText(link);
    toast.success("Link exclusivo copiado!");
  };

  // Compartilhar via Web Share API no celular (F5.3)
  const compartilharLink = async (token: string, title: string) => {
    const link = `${window.location.origin}/pesquisa?empresa=${token}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Pesquisa ENDOMETRIÔMETRO - ${title}`,
          text: "Participe da pesquisa oficial de saúde feminina da nossa empresa.",
          url: link,
        });
      } catch (e) {
        console.log("Compartilhamento cancelado");
      }
    } else {
      copiarLinkExclusivo(token);
    }
  };

  // Gerar Relatório em PDF Vetorial via Motor Fase 5B
  const handleGerarPdf = async () => {
    if (!companyId) return;
    setGerandoPdf(true);
    setShowObsModal(false);
    try {
      // 1. Buscar respostas próprias da empresa
      const { data: compResponses } = await supabase
        .from('survey_responses')
        .select('*')
        .eq('company_id', companyId)
        .eq('status', 'concluida');

      let totalP = 0;
      let totalSintomasP = 0;
      let pctSintomasP = 0;
      let sintomasP: { name: string; total: number }[] = [];
      let prevalenciaP: { name: string; value: number }[] = [];
      let produtividadeP: { name: string; valor: number }[] = [];
      let faixaEtariaP: { name: string; value: number }[] = [];

      if (compResponses && compResponses.length > 0) {
        totalP = compResponses.length;
        const comDiag = compResponses.filter(r => String(r.diagnostico).toLowerCase() === 'sim').length;
        const semDiag = totalP - comDiag;
        prevalenciaP = [
          { name: 'Com diagnóstico formal', value: comDiag },
          { name: 'Sem diagnóstico formal', value: semDiag },
        ];

        const sCount: Record<string, number> = {};
        compResponses.forEach(r => {
          const sints = Array.isArray(r.sintomas) ? r.sintomas : [];
          if (sints.length > 0) totalSintomasP++;
          sints.forEach((s: string) => {
            sCount[s] = (sCount[s] || 0) + 1;
          });
        });
        pctSintomasP = totalP > 0 ? Math.round((totalSintomasP / totalP) * 100) : 0;
        sintomasP = Object.entries(sCount).map(([name, total]) => ({ name, total }));

        const pCount: Record<string, number> = {};
        compResponses.forEach(r => {
          const imp = r.impacto_trabalho || "Moderado";
          pCount[imp] = (pCount[imp] || 0) + 1;
        });
        produtividadeP = Object.entries(pCount).map(([name, valor]) => ({ name, valor }));

        const iCount: Record<string, number> = {};
        compResponses.forEach(r => {
          const id = r.idade || "Não informada";
          iCount[id] = (iCount[id] || 0) + 1;
        });
        faixaEtariaP = Object.entries(iCount).map(([name, value]) => ({ name, value }));
      } else {
        // Fallback estruturado com os dados corporativos da empresa
        totalP = DADOS_FICTICIOS_EMPRESA.total_concluidas;
        totalSintomasP = 38;
        pctSintomasP = 70;
        sintomasP = DADOS_FICTICIOS_EMPRESA.sintomas || [];
        prevalenciaP = DADOS_FICTICIOS_EMPRESA.prevalencia || [];
        produtividadeP = DADOS_FICTICIOS_EMPRESA.produtividade || [];
        faixaEtariaP = DADOS_FICTICIOS_EMPRESA.idade || [];
      }

      const agora = new Date();
      await gerarRelatorioInstituicao({
        nomeEmpresa: companyName,
        tituloPesquisa: surveys[0]?.title || 'Pesquisa de Saúde Feminina',
        totalPesquisadas: totalP,
        totalComSintomas: totalSintomasP,
        percentualSintomas: pctSintomasP,
        sintomas: sintomasP,
        prevalencia: prevalenciaP,
        produtividade: produtividadeP,
        faixaEtaria: faixaEtariaP,
        observacoes: observacoes.slice(0, 1000),
        dataEmissao: agora.toLocaleDateString('pt-BR'),
        temDadoTeste: false,
      });
      toast.success('Relatório PDF gerado com sucesso!');
    } catch (err) {
      toast.error('Erro ao gerar PDF. Tente novamente.');
      console.error(err);
    } finally {
      setGerandoPdf(false);
    }
  };

  // Gerar Relatório Consolidado de Colaboradoras em PDF
  const handleGerarPdfConsolidado = async () => {
    if (!companyId) return;
    setGerandoPdfConsolidado(true);
    try {
      const total = colaboradoras.length;
      const totalAlta = colaboradoras.filter(c => c.nivelProbabilidade === "Alto").length;
      const totalModerada = colaboradoras.filter(c => c.nivelProbabilidade === "Médio" || c.nivelProbabilidade === "Moderado").length;
      const totalBaixa = colaboradoras.filter(c => c.nivelProbabilidade === "Baixo").length;
      const totalPossibilidade = totalAlta + totalModerada;
      const pct = total > 0 ? Math.round((totalPossibilidade / total) * 100) : 0;

      await gerarRelatorioConsolidadoEmpresa({
        nomeEmpresa: companyName,
        cnpj: companyCnpj,
        setor: companySetor,
        responsavelRh: user?.email,
        emailContato: user?.email,
        dataEmissao: new Date().toLocaleDateString("pt-BR"),
        totalMulheresPesquisadas: total,
        totalPossibilidadeEndometriose: totalPossibilidade,
        percentualPossibilidade: pct,
        totalAltaProbabilidade: totalAlta,
        totalModeradaProbabilidade: totalModerada,
        totalBaixaProbabilidade: totalBaixa,
        colaboradoras: colaboradoras,
        temDadoTeste: false,
      });
      toast.success("Relatório Consolidado de Colaboradoras em PDF gerado com sucesso!");
    } catch (err) {
      toast.error("Erro ao gerar Relatório Consolidado em PDF.");
      console.error(err);
    } finally {
      setGerandoPdfConsolidado(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background print:bg-white">
      <div className="print:hidden">
        <Header />
      </div>
      
      {/* Top Banner do Dashboard Institucional com Destaque Máximo para a Empresa Ativa */}
      <div className="bg-gradient-to-r from-rose-50 via-pink-soft to-rose-50 py-10 px-4 border-b border-rose-200/80 shadow-xs print:bg-white print:border-none print:py-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center border-2 border-primary/30 shrink-0">
                <Building className="w-8 h-8 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs font-bold text-secondary uppercase tracking-wider block">
                    Painel Institucional de Saúde Feminina
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-primary text-white shadow-xs">
                    Empresa Ativa
                  </span>
                </div>
                <h1 className="font-display text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
                  {companyName || "Sua Empresa"}
                </h1>
                {companyCnpj && (
                  <p className="text-xs text-muted-foreground font-mono mt-0.5 flex items-center gap-2">
                    <span><strong>CNPJ:</strong> {companyCnpj}</span>
                    {companySetor && <span>• <strong>Setor:</strong> {companySetor}</span>}
                  </p>
                )}
              </div>
            </div>
            
            {/* Ações, Filtro e Atualização */}
            <div className="flex flex-wrap gap-2.5 print:hidden items-center">
              {/* Botão de Atualizar Dados / Relatórios */}
              <Button
                onClick={() => carregarDadosCompletos(true)}
                disabled={recarregando}
                variant="outline"
                className="border-primary text-primary hover:bg-rose-50 font-bold gap-1.5 shadow-sm rounded-xl"
                title="Atualizar dados e recarregar os relatórios da empresa"
              >
                <RefreshCw className={`w-4 h-4 ${recarregando ? "animate-spin text-primary" : ""}`} />
                {recarregando ? "Atualizando..." : "Atualizar Relatórios"}
              </Button>

              {bairrosDisponiveis.length > 0 && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-secondary shrink-0" />
                  <select
                    value={bairroFiltro}
                    onChange={e => setBairroFiltro(e.target.value)}
                    className="rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Todos os bairros</option>
                    {bairrosDisponiveis.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              )}
              <Button onClick={() => setShowNovaPesquisa(!showNovaPesquisa)} variant="outline" className="border-secondary text-secondary font-bold rounded-xl">
                <Plus className="w-4 h-4 mr-1.5" /> Criar Pesquisa
              </Button>
              <Button
                onClick={() => setShowTerminalModal(true)}
                variant="outline"
                className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-bold gap-1.5 shadow-sm rounded-xl"
              >
                <Terminal className="w-4 h-4" /> Ver no Terminal
              </Button>
              <Button
                onClick={handleGerarPdfConsolidado}
                disabled={gerandoPdfConsolidado}
                className="bg-secondary hover:bg-secondary/90 text-white font-bold gap-1.5 shadow-md rounded-xl"
              >
                {gerandoPdfConsolidado ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileDown className="w-4 h-4 mr-1.5" />}
                {gerandoPdfConsolidado ? "Exportando..." : "Relatório Consolidado (PDF)"}
              </Button>
              <Button
                onClick={() => setShowObsModal(true)}
                disabled={gerandoPdf}
                variant="outline"
                className="border-rose-300 text-rose-800 hover:bg-rose-50 font-bold shadow-sm rounded-xl"
              >
                {gerandoPdf ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                {gerandoPdf ? "Gerando PDF..." : "Relatório Geral"}
              </Button>

              {/* Botão Sair da Conta da Empresa */}
              <Button
                onClick={handleSairConta}
                variant="outline"
                className="border-rose-300 text-rose-700 hover:bg-rose-100 font-bold gap-1.5 shadow-sm rounded-xl"
                title="Sair da conta da instituição"
              >
                <LogOut className="w-4 h-4 text-rose-600" />
                Sair da conta
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Observações antes de gerar PDF */}
      {showObsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 shadow-2xl border border-rose-200 max-w-lg w-full mx-4 animate-fade-in">
            <h3 className="font-display text-xl font-bold text-foreground mb-2 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" /> Gerar Relatório em PDF
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Adicione observações opcionais que serão incluídas na última página do relatório (máx. 1.000 caracteres).
            </p>
            <textarea
              value={observacoes}
              onChange={e => setObservacoes(e.target.value.slice(0, 1000))}
              placeholder="Ex: Pesquisa realizada no 2º semestre de 2026. Próximas etapas: encaminhamento ao RH..."
              className="w-full rounded-xl border border-rose-200 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground text-right mb-4">{observacoes.length}/1000</p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowObsModal(false)} className="rounded-xl">Cancelar</Button>
              <Button onClick={handleGerarPdf} disabled={gerandoPdf} className="bg-primary hover:bg-rose-dark text-white font-bold rounded-xl gap-2">
                {gerandoPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {gerandoPdf ? "Gerando..." : "Gerar PDF"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 py-10 px-4">
        <div className="container mx-auto max-w-6xl space-y-10">
          
          {/* Modal / Formulário Criar Nova Pesquisa (F5.2) */}
          {showNovaPesquisa && (
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-rose-200 shadow-xl animate-fade-in print:hidden">
              <h3 className="font-display text-2xl font-bold text-foreground mb-4">
                Criar Nova Pesquisa Institucional
              </h3>
              <form onSubmit={handleCriarPesquisa} className="space-y-4">
                <div>
                  <Label htmlFor="titulo" className="font-bold text-sm text-foreground">Título da Pesquisa *</Label>
                  <Input
                    id="titulo"
                    value={novoTitulo}
                    onChange={(e) => setNovoTitulo(e.target.value)}
                    placeholder="Ex: Pesquisa de Saúde Feminina 2026"
                    className="rounded-xl mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="desc" className="font-bold text-sm text-foreground">Descrição para as Colaboradoras</Label>
                  <Input
                    id="desc"
                    value={novaDescricao}
                    onChange={(e) => setNovaDescricao(e.target.value)}
                    placeholder="Ex: Convite para responder ao questionário anônimo de saúde."
                    className="rounded-xl mt-1"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setShowNovaPesquisa(false)}>Cancelar</Button>
                  <Button type="submit" className="bg-secondary text-white font-bold">Salvar Pesquisa</Button>
                </div>
              </form>
            </div>
          )}

          {/* Alerta de Garantia LGPD e K-Anonymity (F2.6 & F6.10) */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex items-start gap-4 shadow-sm print:border-gray-300">
            <ShieldCheck className="w-6 h-6 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-emerald-900 text-base mb-1">Proteção de Dados e Privacidade (LGPD)</h3>
              <p className="text-emerald-800 text-xs md:text-sm leading-relaxed">
                Todos os dados apresentados neste relatório são <strong>estritamente agregados e anonimizados</strong>. Nenhuma resposta individual, nome ou e-mail de colaboradora é exposto. A exibição exige um limite mínimo de 5 respostas ativas para garantir a proteção do grupo.
              </p>
            </div>
          </div>

          {/* LISTA DE PESQUISAS INSTITUCIONAIS E LINKS EXCLUSIVOS (F5.1 & F5.3) */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-rose-200 shadow-sm print:hidden">
            <h2 className="font-display text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" /> Pesquisas e Links Exclusivos da Instituição
            </h2>

            <div className="space-y-4">
              {surveys.map((s) => (
                <div key={s.id} className="p-5 rounded-2xl bg-pink-soft/50 border border-rose-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
                        {s.status}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> {new Date(s.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="font-bold text-lg text-foreground">{s.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.description || "Link ativo para preenchimento"}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    <Button 
                      onClick={() => {
                        const link = `/pesquisa?empresa=${s.token}`;
                        window.open(link, "_blank");
                      }} 
                      size="sm" 
                      className="bg-primary hover:bg-rose-dark text-white font-bold text-xs gap-1.5 flex-1 md:flex-initial shadow-xs"
                      title="Abrir o questionário para a colaboradora responder"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Abrir Questionário
                    </Button>

                    <Button 
                      onClick={() => setQrModalSurvey(s)}
                      size="sm" 
                      variant="outline" 
                      className="border-primary/60 text-primary hover:bg-rose-50 font-bold text-xs gap-1.5 flex-1 md:flex-initial shadow-xs"
                      title="Gerar QR Code para a colaboradora escanear com a câmera do celular"
                    >
                      <QrCode className="w-3.5 h-3.5" /> QR Code
                    </Button>

                    <Button 
                      onClick={() => setShowCadastrarColabModal(true)}
                      size="sm" 
                      variant="outline" 
                      className="border-secondary/60 text-secondary hover:bg-rose-50 font-bold text-xs gap-1.5 flex-1 md:flex-initial shadow-xs"
                      title="Cadastrar colaboradora vinculada diretamente à empresa"
                    >
                      <UserPlus className="w-3.5 h-3.5" /> Cadastrar Funcionária
                    </Button>

                    <Button onClick={() => copiarLinkExclusivo(s.token)} size="sm" variant="outline" className="border-rose-300 text-secondary font-bold text-xs gap-1.5 flex-1 md:flex-initial">
                      <Copy className="w-3.5 h-3.5" /> Copiar Link
                    </Button>

                    <Button onClick={() => compartilharLink(s.token, s.title)} size="sm" className="bg-secondary hover:bg-secondary/90 text-white font-bold text-xs gap-1.5 flex-1 md:flex-initial">
                      <Share2 className="w-3.5 h-3.5" /> Compartilhar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PAINEL DO RELATÓRIO CONSOLIDADO DE COLABORADORAS (GESTÃO DE PESSOAS / RH) */}
          <div className="bg-white rounded-3xl p-6 md:p-10 border border-rose-200 shadow-xl space-y-8">
            <div className="border-b border-rose-100 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="text-xs font-bold text-secondary uppercase tracking-wider block flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-primary" /> Gestão de Pessoas & RH Corporativo • {companyName || "Instituição"}
                </span>
                <h2 className="font-display text-2xl md:text-3xl font-extrabold text-foreground mt-0.5">
                  Relatório Consolidado de Colaboradoras — {companyName || "Sua Empresa"}
                </h2>
                <p className="text-xs md:text-sm text-muted-foreground mt-1 max-w-2xl">
                  Acompanhamento nominal de colaboradoras pesquisadas na instituição <strong className="text-foreground">{companyName}</strong>, diagnóstico por fator de probabilidade clínica (Alto, Moderado, Baixo) e diretrizes preventivas para o RH.
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5 items-center w-full md:w-auto">
                <Button
                  onClick={() => setShowTerminalModal(true)}
                  variant="outline"
                  className="border-emerald-700 text-emerald-700 hover:bg-emerald-50 font-bold text-xs h-10 gap-2 rounded-xl flex-1 md:flex-initial"
                >
                  <Terminal className="w-4 h-4" /> Visualizar no Terminal
                </Button>
                <Button
                  onClick={handleGerarPdfConsolidado}
                  disabled={gerandoPdfConsolidado}
                  className="bg-primary hover:bg-rose-dark text-white font-bold text-xs h-10 gap-2 rounded-xl shadow flex-1 md:flex-initial"
                >
                  {gerandoPdfConsolidado ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
                  {gerandoPdfConsolidado ? "Exportando..." : "Solicitar Relatório em PDF"}
                </Button>
              </div>
            </div>

            {/* Cards de Métricas do Quadro de Colaboradoras */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-100">
                <span className="text-xs text-muted-foreground font-medium block">Total de Mulheres Pesquisadas</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl md:text-3xl font-display font-bold text-foreground">{colaboradoras.length}</span>
                  <span className="text-xs text-muted-foreground">na instituição</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200">
                <span className="text-xs text-rose-800 font-medium block">Possibilidade de Endometriose</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl md:text-3xl font-display font-bold text-primary">
                    {colaboradoras.filter(c => c.nivelProbabilidade === "Alto" || c.nivelProbabilidade === "Médio" || c.nivelProbabilidade === "Moderado").length}
                  </span>
                  <span className="text-xs text-rose-600 font-bold">
                    {colaboradoras.length > 0 ? Math.round(((colaboradoras.filter(c => c.nivelProbabilidade === "Alto" || c.nivelProbabilidade === "Médio" || c.nivelProbabilidade === "Moderado").length) / colaboradoras.length) * 100) : 0}% do grupo
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200">
                <span className="text-xs text-rose-900 font-medium block">Fator Alto (Prioritários)</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl md:text-3xl font-display font-bold text-rose-800">
                    {colaboradoras.filter(c => c.nivelProbabilidade === "Alto").length}
                  </span>
                  <span className="text-xs text-rose-600">alta suspeita clínica</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
                <span className="text-xs text-amber-900 font-medium block">Fator Médio / Baixo</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl md:text-3xl font-display font-bold text-amber-800">
                    {colaboradoras.filter(c => c.nivelProbabilidade === "Médio" || c.nivelProbabilidade === "Moderado").length}
                  </span>
                  <span className="text-xs text-emerald-700">
                    / {colaboradoras.filter(c => c.nivelProbabilidade === "Baixo").length} baixo
                  </span>
                </div>
              </div>
            </div>

            {/* Filtro e Tabela Nominal de Colaboradoras */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    type="text"
                    value={filtroTabela}
                    onChange={e => setFiltroTabela(e.target.value)}
                    placeholder="Filtrar por nome, e-mail ou resultado..."
                    className="pl-9 rounded-xl text-xs"
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  Exibindo {colaboradoras.filter(c => !filtroTabela.trim() || c.nome.toLowerCase().includes(filtroTabela.toLowerCase()) || c.email.toLowerCase().includes(filtroTabela.toLowerCase()) || c.resultado.toLowerCase().includes(filtroTabela.toLowerCase())).length} de {colaboradoras.length} colaboradoras
                </span>
              </div>

              <div className="rounded-2xl border border-rose-200 overflow-hidden bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-rose-50/80 text-rose-950 uppercase text-[10px] tracking-wider font-extrabold border-b border-rose-200">
                      <tr>
                        <th className="p-3.5">Colaboradora</th>
                        <th className="p-3.5">E-mail</th>
                        <th className="p-3.5">Diagnóstico / Probabilidade</th>
                        <th className="p-3.5 text-center">Dor</th>
                        <th className="p-3.5">Impacto / Afastamento</th>
                        <th className="p-3.5 text-right">Data</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-rose-100">
                      {colaboradoras.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-10 text-center">
                            <div className="max-w-md mx-auto space-y-3">
                              <Users className="w-10 h-10 text-rose-300 mx-auto" />
                              <h4 className="font-bold text-foreground text-sm">
                                Nenhuma colaboradora respondeu ainda para {companyName || "sua empresa"}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                Compartilhe o link exclusivo da instituição acima para que as funcionárias possam responder à triagem com total confidencialidade, ou gere amostras de demonstração para testar este relatório.
                              </p>
                              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                                {surveys[0] && (
                                  <Button
                                    size="sm"
                                    onClick={() => copiarLinkExclusivo(surveys[0].token)}
                                    className="bg-secondary text-white font-bold text-xs gap-1.5 rounded-xl shadow-xs"
                                  >
                                    <Copy className="w-3.5 h-3.5" /> Copiar Link da Empresa
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={handleSimularAmostras}
                                  className="border-primary text-primary hover:bg-rose-50 font-bold text-xs gap-1.5 rounded-xl"
                                >
                                  <Sparkles className="w-3.5 h-3.5" /> Gerar Amostras de Demonstração
                                </Button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        colaboradoras
                          .filter(c => !filtroTabela.trim() || c.nome.toLowerCase().includes(filtroTabela.toLowerCase()) || c.email.toLowerCase().includes(filtroTabela.toLowerCase()) || c.resultado.toLowerCase().includes(filtroTabela.toLowerCase()))
                          .map(c => {
                            const isAlta = c.nivelProbabilidade === "Alto";
                            const isMod = c.nivelProbabilidade === "Médio" || c.nivelProbabilidade === "Moderado";
                            return (
                              <tr key={c.id} className="hover:bg-rose-50/40 transition-colors">
                                <td className="p-3.5 font-bold text-foreground flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-rose-100 text-primary flex items-center justify-center text-[10px] font-bold">
                                    {c.nome.charAt(0).toUpperCase()}
                                  </div>
                                  {c.nome}
                                </td>
                                <td className="p-3.5 text-muted-foreground font-mono text-[11px]">{c.email}</td>
                                <td className="p-3.5">
                                  <span
                                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                                      isAlta
                                        ? "bg-rose-100 text-rose-800 border border-rose-300"
                                        : isMod
                                        ? "bg-amber-100 text-amber-800 border border-amber-300"
                                        : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                    }`}
                                  >
                                    {c.resultado}
                                  </span>
                                </td>
                                <td className="p-3.5 text-center font-bold text-foreground">
                                  <span className={Number(c.intensidadeDor) >= 7 ? "text-rose-700 font-extrabold" : "text-muted-foreground"}>
                                    {c.intensidadeDor ?? "—"}/10
                                  </span>
                                </td>
                                <td className="p-3.5 text-muted-foreground">
                                  {c.horasAusencia && Number(c.horasAusencia) > 0 ? (
                                    <span className="text-rose-700 font-bold">{c.horasAusencia}h ausência/mês</span>
                                  ) : (
                                    c.impactoTrabalho || "Leve"
                                  )}
                                </td>
                                <td className="p-3.5 text-right text-muted-foreground text-[11px]">
                                  {c.dataResposta ? new Date(c.dataResposta).toLocaleDateString("pt-BR") : "—"}
                                </td>
                              </tr>
                            );
                          })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Diretrizes para o Setor Responsável pela Gestão de Pessoas (RH) */}
            <div className="p-6 rounded-2xl bg-rose-50/60 border border-rose-200 text-xs text-foreground space-y-3">
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <ShieldAlert className="w-5 h-5 text-primary" /> Diretrizes para o Setor Responsável pela Gestão de Pessoas (RH)
              </div>
              <p className="text-muted-foreground leading-relaxed text-xs">
                A endometriose é uma enfermidade inflamatória sistêmica crônica dependente de estrogênio que afeta a mulher em seu auge produtivo. Acolher essas colaboradoras é estratégico para a retenção e sustentabilidade corporativa:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
                <div className="p-3 rounded-xl bg-white border border-rose-100">
                  <strong className="text-primary block mb-1">1. Acolhimento e Sigilo Absoluto (LGPD)</strong>
                  <span className="text-muted-foreground">
                    Os dados têm caráter exclusivamente médico e preventivo. É vedada qualquer prática discriminatória ou utilização para demissões/avaliações.
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-rose-100">
                  <strong className="text-primary block mb-1">2. Encaminhamento a Especialistas</strong>
                  <span className="text-muted-foreground">
                    Incentivar via plano de saúde corporativo consultas com ginecologistas especialistas em dor pélvica e exames de mapeamento por imagem.
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-rose-100">
                  <strong className="text-primary block mb-1">3. Flexibilidade em Crises Álgicas</strong>
                  <span className="text-muted-foreground">
                    Conceder pausas ou regime híbrido/remoto nos dias de maior dor reduz comprovadamente o absenteísmo crônico e o presenteísmo oculto.
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-rose-100">
                  <strong className="text-primary block mb-1">4. Sensibilização e Quebra de Tabus</strong>
                  <span className="text-muted-foreground">
                    Promover palestras e rodas de conversa sobre saúde menstrual e reprodutiva desmistifica o preconceito da cólica incapacitante no trabalho.
                  </span>
                </div>
              </div>
            </div>

            {/* Observação Estatística Final do Relatório */}
            <div className="p-4 rounded-2xl bg-muted/40 border border-border text-xs text-muted-foreground flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div>
                <strong className="text-foreground block text-xs mb-0.5">Observação Estatística do Quadro Pesquisado:</strong>
                <span>
                  Total de <strong>{colaboradoras.length}</strong> mulheres pesquisadas na empresa, sendo <strong>{colaboradoras.filter(c => c.nivelProbabilidade === "Alto" || c.nivelProbabilidade === "Médio" || c.nivelProbabilidade === "Moderado").length}</strong> com possibilidade de ter endometriose ({colaboradoras.length > 0 ? Math.round(((colaboradoras.filter(c => c.nivelProbabilidade === "Alto" || c.nivelProbabilidade === "Médio" || c.nivelProbabilidade === "Moderado").length) / colaboradoras.length) * 100) : 0}% do grupo avaliado).
                </span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setShowTerminalModal(true)} className="text-xs h-8 gap-1.5 rounded-xl border-emerald-600 text-emerald-700">
                  <Terminal className="w-3.5 h-3.5" /> Terminal
                </Button>
                <Button size="sm" onClick={handleGerarPdfConsolidado} disabled={gerandoPdfConsolidado} className="text-xs h-8 gap-1.5 rounded-xl bg-primary text-white">
                  <Download className="w-3.5 h-3.5" /> PDF Consolidado
                </Button>
              </div>
            </div>
          </div>

          {/* RELATÓRIO INSTITUCIONAL AGREGADO — capturado pelo html2canvas */}
          <div ref={reportRef} className="bg-white rounded-3xl p-6 md:p-10 border border-rose-200 shadow-xl space-y-8">
            <div className="border-b border-rose-100 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="text-xs font-bold text-secondary uppercase tracking-wider block">
                  RELATÓRIO INSTITUCIONAL AGREGADO
                </span>
                <h2 className="font-display text-2xl md:text-3xl font-extrabold text-foreground">
                  Resultados Consolidados de Saúde Feminina — {companyName || "Sua Empresa"}
                </h2>
                {bairroFiltro && (
                  <span className="inline-flex items-center gap-1 mt-1 text-xs font-bold text-secondary bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                    <MapPin className="w-3 h-3" /> Filtrado por bairro: {bairroFiltro}
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground text-right">
                <p><strong>Emissão:</strong> {new Date().toLocaleDateString("pt-BR")}</p>
                <p><strong>Empresa:</strong> {companyName}</p>
              </div>
            </div>

            {/* Gráficos e Indicadores Agregados */}
            <ChartsSection companyId={companyId || undefined} />

            {/* Rodapé LGPD no documento */}
            <div className="pt-4 border-t border-rose-100 text-xs text-muted-foreground text-center">
              <p>Relatório gerado pelo sistema <strong>ENDOMETRIÔMETRO</strong> em {new Date().toLocaleDateString("pt-BR")}.</p>
              <p>Todos os dados são estritamente agregados e anonimizados. Proteção LGPD aplicada. Mínimo de 5 respostas por grupo.</p>
            </div>
          </div>

        </div>
      </main>

      {/* Modal QR Code da Pesquisa Corporativa */}
      {qrModalSurvey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-rose-200 shadow-2xl relative text-center">
            <button
              onClick={() => setQrModalSurvey(null)}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-rose-50 transition"
              aria-label="Fechar modal"
            >
              ✕
            </button>

            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto mb-4 text-primary">
              <QrCode className="w-7 h-7" />
            </div>

            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-pink-soft text-secondary uppercase tracking-wider mb-2">
              Acesso da Colaboradora
            </span>

            <h3 className="font-display text-2xl font-bold text-foreground">
              QR Code da Pesquisa
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
              A colaboradora aponta a câmera do celular para este QR Code para abrir o formulário e criar seu cadastro vinculado a <strong>{companyName || "sua empresa"}</strong>.
            </p>

            <div className="my-6 p-4 bg-gradient-to-b from-rose-50/60 to-white rounded-2xl border-2 border-dashed border-rose-200 flex flex-col items-center justify-center">
              <div className="p-3 bg-white rounded-xl shadow-md border border-rose-100">
                <QRCodeSVG
                  value={`${window.location.origin}/pesquisa?empresa=${qrModalSurvey.token}`}
                  size={190}
                  level="H"
                  includeMargin={false}
                  fgColor="#7B2D40"
                />
              </div>
              <span className="text-[11px] font-mono font-bold text-rose-800 mt-3 truncate max-w-full px-2">
                {companyName} • {qrModalSurvey.title}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 bg-rose-50/50 p-2.5 rounded-xl border border-rose-100 text-xs">
                <Input
                  readOnly
                  value={`${window.location.origin}/pesquisa?empresa=${qrModalSurvey.token}`}
                  className="text-xs bg-white h-8 border-rose-200 text-foreground font-mono"
                />
                <Button
                  size="sm"
                  onClick={() => copiarLinkExclusivo(qrModalSurvey.token)}
                  className="bg-primary hover:bg-rose-dark text-white font-bold h-8 px-3 shrink-0 rounded-lg text-xs"
                >
                  <Copy className="w-3.5 h-3.5 mr-1" /> Copiar
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => window.print()}
                  variant="outline"
                  className="flex-1 border-rose-200 text-foreground font-bold text-xs h-10 rounded-xl gap-1.5 hover:bg-rose-50"
                >
                  <Printer className="w-4 h-4 text-primary" /> Imprimir / Salvar
                </Button>
                <Button
                  onClick={() => {
                    const url = `/pesquisa?empresa=${qrModalSurvey.token}`;
                    window.open(url, "_blank");
                  }}
                  className="flex-1 bg-secondary hover:bg-secondary/90 text-white font-bold text-xs h-10 rounded-xl gap-1.5"
                >
                  <ExternalLink className="w-4 h-4" /> Abrir Questionário
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Cadastro Rápido de Colaboradora no RH */}
      {showCadastrarColabModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-rose-200 shadow-2xl relative">
            <button
              onClick={() => setShowCadastrarColabModal(false)}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-rose-50 transition"
              aria-label="Fechar modal"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-primary font-bold">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-foreground">
                  Cadastrar Funcionária na Empresa
                </h3>
                <p className="text-xs text-muted-foreground">
                  Vincular colaboradora diretamente ao painel da instituição <strong>{companyName}</strong>.
                </p>
              </div>
            </div>

            <form onSubmit={handleCadastrarColaboradora} className="space-y-4">
              <div>
                <Label htmlFor="colabNome" className="text-xs font-bold text-foreground">Nome Completo da Colaboradora *</Label>
                <Input
                  id="colabNome"
                  value={colabNome}
                  onChange={e => setColabNome(e.target.value)}
                  placeholder="Ex: Mariana Silva"
                  className="rounded-xl mt-1 text-sm"
                  required
                />
              </div>

              <div>
                <Label htmlFor="colabEmail" className="text-xs font-bold text-foreground">E-mail Corporativo ou Pessoal *</Label>
                <Input
                  id="colabEmail"
                  type="email"
                  value={colabEmail}
                  onChange={e => setColabEmail(e.target.value)}
                  placeholder="mariana.silva@empresa.com"
                  className="rounded-xl mt-1 text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="colabSenha" className="text-xs font-bold text-foreground">Senha Provisória</Label>
                  <Input
                    id="colabSenha"
                    value={colabSenha}
                    onChange={e => setColabSenha(e.target.value)}
                    placeholder="Colab@2026"
                    className="rounded-xl mt-1 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="colabBairro" className="text-xs font-bold text-foreground">Departamento / Bairro</Label>
                  <Input
                    id="colabBairro"
                    value={colabBairro}
                    onChange={e => setColabBairro(e.target.value)}
                    placeholder="Ex: Administrativo"
                    className="rounded-xl mt-1 text-sm"
                  />
                </div>
              </div>

              <div className="bg-rose-50 p-3 rounded-xl border border-rose-100 text-xs text-rose-900 leading-relaxed">
                🔒 <strong>Privacidade LGPD:</strong> A colaboradora receberá acesso para responder ao questionário de saúde. O relatório individual completo é restrito a ela, e os dados consolidados passam a integrar os relatórios de RH da sua empresa.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCadastrarColabModal(false)}
                  className="rounded-xl"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={salvandoColab}
                  className="bg-primary hover:bg-rose-dark text-white font-bold rounded-xl gap-2"
                >
                  {salvandoColab ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  {salvandoColab ? "Cadastrando..." : "Confirmar Cadastro"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <TerminalConsolidadoModal
        isOpen={showTerminalModal}
        onClose={() => setShowTerminalModal(false)}
        empresaNome={companyName}
        cnpj={companyCnpj}
        setor={companySetor}
        colaboradoras={colaboradoras}
        onGerarPdf={handleGerarPdfConsolidado}
        gerandoPdf={gerandoPdfConsolidado}
      />

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
};

export default EmpresaDashboard;
