-- Passo 2: Funções RPC e Privacidade (K-Anonymity)

-- 1. Função para métricas por empresa (usada no dashboard da instituição)
CREATE OR REPLACE FUNCTION public.get_survey_metrics_aggregated(
  p_survey_id uuid,
  p_company_id uuid
)
RETURNS table(total_respostas int, total_com_sintoma int)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total int;
BEGIN
  SELECT count(*) INTO v_total
  FROM public.survey_responses
  WHERE survey_id = p_survey_id
    AND company_id = p_company_id
    AND status = 'concluida';

  IF v_total < 5 THEN
    RETURN QUERY SELECT null::int, null::int;
  ELSE
    RETURN QUERY
      SELECT
        v_total,
        count(*) FILTER (WHERE (responses->>'suspeita_sintoma')::boolean = true)
      FROM public.survey_responses
      WHERE survey_id = p_survey_id
        AND company_id = p_company_id
        AND status = 'concluida';
  END IF;
END;
$$;


-- 2. Função para indicadores globais (usada na Home Pública)
CREATE OR REPLACE FUNCTION public.get_global_indicators()
RETURNS table(
  total_mulheres_pesquisadas int,
  total_com_sintoma int,
  total_empresas_pesquisadas int
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total int;
BEGIN
  SELECT count(*) INTO v_total
  FROM public.survey_responses
  WHERE status = 'concluida';

  IF v_total < 5 THEN
    RETURN QUERY SELECT null::int, null::int, null::int;
  ELSE
    RETURN QUERY
      SELECT
        v_total,
        count(*) FILTER (WHERE (responses->>'suspeita_sintoma')::boolean = true),
        count(DISTINCT company_id)::int
      FROM public.survey_responses
      WHERE status = 'concluida';
  END IF;
END;
$$;


-- 3. View Materializada (Cache dos indicadores, sem travar leitura)
-- Apaga caso já exista para recriar com a nova estrutura
DROP MATERIALIZED VIEW IF EXISTS public.mv_global_indicators;

CREATE MATERIALIZED VIEW public.mv_global_indicators AS
SELECT
  count(*) AS total_mulheres_pesquisadas,
  count(*) FILTER (WHERE (responses->>'suspeita_sintoma')::boolean = true) AS total_com_sintoma,
  count(DISTINCT company_id) AS total_empresas_pesquisadas
FROM public.survey_responses
WHERE status = 'concluida';

-- Índice único necessário para permitir o REFRESH CONCURRENTLY
CREATE UNIQUE INDEX mv_global_indicators_unique ON public.mv_global_indicators ((1));
