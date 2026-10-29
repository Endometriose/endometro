import { useState, useEffect } from "react";
import { Mail, Instagram, Youtube, Facebook, Smartphone, ExternalLink } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

const Footer = () => {
  const [siteUrl, setSiteUrl] = useState("https://endometrio-app.vercel.app");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setSiteUrl(window.location.origin);
    }
  }, []);

  return (
    <footer id="contato" className="bg-secondary text-secondary-foreground py-14 px-4 scroll-mt-10">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* Metade Esquerda: Contato e Informações */}
          <div className="space-y-5 text-left">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white font-bold text-xs uppercase tracking-wider mb-2">
                <Mail className="w-3.5 h-3.5" /> Fale Conosco
              </span>
              <h3 className="font-display text-3xl font-bold tracking-wide text-white">
                <span className="italic">Endome</span>triômetro
              </h3>
              <p className="text-secondary-foreground/80 text-sm mt-2 max-w-md leading-relaxed">
                Plataforma digital e instrumento de pesquisa dedicado à conscientização, acolhimento e levantamento de dados clínicos e corporativos sobre a endometriose.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <a
                href="mailto:projeto.endometriose.tcc@gmail.com"
                className="flex items-center gap-3 text-secondary-foreground/90 hover:text-white transition text-sm font-medium p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/30 flex items-center justify-center shrink-0">
                  <Mail className="h-4 w-4 text-white" />
                </div>
                <span className="truncate">projeto.endometriose.tcc@gmail.com</span>
              </a>

              <div className="flex flex-wrap gap-3 pt-1">
                <a
                  href="https://instagram.com/project.endo2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/15 text-white transition"
                >
                  <Instagram className="h-4 w-4 text-pink-300" />
                  @project.endo2
                </a>
                <a
                  href="https://www.facebook.com/share/1CXwao28xD/?mibextid=wwXIfr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/15 text-white transition"
                >
                  <Facebook className="h-4 w-4 text-blue-300" />
                  Facebook Oficial
                </a>
                <a
                  href="https://www.youtube.com/@project.endometriose"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/15 text-white transition"
                >
                  <Youtube className="h-4 w-4 text-red-300" />
                  YouTube Oficial
                </a>
              </div>
            </div>

            <p className="text-white/40 text-xs pt-4 border-t border-white/10">
              © 2026 ENDOMETRIÔMETRO — Todos os direitos reservados.
            </p>
          </div>

          {/* Metade Direita: QR Code Compacto para Acesso Mobile */}
          <div className="flex justify-center md:justify-end">
            <div className="bg-white text-foreground rounded-3xl p-6 shadow-xl border border-rose-100 max-w-[280px] w-full text-center flex flex-col items-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-dark text-xs font-bold mb-3">
                <Smartphone className="w-3.5 h-3.5 text-primary" /> Acesse pelo Celular
              </div>

              {/* QR Code com tamanho equilibrado (sem ser muito grande) */}
              <div className="p-3 bg-white rounded-2xl border-2 border-dashed border-rose-200 shadow-inner mb-3">
                <QRCodeSVG
                  value={siteUrl}
                  size={140}
                  level="M"
                  includeMargin={false}
                  bgColor="#ffffff"
                  fgColor="#7B2D40"
                />
              </div>

              <p className="text-xs text-muted-foreground leading-snug mb-3">
                Aponte a câmera do seu smartphone para navegar no <strong>Endometriômetro</strong> diretamente no celular.
              </p>

              <a
                href={siteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-primary hover:underline"
              >
                <span>{siteUrl.replace(/^https?:\/\//, '')}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
