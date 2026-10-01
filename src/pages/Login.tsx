import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff, Building2, UserCheck, KeyRound, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

const formatCnpj = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
};

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "";
  const initialTipo = searchParams.get("tipo") === "instituicao" ? "instituicao" : "participante";

  const [role, setRole] = useState<"participante" | "instituicao">(initialTipo);
  const [activeTab, setActiveTab] = useState<"entrar" | "cadastrar" | "esqueci">("entrar");

  // Estados dos Formulários
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [nome, setNome] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [setor, setSetor] = useState("");
  const [termosLgpd, setTermosLgpd] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Ação ENTRAR (Login)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !senha) {
      toast.error("Preencha e-mail e senha.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

      if (error) throw error;

      if (data.user) {
        toast.success("Login realizado com sucesso!");
        
        // Redirecionamento por returnUrl ou perfil
        if (returnUrl) {
          navigate(decodeURIComponent(returnUrl));
        } else if (role === "instituicao") {
          navigate("/banco-de-dados");
        } else {
          navigate("/pesquisa");
        }
      }
    } catch (err: any) {
      toast.error(err.message === "Invalid login credentials" ? "E-mail ou senha incorretos." : err.message || "Erro ao fazer login.");
      setSenha("");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Ação CRIAR CONTA (Cadastro)
  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !senha || !nome) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    if (role === "participante" && !termosLgpd) {
      toast.error("Você precisa aceitar os termos de privacidade (LGPD) para prosseguir.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: senha,
      });

      if (authError) throw authError;

      if (authData.user) {
        let createdCompanyId = null;

        // Se for instituição, cria primeiro o registro da empresa
        if (role === "instituicao") {
          const { data: companyData } = await supabase
            .from("companies")
            .insert([
              {
                name: nome,
                cnpj_or_identifier: cnpj || null,
                contact_email: email,
                code_slug: encodeURIComponent(nome.trim().replace(/\s+/g, "_")),
              },
            ])
            .select("id")
            .single();

          if (companyData) {
            createdCompanyId = companyData.id;
          }
        }

        // Criar ou atualizar perfil com o role correto
        await supabase.from("profiles").upsert([
          {
            id: authData.user.id,
            email,
            full_name: nome,
            role: role,
            company_id: createdCompanyId,
          },
        ]);

        toast.success("Conta criada com sucesso!");

        if (returnUrl) {
          navigate(decodeURIComponent(returnUrl));
        } else if (role === "instituicao") {
          navigate("/banco-de-dados");
        } else {
          navigate("/pesquisa");
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar conta.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Ação ESQUECI MINHA SENHA (Recuperação Real via Supabase)
  const handleEsqueciSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Informe seu e-mail para receber as instruções de recuperação.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login?reset=true`,
      });

      if (error) throw error;

      toast.success("E-mail de recuperação enviado! Confira sua caixa de entrada.");
      setActiveTab("entrar");
    } catch (err: any) {
      toast.error(err.message || "Erro ao enviar e-mail de recuperação.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 px-4 relative overflow-hidden">
        {/* Adornos visuais de fundo */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-pink-soft/50 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="w-full max-w-lg bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-rose-200 p-8 z-10">
          
          {/* Seletor do Tipo de Acesso: Participante vs Empresa */}
          <div className="flex bg-pink-soft p-1.5 rounded-2xl mb-8 border border-rose-200">
            <button
              type="button"
              onClick={() => setRole("participante")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs md:text-sm font-bold transition-all ${
                role === "participante"
                  ? "bg-secondary text-white shadow-md"
                  : "text-muted-foreground hover:text-secondary"
              }`}
            >
              <UserCheck className="w-4 h-4" /> Participante Individual
            </button>

            <button
              type="button"
              onClick={() => setRole("instituicao")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs md:text-sm font-bold transition-all ${
                role === "instituicao"
                  ? "bg-secondary text-white shadow-md"
                  : "text-muted-foreground hover:text-secondary"
              }`}
            >
              <Building2 className="w-4 h-4" /> Empresa / Instituição
            </button>
          </div>

          <div className="text-center mb-6">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              {role === "instituicao" ? "Área da Empresa e Instituição" : "Acesso do Participante"}
            </h2>
            <p className="text-muted-foreground text-xs md:text-sm mt-1">
              {role === "instituicao"
                ? "Gerencie pesquisas institucionais e acesse os relatórios consolidados."
                : "Acesse para preencher a pesquisa geral do Endometriômetro."}
            </p>
          </div>

          {activeTab === "esqueci" ? (
            /* FLUXO DE ESQUECI MINHA SENHA */
            <form onSubmit={handleEsqueciSenha} className="space-y-5 animate-fade-in">
              <div className="p-4 rounded-2xl bg-pink-soft border border-rose-200 text-xs text-muted-foreground leading-relaxed">
                Digite seu e-mail cadastrado abaixo. Enviaremos um link de recuperação para você redefinir sua senha com segurança.
              </div>

              <div>
                <Label htmlFor="esqueci-email" className="font-bold text-sm text-foreground mb-1.5 block">E-mail *</Label>
                <Input
                  id="esqueci-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="rounded-xl"
                  required
                />
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full bg-secondary hover:bg-secondary/90 text-white font-bold py-5 rounded-xl shadow-md">
                {isSubmitting ? "Enviando..." : "Enviar link de recuperação"}
              </Button>

              <button
                type="button"
                onClick={() => setActiveTab("entrar")}
                className="flex items-center justify-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-secondary w-full pt-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Voltar para o Login
              </button>
            </form>
          ) : (
            /* TABS: ENTRAR x CRIAR CONTA */
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/60 p-1 rounded-2xl">
                <TabsTrigger value="entrar" className="rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  Entrar
                </TabsTrigger>
                <TabsTrigger value="cadastrar" className="rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  Criar conta
                </TabsTrigger>
              </TabsList>

              {/* ABA 1: ENTRAR */}
              <TabsContent value="entrar">
                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <Label htmlFor="login-email" className="font-bold text-sm text-foreground mb-1.5 block">E-mail *</Label>
                    <Input
                      id="login-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="rounded-xl"
                      required
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <Label htmlFor="login-senha" className="font-bold text-sm text-foreground">Senha *</Label>
                      <button
                        type="button"
                        onClick={() => setActiveTab("esqueci")}
                        className="text-xs font-bold text-secondary hover:underline"
                      >
                        Esqueci minha senha
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        id="login-senha"
                        type={showSenha ? "text" : "password"}
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        placeholder="••••••••"
                        className="rounded-xl pr-10"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-secondary"
                        onClick={() => setShowSenha(!showSenha)}
                      >
                        {showSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" disabled={isSubmitting} className="w-full bg-secondary hover:bg-secondary/90 text-white font-bold py-6 rounded-xl shadow-md text-base mt-4">
                    {isSubmitting ? "Entrando..." : "Entrar"}
                  </Button>
                </form>
              </TabsContent>

              {/* ABA 2: CRIAR CONTA */}
              <TabsContent value="cadastrar">
                <form onSubmit={handleCadastro} className="space-y-5">
                  <div>
                    <Label htmlFor="cad-nome" className="font-bold text-sm text-foreground mb-1.5 block">
                      {role === "instituicao" ? "Nome da Empresa / Instituição *" : "Seu Nome Completo *"}
                    </Label>
                    <Input
                      id="cad-nome"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder={role === "instituicao" ? "Ex: Hospital / Empresa Exemplo S.A." : "Ex: Maria da Silva"}
                      className="rounded-xl"
                      required
                    />
                  </div>

                  {role === "instituicao" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="cad-cnpj" className="font-bold text-sm text-foreground mb-1.5 block">CNPJ (Opcional)</Label>
                        <Input
                          id="cad-cnpj"
                          value={cnpj}
                          onChange={(e) => setCnpj(formatCnpj(e.target.value))}
                          placeholder="00.000.000/0001-00"
                          maxLength={18}
                          className="rounded-xl"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cad-setor" className="font-bold text-sm text-foreground mb-1.5 block">Setor de Atuação</Label>
                        <Input
                          id="cad-setor"
                          value={setor}
                          onChange={(e) => setSetor(e.target.value)}
                          placeholder="Ex: Saúde / Educação / Tecnologia"
                          className="rounded-xl"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="cad-email" className="font-bold text-sm text-foreground mb-1.5 block">
                      {role === "instituicao" ? "E-mail Corporativo do Responsável *" : "Seu E-mail *"}
                    </Label>
                    <Input
                      id="cad-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="rounded-xl"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="cad-senha" className="font-bold text-sm text-foreground mb-1.5 block">Senha (mínimo 6 caracteres) *</Label>
                    <div className="relative">
                      <Input
                        id="cad-senha"
                        type={showSenha ? "text" : "password"}
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        placeholder="••••••••"
                        className="rounded-xl pr-10"
                        minLength={6}
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-secondary"
                        onClick={() => setShowSenha(!showSenha)}
                      >
                        {showSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {role === "participante" && (
                    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-pink-soft border border-rose-200">
                      <input
                        type="checkbox"
                        id="lgpd"
                        checked={termosLgpd}
                        onChange={(e) => setTermosLgpd(e.target.checked)}
                        className="mt-1 accent-primary h-4 w-4 cursor-pointer"
                        required
                      />
                      <label htmlFor="lgpd" className="text-xs text-muted-foreground leading-snug cursor-pointer">
                        Concordo com os termos de consentimento e privacidade (LGPD). Compreendo que minhas respostas serão mantidas em sigilo e utilizadas de forma agregada para pesquisas médicas e científicas.
                      </label>
                    </div>
                  )}

                  <Button type="submit" disabled={isSubmitting} className="w-full bg-secondary hover:bg-secondary/90 text-white font-bold py-6 rounded-xl shadow-md text-base mt-4">
                    {isSubmitting ? "Criando conta..." : "Criar conta"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          )}

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
