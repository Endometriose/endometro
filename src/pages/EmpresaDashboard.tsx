import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChartsSection from "@/components/ChartsSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { 
  Building, Link2, ShieldCheck, Users, Copy, Share2, 
  FileText, Download, Plus, CheckCircle2, Calendar, Lock 
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

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
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [surveys, setSurveys] = useState<SurveyItem[]>([]);

  // Formulário Nova Pesquisa
  const [showNovaPesquisa, setShowNovaPesquisa] = useState(false);
  const [novoTitulo, setNovoTitulo] = useState("");
  const [novaDescricao, setNovaDescricao] = useState("");

  useEffect(() => {
    const fetchCompanyAndSurveys = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (!currentUser) return;

        // Buscar empresa vinculada
        const { data: company } = await supabase
          .from("companies")
          .select("id, name, code_slug")
          .or(`contact_email.eq.${currentUser.email}`)
          .single();

        if (company) {
          setCompanyId(company.id);
          setCompanyName(company.name);

          // Buscar pesquisas da empresa
          const { data: surveyList } = await supabase
            .from("surveys")
            .select("*")
            .eq("company_id", company.id)
            .order("created_at", { ascending: false });

          if (surveyList && surveyList.length > 0) {
            setSurveys(surveyList);
          } else {
            // Criar pesquisa padrão da empresa se não existir
            const defaultToken = Array.from(crypto.getRandomValues(new Uint8Array(16)))
              .map(b => b.toString(16).padStart(2, '0')).join('');

            const { data: newSurvey } = await supabase
              .from("surveys")
              .insert([
                {
                  company_id: company.id,
                  title: `Pesquisa de Saúde Feminina - ${company.name}`,
                  description: "Pesquisa oficial de triagem para colaboradoras",
                  token: defaultToken,
                  status: "ativa",
                },
              ])
              .select("*")
              .single();

            if (newSurvey) setSurveys([newSurvey]);
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
    const link = `${window.location.origin}/pesquisa?token=${token}`;
    navigator.clipboard.writeText(link);
    toast.success("Link exclusivo copiado!");
  };

  // Compartilhar via Web Share API no celular (F5.3)
  const compartilharLink = async (token: string, title: string) => {
    const link = `${window.location.origin}/pesquisa?token=${token}`;
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

  // Gerar Relatório em PDF Profissional (F5.7 - ANEXO A9)
  const handleGerarPdf = () => {
    window.print();
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
            
            {/* BOTÃO GERAR RELATÓRIO EM PDF (ANEXO A9) */}
            <div className="flex gap-3 print:hidden">
              <Button onClick={() => setShowNovaPesquisa(!showNovaPesquisa)} variant="outline" className="border-secondary text-secondary font-bold">
                <Plus className="w-4 h-4 mr-1.5" /> Criar Pesquisa
              </Button>

              <Button onClick={handleGerarPdf} className="bg-primary hover:bg-rose-dark text-white font-bold shadow-md">
                <Download className="w-4 h-4 mr-2" /> Gerar relatório em PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

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

          {/* RELATÓRIO EM FORMULÁRIO PRÓPRIO E RESULTADOS AGREGADOS (F5.5 & F5.6) */}
          <div className="bg-white rounded-3xl p-6 md:p-10 border border-rose-200 shadow-xl space-y-8 print:shadow-none print:border-none print:p-0">
            <div className="border-b border-rose-100 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="text-xs font-bold text-secondary uppercase tracking-wider block">
                  RELATÓRIO INSTITUCIONAL AGREGADO
                </span>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                  Resultados Consolidados de Saúde Feminina
                </h2>
              </div>
              <div className="text-xs text-muted-foreground text-right">
                <p><strong>Emissão:</strong> {new Date().toLocaleDateString()}</p>
                <p><strong>Identificação:</strong> {companyName}</p>
              </div>
            </div>

            {/* Componente de Gráficos e Indicadores Agregados */}
            <ChartsSection companyId={companyId!} />
          </div>

        </div>
      </main>
      
      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
};

export default EmpresaDashboard;
