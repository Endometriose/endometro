import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

const formatCpf = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
};

const formatCnpj = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
};

const NOTIFY_EMAIL = "projeto.endometriose.tcc@gmail.com";

const sendNotification = async (type: string, data: Record<string, string>) => {
  try {
    const body = Object.entries(data).map(([k, v]) => `${k}: ${v}`).join("\n");
    await fetch("https://formsubmit.co/ajax/" + NOTIFY_EMAIL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        _subject: `[Endometriose] ${type}`,
        message: body,
      }),
    });
  } catch (e) {
    console.error("Erro ao enviar notificação:", e);
  }
};

const Login = () => {
  const navigate = useNavigate();
  const [loginEmail, setLoginEmail] = useState("");
  const [loginSenha, setLoginSenha] = useState("");
  const [showLoginSenha, setShowLoginSenha] = useState(false);
  const [cadNome, setCadNome] = useState("");
  const [cadEmail, setCadEmail] = useState("");
  const [cadCpfCnpj, setCadCpfCnpj] = useState("");
  const [cadSenha, setCadSenha] = useState("");
  const [showCadSenha, setShowCadSenha] = useState(false);
  const [cadTipo, setCadTipo] = useState<"pessoal" | "empresa">("pessoal");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendNotification("Login", { email: loginEmail });
    toast.success("Login realizado com sucesso!");
    navigate("/dashboard");
  };

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendNotification("Cadastro", {
      tipo: cadTipo,
      nome: cadNome,
      email: cadEmail,
      cpf_cnpj: cadCpfCnpj,
    });
    toast.success("Cadastro realizado com sucesso!");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 px-4 bg-rose-blush">
        <div className="w-full max-w-md bg-card rounded-xl shadow-lg border border-border p-8">
          <h2 className="font-display text-2xl font-bold text-foreground text-center mb-6">
            Acesse a Pesquisa
          </h2>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="cadastro">Cadastro</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="login-email">E-mail</Label>
                  <Input id="login-email" type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="seu@email.com" required />
                </div>
                <div>
                  <Label htmlFor="login-senha">Senha</Label>
                  <div className="relative">
                    <Input
                      id="login-senha"
                      type={showLoginSenha ? "text" : "password"}
                      value={loginSenha}
                      onChange={e => setLoginSenha(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowLoginSenha(!showLoginSenha)}
                    >
                      {showLoginSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-rose-dark">
                  Entrar
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="cadastro">
              <form onSubmit={handleCadastro} className="space-y-4">
                <div className="flex gap-2 mb-2">
                  <Button
                    type="button"
                    variant={cadTipo === "pessoal" ? "default" : "outline"}
                    className={cadTipo === "pessoal" ? "flex-1 bg-primary text-primary-foreground" : "flex-1"}
                    onClick={() => { setCadTipo("pessoal"); setCadCpfCnpj(""); }}
                  >
                    Pessoal
                  </Button>
                  <Button
                    type="button"
                    variant={cadTipo === "empresa" ? "default" : "outline"}
                    className={cadTipo === "empresa" ? "flex-1 bg-primary text-primary-foreground" : "flex-1"}
                    onClick={() => { setCadTipo("empresa"); setCadCpfCnpj(""); }}
                  >
                    Empresa
                  </Button>
                </div>
                <div>
                  <Label htmlFor="cad-nome">{cadTipo === "empresa" ? "Nome da empresa" : "Nome completo"}</Label>
                  <Input id="cad-nome" value={cadNome} onChange={e => setCadNome(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="cad-email">E-mail</Label>
                  <Input id="cad-email" type="email" value={cadEmail} onChange={e => setCadEmail(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="cad-cpf">{cadTipo === "empresa" ? "CNPJ" : "CPF"}</Label>
                  <Input
                    id="cad-cpf"
                    value={cadCpfCnpj}
                    onChange={e => setCadCpfCnpj(cadTipo === "empresa" ? formatCnpj(e.target.value) : formatCpf(e.target.value))}
                    placeholder={cadTipo === "empresa" ? "00.000.000/0000-00" : "000.000.000-00"}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cad-senha">Senha</Label>
                  <div className="relative">
                    <Input
                      id="cad-senha"
                      type={showCadSenha ? "text" : "password"}
                      value={cadSenha}
                      onChange={e => setCadSenha(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowCadSenha(!showCadSenha)}
                    >
                      {showCadSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-rose-dark">
                  Criar Conta
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
