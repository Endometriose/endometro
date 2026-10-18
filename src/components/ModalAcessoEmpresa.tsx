import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building2, Link2, Copy, Check, FileText, X } from "lucide-react";
import { toast } from "sonner";

interface ModalAcessoEmpresaProps {
  isOpen: boolean;
  onClose: () => void;
  empresaNome: string;
  linkExclusivo: string;
  onAcessarPainel?: () => void;
}

export const ModalAcessoEmpresa = ({
  isOpen,
  onClose,
  empresaNome,
  linkExclusivo,
  onAcessarPainel,
}: ModalAcessoEmpresaProps) => {
  const navigate = useNavigate();
  const [copiado, setCopiado] = useState(false);

  if (!isOpen) return null;

  const copiarLink = () => {
    if (!linkExclusivo) return;
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(linkExclusivo);
      } else {
        const input = document.createElement("input");
        input.value = linkExclusivo;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
      }
      setCopiado(true);
      toast.success("Link exclusivo copiado com sucesso!", {
        description: "Compartilhe este link com suas colaboradoras.",
      });
      setTimeout(() => setCopiado(false), 3000);
    } catch {
      toast.info("Link exclusivo:", {
        description: linkExclusivo,
      });
    }
  };

  const handleIrParaPainel = () => {
    onClose();
    if (onAcessarPainel) {
      onAcessarPainel();
    } else {
      navigate("/banco-de-dados");
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative bg-white rounded-3xl shadow-2xl border border-rose-200 max-w-xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-rose-50 text-muted-foreground hover:text-foreground transition z-10"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-pink-soft flex items-center justify-center text-secondary border border-rose-200 shadow-sm">
            <Building2 className="w-8 h-8" />
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            Acesso da Empresa Concluído!
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            A instituição <strong className="text-foreground">{empresaNome || "Empresa"}</strong> foi registrada com sucesso e o seu link institucional exclusivo para colaboradoras está pronto.
          </p>
        </div>

        <div className="space-y-5 pt-4">
          {/* Card do Link Exclusivo */}
          <div className="p-4 rounded-2xl bg-pink-soft/80 border border-rose-200 space-y-2">
            <span className="text-xs font-bold text-secondary flex items-center gap-1.5 uppercase tracking-wide">
              <Link2 className="w-4 h-4" /> Link Exclusivo para as Colaboradoras:
            </span>
            <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-rose-200 shadow-inner">
              <Input
                value={linkExclusivo}
                readOnly
                className="border-none shadow-none text-xs md:text-sm font-mono text-foreground focus-visible:ring-0 select-all"
              />
              <Button
                type="button"
                onClick={copiarLink}
                size="sm"
                className="bg-primary hover:bg-rose-dark text-white font-bold gap-1.5 shrink-0 rounded-lg shadow-sm"
              >
                {copiado ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiado ? "Copiado!" : "Copiar Link"}
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Envie este link por e-mail ou WhatsApp para suas funcionárias responderem à triagem confidencial.
            </p>
          </div>

          {/* Botões de Ação */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <Button
              type="button"
              onClick={handleIrParaPainel}
              className="bg-secondary hover:bg-secondary/90 text-white font-bold py-6 rounded-xl shadow-md gap-2 w-full text-sm"
            >
              <Building2 className="w-5 h-5" />
              Acessar Painel da Empresa
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleIrParaPainel}
              className="border-rose-300 text-secondary hover:bg-rose-50 font-bold py-6 rounded-xl gap-2 w-full text-sm"
            >
              <FileText className="w-5 h-5" />
              Relatório & Terminal
            </Button>
          </div>

          <div className="flex justify-end pt-1">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Fechar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
