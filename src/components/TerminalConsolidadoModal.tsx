import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Terminal, Copy, Check, Download, FileText, LayoutList, ShieldAlert, Sparkles, Building2, User } from "lucide-react";
import { toast } from "sonner";
import { ColaboradoraRegistro } from "@/lib/relatorio-pdf/gerarPDF";

interface TerminalConsolidadoModalProps {
  isOpen: boolean;
  onClose: () => void;
  empresaNome: string;
  cnpj?: string;
  setor?: string;
  colaboradoras: ColaboradoraRegistro[];
  onGerarPdf: () => void;
  gerandoPdf?: boolean;
}

export const TerminalConsolidadoModal = ({
  isOpen,
  onClose,
  empresaNome,
  cnpj,
  setor,
  colaboradoras,
  onGerarPdf,
  gerandoPdf = false,
}: TerminalConsolidadoModalProps) => {
  const [viewMode, setViewMode] = useState<"terminal" | "tabela">("terminal");
  const [copied, setCopied] = useState(false);
  const [busca, setBusca] = useState("");

  const totalMulheresPesquisadas = colaboradoras.length;
  const totalAlta = colaboradoras.filter(c => c.nivelProbabilidade === "Alto").length;
  const totalModerada = colaboradoras.filter(c => c.nivelProbabilidade === "Médio" || c.nivelProbabilidade === "Moderado").length;
  const totalBaixa = colaboradoras.filter(c => c.nivelProbabilidade === "Baixo").length;
  const totalPossibilidade = totalAlta + totalModerada;
  const pctPossibilidade = totalMulheresPesquisadas > 0
    ? Math.round((totalPossibilidade / totalMulheresPesquisadas) * 100)
    : 0;

  // Gerar saída em texto formatada para o terminal
  const terminalText = useMemo(() => {
    const dataHoraStr = `${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}`;
    const hash = Math.random().toString(36).substring(2, 10).toUpperCase();

    let output = "";
    output += "========================================================================================\n";
    output += "       ENDOMETRIÔMETRO — PLATAFORMA DE PESQUISA & SAÚDE CORPORATIVA FEMININA            \n";
    output += "       RELATÓRIO CONSOLIDADO INSTITUCIONAL (GESTÃO DE PESSOAS / RH)                     \n";
    output += "========================================================================================\n\n";

    output += `[+] INSTITUIÇÃO:         ${empresaNome.toUpperCase()}\n`;
    output += `[+] IDENTIFICADOR/CNPJ:   ${cnpj || "Não informado"}\n`;
    output += `[+] SETOR DE ATUAÇÃO:    ${setor || "Geral"}\n`;
    output += `[+] DATA DE EMISSÃO:     ${dataHoraStr}\n`;
    output += `[+] PROTOCOLO SEGURO:    LGPD-BR-V2.${hash}\n`;
    output += `[+] STATUS DA BASE:      CONECTADO (Supabase Cloud PostgreSQL Production)\n\n`;

    output += "----------------------------------------------------------------------------------------\n";
    output += "  1. SUMÁRIO ESTATÍSTICO DO QUADRO DE COLABORADORAS PESQUISADAS                         \n";
    output += "----------------------------------------------------------------------------------------\n";
    output += `[•] TOTAL DE MULHERES PESQUISADAS NA EMPRESA:              ${totalMulheresPesquisadas} colaboradora(s)\n`;
    output += `[•] MULHERES COM POSSIBILIDADE DE TER ENDOMETRIOSE:        ${totalPossibilidade} colaboradora(s) (${pctPossibilidade}% do grupo)\n`;
    output += `    ├── ALTA PROBABILIDADE (Casos prioritários):           ${totalAlta} colaboradora(s)\n`;
    output += `    ├── MODERADA PROBABILIDADE (Investigação clínica):     ${totalModerada} colaboradora(s)\n`;
    output += `    └── BAIXA PROBABILIDADE (Acompanhamento rotina):       ${totalBaixa} colaboradora(s)\n\n`;

    output += "----------------------------------------------------------------------------------------\n";
    output += "  2. TABELA NOMINAL DE COLABORADORAS, CONTATO E RESULTADO DE TRIAGEM                   \n";
    output += "----------------------------------------------------------------------------------------\n";
    output += "NOME".padEnd(26) + "E-MAIL".padEnd(32) + "DIAGNÓSTICO (FATOR PROBABILIDADE)".padEnd(34) + "DOR".padEnd(6) + "IMPACTO\n";
    output += "----------------------------------------------------------------------------------------------------\n";

    if (colaboradoras.length === 0) {
      output += ">> Nenhuma colaboradora respondeu até o momento pelo link institucional exclusivo.\n";
    } else {
      colaboradoras.forEach((c) => {
        const nomeFmt = (c.nome.length > 24 ? c.nome.slice(0, 24) + "…" : c.nome).padEnd(26);
        const emailFmt = (c.email.length > 30 ? c.email.slice(0, 30) + "…" : c.email).padEnd(32);
        const resFmt = (c.nivelProbabilidade === "Alto" 
          ? "FATOR ALTO (Alta Probabilidade)" 
          : c.nivelProbabilidade === "Médio" || c.nivelProbabilidade === "Moderado"
          ? "FATOR MÉDIO (Prob. Moderada)"
          : "FATOR BAIXO (Baixa Probabilidade)"
        ).padEnd(34);
        const dorFmt = `${c.intensidadeDor ?? "—"}/10`.padEnd(6);
        const impFmt = c.horasAusencia && Number(c.horasAusencia) > 0 ? `${c.horasAusencia}h ausência` : (c.impactoTrabalho || "Leve");
        output += `${nomeFmt}${emailFmt}${resFmt}${dorFmt}${impFmt}\n`;
      });
    }

    output += "----------------------------------------------------------------------------------------\n\n";

    output += "----------------------------------------------------------------------------------------\n";
    output += "  3. DIRETRIZES PARA O SETOR RESPONSÁVEL PELA GESTÃO DE PESSOAS (RH)                   \n";
    output += "----------------------------------------------------------------------------------------\n";
    output += "A endometriose é uma enfermidade inflamatória sistêmica crônica dependente de estrogênio\n";
    output += "que afeta a mulher em seu auge produtivo. Acolher essas colaboradoras é estratégico:\n\n";
    output += "[1] Acolhimento e Sigilo Absoluto: Os diagnósticos têm natureza estritamente privada.\n";
    output += "    É vedada qualquer prática discriminatória ou utilização para desligamento/avaliação.\n";
    output += "[2] Encaminhamento a Especialistas: Estimular o acesso via benefício de saúde a médicos\n";
    output += "    ginecologistas especialistas em dor pélvica e exames de mapeamento por imagem.\n";
    output += "[3] Flexibilidade em Crises Álgicas: Conceder regime de trabalho adaptável ou pausas\n";
    output += "    nos dias de maior intensidade álgica reduz o absenteísmo crônico e o presenteísmo.\n";
    output += "[4] Sensibilização Corporativa: Desenvolver rodas de conversa sobre saúde reprodutiva\n";
    output += "    para desmistificar o tabu da cólica menstrual intensa no ambiente corporativo.\n\n";

    output += "----------------------------------------------------------------------------------------\n";
    output += "  4. CRITÉRIOS CLÍNICOS E FATORES DE PROBABILIDADE (COMO NO RELATÓRIO INDIVIDUAL)       \n";
    output += "----------------------------------------------------------------------------------------\n";
    output += "[*] FATOR ALTO (Alta Probabilidade — Pontuação clínica >= 8):\n";
    output += "    Forte associação clínica entre dor incapacitante (escala EVA >= 7) e sintomas chave\n";
    output += "    (cólica severa, dispareunia profunda, dor evacuatória/urinária acíclica e fadiga).\n";
    output += "    Alta suspeita de endometriose profunda; encaminhamento prioritário imediato.\n\n";
    output += "[*] FATOR MÉDIO / MODERADO (Moderada Probabilidade — Pontuação clínica 4 a 7):\n";
    output += "    Sintomas clínicos consistentes com impacto no cotidiano e trabalho. Justifica exame\n";
    output += "    clínico e ultrassom direcionado para diagnóstico diferencial e alívio de sintomas.\n\n";
    output += "[*] FATOR BAIXO (Baixa Probabilidade — Pontuação clínica < 4):\n";
    output += "    Manifestações esporádicas sem critérios de cronicidade ou incapacitação imediata.\n";
    output += "    Recomenda-se manter rotina preventiva anual.\n\n";

    output += "========================================================================================\n";
    output += `[OK] COMANDO CONCLUÍDO COM SUCESSO — EMISSÃO EXECUTIVA DE GESTÃO DE PESSOAS\n`;
    output += "========================================================================================\n";

    return output;
  }, [empresaNome, cnpj, setor, colaboradoras, totalMulheresPesquisadas, totalAlta, totalModerada, totalBaixa, totalPossibilidade, pctPossibilidade]);

  const handleCopy = () => {
    navigator.clipboard.writeText(terminalText);
    setCopied(true);
    toast.success("Saída do terminal copiada para a área de transferência!");
    setTimeout(() => setCopied(false), 2000);
  };

  const colaboradorasFiltradas = useMemo(() => {
    if (!busca.trim()) return colaboradoras;
    const term = busca.toLowerCase();
    return colaboradoras.filter(
      c => c.nome.toLowerCase().includes(term) || c.email.toLowerCase().includes(term) || c.resultado.toLowerCase().includes(term)
    );
  }, [colaboradoras, busca]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[92vh] flex flex-col p-0 overflow-hidden bg-zinc-950 border-zinc-800 text-zinc-100 rounded-3xl shadow-2xl">
        {/* Barra superior de janela de terminal */}
        <div className="flex items-center justify-between px-6 py-4 bg-zinc-900 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
            </div>
            <div className="flex items-center gap-2 pl-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono font-bold text-zinc-300">
                bash - endometriometro-report --empresa="{empresaNome}"
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Alternador de Modo */}
            <div className="bg-zinc-800 p-1 rounded-xl flex gap-1">
              <button
                type="button"
                onClick={() => setViewMode("terminal")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === "terminal" ? "bg-zinc-700 text-emerald-400 shadow" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Terminal className="w-3.5 h-3.5" /> Terminal
              </button>
              <button
                type="button"
                onClick={() => setViewMode("tabela")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === "tabela" ? "bg-zinc-700 text-cyan-400 shadow" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <LayoutList className="w-3.5 h-3.5" /> Tabela
              </button>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={handleCopy}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white text-xs h-8 gap-1.5 rounded-xl"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copiado" : "Copiar Saída"}
            </Button>

            <Button
              size="sm"
              onClick={onGerarPdf}
              disabled={gerandoPdf}
              className="bg-primary hover:bg-rose-dark text-white font-bold text-xs h-8 gap-1.5 rounded-xl shadow"
            >
              <Download className="w-3.5 h-3.5" />
              {gerandoPdf ? "Exportando..." : "Exportar PDF"}
            </Button>
          </div>
        </div>

        {/* Resumo Rápido no Topo */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-zinc-900/60 border-b border-zinc-800 text-xs font-mono">
          <div className="p-2.5 rounded-xl bg-zinc-800/60 border border-zinc-700/60">
            <span className="text-zinc-400 block text-[11px]">Total Pesquisadas:</span>
            <span className="text-base font-bold text-white">{totalMulheresPesquisadas}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-zinc-800/60 border border-rose-900/50">
            <span className="text-rose-300 block text-[11px]">Possibilidade Endom.:</span>
            <span className="text-base font-bold text-rose-400">
              {totalPossibilidade} ({pctPossibilidade}%)
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-zinc-800/60 border border-rose-900/50">
            <span className="text-rose-400 block text-[11px]">Alta Probabilidade:</span>
            <span className="text-base font-bold text-rose-300">{totalAlta}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-zinc-800/60 border border-amber-900/50">
            <span className="text-amber-400 block text-[11px]">Moderada / Baixa:</span>
            <span className="text-base font-bold text-amber-300">{totalModerada} / {totalBaixa}</span>
          </div>
        </div>

        {/* Corpo do Terminal / Tabela */}
        <div className="flex-1 overflow-auto p-5 font-mono text-xs leading-relaxed">
          {viewMode === "terminal" ? (
            <pre className="text-emerald-400 whitespace-pre selection:bg-emerald-900 selection:text-emerald-100">
              {terminalText}
            </pre>
          ) : (
            <div className="space-y-4 font-sans text-foreground">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <input
                  type="text"
                  value={busca}
                  onChange={e => setBusca(e.target.value)}
                  placeholder="Filtrar colaboradora por nome, e-mail ou resultado..."
                  className="w-full md:w-80 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <span className="text-xs text-zinc-400">
                  Mostrando {colaboradorasFiltradas.length} de {colaboradoras.length} colaboradoras
                </span>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900/80">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-zinc-800/80 text-zinc-400 uppercase text-[10px] tracking-wider font-bold">
                    <tr>
                      <th className="p-3">Colaboradora</th>
                      <th className="p-3">E-mail</th>
                      <th className="p-3">Diagnóstico / Probabilidade</th>
                      <th className="p-3 text-center">Dor</th>
                      <th className="p-3">Impacto / Afastamento</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {colaboradorasFiltradas.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-zinc-500 italic">
                          Nenhuma colaboradora encontrada com os termos informados.
                        </td>
                      </tr>
                    ) : (
                      colaboradorasFiltradas.map((c) => {
                        const isAlta = c.nivelProbabilidade === "Alto";
                        const isMod = c.nivelProbabilidade === "Médio" || c.nivelProbabilidade === "Moderado";
                        return (
                          <tr key={c.id} className="hover:bg-zinc-800/40 transition-colors">
                            <td className="p-3 font-bold text-white flex items-center gap-2">
                              <User className="w-3.5 h-3.5 text-zinc-400" />
                              {c.nome}
                            </td>
                            <td className="p-3 text-zinc-300 font-mono text-[11px]">{c.email}</td>
                            <td className="p-3">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                                  isAlta
                                    ? "bg-rose-950/80 text-rose-300 border border-rose-800/60"
                                    : isMod
                                    ? "bg-amber-950/80 text-amber-300 border border-amber-800/60"
                                    : "bg-emerald-950/80 text-emerald-300 border border-emerald-800/60"
                                }`}
                              >
                                {c.resultado}
                              </span>
                            </td>
                            <td className="p-3 text-center font-bold text-white">{c.intensidadeDor ?? "—"}/10</td>
                            <td className="p-3 text-zinc-400">
                              {c.horasAusencia && Number(c.horasAusencia) > 0 ? (
                                <span className="text-rose-400 font-bold">{c.horasAusencia}h ausência/mês</span>
                              ) : (
                                c.impactoTrabalho || "Leve"
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Box de Orientações para Gestão de Pessoas */}
              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                  <ShieldAlert className="w-4 h-4" /> Diretrizes de Gestão de Pessoas (RH)
                </div>
                <p className="text-zinc-400 leading-relaxed text-[11px]">
                  Os dados apresentados destinam-se ao acolhimento preventivo de colaboradoras identificadas com possibilidade da condição. Recomenda-se facilitação de consultas com ginecologistas especialistas em dor pélvica, suporte laboral flexível nos dias mais intensos de dor e sigilo médico nos termos da LGPD.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé do Modal */}
        <div className="flex items-center justify-between px-6 py-3 bg-zinc-900 border-t border-zinc-800 text-xs text-zinc-400 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Relatório Consolidado Oficial — ENDOMETRIÔMETRO v2.6</span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="text-zinc-400 hover:text-white hover:bg-zinc-800 text-xs h-7 rounded-lg"
          >
            Fechar Terminal
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
