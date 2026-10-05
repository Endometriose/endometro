-- Migração Aditiva - FASE 2B: Camada de Agregação de Gráficos Dinâmicos
-- Implementa a regra F2B.2 (função get_indicadores)

CREATE OR REPLACE FUNCTION public.get_indicadores(p_escopo text, p_survey_id uuid DEFAULT NULL, p_incluir_teste boolean DEFAULT false)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_total_concluidas int;
    v_suficiente boolean;
    v_company_id uuid;
    
    v_prevalencia jsonb;
    v_sintomas jsonb;
    v_idade jsonb;
    v_produtividade jsonb;
    
    v_result jsonb;
BEGIN
    -- 1. Validações de Escopo e Segurança RLS em nível de função
    IF p_escopo = 'pesquisa' THEN
        IF p_survey_id IS NULL THEN
            RAISE EXCEPTION 'survey_id é obrigatorio para escopo de pesquisa';
        END IF;
        
        -- Segurança: Somente a instituição dona pode ver sua própria pesquisa
        SELECT company_id INTO v_company_id FROM public.surveys WHERE id = p_survey_id;
        IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND company_id = v_company_id AND role = 'instituicao') THEN
            RAISE EXCEPTION 'Acesso negado: voce nao possui permissao para visualizar agregados desta pesquisa.';
        END IF;
    ELSIF p_escopo != 'geral' THEN
        RAISE EXCEPTION 'Escopo invalido. Use "geral" ou "pesquisa".';
    END IF;

    -- 2. Contar total de respostas para aplicar K-Anonymity
    SELECT COUNT(*) INTO v_total_concluidas
    FROM public.survey_responses
    WHERE status = 'concluida'
      AND (p_escopo = 'geral' OR survey_id = p_survey_id)
      AND (p_incluir_teste OR is_teste IS NOT TRUE);

    -- Limite de K-Anonymity (minimo de 5 respostas para proteger privacidade)
    v_suficiente := v_total_concluidas >= 5;

    IF NOT v_suficiente THEN
        RETURN jsonb_build_object(
            'total_concluidas', v_total_concluidas,
            'suficiente', false,
            'atualizado_em', now()
        );
    END IF;

    -- 3. Calcular agregados (somente se k-anonymity aprovado)

    -- G1: Prevalência (Baseado no campo 'diagnostico')
    SELECT jsonb_build_array(
        jsonb_build_object('name', 'Com endometriose', 'value', COUNT(*) FILTER (WHERE responses->>'diagnostico' = 'Sim')),
        jsonb_build_object('name', 'Sem endometriose', 'value', COUNT(*) FILTER (WHERE responses->>'diagnostico' IN ('Não', 'Em investigação')))
    ) INTO v_prevalencia
    FROM public.survey_responses
    WHERE status = 'concluida' AND (p_escopo = 'geral' OR survey_id = p_survey_id)
      AND (p_incluir_teste OR is_teste IS NOT TRUE);

    -- G2: Sintomas (Desenrola o array 'sintomas' e conta frequencia)
    SELECT COALESCE(jsonb_agg(jsonb_build_object('name', sintoma, 'total', qtd)), '[]'::jsonb) INTO v_sintomas
    FROM (
        SELECT s.sintoma, COUNT(*) as qtd
        FROM public.survey_responses sr,
             jsonb_array_elements_text(sr.responses->'sintomas') as s(sintoma)
        WHERE sr.status = 'concluida' AND (p_escopo = 'geral' OR sr.survey_id = p_survey_id)
          AND (p_incluir_teste OR sr.is_teste IS NOT TRUE)
        GROUP BY s.sintoma
        ORDER BY qtd DESC
    ) sub;

    -- G5: Idade (Agrupa por campo 'idade')
    SELECT COALESCE(jsonb_agg(jsonb_build_object('name', idade, 'value', qtd)), '[]'::jsonb) INTO v_idade
    FROM (
        SELECT sr.responses->>'idade' as idade, COUNT(*) as qtd
        FROM public.survey_responses sr
        WHERE sr.status = 'concluida' AND (p_escopo = 'geral' OR sr.survey_id = p_survey_id)
          AND sr.responses->>'idade' IS NOT NULL
          AND (p_incluir_teste OR sr.is_teste IS NOT TRUE)
        GROUP BY sr.responses->>'idade'
    ) sub;

    -- G3: Produtividade (Média extraindo apenas digitos numéricos)
    SELECT jsonb_build_array(
        jsonb_build_object(
            'name', 'Horas Mês c/ Dor (Presenteísmo)', 
            'valor', COALESCE(AVG(NULLIF(regexp_replace(sr.responses->>'horasAusencia', '[^0-9.]', '', 'g'), '')::numeric), 0)::numeric(10,1)
        ),
        jsonb_build_object(
            'name', 'Dias Atestado/Ano (Absenteísmo)', 
            'valor', COALESCE(AVG(NULLIF(regexp_replace(sr.responses->>'diasAtestado', '[^0-9.]', '', 'g'), '')::numeric), 0)::numeric(10,1)
        )
    ) INTO v_produtividade
    FROM public.survey_responses sr
    WHERE sr.status = 'concluida' AND (p_escopo = 'geral' OR sr.survey_id = p_survey_id)
      AND sr.responses->>'trabalha' = 'Sim'
      AND (p_incluir_teste OR sr.is_teste IS NOT TRUE);

    -- 4. Construir resposta final JSON
    v_result := jsonb_build_object(
        'total_concluidas', v_total_concluidas,
        'suficiente', true,
        'atualizado_em', now(),
        'prevalencia', v_prevalencia,
        'sintomas', v_sintomas,
        'idade', v_idade,
        'produtividade', v_produtividade
    );

    RETURN v_result;
END;
$$;
