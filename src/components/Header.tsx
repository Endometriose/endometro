import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Instagram, Mail, Youtube, Facebook, Menu, Maximize, Minimize, ChevronDown, Building2, Eye, ShieldCheck, PhoneCall, LogOut } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabase";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [activeCompanyName, setActiveCompanyName] = useState<string>("");
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Detecta se está no contexto da empresa (login, cadastro, dashboard ou empresa ativa)
  const isEmpresaContext = 
    location.pathname === "/banco-de-dados" ||
    (location.pathname === "/pesquisa" && location.search.includes("tab=empresa")) ||
    location.pathname === "/login" ||
    Boolean(activeCompanyName && (location.pathname === "/banco-de-dados" || location.pathname === "/pesquisa"));

  // Carrega nome da empresa ativa na sessão
  useEffect(() => {
    const resolveCompany = async () => {
      try {
        const raw = sessionStorage.getItem("empresa_ativa");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.name) {
            setActiveCompanyName(parsed.name);
            return;
          }
        }
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: prof } = await supabase.from("profiles").select("company_id, full_name, nome").eq("id", user.id).maybeSingle();
          if (prof?.company_id) {
            const { data: comp } = await supabase.from("companies").select("name, nome_empresa").eq("id", prof.company_id).maybeSingle();
            if (comp) {
              const compName = comp.name || comp.nome_empresa || "Empresa";
              setActiveCompanyName(compName);
              sessionStorage.setItem("empresa_ativa", JSON.stringify({ id: comp.id, name: compName }));
              return;
            }
          }
          if (user.email) {
            const { data: compByEmail } = await supabase.from("companies").select("id, name, nome_empresa").ilike("contact_email", user.email).maybeSingle();
            if (compByEmail) {
              const compName = compByEmail.name || compByEmail.nome_empresa || "Empresa";
              setActiveCompanyName(compName);
              sessionStorage.setItem("empresa_ativa", JSON.stringify({ id: compByEmail.id, name: compName }));
            }
          }
        }
      } catch (e) {
        console.warn("Aviso ao carregar empresa ativa no Header:", e);
      }
    };

    resolveCompany();

    const storageListener = () => resolveCompany();
    window.addEventListener("storage", storageListener);
    window.addEventListener("empresa_atualizada", storageListener);
    return () => {
      window.removeEventListener("storage", storageListener);
      window.removeEventListener("empresa_atualizada", storageListener);
    };
  }, [location.pathname, location.search]);

  // Observer para Scrollspy (marcar menu ativo e animar entrada de seções)
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
          entry.target.classList.add("section-visible");
        }
      });
    }, { rootMargin: "-90px 0px -50% 0px", threshold: 0.1 });

    const sections = document.querySelectorAll("section[id]");
    sections.forEach(section => observer.observe(section));

    return () => {
      window.removeEventListener("scroll", handleScroll);
      sections.forEach(section => observer.unobserve(section));
    };
  }, [location.pathname]);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen().catch(err => console.log(err));
    } else {
      await document.exitFullscreen().catch(err => console.log(err));
    }
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, to: string, sectionId?: string) => {
    setIsOpen(false);
    if (to.startsWith("/#")) {
      const id = sectionId || to.replace("/#", "");
      let targetId = id;
      if (id === "tratamentos") targetId = "tratamento";
      if (id === "duvidas") targetId = "relatos";
      if (id === "diagnostico") targetId = "investigacao";
      if (id === "oquee-endometriometro") targetId = "oquee-endometriometro";

      if (location.pathname === "/") {
        e.preventDefault();
        const element = document.getElementById(targetId) || document.getElementById(id);
        if (element) {
          const yOffset = -80; // Altura do cabeçalho
          const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: "smooth" });
          window.history.pushState(null, "", to);
          
          // Efeito de destaque no título de destino
          const title = element.querySelector("h2");
          if (title) {
            title.classList.add("highlight-title");
            setTimeout(() => title.classList.remove("highlight-title"), 2000);
          }
        }
      } else {
        navigate(to);
      }
    } else {
      navigate(to);
    }
  };

  const isLinkActive = (href: string) => {
    if (location.pathname !== "/") return location.pathname === href;
    const hash = href.replace("/#", "");
    return activeSection === hash || activeSection === href;
  };

  const linkClass = (mobile: boolean, href: string) => {
    const active = isLinkActive(href);
    if (mobile) {
      return `font-semibold text-lg py-2 px-3 w-full text-left transition-colors ${active ? "text-primary bg-rose-50 rounded-lg" : "hover:bg-rose-50/50 rounded-lg"}`;
    }
    return `relative font-semibold text-[15px] py-1 px-1 transition-colors whitespace-nowrap outline-none ${
      active ? "text-primary" : "text-foreground hover:text-secondary"
    } after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:w-0 after:h-[2px] after:bg-primary after:transition-all after:duration-300 after:-translate-x-1/2 hover:after:w-full ${
      active ? "after:w-full" : ""
    }`;
  };

  const NavItems = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      <Link to="/" onClick={(e) => handleLinkClick(e as any, "/")} className={linkClass(mobile, "/")}>Início</Link>
      
      <DropdownMenu>
        <DropdownMenuTrigger className={`flex items-center justify-between gap-1 group outline-none ${linkClass(mobile, "")}`}>
          <span>Conheça</span> <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-white/95 backdrop-blur-md border-rose-100 shadow-lg rounded-2xl z-50 animate-in fade-in slide-in-from-top-2 p-2">
          <DropdownMenuItem className="rounded-xl focus:bg-rose-50 cursor-pointer">
            <button
              className="w-full font-medium text-left"
              onClick={() => { setIsOpen(false); window.dispatchEvent(new CustomEvent("open-endometriometro-modal")); }}
            >
              O que é o Endometriômetro
            </button>
          </DropdownMenuItem>
          <DropdownMenuItem className="rounded-xl focus:bg-rose-50 cursor-pointer"><Link to="/#oquee" onClick={(e) => handleLinkClick(e as any, "/#oquee")} className="w-full font-medium">O que é Endometriose</Link></DropdownMenuItem>
          <DropdownMenuItem className="rounded-xl focus:bg-rose-50 cursor-pointer"><Link to="/#sintomas" onClick={(e) => handleLinkClick(e as any, "/#sintomas")} className="w-full font-medium">Sintomas</Link></DropdownMenuItem>
          <DropdownMenuItem className="rounded-xl focus:bg-rose-50 cursor-pointer"><Link to="/#investigacao" onClick={(e) => handleLinkClick(e as any, "/#investigacao")} className="w-full font-medium">Diagnóstico</Link></DropdownMenuItem>
          <DropdownMenuItem className="rounded-xl focus:bg-rose-50 cursor-pointer"><Link to="/#tratamento" onClick={(e) => handleLinkClick(e as any, "/#tratamento")} className="w-full font-medium">Tratamentos</Link></DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger className={`flex items-center justify-between gap-1 group outline-none ${linkClass(mobile, "")}`}>
          <span>Participe</span> <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-white/95 backdrop-blur-md border-rose-100 shadow-lg rounded-2xl z-50 animate-in fade-in slide-in-from-top-2 p-2">
          <DropdownMenuItem className="rounded-xl focus:bg-rose-50 cursor-pointer"><Link to="/#participe" onClick={(e) => handleLinkClick(e as any, "/#participe")} className="w-full font-medium">Apresentação da Pesquisa</Link></DropdownMenuItem>
          <DropdownMenuItem className="rounded-xl focus:bg-rose-50 cursor-pointer"><Link to="/pesquisa?tab=triagem" onClick={(e) => handleLinkClick(e as any, "/pesquisa?tab=triagem")} className="w-full font-medium">Pesquisa Individual</Link></DropdownMenuItem>
          <DropdownMenuItem className="rounded-xl focus:bg-rose-50 cursor-pointer"><Link to="/pesquisa?tab=empresa" onClick={(e) => handleLinkClick(e as any, "/pesquisa?tab=empresa")} className="w-full font-medium">Área da Empresa / Instituição</Link></DropdownMenuItem>
          <DropdownMenuItem className="rounded-xl focus:bg-rose-50 cursor-pointer"><Link to="/#relatos" onClick={(e) => handleLinkClick(e as any, "/#relatos")} className="w-full font-medium">Relatos</Link></DropdownMenuItem>
          <DropdownMenuItem className="rounded-xl focus:bg-rose-50 cursor-pointer"><Link to="/#duvidas" onClick={(e) => handleLinkClick(e as any, "/#duvidas")} className="w-full font-medium">Dúvidas Frequentes</Link></DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger className={`flex items-center justify-between gap-1 group outline-none ${linkClass(mobile, "")}`}>
          <span>Dados</span> <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-white/95 backdrop-blur-md border-rose-100 shadow-lg rounded-2xl z-50 animate-in fade-in slide-in-from-top-2 p-2">
          <DropdownMenuItem className="rounded-xl focus:bg-rose-50 cursor-pointer"><Link to="/#graficos" onClick={(e) => handleLinkClick(e as any, "/#graficos")} className="w-full font-medium">Dados e Estatísticas</Link></DropdownMenuItem>
          <DropdownMenuItem className="rounded-xl focus:bg-rose-50 cursor-pointer"><Link to="/#dados-individuais" onClick={(e) => handleLinkClick(e as any, "/#dados-individuais")} className="w-full font-medium">Pesquisa Individual</Link></DropdownMenuItem>
          <DropdownMenuItem className="rounded-xl focus:bg-rose-50 cursor-pointer"><Link to="/#dados-empresas" onClick={(e) => handleLinkClick(e as any, "/#dados-empresas")} className="w-full font-medium">Pesquisa em Empresas</Link></DropdownMenuItem>
          <DropdownMenuItem className="rounded-xl focus:bg-rose-50 cursor-pointer"><Link to="/#impacto" onClick={(e) => handleLinkClick(e as any, "/#impacto")} className="w-full font-medium">Impacto no Trabalho</Link></DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Nome destacado da Empresa no Menu para máxima visibilidade e botão para sair */}
      {activeCompanyName && (
        <div className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-rose-100 to-rose-50 border border-rose-300 rounded-full text-xs font-bold text-secondary shadow-xs">
          <Building2 className="w-4 h-4 text-primary shrink-0" />
          <span className="truncate max-w-[180px]" title={`Empresa ativa: ${activeCompanyName}`}>
            {activeCompanyName}
          </span>
          <span className="text-[10px] bg-white/90 text-rose-800 px-1.5 py-0.2 rounded font-semibold ml-0.5">
            Ativa
          </span>
          <button
            type="button"
            onClick={async () => {
              sessionStorage.removeItem("empresa_ativa");
              await supabase.auth.signOut();
              setActiveCompanyName("");
              window.dispatchEvent(new Event("empresa_atualizada"));
              navigate("/");
            }}
            className="text-[11px] text-rose-700 hover:text-rose-900 font-extrabold flex items-center gap-0.5 hover:underline ml-1 pl-1 border-l border-rose-200 cursor-pointer"
            title="Sair da conta da empresa"
          >
            <LogOut className="w-3 h-3" /> Sair
          </button>
        </div>
      )}

      {/* Contato compacto para não ofuscar o nome da empresa */}
      <DropdownMenu>
        <DropdownMenuTrigger className={`flex items-center gap-1 text-xs text-muted-foreground hover:text-secondary py-1 px-2 rounded-lg hover:bg-rose-50 transition-colors outline-none`}>
          <Mail className="h-3.5 w-3.5" />
          <span className="hidden xl:inline">Contato</span>
          <ChevronDown className="h-3 w-3" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-white/95 backdrop-blur-md border-rose-100 shadow-lg rounded-2xl z-50 p-2 text-xs">
          <DropdownMenuItem className="rounded-xl focus:bg-rose-50 cursor-pointer">
            <Link to="/#contato" onClick={(e) => handleLinkClick(e as any, "/#contato")} className="w-full font-medium flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-primary" /> Ir para Seção de Contato
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="rounded-xl focus:bg-rose-50 cursor-pointer">
            <a href="mailto:projeto.endometriose.tcc@gmail.com" className="w-full font-medium flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-secondary" /> projeto.endometriose.tcc@gmail.com
            </a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {mobile && (
        <Link to="/pesquisa" onClick={(e) => handleLinkClick(e as any, "/pesquisa")} className="mt-6 bg-primary hover:bg-rose-dark text-white font-bold rounded-full py-3 px-6 text-center shadow-md transition-transform hover:-translate-y-0.5 w-full">
          Entrar / Cadastrar
        </Link>
      )}
    </>
  );

  return (
    <>
      <header 
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ease-in-out border-b shadow-sm ${
          scrolled ? 'bg-white/90 backdrop-blur-[12px] border-rose-200/50 py-2' : 'bg-white/98 backdrop-blur-[12px] border-border py-4'
        }`}
      >
        <nav className="container mx-auto flex items-center justify-between px-4 md:px-6 max-w-7xl">
          {/* Logo (Esquerda) */}
          <div className="flex-shrink-0 flex items-center gap-3">
            <Link to="/" className="font-display text-2xl md:text-3xl font-bold tracking-wide flex items-center gap-1 group">
              <span className="text-secondary italic group-hover:text-primary transition-colors">Endome</span>
              <span className="text-foreground">triose</span>
            </Link>

            {/* Nome da Empresa em Destaque no Cabeçalho */}
            {activeCompanyName && (
              <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-soft text-secondary border border-rose-200 text-xs font-extrabold max-w-[240px] truncate">
                <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="truncate">{activeCompanyName}</span>
              </span>
            )}
          </div>

          {/* Desktop Nav (Centralizado) */}
          <div className="hidden lg:flex flex-1 items-center justify-center gap-6 xl:gap-8 text-foreground font-medium">
            <NavItems />
          </div>

          {/* Ações (Direita) */}
          <div className="flex items-center justify-end gap-3 flex-shrink-0">
            {location.pathname !== "/banco-de-dados" && (
              <Link to="/pesquisa?tab=empresa" className="hidden lg:flex bg-secondary hover:bg-secondary/90 text-white font-bold rounded-full py-2 px-4 text-xs md:text-sm shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 whitespace-nowrap outline-none">
                Área da Empresa
              </Link>
            )}

            <Link to="/pesquisa" className="hidden sm:flex bg-primary hover:bg-rose-dark text-white font-bold rounded-full py-2 px-4 text-xs md:text-sm shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 whitespace-nowrap outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2">
              Entrar / Cadastrar
            </Link>

            <button onClick={toggleFullscreen} className="text-foreground hover:text-secondary transition p-2 rounded-full hover:bg-rose-50 flex items-center justify-center min-w-[40px] min-h-[40px]" title="Alternar Tela Cheia">
              {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </button>

            {/* Mobile Menu Toggle — Drawer */}
            <div className="lg:hidden flex items-center">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <button className="text-foreground hover:text-secondary transition p-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full hover:bg-rose-50" aria-label="Abrir Menu">
                    <Menu className="h-6 w-6" />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[85vw] max-w-[350px] bg-background border-r-border z-[100] shadow-2xl overflow-y-auto">
                  <SheetTitle className="sr-only">Menu de Navegação</SheetTitle>
                  <div className="flex flex-col gap-1 mt-8 text-foreground font-medium w-full items-start">
                    {activeCompanyName && (
                      <div className="w-full p-3 rounded-2xl bg-rose-50 border border-rose-200 mb-4 flex items-center gap-2 text-xs font-bold text-secondary">
                        <Building2 className="w-4 h-4 text-primary shrink-0" />
                        <span className="truncate">{activeCompanyName}</span>
                      </div>
                    )}
                    <NavItems mobile />
                    <div className="flex items-center gap-4 mt-8 pt-6 border-t border-border justify-center w-full">
                      <a href="https://www.youtube.com/@project.endometriose" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-secondary transition p-2 rounded-full hover:bg-rose-50" title="YouTube"><Youtube className="h-5 w-5" /></a>
                      <a href="https://instagram.com/project.endo2" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-secondary transition p-2 rounded-full hover:bg-rose-50" title="Instagram"><Instagram className="h-5 w-5" /></a>
                      <a href="https://www.facebook.com/share/1CXwao28xD/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-secondary transition p-2 rounded-full hover:bg-rose-50" title="Facebook"><Facebook className="h-5 w-5" /></a>
                      <a href="mailto:projeto.endometriose.tcc@gmail.com" className="text-muted-foreground hover:text-secondary transition p-2 rounded-full hover:bg-rose-50" title="E-mail"><Mail className="h-5 w-5" /></a>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </nav>
      </header>
    </>
  );
};

export default Header;
