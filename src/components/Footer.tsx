import { Mail, Instagram, Youtube, Facebook } from "lucide-react";

const Footer = () => {
  return (
    <footer id="contato" className="bg-secondary text-secondary-foreground py-12 px-4">
      <div className="container mx-auto text-center space-y-6">
        <h3 className="font-display text-2xl font-bold tracking-wide">
          <span className="italic">Endome</span>triômetro
        </h3>
        <p className="text-secondary-foreground/80 text-sm max-w-md mx-auto">
          Uma plataforma digital de informação, conscientização e pesquisa sobre endometriose.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-secondary-foreground/90 pt-4">
          <a
            href="mailto:projeto.endometriose.tcc@gmail.com"
            className="flex items-center gap-2 hover:text-white transition text-sm font-medium"
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
          <a
            href="https://www.facebook.com/share/1CXwao28xD/?mibextid=wwXIfr"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-primary-foreground transition text-sm"
          >
            <Facebook className="h-4 w-4" />
            Facebook
          </a>
          <a
            href="https://www.youtube.com/@project.endometriose"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-primary-foreground transition text-sm"
          >
            <Youtube className="h-4 w-4" />
            YouTube
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
