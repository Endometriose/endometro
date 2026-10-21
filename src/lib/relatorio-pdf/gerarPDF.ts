/**
 * FASE 5B — Motor de PDF Vetorial
 * Geração programática via jsPDF — proibido html2canvas
 * Paleta, layout e regras conforme PROMPT_GERACAO_PDF.md
 */
import jsPDF from "jspdf";

// ─── Paleta (hex → RGB para jsPDF) ───────────────────────────────────────────
const CORES = {
  vinho:   [123,  45,  64] as [number, number, number],
  rosa:    [201, 107, 130] as [number, number, number],
  paleRosa:[232, 160, 176] as [number, number, number],
  palido:  [245, 205, 214] as [number, number, number],
  branco:  [255, 255, 255] as [number, number, number],
  cinzaClaro: [245, 245, 245] as [number, number, number],
  cinzaMedio: [170, 170, 170] as [number, number, number],
  cinzaTexto: [80,  80,  80] as [number, number, number],
  preto:   [30,   30,  30] as [number, number, number],
  ambar:   [180, 130,  0] as [number, number, number],
  verdeEscuro: [30, 100, 60] as [number, number, number],
};

// ─── Mapeamento fiel dos sintomas do questionário ───────────────────────────
export const MAPA_SINTOMAS_QUESTIONARIO: Record<string, string> = {
  colica_intensa: "Cólicas menstruais muito intensas que impedem atividades normais",
  dor_relacao: "Dor profunda durante ou após relações sexuais (dispareunia)",
  dor_pelvica_cronica: "Dor pélvica ou abdominal contínua mesmo fora da menstruação",
  dor_intestino: "Dor ao evacuar, diarreia, constipação ou distensão abdominal no período menstrual",
  dor_xixi: "Dor, ardência ou sangramento ao urinar durante a menstruação",
  historico_familiar: "Mãe, irmã ou parente de 1º grau diagnosticada com endometriose",
  dificuldade_engravidar: "Dificuldade para engravidar há mais de 6 a 12 meses",
  dor_lombar_pernas: "Dor na região lombar ou irradiada para as pernas no período menstrual",
  uso_analgesicos: "Necessidade de tomar analgésicos fortes ou injeções frequentemente para conter a dor",
  historico_cistos: "Histórico de cistos ovarianos, miomas ou cirurgias pélvicas prévias",
  fadiga_extrema: "Fadiga crônica, exaustão física e tonturas sem causa aparente",
  ansiedade_dor: "Ansiedade, estresse ou impacto emocional devido às dores crônicas",
};

export const formatarSintomaQuestionario = (s: string): string => {
  if (!s) return "";
  return MAPA_SINTOMAS_QUESTIONARIO[s] || s;
};

// ─── Tipos públicos ───────────────────────────────────────────────────────────
export interface DadosIndividuais {
  resultado: string;
  sintomas: string[];
  intensidadeDor: number | string;
  horasAusencia: number | string;
  diasAtestado: number | string;
  trabalha?: string;
  impactoTrabalho?: string;
  diagnostico?: string;
  idade?: string;
  cidade?: string;
  bairro?: string;
  uf?: string;
  dataEmissao?: string;
  temDadoTeste?: boolean;
}

export interface DadosInstituicao {
  nomeEmpresa: string;
  cnpj?: string;
  cidade?: string;
  uf?: string;
  tituloPesquisa?: string;
  periodoInicio?: string;
  periodoFim?: string;
  totalPesquisadas: number;
  totalComSintomas: number;
  percentualSintomas: number;
  sintomas?: { name: string; total: number }[];
  prevalencia?: { name: string; value: number }[];
  produtividade?: { name: string; valor: number }[];
  faixaEtaria?: { name: string; value: number }[];
  observacoes?: string;
  dataEmissao?: string;
  temDadoTeste?: boolean;
}

export interface ColaboradoraRegistro {
  id: string;
  nome: string;
  email: string;
  idade?: string;
  diagnosticoPrevio?: string;
  resultado: string;
  nivelProbabilidade: "Alto" | "Médio" | "Moderado" | "Baixo";
  intensidadeDor?: number | string;
  sintomas?: string[];
  impactoTrabalho?: string;
  horasAusencia?: number | string;
  diasAtestado?: number | string;
  dataResposta?: string;
}

export interface DadosRelatorioConsolidadoEmpresa {
  nomeEmpresa: string;
  cnpj?: string;
  setor?: string;
  responsavelRh?: string;
  emailContato?: string;
  dataEmissao?: string;
  totalMulheresPesquisadas: number;
  totalPossibilidadeEndometriose: number; // Alta + Moderada
  percentualPossibilidade: number;
  totalAltaProbabilidade: number;
  totalModeradaProbabilidade: number;
  totalBaixaProbabilidade: number;
  colaboradoras: ColaboradoraRegistro[];
  observacaoGestaoPessoas?: string;
  temDadoTeste?: boolean;
}

// ─── Helpers de renderização ──────────────────────────────────────────────────
const A4 = { w: 210, h: 297 };
const MARGIN = 20;
const CONTENT_W = A4.w - MARGIN * 2;

function setColor(doc: jsPDF, rgb: [number, number, number], target: "fill" | "stroke" | "text") {
  const [r, g, b] = rgb;
  if (target === "fill")   doc.setFillColor(r, g, b);
  if (target === "stroke") doc.setDrawColor(r, g, b);
  if (target === "text")   doc.setTextColor(r, g, b);
}

function cabecalho(doc: jsPDF, titulo: string, subtitulo: string, pagNum: number, totalPag: number, temTeste: boolean) {
  // Faixa superior
  setColor(doc, CORES.vinho, "fill");
  doc.rect(0, 0, A4.w, 16, "F");
  setColor(doc, CORES.branco, "text");
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("ENDOMETRIÔMETRO", MARGIN, 10);
  doc.setFont("helvetica", "normal");
  doc.text(`Pág. ${pagNum} / ${totalPag}`, A4.w - MARGIN, 10, { align: "right" });

  if (temTeste) {
    setColor(doc, CORES.ambar, "fill");
    doc.rect(0, 16, A4.w, 6, "F");
    setColor(doc, CORES.branco, "text");
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text("⚠  RELATÓRIO DE TESTE — Não representa respostas reais", A4.w / 2, 20.5, { align: "center" });
  }

  // Título da seção
  const yInicio = temTeste ? 30 : 24;
  setColor(doc, CORES.preto, "text");
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(titulo, MARGIN, yInicio);
  if (subtitulo) {
    setColor(doc, CORES.cinzaTexto, "text");
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(subtitulo, MARGIN, yInicio + 6);
  }

  // Linha divisória
  const yLinha = yInicio + (subtitulo ? 10 : 6);
  setColor(doc, CORES.palido, "stroke");
  doc.setLineWidth(0.5);
  doc.line(MARGIN, yLinha, A4.w - MARGIN, yLinha);

  return yLinha + 6;
}

function rodape(doc: jsPDF, texto: string) {
  setColor(doc, CORES.cinzaClaro, "fill");
  doc.rect(0, A4.h - 12, A4.w, 12, "F");
  setColor(doc, CORES.cinzaTexto, "text");
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text(texto, A4.w / 2, A4.h - 4.5, { align: "center" });
}

function marcaDaguaTeste(doc: jsPDF) {
  doc.saveGraphicsState();
  // Texto diagonal TESTE
  setColor(doc, CORES.palido, "text");
  doc.setFontSize(72);
  doc.setFont("helvetica", "bold");
  // Rotacionar 45°
  const cx = A4.w / 2;
  const cy = A4.h / 2;
  doc.text("TESTE", cx, cy, { align: "center", angle: 45 });
  doc.restoreGraphicsState();
}

function cardMetrica(doc: jsPDF, x: number, y: number, w: number, titulo: string, valor: string | number, sub?: string) {
  setColor(doc, CORES.cinzaClaro, "fill");
  doc.roundedRect(x, y, w, 24, 3, 3, "F");
  setColor(doc, CORES.vinho, "text");
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(String(valor), x + w / 2, y + 12, { align: "center" });
  setColor(doc, CORES.cinzaTexto, "text");
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.text(titulo, x + w / 2, y + 18, { align: "center" });
  if (sub) {
    setColor(doc, CORES.rosa, "text");
    doc.setFontSize(7);
    doc.text(sub, x + w / 2, y + 22.5, { align: "center" });
  }
}

/** Gráfico de barras horizontais vetorial */
function graficoBarrasHorizontais(
  doc: jsPDF,
  dados: { name: string; value: number }[],
  x: number,
  y: number,
  w: number,
  h: number,
  max?: number
) {
  if (!dados || dados.length === 0) return;
  const barH = Math.min(8, (h / dados.length) - 3);
  const maxVal = max ?? Math.max(...dados.map(d => d.value), 1);
  const labelW = 60;
  const barAreaW = w - labelW - 25;

  dados.forEach((d, i) => {
    const yBar = y + i * (barH + 4);
    const barW = (d.value / maxVal) * barAreaW;

    // Label
    setColor(doc, CORES.cinzaTexto, "text");
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    const label = d.name.length > 22 ? d.name.slice(0, 22) + "…" : d.name;
    doc.text(label, x + labelW - 2, yBar + barH / 2 + 2, { align: "right" });

    // Barra fundo
    setColor(doc, CORES.cinzaClaro, "fill");
    doc.roundedRect(x + labelW, yBar, barAreaW, barH, 2, 2, "F");

    // Barra preenchida
    if (barW > 0) {
      setColor(doc, CORES.rosa, "fill");
      doc.roundedRect(x + labelW, yBar, barW, barH, 2, 2, "F");
    }

    // Valor
    setColor(doc, CORES.vinho, "text");
    doc.setFont("helvetica", "bold");
    doc.text(String(d.value), x + labelW + barAreaW + 3, yBar + barH / 2 + 2);
  });
}

/** Gráfico de barras verticais vetorial */
function graficoBarrasVerticais(
  doc: jsPDF,
  dados: { name: string; valor: number }[],
  x: number,
  y: number,
  w: number,
  h: number
) {
  if (!dados || dados.length === 0) return;
  const n = dados.length;
  const maxVal = Math.max(...dados.map(d => d.valor), 1);
  const barW = Math.min(30, (w / n) - 8);
  const barAreaH = h - 20;

  dados.forEach((d, i) => {
    const xBar = x + i * (w / n) + (w / n - barW) / 2;
    const filledH = (d.valor / maxVal) * barAreaH;
    const yBar = y + barAreaH - filledH;

    // Fundo
    setColor(doc, CORES.cinzaClaro, "fill");
    doc.roundedRect(xBar, y, barW, barAreaH, 2, 2, "F");

    // Barra
    if (filledH > 0) {
      setColor(doc, CORES.paleRosa, "fill");
      doc.roundedRect(xBar, yBar, barW, filledH, 2, 2, "F");
    }

    // Valor no topo
    setColor(doc, CORES.vinho, "text");
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(String(d.valor), xBar + barW / 2, yBar - 2, { align: "center" });

    // Label
    setColor(doc, CORES.cinzaTexto, "text");
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "normal");
    const label = d.name.length > 16 ? d.name.slice(0, 16) + "…" : d.name;
    doc.text(label, xBar + barW / 2, y + barAreaH + 8, { align: "center" });
  });
}

/** Donut vetorial simples */
function graficoDonut(
  doc: jsPDF,
  dados: { name: string; value: number }[],
  cx: number,
  cy: number,
  r: number,
  centerLabel: string,
  centerValue: string,
  cores: [number, number, number][]
) {
  const total = dados.reduce((s, d) => s + d.value, 0);
  if (total === 0) return;

  let startAngle = -Math.PI / 2;
  dados.forEach((d, i) => {
    const angle = (d.value / total) * Math.PI * 2;
    const endAngle = startAngle + angle;
    const mid = startAngle + angle / 2;

    // Setor vetorial
    const cor = cores[i % cores.length];
    setColor(doc, cor, "fill");
    setColor(doc, CORES.branco, "stroke");
    doc.setLineWidth(0.5);

    // jsPDF círculo parcial via bezier aproximado
    const steps = Math.max(8, Math.round((angle / (Math.PI * 2)) * 32));
    const pts: number[] = [];
    pts.push(cx, cy);
    for (let s = 0; s <= steps; s++) {
      const a = startAngle + (angle * s) / steps;
      pts.push(cx + r * Math.cos(a), cy + r * Math.sin(a));
    }
    // Desenhar como polígono preenchido
    doc.setFillColor(cor[0], cor[1], cor[2]);
    // @ts-ignore — método interno do jsPDF
    const lines: number[][] = [];
    for (let p = 2; p < pts.length - 1; p += 2) {
      lines.push([pts[p] - pts[0], pts[p + 1] - pts[1]]);
    }
    // Usar lines API para polígono
    doc.lines(lines, pts[0], pts[1], [1, 1], "F", true);

    // Label com porcentagem
    const pct = Math.round((d.value / total) * 100);
    if (pct >= 6) {
      const lx = cx + (r * 0.7) * Math.cos(mid);
      const ly = cy + (r * 0.7) * Math.sin(mid);
      setColor(doc, CORES.branco, "text");
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text(`${pct}%`, lx, ly + 2, { align: "center" });
    }

    startAngle = endAngle;
  });

  // Buraco do donut
  setColor(doc, CORES.branco, "fill");
  doc.circle(cx, cy, r * 0.55, "F");

  // Texto central
  setColor(doc, CORES.vinho, "text");
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(centerValue, cx, cy + 2, { align: "center" });
  setColor(doc, CORES.rosa, "text");
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text(centerLabel, cx, cy + 8, { align: "center" });

  // Legenda
  dados.forEach((d, i) => {
    const ly = cy + r + 6 + i * 9;
    const cor = cores[i % cores.length];
    setColor(doc, cor, "fill");
    doc.roundedRect(cx - r, ly, 8, 5, 1, 1, "F");
    setColor(doc, CORES.cinzaTexto, "text");
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(d.name, cx - r + 11, ly + 4.5);
  });
}

function blocoLimitado(doc: jsPDF, y: number, texto: string) {
  setColor(doc, CORES.cinzaClaro, "fill");
  doc.roundedRect(MARGIN, y, CONTENT_W, 12, 2, 2, "F");
  setColor(doc, CORES.ambar, "text");
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.text(texto, A4.w / 2, y + 8, { align: "center" });
  return y + 16;
}

function paginaMetodologia(doc: jsPDF, pagNum: number, totalPag: number, temTeste: boolean) {
  doc.addPage();
  if (temTeste) marcaDaguaTeste(doc);
  let y = cabecalho(doc, "Metodologia e Limitações", "", pagNum, totalPag, temTeste);

  const blocos = [
    ["Definições", "\"Pesquisada\" = participante que concluiu o questionário. \"Com sintomas\" = assinalou ao menos 1 sintoma ou situação clínica listada no formulário. Inclui mulheres sem diagnóstico formal."],
    ["Autodeclaração", "Todos os dados são autodeclarados pelas participantes. O sistema não coleta exames, histórico médico nem prontuários."],
    ["Amostra", "Amostra não probabilística (opt-in). Os resultados não são generalizáveis para toda a população."],
    ["K-Anonimato", "Seções com menos de 5 respostas são omitidas ou substituídas por aviso. Grupos com n < 5 são agrupados em \"Demais\" para preservar a privacidade."],
    ["Diagnóstico", "\"Sintomas relatados\" ≠ diagnóstico de endometriose. Este relatório NÃO substitui avaliação médica especializada."],
    ["Privacidade", "Nenhum dado pessoal identificável (nome, CPF, e-mail, endereço completo) consta neste relatório. LGPD aplicada."],
  ];

  blocos.forEach(([titulo, texto]) => {
    setColor(doc, CORES.palido, "fill");
    doc.roundedRect(MARGIN, y, CONTENT_W, 3, 0, 0, "F");
    setColor(doc, CORES.vinho, "text");
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(titulo, MARGIN + 3, y + 2.5);

    y += 5;
    setColor(doc, CORES.cinzaTexto, "text");
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(texto, CONTENT_W - 6);
    doc.text(lines, MARGIN + 3, y + 4);
    y += lines.length * 4 + 8;
  });

  rodape(doc, "ENDOMETRIÔMETRO — Relatório gerado automaticamente. Dados agregados e anonimizados. LGPD aplicada.");
}

// ─── R1: Relatório Institucional ─────────────────────────────────────────────
export async function gerarRelatorioInstituicao(dados: DadosInstituicao): Promise<void> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const temTeste = dados.temDadoTeste ?? false;
  const dataStr = dados.dataEmissao || new Date().toLocaleDateString("pt-BR");
  const TOTAL_PAG = 4;

  // ── PÁG 1: Identificação e resumo ─────────────────────────────────────────
  if (temTeste) marcaDaguaTeste(doc);
  let y = cabecalho(doc,
    "Relatório da Pesquisa ENDOMETRIÔMETRO",
    `${dados.nomeEmpresa}${dados.cnpj ? ` — CNPJ: ${dados.cnpj}` : ""}`,
    1, TOTAL_PAG, temTeste
  );

  // Metadados
  setColor(doc, CORES.cinzaTexto, "text");
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text([
    `Pesquisa: ${dados.tituloPesquisa || "Pesquisa de Saúde Feminina"}`,
    `Cidade/UF: ${[dados.cidade, dados.uf].filter(Boolean).join("/") || "Não informado"}`,
    `Período: ${[dados.periodoInicio, dados.periodoFim].filter(Boolean).join(" a ") || "—"}`,
    `Data de emissão: ${dataStr}`,
  ], MARGIN, y);
  y += 22;

  // Cards de métricas
  const cardW = (CONTENT_W - 8) / 3;
  cardMetrica(doc, MARGIN, y, cardW, "Mulheres pesquisadas", dados.totalPesquisadas);
  cardMetrica(doc, MARGIN + cardW + 4, y, cardW, "Com sintomas relatados", dados.totalComSintomas);
  cardMetrica(doc, MARGIN + (cardW + 4) * 2, y, cardW, "% com sintomas", `${dados.percentualSintomas}%`);
  y += 32;

  // Donut Prevalência
  const prevalencia = dados.prevalencia ?? [
    { name: "Com sintomas", value: dados.totalComSintomas },
    { name: "Sem sintomas", value: dados.totalPesquisadas - dados.totalComSintomas },
  ];
  if (dados.totalPesquisadas >= 5) {
    const pct = dados.totalPesquisadas > 0
      ? Math.round((dados.totalComSintomas / dados.totalPesquisadas) * 100)
      : 0;
    graficoDonut(doc, prevalencia,
      A4.w / 2, y + 36, 30,
      "com sintomas", `${pct}%`,
      [CORES.vinho, CORES.palido]
    );
    y += 90;
  } else {
    y = blocoLimitado(doc, y, "Dados insuficientes (n < 5). Seção omitida para proteção de privacidade.");
  }

  rodape(doc, `Emitido em ${dataStr} — ENDOMETRIÔMETRO — Dados agregados e anonimizados`);

  // ── PÁG 2: Perfil das participantes ───────────────────────────────────────
  doc.addPage();
  if (temTeste) marcaDaguaTeste(doc);
  y = cabecalho(doc, "Perfil das Participantes", "Faixa etária e distribuição geográfica", 2, TOTAL_PAG, temTeste);

  if (dados.faixaEtaria && dados.faixaEtaria.length >= 5) {
    setColor(doc, CORES.preto, "text");
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Distribuição por Faixa Etária", MARGIN, y + 2);
    y += 6;
    graficoBarrasHorizontais(doc, dados.faixaEtaria, MARGIN, y, CONTENT_W, 60);
    y += 70;
  } else {
    y = blocoLimitado(doc, y, "Dados de faixa etária insuficientes (n < 5 por grupo).");
  }

  rodape(doc, `Emitido em ${dataStr} — ENDOMETRIÔMETRO`);

  // ── PÁG 3: Sintomas e impacto ─────────────────────────────────────────────
  doc.addPage();
  if (temTeste) marcaDaguaTeste(doc);
  y = cabecalho(doc, "Sintomas e Impacto no Trabalho", "Frequência de sintomas e indicadores de produtividade", 3, TOTAL_PAG, temTeste);

  // Sintomas
  if (dados.sintomas && dados.sintomas.length > 0 && dados.totalPesquisadas >= 5) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    setColor(doc, CORES.preto, "text");
    doc.text("Sintomas Relatados (% de participantes)", MARGIN, y + 2);
    y += 6;

    const sintPct = dados.sintomas.map(s => ({
      name: s.name,
      value: Math.round((s.total / dados.totalPesquisadas) * 100)
    }));
    graficoBarrasHorizontais(doc, sintPct, MARGIN, y, CONTENT_W, Math.min(dados.sintomas.length * 12, 80), 100);
    y += Math.min(dados.sintomas.length * 12 + 10, 90);
  } else {
    y = blocoLimitado(doc, y, "Dados de sintomas insuficientes (n < 5).");
  }

  // Produtividade — dois indicadores separados
  if (dados.produtividade && dados.produtividade.length > 0 && dados.totalPesquisadas >= 5) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    setColor(doc, CORES.preto, "text");
    doc.text("Impacto no Trabalho (médias)", MARGIN, y + 2);
    y += 6;

    const halfW = (CONTENT_W - 6) / 2;
    dados.produtividade.slice(0, 2).forEach((item, i) => {
      const xCard = MARGIN + i * (halfW + 6);
      setColor(doc, CORES.cinzaClaro, "fill");
      doc.roundedRect(xCard, y, halfW, 30, 3, 3, "F");
      setColor(doc, CORES.rosa, "fill");
      doc.roundedRect(xCard, y, halfW, 8, 3, 3, "F");
      setColor(doc, CORES.branco, "text");
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "bold");
      doc.text(item.name, xCard + halfW / 2, y + 5.5, { align: "center" });
      setColor(doc, CORES.vinho, "text");
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text(String(item.valor), xCard + halfW / 2, y + 22, { align: "center" });
    });
    y += 36;
  }

  rodape(doc, `Emitido em ${dataStr} — ENDOMETRIÔMETRO`);

  // ── PÁG 4: Fechamento ─────────────────────────────────────────────────────
  paginaMetodologia(doc, 4, TOTAL_PAG, temTeste);

  // Download
  const nomeArq = `relatorio-instituicao-${dataStr.replace(/\//g, "-")}.pdf`;
  doc.save(nomeArq);
}

// ─── R2/R3: Relatório Individual / Pessoal ───────────────────────────────────
export async function gerarRelatorioIndividual(dados: DadosIndividuais): Promise<void> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const temTeste = dados.temDadoTeste ?? false;
  const dataStr = dados.dataEmissao || new Date().toLocaleDateString("pt-BR");
  const TOTAL_PAG = 2;

  // ── PÁG 1 ─────────────────────────────────────────────────────────────────
  if (temTeste) marcaDaguaTeste(doc);
  let y = cabecalho(doc,
    "Relatório Individual de Triagem",
    `Emitido em ${dataStr}`,
    1, TOTAL_PAG, temTeste
  );

  // Resultado
  const nivelBaixo = dados.resultado.toLowerCase().includes("baixa");
  const nivelAlto  = dados.resultado.toLowerCase().includes("alta");
  const corResult  = nivelAlto ? CORES.vinho : nivelBaixo ? CORES.verdeEscuro : CORES.ambar;

  setColor(doc, corResult, "fill");
  doc.roundedRect(MARGIN, y, CONTENT_W, 16, 3, 3, "F");
  setColor(doc, CORES.branco, "text");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(dados.resultado, A4.w / 2, y + 10, { align: "center" });
  y += 22;

  // Cards
  const cW = (CONTENT_W - 8) / 3;
  cardMetrica(doc, MARGIN, y, cW, "Intensidade da Dor", `${dados.intensidadeDor}/10`);
  cardMetrica(doc, MARGIN + cW + 4, y, cW, "Sintomas relatados", `${dados.sintomas.length} tipos`);
  cardMetrica(doc, MARGIN + (cW + 4) * 2, y, cW, "Horas/mês c/ dor", `${dados.horasAusencia}h`, `${dados.diasAtestado} dias atestado/ano`);
  y += 32;

  // Sintomas e Situações Relatadas no Questionário
  if (dados.sintomas.length > 0) {
    setColor(doc, CORES.preto, "text");
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Sintomas e Situações Relatadas no Questionário:", MARGIN, y);
    y += 5;

    dados.sintomas.forEach((s) => {
      const rotulo = MAPA_SINTOMAS_QUESTIONARIO[s] || s;
      setColor(doc, CORES.palido, "fill");
      setColor(doc, CORES.rose || CORES.paleRosa, "stroke");
      doc.setLineWidth(0.3);

      const lines = doc.splitTextToSize(`• ${rotulo}`, CONTENT_W - 8);
      const boxH = Math.max(lines.length * 4.2 + 3.5, 7.5);

      doc.roundedRect(MARGIN, y, CONTENT_W, boxH, 1.5, 1.5, "FD");
      setColor(doc, CORES.vinho, "text");
      doc.setFontSize(7.2);
      doc.setFont("helvetica", "normal");
      doc.text(lines, MARGIN + 4, y + 4.8);
      y += boxH + 2;
    });
    y += 4;
  }

  // Aviso
  setColor(doc, CORES.cinzaClaro, "fill");
  doc.roundedRect(MARGIN, y, CONTENT_W, 18, 3, 3, "F");
  setColor(doc, CORES.ambar, "stroke");
  doc.setLineWidth(0.7);
  doc.roundedRect(MARGIN, y, CONTENT_W, 18, 3, 3, "S");
  setColor(doc, CORES.cinzaTexto, "text");
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.text("⚠  Aviso Importante", MARGIN + 4, y + 6);
  doc.setFont("helvetica", "normal");
  const avisoLines = doc.splitTextToSize(
    "Este relatório é um espelho das informações que você forneceu e NÃO substitui diagnóstico ou aconselhamento médico. A endometriose só pode ser diagnosticada por médicos especialistas.",
    CONTENT_W - 8
  );
  doc.text(avisoLines, MARGIN + 4, y + 12);

  rodape(doc, "ENDOMETRIÔMETRO — Relatório Individual. Dados de uso exclusivo da participante. LGPD aplicada.");

  // ── PÁG 2: Metodologia ────────────────────────────────────────────────────
  paginaMetodologia(doc, 2, TOTAL_PAG, temTeste);

  const nomeArq = `relatorio-individual-endometriometro-${dataStr.replace(/\//g, "-")}.pdf`;
  doc.save(nomeArq);
}

// ─── R4: Relatório Consolidado de Colaboradoras para Empresas ───────────────────
export async function gerarRelatorioConsolidadoEmpresa(dados: DadosRelatorioConsolidadoEmpresa): Promise<void> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const temTeste = dados.temDadoTeste ?? false;
  const dataStr = dados.dataEmissao || new Date().toLocaleDateString("pt-BR");
  
  // Calcular número de páginas necessárias para tabela e fechamento
  const itensPorPagina = 12;
  const totalColabs = dados.colaboradoras.length;
  const paginasTabela = Math.max(1, Math.ceil(totalColabs / itensPorPagina));
  const TOTAL_PAG = paginasTabela + 1; // + 1 página para o parecer de Gestão de Pessoas e Fatores de Probabilidade

  // ── PÁGINAS DA TABELA DE COLABORADORAS ─────────────────────────────────────
  let indexColab = 0;
  for (let pag = 1; pag <= paginasTabela; pag++) {
    if (pag > 1) doc.addPage();
    if (temTeste) marcaDaguaTeste(doc);

    let y = cabecalho(
      doc,
      "Relatório Consolidado de Colaboradoras",
      `${dados.nomeEmpresa} — Gestão de Pessoas & Saúde Corporativa`,
      pag,
      TOTAL_PAG,
      temTeste
    );

    // Se for a primeira página, exibe os cards de métricas
    if (pag === 1) {
      // Sub-cabeçalho com CNPJ e Setor
      setColor(doc, CORES.cinzaTexto, "text");
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      const infoEmpresa = [
        dados.cnpj ? `CNPJ: ${dados.cnpj}` : null,
        dados.setor ? `Setor: ${dados.setor}` : null,
        dados.responsavelRh ? `Responsável RH: ${dados.responsavelRh}` : null,
        `Data de Emissão: ${dataStr}`,
      ].filter(Boolean).join("  •  ");
      doc.text(infoEmpresa, MARGIN, y);
      y += 5;

      // 4 Cards de Métricas
      const cW = (CONTENT_W - 9) / 4;
      cardMetrica(doc, MARGIN, y, cW, "Mulheres Pesquisadas", dados.totalMulheresPesquisadas, "Total na empresa");
      cardMetrica(doc, MARGIN + cW + 3, y, cW, "Possibilidade Endom.", dados.totalPossibilidadeEndometriose, `${dados.percentualPossibilidade}% do grupo`);
      cardMetrica(doc, MARGIN + (cW + 3) * 2, y, cW, "Alta Probabilidade", dados.totalAltaProbabilidade, "Casos prioritários");
      cardMetrica(doc, MARGIN + (cW + 3) * 3, y, cW, "Moderada / Baixa", `${dados.totalModeradaProbabilidade} / ${dados.totalBaixaProbabilidade}`, "Investigação/rotina");
      y += 30;
    }

    // Título da Tabela
    setColor(doc, CORES.preto, "text");
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`Lista de Colaboradoras Pesquisadas (Página ${pag} de ${paginasTabela})`, MARGIN, y);
    y += 5;

    // Cabeçalho da Tabela
    const colNomeW = 44;
    const colEmailW = 46;
    const colDiagW = 54;
    const colImpW = 26;

    setColor(doc, CORES.vinho, "fill");
    doc.roundedRect(MARGIN, y, CONTENT_W, 8, 2, 2, "F");
    setColor(doc, CORES.branco, "text");
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.text("NOME", MARGIN + 4, y + 5.5);
    doc.text("E-MAIL", MARGIN + colNomeW + 4, y + 5.5);
    doc.text("DIAGNÓSTICO (FATOR PROBAB.)", MARGIN + colNomeW + colEmailW + 4, y + 5.5);
    doc.text("IMPACTO / AFAS.", MARGIN + colNomeW + colEmailW + colDiagW + 2, y + 5.5);
    y += 9;

    // Linhas de colaboradoras
    const fimIndex = Math.min(indexColab + itensPorPagina, totalColabs);
    if (totalColabs === 0) {
      setColor(doc, CORES.cinzaClaro, "fill");
      doc.roundedRect(MARGIN, y, CONTENT_W, 14, 2, 2, "F");
      setColor(doc, CORES.cinzaTexto, "text");
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.text("Nenhuma colaboradora registrada nesta pesquisa institucional até o momento.", A4.w / 2, y + 8, { align: "center" });
      y += 18;
    } else {
      for (let i = indexColab; i < fimIndex; i++) {
        const c = dados.colaboradoras[i];
        const isPar = i % 2 === 0;

        // Fundo zebrado
        setColor(doc, isPar ? CORES.branco : CORES.cinzaClaro, "fill");
        doc.rect(MARGIN, y, CONTENT_W, 9.5, "F");

        // Borda inferior sutil
        setColor(doc, CORES.palido, "stroke");
        doc.setLineWidth(0.2);
        doc.line(MARGIN, y + 9.5, MARGIN + CONTENT_W, y + 9.5);

        // Nome
        setColor(doc, CORES.preto, "text");
        doc.setFontSize(7.5);
        doc.setFont("helvetica", "bold");
        const nomeTruncado = c.nome.length > 22 ? c.nome.slice(0, 22) + "…" : c.nome;
        doc.text(nomeTruncado, MARGIN + 4, y + 6);

        // Email
        setColor(doc, CORES.cinzaTexto, "text");
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        const emailTruncado = c.email.length > 26 ? c.email.slice(0, 26) + "…" : c.email;
        doc.text(emailTruncado, MARGIN + colNomeW + 4, y + 6);

        // Badge de Diagnóstico / Probabilidade
        const nivel = c.nivelProbabilidade;
        let badgeBg = CORES.verdeEscuro;
        if (nivel === "Alto") badgeBg = CORES.vinho;
        else if (nivel === "Médio" || nivel === "Moderado") badgeBg = CORES.ambar;

        const xBadge = MARGIN + colNomeW + colEmailW + 2;
        setColor(doc, badgeBg, "fill");
        doc.roundedRect(xBadge, y + 1.8, colDiagW - 4, 6, 1.5, 1.5, "F");
        setColor(doc, CORES.branco, "text");
        doc.setFontSize(6.2);
        doc.setFont("helvetica", "bold");
        const resLabel = c.resultado.length > 30 ? c.resultado.slice(0, 30) + "…" : c.resultado;
        doc.text(resLabel, xBadge + (colDiagW - 4) / 2, y + 5.8, { align: "center" });

        // Impacto / Afastamento
        setColor(doc, CORES.cinzaTexto, "text");
        doc.setFontSize(6.8);
        doc.setFont("helvetica", "normal");
        const impTexto = c.horasAusencia && Number(c.horasAusencia) > 0 
          ? `${c.horasAusencia}h ausência` 
          : (c.impactoTrabalho || "Leve");
        doc.text(impTexto, MARGIN + colNomeW + colEmailW + colDiagW + 2, y + 6);

        y += 10;
      }
      indexColab = fimIndex;
    }

    rodape(doc, `Relatório Consolidado Institucional — ${dados.nomeEmpresa} — Confidencial (LGPD)`);
  }

  // ── PÁGINA FINAL: PARECER PARA GESTÃO DE PESSOAS E FATORES DE PROBABILIDADE ─
  doc.addPage();
  if (temTeste) marcaDaguaTeste(doc);
  let y = cabecalho(
    doc,
    "Gestão de Pessoas e Parecer Clínico",
    "Diretrizes de apoio corporativo e fatores diagnósticos",
    TOTAL_PAG,
    TOTAL_PAG,
    temTeste
  );

  // 1. Parecer para o Setor Responsável pela Gestão de Pessoas (RH)
  setColor(doc, CORES.palido, "fill");
  doc.roundedRect(MARGIN, y, CONTENT_W, 58, 3, 3, "F");
  setColor(doc, CORES.vinho, "stroke");
  doc.setLineWidth(0.6);
  doc.roundedRect(MARGIN, y, CONTENT_W, 58, 3, 3, "S");

  setColor(doc, CORES.vinho, "text");
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("DIRETRIZES PARA O SETOR RESPONSÁVEL PELA GESTÃO DE PESSOAS (RH)", MARGIN + 5, y + 7);

  setColor(doc, CORES.cinzaTexto, "text");
  doc.setFontSize(7.2);
  doc.setFont("helvetica", "normal");
  const rhTexto = [
    "A endometriose é uma doença inflamatória crônica que atinge mulheres em idade reprodutiva e produtiva, sendo uma das principais causas de dor incapacitante, absenteísmo e presenteísmo oculto.",
    "",
    "1. Acolhimento e Sigilo Absoluto: Os dados individuais deste relatório têm caráter estritamente médico e preventivo. As informações não devem ser utilizadas para fins discriminatórios ou avaliações de desempenho.",
    "2. Encaminhamento Médico Especializado: Recomenda-se que o setor de Recursos Humanos / Saúde Ocupacional oriente as colaboradoras com probabilidade Alta e Moderada a buscar ginecologistas especializados em endometriose e dor pélvica.",
    "3. Flexibilidade e Ergonomia: Casos de dor crônica beneficiam-se de flexibilidade de horários ou regime híbrido/remoto nos dias mais críticos do ciclo menstrual, minimizando a perda de produtividade.",
    "4. Campanhas Corporativas: A promoção de rodas de conversa e palestras sobre saúde reprodutiva reduz o estigma e encoraja a busca precoce por tratamento."
  ];

  let yRh = y + 13;
  rhTexto.forEach(linha => {
    if (linha === "") {
      yRh += 2;
    } else {
      const splitLinha = doc.splitTextToSize(linha, CONTENT_W - 10);
      doc.text(splitLinha, MARGIN + 5, yRh);
      yRh += splitLinha.length * 3.6;
    }
  });

  y += 64;

  // 2. Observação Estatística do Quadro Pesquisado
  setColor(doc, CORES.cinzaClaro, "fill");
  doc.roundedRect(MARGIN, y, CONTENT_W, 30, 3, 3, "F");
  setColor(doc, CORES.rosa, "stroke");
  doc.setLineWidth(0.5);
  doc.roundedRect(MARGIN, y, CONTENT_W, 30, 3, 3, "S");

  setColor(doc, CORES.vinho, "text");
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.text("OBSERVAÇÃO ESTATÍSTICA DO QUADRO DE MULHERES PESQUISADAS", MARGIN + 5, y + 6);

  setColor(doc, CORES.preto, "text");
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  const estatTexto = [
    `• Total de mulheres pesquisadas na instituição: ${dados.totalMulheresPesquisadas} colaboradora(s).`,
    `• Mulheres com possibilidade de ter endometriose: ${dados.totalPossibilidadeEndometriose} colaboradora(s) (${dados.percentualPossibilidade}% do grupo avaliado).`,
    `  - Alta Probabilidade: ${dados.totalAltaProbabilidade} colaboradora(s) | Moderada Probabilidade: ${dados.totalModeradaProbabilidade} colaboradora(s) | Baixa Probabilidade: ${dados.totalBaixaProbabilidade} colaboradora(s).`
  ];
  let yEst = y + 12;
  estatTexto.forEach(l => {
    doc.text(l, MARGIN + 5, yEst);
    yEst += 5;
  });

  y += 36;

  // 3. Classificação dos Fatores de Probabilidade Clínica de Sintomas
  setColor(doc, CORES.cinzaClaro, "fill");
  doc.roundedRect(MARGIN, y, CONTENT_W, 60, 3, 3, "F");
  setColor(doc, CORES.paleRosa, "stroke");
  doc.setLineWidth(0.5);
  doc.roundedRect(MARGIN, y, CONTENT_W, 60, 3, 3, "S");

  setColor(doc, CORES.vinho, "text");
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.text("FATORES DE PROBABILIDADE CLÍNICA E CRITÉRIOS DIAGNÓSTICOS", MARGIN + 5, y + 6);

  const fatores = [
    {
      titulo: "ALTO (Alta Probabilidade — Pontuação clínica >= 8):",
      cor: CORES.vinho,
      desc: "Concomitância de intensidade severa de dor (escala EVA >= 7) com múltiplos sintomas clínicos incapacitantes (cólica menstrual refratária, dor pélvica acíclica, dor profunda na relação sexual, dor evacuatória/urinária e fadiga crônica). Forte concordância clínica com endometriose profunda ou infiltrativa, requerendo encaminhamento prioritário para mapeamento com preparo e ressonância magnética."
    },
    {
      titulo: "MÉDIO / MODERADO (Moderada Probabilidade — Pontuação clínica 4 a 7):",
      cor: CORES.ambar,
      desc: "Presença de sintomas clínicos com repercussão intermediária na qualidade de vida e na rotina laboral. Justifica consulta ginecológica para investigação diagnóstica, diagnóstico diferencial e controle precoce de sintomas antes de eventual progressão lesional."
    },
    {
      titulo: "BAIXO (Baixa Probabilidade — Pontuação clínica < 4):",
      cor: CORES.verdeEscuro,
      desc: "Manifestações isoladas ou de baixa intensidade sem critérios típicos de acometimento pélvico extenso. Recomenda-se a manutenção do acompanhamento preventivo anual com ginecologista de confiança."
    }
  ];

  let yFat = y + 12;
  fatores.forEach(f => {
    setColor(doc, f.cor, "text");
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.text(f.titulo, MARGIN + 5, yFat);
    yFat += 4;

    setColor(doc, CORES.cinzaTexto, "text");
    doc.setFontSize(6.8);
    doc.setFont("helvetica", "normal");
    const descLines = doc.splitTextToSize(f.desc, CONTENT_W - 10);
    doc.text(descLines, MARGIN + 5, yFat);
    yFat += descLines.length * 3.4 + 2;
  });

  // Rodapé da página final
  rodape(doc, `ENDOMETRIÔMETRO — Relatório Consolidado Institucional emitido em ${dataStr}. Proteção LGPD aplicada.`);

  // Salvar PDF
  const safeName = dados.nomeEmpresa.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 30);
  doc.save(`relatorio-consolidado-${safeName}-${dataStr.replace(/\//g, "-")}.pdf`);
}
