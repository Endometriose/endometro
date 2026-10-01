import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Instagram, Mail, Youtube, Facebook, Menu, Maximize, Minimize, ChevronDown } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
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

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, to: string) => {
    setIsOpen(false);
    if (to.startsWith("/#")) {
      const id = to.replace("/#", "");
      let targetId = id;
      if (id === "tratamentos") targetId = "tratamento";
      if (id === "duvidas") targetId = "relatos";
      if (id === "diagnostico") targetId = "investigacao";

      if (location.pathname === "/") {
        e.preventDefault();
        const element = document.getElementById(targetId) || document.getElementById(id);
        if (element) {
          const yOffset = -90;
          const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: "smooth" });
          window.history.pushState(null, "", to);
        }
      } else {
        navigate(to);
      }
    } else {
      navigate(to);
    }
  };

  const NavItems = ({ mobile }: { mobile?: boolean }) => (
    <>
      <Link to="/" onClick={(e) => handleLinkClick(e as any, "/")} className={`font-semibold hover:text-secondary transition ${mobile ? 'text-lg py-1' : 'text-sm'}`}>Início</Link>
      
      {/* Dropdown: Conheça */}
      <DropdownMenu>
        <DropdownMenuTrigger className={`flex items-center gap-1 font-semibold hover:text-secondary transition outline-none ${mobile ? 'text-lg py-1' : 'text-sm'}`}>
          Conheça <ChevronDown className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-background border-border z-50">
          <DropdownMenuItem><Link to="/#oquee-endometriometro" onClick={(e) => handleLinkClick(e as any, "/#oquee-endometriometro")} className="w-full">O que é o Endometriômetro</Link></DropdownMenuItem>
          <DropdownMenuItem><Link to="/#oquee" onClick={(e) => handleLinkClick(e as any, "/#oquee")} className="w-full">O que é Endometriose</Link></DropdownMenuItem>
          <DropdownMenuItem><Link to="/#sintomas" onClick={(e) => handleLinkClick(e as any, "/#sintomas")} className="w-full">Sintomas</Link></DropdownMenuItem>
          <DropdownMenuItem><Link to="/#investigacao" onClick={(e) => handleLinkClick(e as any, "/#investigacao")} className="w-full">Diagnóstico</Link></DropdownMenuItem>
          <DropdownMenuItem><Link to="/#tratamento" onClick={(e) => handleLinkClick(e as any, "/#tratamento")} className="w-full">Tratamentos</Link></DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dropdown: Participe */}
      <DropdownMenu>
        <DropdownMenuTrigger className={`flex items-center gap-1 font-semibold hover:text-secondary transition outline-none ${mobile ? 'text-lg py-1' : 'text-sm'}`}>
          Participe <ChevronDown className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-background border-border z-50">
          <DropdownMenuItem><Link to="/#participe" onClick={(e) => handleLinkClick(e as any, "/#participe")} className="w-full">Apresentação da Pesquisa</Link></DropdownMenuItem>
          <DropdownMenuItem><Link to="/pesquisa" onClick={(e) => handleLinkClick(e as any, "/pesquisa")} className="w-full">Pesquisa Individual</Link></DropdownMenuItem>
          <DropdownMenuItem><Link to="/login?tipo=instituicao" onClick={(e) => handleLinkClick(e as any, "/login?tipo=instituicao")} className="w-full">Área da Empresa / Instituição</Link></DropdownMenuItem>
          <DropdownMenuItem><Link to="/#relatos" onClick={(e) => handleLinkClick(e as any, "/#relatos")} className="w-full">Relatos</Link></DropdownMenuItem>
          <DropdownMenuItem><Link to="/#duvidas" onClick={(e) => handleLinkClick(e as any, "/#duvidas")} className="w-full">Dúvidas Frequentes</Link></DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dropdown: Dados */}
      <DropdownMenu>
        <DropdownMenuTrigger className={`flex items-center gap-1 font-semibold hover:text-secondary transition outline-none ${mobile ? 'text-lg py-1' : 'text-sm'}`}>
          Dados <ChevronDown className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-background border-border z-50">
          <DropdownMenuItem><Link to="/#graficos" onClick={(e) => handleLinkClick(e as any, "/#graficos")} className="w-full">Dados e Estatísticas</Link></DropdownMenuItem>
          <DropdownMenuItem><Link to="/#graficos" onClick={(e) => handleLinkClick(e as any, "/#graficos")} className="w-full">Gráficos Expansíveis</Link></DropdownMenuItem>
          <DropdownMenuItem><Link to="/#impacto" onClick={(e) => handleLinkClick(e as any, "/#impacto")} className="w-full">Impacto no Trabalho</Link></DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Link to="/#contato" onClick={(e) => handleLinkClick(e as any, "/#contato")} className={`font-semibold hover:text-secondary transition ${mobile ? 'text-lg py-1' : 'text-sm'}`}>Contato</Link>
      <Link to="/login" onClick={(e) => handleLinkClick(e as any, "/login")} className={`font-semibold text-secondary hover:text-primary transition ${mobile ? 'text-lg mt-4' : 'text-sm'}`}>Entrar / Cadastrar</Link>
    </>
  );

  return (
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 border-b border-border shadow-sm">
      <nav className="container mx-auto grid grid-cols-2 md:grid-cols-3 items-center py-3 px-4 md:px-6 h-[70px]">
        {/* Logo (Esquerda) - Apresentação visual "Endometriose" conforme ANEXO A1 */}
        <div className="flex items-center justify-start">
          <Link to="/" className="font-display text-2xl md:text-3xl font-bold tracking-wide flex items-center gap-1 group">
            <span className="text-secondary italic group-hover:text-primary transition-colors">Endome</span>
            <span className="text-foreground">triose</span>
          </Link>
        </div>

        {/* Desktop Nav (Centralizado na tela) */}
        <div className="hidden md:flex items-center justify-center gap-6 text-foreground font-medium w-full">
          <NavItems />
        </div>

        {/* Ações e Menu Mobile (Direita) */}
        <div className="flex items-center justify-end gap-2 md:gap-4">
          {/* Fullscreen Toggle */}
          <button onClick={toggleFullscreen} className="text-foreground hover:text-secondary transition p-2.5 rounded-full hover:bg-muted min-w-[44px] min-h-[44px] flex items-center justify-center" title="Alternar Tela Cheia">
            {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
          </button>

          {/* Mobile Menu Toggle — Drawer pelo Lado Esquerdo (F7.3) */}
          <div className="md:hidden flex items-center">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <button className="text-foreground hover:text-secondary transition p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center" aria-label="Abrir Menu">
                  <Menu className="h-6 w-6" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] bg-background border-r-border z-[100]">
                <div className="flex flex-col gap-4 mt-12 text-foreground">
                  <NavItems mobile />
                  <div className="flex items-center gap-4 mt-8 pt-6 border-t border-border">
                    <a href="https://www.youtube.com/@project.endometriose" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-secondary transition p-2"><Youtube className="h-6 w-6" /></a>
                    <a href="https://instagram.com/project.endo2" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-secondary transition p-2"><Instagram className="h-6 w-6" /></a>
                    <a href="https://www.facebook.com/share/1CXwao28xD/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-secondary transition p-2"><Facebook className="h-6 w-6" /></a>
                    <a href="mailto:projeto.endometriose.tcc@gmail.com" className="text-muted-foreground hover:text-secondary transition p-2"><Mail className="h-6 w-6" /></a>
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
