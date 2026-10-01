import { Link } from "react-router-dom";
import { Instagram, Mail } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-background border-b border-border">
      {/* Navigation bar */}
      <nav className="bg-rose-pale/60">
        <div className="container mx-auto flex items-center justify-between py-3 px-6">
          <Link to="/" className="font-display text-2xl font-bold text-foreground tracking-wide">
            <span className="text-primary italic">Endometrio</span>metro
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-foreground hover:text-primary transition font-body text-xs tracking-widest uppercase font-semibold">
              Início
            </Link>
            <span className="text-rose-light text-xs">✦</span>
            <Link to="/pesquisa" className="text-foreground hover:text-primary transition font-body text-xs tracking-widest uppercase font-semibold">
              Pesquisa
            </Link>
            <span className="text-rose-light text-xs">✦</span>
            <Link to="/login" className="text-foreground hover:text-primary transition font-body text-xs tracking-widest uppercase font-semibold">
              Entrar
            </Link>
            <span className="text-rose-light text-xs">✦</span>
            <a href="#informacoes" className="text-foreground hover:text-primary transition font-body text-xs tracking-widest uppercase font-semibold">
              Sobre
            </a>
            <span className="text-rose-light text-xs">✦</span>
            <a href="#relatos" className="text-foreground hover:text-primary transition font-body text-xs tracking-widest uppercase font-semibold">
              Relatos
            </a>
            <span className="text-rose-light text-xs">✦</span>
            <a href="#contato" className="text-foreground hover:text-primary transition font-body text-xs tracking-widest uppercase font-semibold">
              Contato
            </a>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://instagram.com/project.endo2"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition"
            >
              <Instagram className="h-3.5 w-3.5" />
            </a>
            <a
              href="mailto:projeto.endometriose.tcc@gmail.com"
              className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition"
            >
              <Mail className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
