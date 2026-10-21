import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, UserCheck, Building2, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { ModalAcessoEmpresa } from "@/components/ModalAcessoEmpresa";

interface ParticipantLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  empresaToken?: string;
  empresaNome?: string;
  defaultTab?: "cadastrar" | "entrar";
}

export const ParticipantLoginModal = ({
  isOpen,
  onClose,
  onSuccess,
  empresaToken = "",
  empresaNome = "",
  defaultTab = "cadastrar",
}: ParticipantLoginModalProps) => {
  const navigate = useNavigate();

  // "participante" | "instituicao"
  const [role, setRole] = useState<"participante" | "instituicao">("participante");
  const [activeTab, setActiveTab] = useState<"entrar" | "cadastrar" | "esqueci">(defaultTab);

  // Form states
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [nome, setNome] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [setor, setSetor] = useState("");
  const [termosLgpd, setTermosLgpd] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados do Modal da Empresa
  const [showModalEmpresa, setShowModalEmpresa] = useState(false);
  const [empresaCriadaNome, setEmpresaCriadaNome] = useState("");
  const [empresaCriadaLink, setEmpresaCriadaLink] = useState("");

  // Limpa os campos toda vez que o modal for aberto para garantir login limpo
  useEffect(() => {
    if (isOpen) {
      setEmail("");
      setSenha("");
      setShowSenha(false);
      setNome("");
      setCnpj("");
      setSetor("");
      setTermosLgpd(false);
      setActiveTab(defaultTab || "cadastrar");
      setRole("participante");
      setIsSubmitting(false);
    }
  }, [isOpen, defaultTab]);

  const formatCnpj = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 14);
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
    if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
    if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
  };

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
        onClose();

        if (role === "instituicao") {
          navigate("/banco-de-dados");
        } else {
          // Check if participant already has survey answers
          const { data: previousSurvey } = await supabase
            .from("survey_responses")
            .select("*")
            .eq("user_id", data.user.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (previousSurvey) {
            toast.info("Pesquisa registrada identificada!", {
              description: "Suas respostas foram carregadas em modo de visualização. É possível conferir os dados e gerar o PDF.",
            });
          }

          if (onSuccess) {
            onSuccess();
          } else {
            navigate("/pesquisa");
          }
        }
      }
    } catch (err: any) {
      toast.error(
        err.message === "Invalid login credentials"
          ? "E-mail ou senha incorretos."
          : err.message || "Erro ao fazer login."
      );
      setSenha("");
    } finally {
      setIsSubmitting(false);
    }
  };

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

    if (role === "instituicao" && !cnpj) {
      toast.error("Informe o CNPJ da empresa.");
      return;
    }

    setIsSubmitting(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: senha,
        options: {
          data: {
            full_name: nome,
            role: role,
            tipo_usuario: role === "instituicao" ? "EMPRESA" : null,
          },
        },
      });

      let userObj = authData?.user;
      if (authError) {
        if (authError.message.includes("already registered") || authError.message.includes("already exists")) {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password: senha,
          });
          if (signInError) {
            throw new Error("Este e-mail já possui cadastro. Use a aba 'Entrar' ou informe a senha correta.");
          }
          userObj = signInData.user;
        } else {
          throw authError;
        }
      }

      if (userObj) {
        const userId = userObj.id;
        let companyId = null;

        // 1. Criar perfil primeiro para satisfazer chave estrangeira de companies.user_id
        await supabase.from("profiles").upsert([
          {
            id: userId,
            email: cleanEmail,
            full_name: nome,
            nome: nome,
            role: role,
            tipo_usuario: role === "instituicao" ? "EMPRESA" : null,
          },
        ]);

        // 2. Se for instituição, criar ou vincular o registro da empresa com campos corretos
        if (role === "instituicao") {
          const codSlug = encodeURIComponent(nome.trim().toLowerCase().replace(/\s+/g, "_")) + "_" + Date.now().toString().slice(-4);
          const cleanCnpj = cnpj.trim();
          let slugToUse = codSlug;

          let existingCompQuery = supabase.from("companies").select("id, code_slug");
          if (cleanCnpj) {
            existingCompQuery = existingCompQuery.or(`cnpj.eq.${cleanCnpj},cnpj_or_identifier.eq.${cleanCnpj},contact_email.eq.${cleanEmail},user_id.eq.${userId}`);
          } else {
            existingCompQuery = existingCompQuery.or(`contact_email.eq.${cleanEmail},user_id.eq.${userId}`);
          }

          const { data: existingComp } = await existingCompQuery.limit(1).maybeSingle();

          if (existingComp) {
            companyId = existingComp.id;
            if (existingComp.code_slug) slugToUse = existingComp.code_slug;

            await supabase.from("companies").update({
              user_id: userId,
              name: nome,
              nome_empresa: nome,
              cnpj: cleanCnpj || null,
              cnpj_or_identifier: cleanCnpj || null,
              setor: setor || null,
              contact_email: cleanEmail,
            }).eq("id", existingComp.id);
          } else {
            const { data: compData, error: compError } = await supabase
              .from("companies")
              .insert([
                {
                  user_id: userId,
                  name: nome,
                  nome_empresa: nome,
                  cnpj: cleanCnpj || null,
                  cnpj_or_identifier: cleanCnpj || null,
                  setor: setor || null,
                  contact_email: cleanEmail,
                  code_slug: codSlug,
                },
              ])
              .select("id, code_slug")
              .single();

            if (compData) {
              companyId = compData.id;
              if (compData.code_slug) slugToUse = compData.code_slug;
            } else if (compError) {
              console.warn("Recuperando empresa por CNPJ após aviso:", compError.message);
              if (cleanCnpj) {
                const { data: compByCnpj } = await supabase
                  .from("companies")
                  .select("id, code_slug")
                  .or(`cnpj.eq.${cleanCnpj},cnpj_or_identifier.eq.${cleanCnpj}`)
                  .limit(1)
                  .maybeSingle();
                if (compByCnpj) {
                  companyId = compByCnpj.id;
                  if (compByCnpj.code_slug) slugToUse = compByCnpj.code_slug;
                  await supabase.from("companies").update({ user_id: userId }).eq("id", compByCnpj.id);
                }
              }
            }
          }

          if (companyId) {
            await supabase.from("profiles").update({ company_id: companyId, role: "instituicao", tipo_usuario: "EMPRESA" }).eq("id", userId);
            try {
              sessionStorage.setItem("empresa_ativa", JSON.stringify({ id: companyId, name: nome, code_slug: slugToUse }));
            } catch (e) {}
          }

          const generatedUrl = `${window.location.origin}/pesquisa?empresa=${slugToUse}`;
          setEmpresaCriadaNome(nome);
          setEmpresaCriadaLink(generatedUrl);
          setShowModalEmpresa(true);
          toast.success("Conta da empresa cadastrada com sucesso! Abrindo opções de acesso.");
          return;
        }

        toast.success("Conta criada com sucesso!");
        onClose();

        if (onSuccess) {
          onSuccess();
        } else {
          navigate("/pesquisa");
        }
      }
    } catch (err: any) {
      const msg = err.message === "User already registered"
        ? "Este e-mail já possui cadastro. Use a aba Entrar para acessar."
        : (err.message || "Erro ao criar conta.");
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecuperarSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Informe seu e-mail cadastrado.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login?tab=nova-senha`,
      });
      if (error) throw error;
      toast.success("E-mail de recuperação enviado!", {
        description: "Verifique sua caixa de entrada para redefinir a senha.",
      });
      setActiveTab("entrar");
    } catch (err: any) {
      toast.error(err.message || "Erro ao solicitar recuperação de senha.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen && !showModalEmpresa} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[460px] p-6 sm:p-8 bg-card rounded-3xl border border-rose-200/80 shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto">
        <DialogTitle className="sr-only">Acesso do Participante</DialogTitle>
        <DialogDescription className="sr-only">
          Formulário de acesso e cadastro individual para a pesquisa do Endometriômetro
        </DialogDescription>

        {/* 1. Header Role Toggle (Imagem 3) */}
        <div className="bg-rose-blush/60 p-1.5 rounded-2xl flex gap-1 mb-6 border border-rose-200/50">
          <button
            type="button"
            onClick={() => setRole("participante")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              role === "participante"
                ? "bg-secondary text-white shadow-sm"
                : "text-secondary hover:text-secondary/80"
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Participante Individual
          </button>
          <button
            type="button"
            onClick={() => setRole("instituicao")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              role === "instituicao"
                ? "bg-secondary text-white shadow-sm"
                : "text-secondary hover:text-secondary/80"
            }`}
          >
            <Building2 className="w-4 h-4" />
            Empresa / Instituição
          </button>
        </div>

        {/* 2. Title & Subtitle */}
        <div className="text-center mb-6">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            {role === "participante" ? "Acesso do Participante" : "Área da Empresa e Instituição"}
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1.5 leading-relaxed">
            {role === "participante"
              ? "Acesse para preencher a pesquisa geral do Endometriômetro."
              : "Gerencie pesquisas institucionais e acesse os relatórios consolidados."}
          </p>
        </div>

        {/* Destaque de vínculo com empresa se houver token */}
        {(empresaNome || empresaToken) && (
          <div className="mb-4 p-2.5 rounded-2xl bg-pink-soft border border-rose-200 text-center text-xs font-bold text-secondary flex items-center justify-center gap-2">
            <Building2 className="w-4 h-4 text-primary shrink-0" />
            <span>Pesquisa Vinculada: <strong>{empresaNome || empresaToken}</strong></span>
          </div>
        )}

        {/* 3. Sub-tabs Cadastro em Destaque vs Entrar */}
        {activeTab !== "esqueci" && (
          <div className="bg-rose-blush/40 p-1.5 rounded-2xl flex gap-1 mb-5 border border-rose-200/50">
            <button
              type="button"
              onClick={() => setActiveTab("cadastrar")}
              className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                activeTab === "cadastrar"
                  ? "bg-secondary text-white shadow-sm ring-1 ring-secondary/40 font-extrabold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Criar conta (Cadastro)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("entrar")}
              className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                activeTab === "entrar"
                  ? "bg-white text-foreground shadow-xs font-extrabold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Entrar
            </button>
          </div>
        )}

        {/* 4. Form Content */}
        {activeTab === "entrar" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label className="text-xs font-bold text-foreground">E-mail *</Label>
              <Input
                type="email"
                required
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 bg-white border-rose-200 focus-visible:ring-secondary text-sm h-11 rounded-xl"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <Label className="text-xs font-bold text-foreground">Senha *</Label>
                <button
                  type="button"
                  onClick={() => setActiveTab("esqueci")}
                  className="text-xs text-secondary hover:underline font-semibold"
                >
                  Esqueci minha senha
                </button>
              </div>
              <div className="relative">
                <Input
                  type={showSenha ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="bg-white border-rose-200 focus-visible:ring-secondary text-sm h-11 rounded-xl pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowSenha(!showSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-secondary hover:bg-secondary/90 text-white font-bold py-6 rounded-xl text-base shadow-md mt-2"
            >
              {isSubmitting ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        )}

        {activeTab === "cadastrar" && (
          <form onSubmit={handleCadastro} className="space-y-4">
            <div>
              <Label className="text-xs font-bold text-foreground">
                {role === "participante" ? "Nome ou Apelido *" : "Nome da Empresa / Instituição *"}
              </Label>
              <Input
                type="text"
                required
                placeholder={role === "participante" ? "Como prefere ser chamada" : "Razão Social ou Nome Fantasia"}
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="mt-1 bg-white border-rose-200 focus-visible:ring-secondary text-sm h-11 rounded-xl"
              />
            </div>

            {role === "instituicao" && (
              <>
                <div>
                  <Label className="text-xs font-bold text-foreground">CNPJ *</Label>
                  <Input
                    type="text"
                    required
                    placeholder="00.000.000/0000-00"
                    value={cnpj}
                    onChange={(e) => setCnpj(formatCnpj(e.target.value))}
                    className="mt-1 bg-white border-rose-200 focus-visible:ring-secondary text-sm h-11 rounded-xl"
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold text-foreground">Setor de Atuação</Label>
                  <Input
                    type="text"
                    placeholder="Ex: Tecnologia, Saúde, Educação..."
                    value={setor}
                    onChange={(e) => setSetor(e.target.value)}
                    className="mt-1 bg-white border-rose-200 focus-visible:ring-secondary text-sm h-11 rounded-xl"
                  />
                </div>
              </>
            )}

            <div>
              <Label className="text-xs font-bold text-foreground">E-mail *</Label>
              <Input
                type="email"
                required
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 bg-white border-rose-200 focus-visible:ring-secondary text-sm h-11 rounded-xl"
              />
            </div>

            <div>
              <Label className="text-xs font-bold text-foreground">Senha *</Label>
              <div className="relative mt-1">
                <Input
                  type={showSenha ? "text" : "password"}
                  required
                  placeholder="Mínimo de 6 caracteres"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="bg-white border-rose-200 focus-visible:ring-secondary text-sm h-11 rounded-xl pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowSenha(!showSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {role === "participante" && (
              <div className="flex items-start gap-2.5 pt-1">
                <Checkbox
                  id="modal-termos"
                  checked={termosLgpd}
                  onCheckedChange={(c) => setTermosLgpd(!!c)}
                  className="mt-0.5 border-rose-300 data-[state=checked]:bg-secondary"
                />
                <label htmlFor="modal-termos" className="text-xs text-muted-foreground leading-relaxed cursor-pointer select-none">
                  Concordo com os Termos de Privacidade e tratamento anônimo de dados estatísticos (LGPD).
                </label>
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-secondary hover:bg-secondary/90 text-white font-bold py-6 rounded-xl text-base shadow-md mt-2"
            >
              {isSubmitting ? "Criando conta..." : "Criar conta"}
            </Button>
          </form>
        )}

        {activeTab === "esqueci" && (
          <form onSubmit={handleRecuperarSenha} className="space-y-4">
            <div className="text-center p-3 bg-rose-blush/30 rounded-xl border border-rose-200/50 mb-2">
              <KeyRound className="w-6 h-6 text-secondary mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">
                Informe o e-mail cadastrado para receber as instruções de redefinição de senha.
              </p>
            </div>

            <div>
              <Label className="text-xs font-bold text-foreground">E-mail *</Label>
              <Input
                type="email"
                required
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 bg-white border-rose-200 focus-visible:ring-secondary text-sm h-11 rounded-xl"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-secondary hover:bg-secondary/90 text-white font-bold py-6 rounded-xl text-base shadow-md"
            >
              {isSubmitting ? "Enviando..." : "Enviar instruções"}
            </Button>

            <button
              type="button"
              onClick={() => setActiveTab("entrar")}
              className="w-full text-center text-xs text-secondary font-semibold hover:underline pt-2 block"
            >
              Voltar para o login
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>

    <ModalAcessoEmpresa
      isOpen={showModalEmpresa}
      onClose={() => {
        setShowModalEmpresa(false);
        onClose();
      }}
      empresaNome={empresaCriadaNome}
      linkExclusivo={empresaCriadaLink}
      onAcessarPainel={() => {
        setShowModalEmpresa(false);
        onClose();
        navigate("/banco-de-dados");
      }}
    />
    </>
  );
};
