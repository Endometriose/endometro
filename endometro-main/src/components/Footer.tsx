import { Mail, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer id="contato" className="bg-gradient-to-r from-rose-dark via-primary to-rose-light py-10 px-4">
      <div className="container mx-auto text-center space-y-4">
        <h3 className="font-display text-xl font-bold text-primary-foreground">
          Projeto Endometriose
        </h3>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-primary-foreground/90">
          <a
            href="mailto:projeto.endometriose.tcc@gmail.com"
            className="flex items-center gap-2 hover:text-primary-foreground transition text-sm"
          >
            <Mail className="h-4 w-4" />
            projeto.endometriose.tcc@gmail.com
          </a>
          <a
            href="https://instagram.com/project.endo2"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-primary-foreground transition text-sm"
          >
            <Instagram className="h-4 w-4" />
            @project.endo2
          </a>
        </div>
        <p className="text-primary-foreground/60 text-xs mt-4">
          © 2026 Projeto Endometriose. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
