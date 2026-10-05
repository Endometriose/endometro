import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

const INCLUIR_TESTE = import.meta.env.VITE_INCLUIR_DADOS_TESTE === 'true';

// --- Tipos ---
export interface PanoramaData {
  k1_total_pesquisadas: number;
  k2_total_com_sintoma: number;
  k3_percentual_sintoma: number;
  k4_total_individual: number;
  k5_total_empresa: number;
  k6_total_empresas_pesq: number;
  d4_individual_com_sintoma: number;
  d5_empresa_com_sintoma: number;
  suficiente: boolean;
  atualizado_em: string;
  incluiu_teste: boolean;
}

export interface DistribuicaoItem {
  categoria: string;
  pesquisadas: number;
  com_sintoma: number;
  percentual: number;
}

// --- Hook: Panorama Geral (K1-K6 e D4/D5) ---
export const usePanorama = (escopo: 'geral' | 'pesquisa' = 'geral', pesquisaId?: string) => {
  return useQuery({
    queryKey: ['panorama', escopo, pesquisaId, INCLUIR_TESTE],
    queryFn: async (): Promise<PanoramaData> => {
      const { data, error } = await supabase.rpc('get_panorama', {
        p_escopo: escopo,
        p_survey_id: pesquisaId || null,
        p_incluir_teste: INCLUIR_TESTE,
      });
      if (error) throw new Error(error.message || 'Erro ao carregar panorama');
      return { ...(data as PanoramaData), incluiu_teste: INCLUIR_TESTE };
    },
    refetchInterval: 60000,
    refetchOnWindowFocus: true,
  });
};

// --- Hook: Distribuição por Dimensão (B1/B2) ---
export const useDistribuicao = (
  dimensao: 'bairro' | 'faixa_etaria',
  origem: 'individual' | 'empresa' | 'todas',
  escopo: 'geral' | 'pesquisa' = 'geral',
  pesquisaId?: string
) => {
  return useQuery({
    queryKey: ['distribuicao', dimensao, origem, escopo, pesquisaId, INCLUIR_TESTE],
    queryFn: async (): Promise<DistribuicaoItem[]> => {
      const { data, error } = await supabase.rpc('get_distribuicao', {
        p_escopo: escopo,
        p_dimensao: dimensao,
        p_origem: origem,
        p_survey_id: pesquisaId || null,
        p_incluir_teste: INCLUIR_TESTE,
      });
      if (error) throw new Error(error.message || 'Erro ao carregar distribuição');
      return (data as DistribuicaoItem[]) || [];
    },
    refetchInterval: 60000,
    refetchOnWindowFocus: true,
  });
};
