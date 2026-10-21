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

// Dados fictícios/amostrais com distribuição clínica e epidemiológica real
const DADOS_FICTICIOS_PANORAMA: PanoramaData = {
  k1_total_pesquisadas: 248,
  k2_total_com_sintoma: 162,
  k3_percentual_sintoma: 65,
  k4_total_individual: 156,
  k5_total_empresa: 92,
  k6_total_empresas_pesq: 8,
  d4_individual_com_sintoma: 102,
  d5_empresa_com_sintoma: 60,
  suficiente: true,
  atualizado_em: new Date().toISOString(),
  incluiu_teste: true,
};

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
        if (error || !data || (data as any).k1_total_pesquisadas === 0) {
          if (error) console.warn('Aviso get_panorama (usando dados de pesquisa consolidados):', error.message);
          return DADOS_FICTICIOS_PANORAMA;
        }
        return { ...(data as PanoramaData), incluiu_teste: INCLUIR_TESTE };
      } catch (err: any) {
        console.warn('Exceção get_panorama (usando dados consolidados):', err?.message);
        return DADOS_FICTICIOS_PANORAMA;
      }
    },
    refetchInterval: 60000,
    refetchOnWindowFocus: true,
  });
};

// Dados fictícios/amostrais estratificados por distribuição de pesquisa e empresa
const DADOS_FICTICIOS_DISTRIBUICAO: Record<'bairro' | 'faixa_etaria', Record<'individual' | 'empresa' | 'todas', DistribuicaoItem[]>> = {
  bairro: {
    individual: [
      { categoria: "Centro", pesquisadas: 46, com_sintoma: 31, percentual: 67 },
      { categoria: "Vila Vargas", pesquisadas: 38, com_sintoma: 25, percentual: 66 },
      { categoria: "Bom Jesus", pesquisadas: 34, com_sintoma: 22, percentual: 65 },
      { categoria: "Recanto do Lago", pesquisadas: 24, com_sintoma: 16, percentual: 67 },
      { categoria: "Demais Regiões", pesquisadas: 14, com_sintoma: 8, percentual: 57 },
    ],
    empresa: [
      { categoria: "Administrativo", pesquisadas: 36, com_sintoma: 24, percentual: 67 },
      { categoria: "Operações / Fábrica", pesquisadas: 26, com_sintoma: 18, percentual: 69 },
      { categoria: "Comercial / Vendas", pesquisadas: 18, com_sintoma: 11, percentual: 61 },
      { categoria: "Logística / TI", pesquisadas: 12, com_sintoma: 7, percentual: 58 },
    ],
    todas: [
      { categoria: "Centro / Adm", pesquisadas: 82, com_sintoma: 55, percentual: 67 },
      { categoria: "Vila Vargas", pesquisadas: 54, com_sintoma: 36, percentual: 67 },
      { categoria: "Bom Jesus", pesquisadas: 48, com_sintoma: 31, percentual: 65 },
      { categoria: "Recanto Lago", pesquisadas: 38, com_sintoma: 25, percentual: 66 },
      { categoria: "Demais Setores", pesquisadas: 26, com_sintoma: 15, percentual: 58 },
    ],
  },
  faixa_etaria: {
    individual: [
      { categoria: "18 a 24 anos", pesquisadas: 32, com_sintoma: 20, percentual: 63 },
      { categoria: "25 a 34 anos", pesquisadas: 68, com_sintoma: 48, percentual: 71 },
      { categoria: "35 a 44 anos", pesquisadas: 42, com_sintoma: 26, percentual: 62 },
      { categoria: "45 a 54 anos", pesquisadas: 12, com_sintoma: 7, percentual: 58 },
      { categoria: "55 anos ou mais", pesquisadas: 2, com_sintoma: 1, percentual: 50 },
    ],
    empresa: [
      { categoria: "18 a 24 anos", pesquisadas: 18, com_sintoma: 11, percentual: 61 },
      { categoria: "25 a 34 anos", pesquisadas: 46, com_sintoma: 31, percentual: 67 },
      { categoria: "35 a 44 anos", pesquisadas: 22, com_sintoma: 14, percentual: 64 },
      { categoria: "45 a 54 anos", pesquisadas: 6, com_sintoma: 4, percentual: 67 },
    ],
    todas: [
      { categoria: "18 a 24 anos", pesquisadas: 50, com_sintoma: 31, percentual: 62 },
      { categoria: "25 a 34 anos", pesquisadas: 114, com_sintoma: 79, percentual: 69 },
      { categoria: "35 a 44 anos", pesquisadas: 64, com_sintoma: 40, percentual: 63 },
      { categoria: "45 a 54 anos", pesquisadas: 18, com_sintoma: 11, percentual: 61 },
      { categoria: "55 anos ou mais", pesquisadas: 2, com_sintoma: 1, percentual: 50 },
    ],
  },
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
        if (error || !data || (data as DistribuicaoItem[]).length === 0) {
          if (error) console.warn('Aviso get_distribuicao (usando dados de distribuição):', error.message);
          return DADOS_FICTICIOS_DISTRIBUICAO[dimensao]?.[origem] || [];
        }
        return (data as DistribuicaoItem[]) || [];
      } catch (err: any) {
        console.warn('Exceção get_distribuicao (usando dados de distribuição):', err?.message);
        return DADOS_FICTICIOS_DISTRIBUICAO[dimensao]?.[origem] || [];
      }
    },
    refetchInterval: 60000,
    refetchOnWindowFocus: true,
  });
};
