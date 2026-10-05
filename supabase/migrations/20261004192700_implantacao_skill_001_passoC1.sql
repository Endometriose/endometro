-- Passo C1: Função RPC para métricas agregadas filtradas por bairro (K-Anonymity aplicado)

CREATE OR REPLACE FUNCTION public.get_company_responses_by_bairro(
  p_company_id uuid,
  p_bairro text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total int;
  v_min_k int := 5;
BEGIN
  SELECT count(*) INTO v_total
  FROM public.survey_responses
  WHERE company_id = p_company_id
    AND status = 'concluida'
    AND (
      p_bairro IS NULL
      OR p_bairro = ''
      OR (responses->>'bairro') ILIKE p_bairro
    );

  IF v_total < v_min_k THEN
    RETURN jsonb_build_object(
      'k_anonymity_satisfied', false,
      'total', v_total,
      'min_required', v_min_k,
      'message', 'Dados insuficientes para exibição (mínimo de 5 respostas necessárias).'
    );
  END IF;

  RETURN jsonb_build_object(
    'k_anonymity_satisfied', true,
    'total', v_total,
    'bairro_filtro', p_bairro,
    'metricas', (
      SELECT jsonb_build_object(
        'total_respostas', count(*),
        'alta_probabilidade', count(*) FILTER (WHERE (responses->>'resultado') ILIKE '%Alta%'),
        'moderada_probabilidade', count(*) FILTER (WHERE (responses->>'resultado') ILIKE '%Moderada%'),
        'baixa_probabilidade', count(*) FILTER (WHERE (responses->>'resultado') ILIKE '%Baixa%'),
        'media_intensidade_dor', round(avg((responses->>'intensidadeDor')::numeric), 1),
        'trabalham', count(*) FILTER (WHERE (responses->>'trabalha') = 'Sim'),
        'media_horas_ausencia', round(avg((responses->>'horasAusencia')::numeric) FILTER (WHERE (responses->>'horasAusencia') IS NOT NULL AND (responses->>'horasAusencia') != ''), 1),
        'bairros_disponiveis', (
          SELECT jsonb_agg(DISTINCT responses->>'bairro')
          FROM public.survey_responses
          WHERE company_id = p_company_id
            AND status = 'concluida'
            AND (responses->>'bairro') IS NOT NULL
            AND (responses->>'bairro') != ''
        )
      )
      FROM public.survey_responses
      WHERE company_id = p_company_id
        AND status = 'concluida'
        AND (
          p_bairro IS NULL
          OR p_bairro = ''
          OR (responses->>'bairro') ILIKE p_bairro
        )
    )
  );
END;
$$;
