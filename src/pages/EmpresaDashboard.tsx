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
  Terminal, Users, FileDown, AlertTriangle, Stethoscope, CheckCircle2, Search, Sparkles, ShieldAlert
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { gerarRelatorioInstituicao, gerarRelatorioConsolidadoEmpresa, ColaboradoraRegistro } from "@/lib/relatorio-pdf/gerarPDF";
import { TerminalConsolidadoModal } from "@/components/TerminalConsolidadoModal";

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
  const reportRef = useRef<HTMLDivElement>(null);

  // Formulário Nova Pesquisa
  const [showNovaPesquisa, setShowNovaPesquisa] = useState(false);
  const [novoTitulo, setNovoTitulo] = useState("");
  const [novaDescricao, setNovaDescricao] = useState("");

  useEffect(() => {
    const fetchCompanyAndSurveys = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (!currentUser) {
          setLoading(false);
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
          // Tentar por user_id
          const { data } = await supabase
            .from("companies")
            .select("id, name, nome_empresa, code_slug, cnpj, cnpj_or_identifier, contact_email, setor, created_at")
            .eq("user_id", currentUser.id)
            .limit(1)
            .maybeSingle();
          if (data) company = data;
        }

        if (!company && cleanEmail) {
          // Tentar por contact_email ou prefixo do e-mail (ex: ctor4.com)
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
          // Se ainda não encontrou empresa, criar automaticamente para garantir acesso imediato
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

          // Sincronizar company_id de volta no perfil se estava desatualizado
          if (userProfile && !userProfile.company_id) {
            supabase.from("profiles").update({ company_id: company.id, role: "instituicao" }).eq("id", currentUser.id).then();
          }

          // Buscar respostas completas das colaboradoras desta empresa
          const { data: respostas } = await supabase
            .from("survey_responses")
            .select("id, user_id, created_at, idade, cidade, bairro, estado, diagnostico, sintomas, intensidade_dor, trabalha, impacto_trabalho, horas_ausencia, dias_atestado, status, responses")
            .eq("company_id", company.id)
            .eq("status", "concluida")
            .order("created_at", { ascending: false });

          if (respostas) {
            const bairros = [...new Set(
              respostas
                .map((r: any) => r.responses?.bairro || r.bairro)
                .filter(Boolean)
            )] as string[];
            setBairrosDisponiveis(bairros);

            // Obter nomes e emails dos perfis cadastrados
            const userIds = [...new Set(respostas.map((r: any) => r.user_id).filter(Boolean))];
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

            const parsedColabs: ColaboradoraRegistro[] = respostas.map((r: any, idx: number) => {
              const p = r.user_id ? profilesMap[r.user_id] : null;
              const respPayload = r.responses || {};
              const nome = respPayload.nome || respPayload.full_name || p?.nome || `Colaboradora #${idx + 1}`;
              const email = respPayload.email || p?.email || `colaboradora.${idx + 1}@empresa.com`;
              const resultadoRaw = respPayload.resultado || (r.diagnostico === "Sim" ? "Alta Probabilidade de Endometriose" : "Investigação Recomendada");

              let nivel: "Alto" | "Médio" | "Moderado" | "Baixo" = "Baixo";
              const rLower = String(resultadoRaw).toLowerCase();
              if (rLower.includes("alta") || (Number(r.intensidade_dor) >= 7 && (r.sintomas || []).length >= 3)) {
                nivel = "Alto";
              } else if (rLower.includes("moderada") || rLower.includes("médio") || Number(r.intensidade_dor) >= 4) {
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
                id: r.id,
                nome,
                email,
                idade: r.idade || respPayload.idade,
                diagnosticoPrevio: r.diagnostico,
                resultado: finalResultado,
                nivelProbabilidade: nivel,
                intensidadeDor: r.intensidade_dor ?? respPayload.intensidadeDor ?? "—",
                sintomas: r.sintomas || respPayload.sintomas || [],
                impactoTrabalho: r.impacto_trabalho || respPayload.impactoTrabalho || "Moderado",
                horasAusencia: r.horas_ausencia ?? respPayload.horasAusencia ?? 0,
                diasAtestado: r.dias_atestado ?? respPayload.diasAtestado ?? 0,
                dataResposta: r.created_at,
              };
            });

            setColaboradoras(parsedColabs);
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
            // Se não houver pesquisa explícita no surveys, exibe a pesquisa institucional ativa com o slug da empresa
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
      }
    };

    fetchCompanyAndSurveys();
  }, []);

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
        // Fallback para indicadores gerais
        const { data: indData } = await supabase.rpc('get_indicadores', {
          p_escopo: 'geral',
          p_survey_id: null,
          p_incluir_teste: true,
        });

        totalP = indData?.total_concluidas ?? 0;
        sintomasP = indData?.sintomas ?? [];
        prevalenciaP = indData?.prevalencia ?? [];
        produtividadeP = indData?.produtividade ?? [];
        faixaEtariaP = indData?.idade ?? [];
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
      
      {/* Top Banner do Dashboard Institucional */}
      <div className="bg-rose-blush py-10 px-4 border-b border-border print:bg-white print:border-none print:py-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-rose-200">
                <Building className="w-8 h-8 text-primary" />
              </div>
              <div>
                <span className="text-xs font-bold text-secondary uppercase tracking-wider block">
                  Área Protegida Institucional
                </span>
                <h1 className="font-display text-3xl font-bold text-foreground">
                  {companyName || "Sua Empresa"}
                </h1>
              </div>
            </div>
            
            {/* FILTRO POR BAIRRO + BOTÃO GERAR PDF */}
            <div className="flex flex-wrap gap-3 print:hidden items-center">
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
              <Button onClick={() => setShowNovaPesquisa(!showNovaPesquisa)} variant="outline" className="border-secondary text-secondary font-bold">
                <Plus className="w-4 h-4 mr-1.5" /> Criar Pesquisa
              </Button>
              <Button
                onClick={() => setShowTerminalModal(true)}
                variant="outline"
                className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-bold gap-1.5 shadow-sm"
              >
                <Terminal className="w-4 h-4" /> Ver no Terminal
              </Button>
              <Button
                onClick={handleGerarPdfConsolidado}
                disabled={gerandoPdfConsolidado}
                className="bg-secondary hover:bg-secondary/90 text-white font-bold gap-1.5 shadow-md"
              >
                {gerandoPdfConsolidado ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileDown className="w-4 h-4 mr-1.5" />}
                {gerandoPdfConsolidado ? "Exportando..." : "Relatório Consolidado (PDF)"}
              </Button>
              <Button
                onClick={() => setShowObsModal(true)}
                disabled={gerandoPdf}
                variant="outline"
                className="border-rose-300 text-rose-800 hover:bg-rose-50 font-bold shadow-sm"
              >
                {gerandoPdf ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                {gerandoPdf ? "Gerando PDF..." : "Relatório Geral Agregado"}
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

                  <div className="flex items-center gap-2 w-full md:w-auto">
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
                  <Users className="w-4 h-4" /> Gestão de Pessoas & RH Corporativo
                </span>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mt-0.5">
                  Relatório Consolidado de Colaboradoras
                </h2>
                <p className="text-xs md:text-sm text-muted-foreground mt-1 max-w-2xl">
                  Acompanhamento nominal de colaboradoras pesquisadas, diagnóstico por fator de probabilidade clínica (Alto, Moderado, Baixo) e diretrizes preventivas para o RH.
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
                              <h4 className="font-bold text-foreground text-sm">Nenhuma colaboradora respondeu ainda</h4>
                              <p className="text-xs text-muted-foreground">
                                Compartilhe o link exclusivo da instituição acima para que as funcionárias possam responder à triagem com total confidencialidade.
                              </p>
                              {surveys[0] && (
                                <Button
                                  size="sm"
                                  onClick={() => copiarLinkExclusivo(surveys[0].token)}
                                  className="bg-secondary text-white font-bold text-xs gap-1.5 rounded-xl"
                                >
                                  <Copy className="w-3.5 h-3.5" /> Copiar Link Exclusivo da Empresa
                                </Button>
                              )}
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
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                  Resultados Consolidados de Saúde Feminina
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
