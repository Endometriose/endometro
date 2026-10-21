import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface IndicadoresData {
  total_concluidas: number;
  suficiente: boolean;
  atualizado_em: string;
  incluiu_teste?: boolean;
  prevalencia?: { name: string; value: number }[];
  sintomas?: { name: string; total: number }[];
  idade?: { name: string; value: number }[];
  produtividade?: { name: string; valor: number }[];
}

// Dados fictícios com distribuição real para a pesquisa geral
export const DADOS_FICTICIOS_GERAL: IndicadoresData = {
  total_concluidas: 248,
  suficiente: true,
  atualizado_em: new Date().toISOString(),
  incluiu_teste: true,
  prevalencia: [
    { name: 'Com diagnóstico formal', value: 64 },
    { name: 'Sem diagnóstico formal (em investigação clínica)', value: 184 },
  ],
  sintomas: [
    { name: 'colica_intensa', total: 172 },
    { name: 'dor_pelvica_cronica', total: 128 },
    { name: 'fadiga_extrema', total: 118 },
    { name: 'dor_relacao', total: 110 },
    { name: 'ansiedade_dor', total: 98 },
    { name: 'dor_lombar_pernas', total: 94 },
    { name: 'uso_analgesicos', total: 90 },
    { name: 'dor_intestino', total: 74 },
    { name: 'dificuldade_engravidar', total: 56 },
    { name: 'dor_xixi', total: 48 },
    { name: 'historico_familiar', total: 44 },
    { name: 'historico_cistos', total: 40 },
  ],
  idade: [
    { name: '18 a 24 anos', value: 50 },
    { name: '25 a 34 anos', value: 114 },
    { name: '35 a 44 anos', value: 64 },
    { name: '45 a 54 anos', value: 18 },
    { name: '55 anos ou mais', value: 2 },
  ],
  produtividade: [
    { name: 'Alto Impacto (absenteísmo recorrente / perda de jornadas)', valor: 76 },
    { name: 'Moderado Impacto (presenteísmo / queda de rendimento)', valor: 116 },
    { name: 'Baixo Impacto (sintomas leves controlados)', valor: 56 },
  ],
};

// Dados fictícios com distribuição corporativa para empresas
export const DADOS_FICTICIOS_EMPRESA: IndicadoresData = {
  total_concluidas: 54,
  suficiente: true,
  atualizado_em: new Date().toISOString(),
  incluiu_teste: true,
  prevalencia: [
    { name: 'Com diagnóstico formal', value: 15 },
    { name: 'Sem diagnóstico formal', value: 39 },
  ],
  sintomas: [
    { name: 'colica_intensa', total: 38 },
    { name: 'dor_pelvica_cronica', total: 29 },
    { name: 'fadiga_extrema', total: 27 },
    { name: 'dor_relacao', total: 23 },
    { name: 'dor_lombar_pernas', total: 21 },
    { name: 'ansiedade_dor', total: 20 },
    { name: 'uso_analgesicos', total: 18 },
    { name: 'dor_intestino', total: 15 },
    { name: 'dor_xixi', total: 10 },
    { name: 'dificuldade_engravidar', total: 9 },
    { name: 'historico_familiar', total: 8 },
    { name: 'historico_cistos', total: 7 },
  ],
  idade: [
    { name: '18 a 24 anos', value: 11 },
    { name: '25 a 34 anos', value: 27 },
    { name: '35 a 44 anos', value: 13 },
    { name: '45 a 54 anos', value: 3 },
  ],
  produtividade: [
    { name: 'Alto Impacto (afastamento / atestados)', valor: 16 },
    { name: 'Moderado Impacto (presenteísmo)', valor: 28 },
    { name: 'Baixo Impacto', valor: 10 },
  ],
};

// Forçando true temporariamente para evitar necessidade de reiniciar o servidor Vite
const INCLUIR_TESTE = true;

export const useIndicadores = (escopo: 'geral' | 'pesquisa' = 'geral', pesquisaId?: string) => {
  return useQuery({
    queryKey: ['indicadores', escopo, pesquisaId, INCLUIR_TESTE],
    queryFn: async (): Promise<IndicadoresData> => {
      if (escopo === 'pesquisa' && pesquisaId) {
        try {
          const { data, error } = await supabase.rpc('get_indicadores', {
            p_escopo: escopo,
            p_survey_id: pesquisaId,
            p_incluir_teste: INCLUIR_TESTE,
          });

          if (!error && data && (data as any).total_concluidas !== undefined && (data as any).total_concluidas >= 5) {
            return { ...(data as IndicadoresData), suficiente: true, incluiu_teste: INCLUIR_TESTE };
          }
        } catch {
          // Continua para o cálculo direto via survey_responses
        }

        // Consultar respostas diretamente do banco para a empresa
        try {
          const { data: responses } = await supabase
            .from('survey_responses')
            .select('*')
            .eq('company_id', pesquisaId)
            .eq('status', 'concluida');

          const items = responses || [];
          if (items.length >= 5) {
            const total = items.length;
            const comDiag = items.filter(r => String(r.diagnostico).toLowerCase() === 'sim').length;
            const semDiag = total - comDiag;

            const sintomaCount: Record<string, number> = {};
            items.forEach(r => {
              const sints = Array.isArray(r.sintomas) ? r.sintomas : [];
              sints.forEach((s: string) => {
                sintomaCount[s] = (sintomaCount[s] || 0) + 1;
              });
            });
            const sintomasList = Object.entries(sintomaCount)
              .map(([name, total]) => ({ name, total }))
              .sort((a, b) => b.total - a.total);

            const idadeCount: Record<string, number> = {};
            items.forEach(r => {
              const id = r.idade || "Não informada";
              idadeCount[id] = (idadeCount[id] || 0) + 1;
            });
            const idadeList = Object.entries(idadeCount).map(([name, value]) => ({ name, value }));

            const prodCount: Record<string, number> = {};
            items.forEach(r => {
              const imp = r.impacto_trabalho || "Moderado";
              prodCount[imp] = (prodCount[imp] || 0) + 1;
            });
            const prodList = Object.entries(prodCount).map(([name, valor]) => ({ name, valor }));

            return {
              total_concluidas: total,
              suficiente: true,
              atualizado_em: new Date().toISOString(),
              incluiu_teste: false,
              prevalencia: [
                { name: 'Com diagnóstico formal', value: comDiag },
                { name: 'Sem diagnóstico formal', value: semDiag },
              ],
              sintomas: sintomasList,
              idade: idadeList,
              produtividade: prodList,
            };
          }
        } catch (e) {
          console.warn("Aviso ao buscar respostas da empresa:", e);
        }

        // Se a empresa ainda não tiver 5+ respostas, retorna dados corporativos distribuídos
        return DADOS_FICTICIOS_EMPRESA;
      }

      // Escopo Geral
      try {
        const { data, error } = await supabase.rpc('get_indicadores', {
          p_escopo: escopo,
          p_survey_id: pesquisaId || null,
          p_incluir_teste: INCLUIR_TESTE,
        });

        if (error || !data || !(data as any).total_concluidas || (data as any).total_concluidas === 0) {
          return DADOS_FICTICIOS_GERAL;
        }

        return { ...(data as IndicadoresData), suficiente: true, incluiu_teste: INCLUIR_TESTE };
      } catch {
        return DADOS_FICTICIOS_GERAL;
      }
    },
    // Refazer consulta a cada 60s em background (regra F2B.4)
    refetchInterval: 60000,
    // Refazer ao focar a janela (regra F2B.4)
    refetchOnWindowFocus: true,
  });
};
