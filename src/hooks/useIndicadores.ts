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

          if (!error && data && (data as any).total_concluidas !== undefined) {
            return { ...(data as IndicadoresData), incluiu_teste: INCLUIR_TESTE };
          }
        } catch {
          // Continua para o cálculo direto via survey_responses
        }

        // Consultar respostas diretamente do banco para a empresa
        const { data: responses, error: respError } = await supabase
          .from('survey_responses')
          .select('*')
          .eq('company_id', pesquisaId)
          .eq('status', 'concluida');

        if (respError) {
          console.warn("Aviso ao buscar respostas da empresa:", respError);
        }

        const items = responses || [];
        const total = items.length;
        const suficiente = total >= 5;

        // Prevalência
        const comDiag = items.filter(r => String(r.diagnostico).toLowerCase() === 'sim').length;
        const semDiag = total - comDiag;

        // Sintomas
        const sintomaCount: Record<string, number> = {};
        items.forEach(r => {
          const sints = Array.isArray(r.sintomas) ? r.sintomas : [];
          sints.forEach((s: string) => {
            sintomaCount[s] = (sintomaCount[s] || 0) + 1;
          });
        });
        const sintomasList = Object.entries(sintomaCount)
          .map(([name, count]) => ({ name, total: count }))
          .sort((a, b) => b.total - a.total);

        // Faixa Etária
        const idadeCount: Record<string, number> = {};
        items.forEach(r => {
          const id = r.idade || "Não informada";
          idadeCount[id] = (idadeCount[id] || 0) + 1;
        });
        const idadeList = Object.entries(idadeCount).map(([name, value]) => ({ name, value }));

        // Produtividade
        const prodCount: Record<string, number> = {};
        items.forEach(r => {
          const imp = r.impacto_trabalho || "Moderado";
          prodCount[imp] = (prodCount[imp] || 0) + 1;
        });
        const prodList = Object.entries(prodCount).map(([name, valor]) => ({ name, valor }));

        return {
          total_concluidas: total,
          suficiente,
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

      const { data, error } = await supabase.rpc('get_indicadores', {
        p_escopo: escopo,
        p_survey_id: pesquisaId || null,
        p_incluir_teste: INCLUIR_TESTE,
      });

      if (error) {
        throw new Error(error.message || 'Erro ao carregar indicadores');
      }

      return { ...(data as IndicadoresData), incluiu_teste: INCLUIR_TESTE };
    },
    // Refazer consulta a cada 60s em background (regra F2B.4)
    refetchInterval: 60000,
    // Refazer ao focar a janela (regra F2B.4)
    refetchOnWindowFocus: true,
  });
};
