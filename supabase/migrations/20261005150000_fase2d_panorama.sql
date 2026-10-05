-- Migração Aditiva - FASE 2D: Painel de Totais e Distribuição
-- Implementa a regra D2 (funções get_panorama e get_distribuicao) com K-Anonymity

CREATE OR REPLACE FUNCTION public.get_panorama(p_escopo text, p_survey_id uuid DEFAULT NULL, p_incluir_teste boolean DEFAULT false)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_total_pesquisadas int;
    v_total_com_sintoma int;
    v_total_individual int;
    v_total_empresa int;
    v_total_empresas_pesquisadas int;
    
    v_individual_com_sintoma int;
    v_empresa_com_sintoma int;
    
    v_company_id uuid;
    v_result jsonb;
    v_min_empresas int := 3;
BEGIN
    -- 1. Validações de Escopo e Segurança RLS
    IF p_escopo = 'pesquisa' THEN
        IF p_survey_id IS NULL THEN
            RAISE EXCEPTION 'survey_id é obrigatorio para escopo de pesquisa';
        END IF;
        SELECT company_id INTO v_company_id FROM public.surveys WHERE id = p_survey_id;
        IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND company_id = v_company_id AND role = 'instituicao') THEN
            RAISE EXCEPTION 'Acesso negado: voce nao possui permissao para visualizar agregados desta pesquisa.';
        END IF;
    ELSIF p_escopo != 'geral' THEN
        RAISE EXCEPTION 'Escopo invalido. Use "geral" ou "pesquisa".';
    END IF;

    -- Ajuste de limite em dev com teste
    IF p_incluir_teste THEN
        v_min_empresas := 1;
    END IF;

    -- 2. Cálculos Gerais (K1 a K6)
    
    -- K1, K4, K5 (Total geral, individual e empresa)
    SELECT 
        COUNT(*),
        COUNT(*) FILTER (WHERE sr.company_id IS NULL),
        COUNT(*) FILTER (WHERE sr.company_id IS NOT NULL)
    INTO v_total_pesquisadas, v_total_individual, v_total_empresa
    FROM public.survey_responses sr
    WHERE sr.status = 'concluida'
      AND (p_escopo = 'geral' OR sr.survey_id = p_survey_id)
      AND (p_incluir_teste OR sr.is_teste IS NOT TRUE);

    -- K6 (Total de Empresas Pesquisadas)
    SELECT COUNT(DISTINCT company_id) INTO v_total_empresas_pesquisadas
    FROM public.survey_responses
    WHERE status = 'concluida' AND company_id IS NOT NULL
      AND (p_incluir_teste OR is_teste IS NOT TRUE);

    -- K2, K3 (Total e % Com Sintomas)
    -- Considera "com sintoma" se o array de sintomas não for nulo e tiver comprimento > 0
    SELECT 
        COUNT(*),
        COUNT(*) FILTER (WHERE sr.company_id IS NULL),
        COUNT(*) FILTER (WHERE sr.company_id IS NOT NULL)
    INTO v_total_com_sintoma, v_individual_com_sintoma, v_empresa_com_sintoma
    FROM public.survey_responses sr
    WHERE sr.status = 'concluida'
      AND (p_escopo = 'geral' OR sr.survey_id = p_survey_id)
      AND (p_incluir_teste OR sr.is_teste IS NOT TRUE)
      AND sr.responses->'sintomas' IS NOT NULL 
      AND jsonb_array_length(sr.responses->'sintomas') > 0;

    -- 3. Restrições de Privacidade (K-Anonymity e Ocultação de Empresa Pública)
    -- Se escopo geral e total de empresas for menor que MIN, oculta dados de empresa
    IF p_escopo = 'geral' AND v_total_empresas_pesquisadas < v_min_empresas THEN
        v_total_empresa := 0;
        v_empresa_com_sintoma := 0;
        v_total_empresas_pesquisadas := 0;
    END IF;

    -- 4. Construção do JSON
    v_result := jsonb_build_object(
        'k1_total_pesquisadas', v_total_pesquisadas,
        'k2_total_com_sintoma', v_total_com_sintoma,
        'k3_percentual_sintoma', CASE WHEN v_total_pesquisadas > 0 THEN ROUND((v_total_com_sintoma::numeric / v_total_pesquisadas) * 100) ELSE 0 END,
        'k4_total_individual', v_total_individual,
        'k5_total_empresa', v_total_empresa,
        'k6_total_empresas_pesq', v_total_empresas_pesquisadas,
        
        'd4_individual_com_sintoma', v_individual_com_sintoma,
        'd5_empresa_com_sintoma', v_empresa_com_sintoma,
        
        'atualizado_em', now(),
        'suficiente', v_total_pesquisadas >= 5,
        'incluiu_teste', p_incluir_teste
    );

    RETURN v_result;
END;
$$;

-- Função get_distribuicao para B1 e B2
CREATE OR REPLACE FUNCTION public.get_distribuicao(p_escopo text, p_dimensao text, p_origem text DEFAULT 'individual', p_survey_id uuid DEFAULT NULL, p_incluir_teste boolean DEFAULT false)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_company_id uuid;
    v_result jsonb;
    v_min_empresas int := 3;
    v_total_empresas int;
BEGIN
    -- 1. Validações e Segurança
    IF p_dimensao NOT IN ('bairro', 'faixa_etaria') THEN
        RAISE EXCEPTION 'Dimensão invalida. Use "bairro" ou "faixa_etaria".';
    END IF;
    IF p_origem NOT IN ('individual', 'empresa', 'todas') THEN
        RAISE EXCEPTION 'Origem invalida. Use "individual", "empresa" ou "todas".';
    END IF;

    IF p_escopo = 'pesquisa' THEN
        IF p_survey_id IS NULL THEN RAISE EXCEPTION 'survey_id obrigatorio'; END IF;
        SELECT company_id INTO v_company_id FROM public.surveys WHERE id = p_survey_id;
        IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND company_id = v_company_id AND role = 'instituicao') THEN
            RAISE EXCEPTION 'Acesso negado.';
        END IF;
    END IF;

    IF p_incluir_teste THEN v_min_empresas := 1; END IF;

    IF p_escopo = 'geral' AND p_origem = 'empresa' THEN
        SELECT COUNT(DISTINCT company_id) INTO v_total_empresas
        FROM public.survey_responses
        WHERE status = 'concluida' AND company_id IS NOT NULL AND (p_incluir_teste OR is_teste IS NOT TRUE);
        
        IF v_total_empresas < v_min_empresas THEN
            RETURN '[]'::jsonb;
        END IF;
    END IF;

    -- 2. Agregação com K-Anonymity (Demais)
    WITH raw_data AS (
        SELECT 
            CASE 
                WHEN p_dimensao = 'bairro' THEN sr.responses->>'bairro'
                WHEN p_dimensao = 'faixa_etaria' THEN sr.responses->>'idade'
                ELSE 'Indefinido'
            END as categoria,
            COUNT(*) as total_pesquisadas,
            COUNT(*) FILTER (WHERE sr.responses->'sintomas' IS NOT NULL AND jsonb_array_length(sr.responses->'sintomas') > 0) as total_com_sintoma
        FROM public.survey_responses sr
        WHERE sr.status = 'concluida'
          AND (p_escopo = 'geral' OR sr.survey_id = p_survey_id)
          AND (p_incluir_teste OR sr.is_teste IS NOT TRUE)
          AND (
               (p_origem = 'individual' AND sr.company_id IS NULL) OR
               (p_origem = 'empresa' AND sr.company_id IS NOT NULL) OR
               (p_origem = 'todas')
          )
        GROUP BY 1
    ),
    grouped_data AS (
        SELECT 
            CASE WHEN total_pesquisadas >= 5 THEN categoria ELSE 'Demais (agrupados)' END as categoria_final,
            SUM(total_pesquisadas) as total_pesquisadas,
            SUM(total_com_sintoma) as total_com_sintoma
        FROM raw_data
        WHERE categoria IS NOT NULL AND categoria != ''
        GROUP BY 1
    )
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'categoria', categoria_final,
            'pesquisadas', total_pesquisadas,
            'com_sintoma', total_com_sintoma,
            'percentual', CASE WHEN total_pesquisadas > 0 THEN ROUND((total_com_sintoma::numeric / total_pesquisadas) * 100) ELSE 0 END
        )
    ), '[]'::jsonb) INTO v_result
    FROM grouped_data
    -- Se o "Demais (agrupados)" somar menos de 5, removemos para evitar dedução por exclusão
    WHERE NOT (categoria_final = 'Demais (agrupados)' AND total_pesquisadas < 5);

    RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$;
