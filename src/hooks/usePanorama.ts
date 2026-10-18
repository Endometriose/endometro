import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// Forçando true temporariamente para evitar necessidade de reiniciar o servidor Vite
const INCLUIR_TESTE = true;

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
      try {
        const { data, error } = await supabase.rpc('get_panorama', {
          p_escopo: escopo,
          p_survey_id: pesquisaId || null,
          p_incluir_teste: INCLUIR_TESTE,
        });
        if (error) {
          console.warn('Aviso get_panorama:', error.message);
          return {
            k1_total_pesquisadas: 0,
            k2_total_com_sintoma: 0,
            k3_percentual_sintoma: 0,
            k4_total_individual: 0,
            k5_total_empresa: 0,
            k6_total_empresas_pesq: 0,
            d4_individual_com_sintoma: 0,
            d5_empresa_com_sintoma: 0,
            suficiente: false,
            atualizado_em: new Date().toISOString(),
            incluiu_teste: false,
          };
        }
        return { ...(data as PanoramaData), incluiu_teste: INCLUIR_TESTE };
      } catch (err: any) {
        console.warn('Exceção get_panorama:', err?.message);
        return {
          k1_total_pesquisadas: 0,
          k2_total_com_sintoma: 0,
          k3_percentual_sintoma: 0,
          k4_total_individual: 0,
          k5_total_empresa: 0,
          k6_total_empresas_pesq: 0,
          d4_individual_com_sintoma: 0,
          d5_empresa_com_sintoma: 0,
          suficiente: false,
          atualizado_em: new Date().toISOString(),
          incluiu_teste: false,
        };
      }
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
      try {
        const { data, error } = await supabase.rpc('get_distribuicao', {
          p_escopo: escopo,
          p_dimensao: dimensao,
          p_origem: origem,
          p_survey_id: pesquisaId || null,
          p_incluir_teste: INCLUIR_TESTE,
        });
        if (error) {
          console.warn('Aviso get_distribuicao:', error.message);
          return [];
        }
        return (data as DistribuicaoItem[]) || [];
      } catch (err: any) {
        console.warn('Exceção get_distribuicao:', err?.message);
        return [];
      }
    },
    refetchInterval: 60000,
    refetchOnWindowFocus: true,
  });
};
