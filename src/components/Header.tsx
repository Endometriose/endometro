import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Instagram, Mail, Youtube, Facebook, Menu, Maximize, Minimize, ChevronDown } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  // Observer para Scrollspy (marcar menu ativo e animar entrada de seções)
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
          // Animação de entrada (se houver classe para isso)
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

      <Link to="/#contato" onClick={(e) => handleLinkClick(e as any, "/#contato")} className={linkClass(mobile, "/#contato")}>Contato</Link>
      
      {mobile && (
        <Link to="/pesquisa" onClick={(e) => handleLinkClick(e as any, "/pesquisa")} className="mt-6 bg-primary hover:bg-rose-dark text-white font-bold rounded-full py-3 px-6 text-center shadow-md transition-transform hover:-translate-y-0.5 w-full">
          Entrar / Cadastrar
        </Link>
      )}
    </>
  );

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ease-in-out border-b shadow-sm ${
      scrolled ? 'bg-white/90 backdrop-blur-[12px] border-rose-200/50 py-2' : 'bg-white/98 backdrop-blur-[12px] border-border py-4'
    }`}>
      <nav className="container mx-auto flex items-center justify-between px-4 md:px-6 max-w-7xl">
        {/* Logo (Esquerda) */}
        <div className="flex-shrink-0 flex items-center">
          <Link to="/" className="font-display text-2xl md:text-3xl font-bold tracking-wide flex items-center gap-1 group">
            <span className="text-secondary italic group-hover:text-primary transition-colors">Endome</span>
            <span className="text-foreground">triose</span>
          </Link>
        </div>

        {/* Desktop Nav (Centralizado) */}
        <div className="hidden lg:flex flex-1 items-center justify-center gap-6 xl:gap-8 text-foreground font-medium">
          <NavItems />
        </div>

        {/* Ações (Direita) */}
        <div className="flex items-center justify-end gap-3 flex-shrink-0">
          
          <Link to="/pesquisa" className="hidden lg:flex bg-primary hover:bg-rose-dark text-white font-bold rounded-full py-2 px-5 text-[15px] shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 whitespace-nowrap outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2">
            Entrar / Cadastrar
          </Link>

          <button onClick={toggleFullscreen} className="text-foreground hover:text-secondary transition p-2 rounded-full hover:bg-rose-50 flex items-center justify-center min-w-[44px] min-h-[44px]" title="Alternar Tela Cheia">
            {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
          </button>

          {/* Mobile Menu Toggle — Drawer */}
          <div className="lg:hidden flex items-center">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <button className="text-foreground hover:text-secondary transition p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-rose-50" aria-label="Abrir Menu">
                  <Menu className="h-6 w-6" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[85vw] max-w-[350px] bg-background border-r-border z-[100] shadow-2xl overflow-y-auto">
                <SheetTitle className="sr-only">Menu de Navegação</SheetTitle>
                <div className="flex flex-col gap-1 mt-8 text-foreground font-medium w-full items-start">
                  <NavItems mobile />
                  <div className="flex items-center gap-4 mt-8 pt-6 border-t border-border justify-center w-full">
                    <a href="https://www.youtube.com/@project.endometriose" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-secondary transition p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-rose-50"><Youtube className="h-6 w-6" /></a>
                    <a href="https://instagram.com/project.endo2" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-secondary transition p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-rose-50"><Instagram className="h-6 w-6" /></a>
                    <a href="https://www.facebook.com/share/1CXwao28xD/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-secondary transition p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-rose-50"><Facebook className="h-6 w-6" /></a>
                    <a href="mailto:projeto.endometriose.tcc@gmail.com" className="text-muted-foreground hover:text-secondary transition p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-rose-50"><Mail className="h-6 w-6" /></a>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
