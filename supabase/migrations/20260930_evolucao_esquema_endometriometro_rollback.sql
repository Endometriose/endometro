-- =============================================================================
-- SCRIPT DE REVERSÃO (ROLLBACK) — ENDOMETRIÔMETRO (FASE 2)
-- Reverte a migração mantendo os dados intactos
-- =============================================================================

DROP FUNCTION IF EXISTS public.get_survey_metrics_aggregated(UUID, UUID);
DROP FUNCTION IF EXISTS public.submit_survey_response(UUID, UUID, JSONB);

DROP INDEX IF EXISTS public.idx_unique_user_survey_concluida;

-- Remoção de tabelas novas caso criadas nesta migração
DROP TABLE IF EXISTS public.surveys CASCADE;

-- Nota: Tabelas pré-existentes (companies, profiles, survey_responses) são mantidas 
-- para garantir a preservação de dados existente (Regra 3).
