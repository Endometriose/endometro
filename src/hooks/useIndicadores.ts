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
