-- FASE 2C — S1: Marcadores de Teste e Campos Aditivos
-- Migration aditiva e reversível — sem risco para dados reais existentes

-- ============================================================
-- 1. MARCADORES DE TESTE em survey_responses
-- ============================================================
ALTER TABLE public.survey_responses
    ADD COLUMN IF NOT EXISTS is_teste     BOOLEAN     NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS seed_lote    TEXT;

-- Índice para deletar em batch de forma eficiente
CREATE INDEX IF NOT EXISTS idx_seed_lote ON public.survey_responses (seed_lote)
    WHERE seed_lote IS NOT NULL;


-- ============================================================
-- 2. MARCADOR DE TESTE em companies (instituição de teste)
-- ============================================================
ALTER TABLE public.companies
    ADD COLUMN IF NOT EXISTS is_teste     BOOLEAN     NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS seed_lote    TEXT,
    -- Campos da instituição que faltavam no schema original
    ADD COLUMN IF NOT EXISTS cnpj         TEXT,
    ADD COLUMN IF NOT EXISTS bairro       TEXT,
    ADD COLUMN IF NOT EXISTS cidade       TEXT,
    ADD COLUMN IF NOT EXISTS uf           TEXT;

-- ============================================================
-- 3. MARCADOR DE TESTE em profiles (usuário participante fictício)
-- ============================================================
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS is_teste     BOOLEAN     NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS seed_lote    TEXT;

-- ============================================================
-- 4. CAMPO BAIRRO em survey_responses (para agregação por bairro)
--    O campo responses JSONB já contém bairro (gravado pelo Pesquisa.tsx)
--    mas adicionamos como coluna indexada para queries eficientes
-- ============================================================
-- (bairro já está dentro do responses JSONB — não duplicar como coluna;
--  a RPC get_indicadores lê responses->>'bairro' diretamente)

-- ============================================================
-- 5. RLS — garantir que dados de teste NÃO vazem para anônimos
-- ============================================================

-- Participante só vê respostas próprias e não-teste (ou as suas próprias de teste)
DROP POLICY IF EXISTS "Responses user read" ON public.survey_responses;
CREATE POLICY "Responses user read" ON public.survey_responses
    FOR SELECT USING (auth.uid() = user_id);

-- Bloquear listagem pública de respostas de teste
DROP POLICY IF EXISTS "Block test data public" ON public.survey_responses;
CREATE POLICY "Block test data public" ON public.survey_responses
    FOR SELECT
    USING (
        -- anônimos não veem nada (RLS já bloqueia via outras policies)
        -- usuário autenticado só vê as próprias
        auth.uid() = user_id
        OR
        -- service_role ultrapassa (necessário para o seed script)
        current_setting('role') = 'service_role'
    );

-- ============================================================
-- 6. ROLLBACK SEGURO (executar manualmente se necessário)
-- ============================================================
-- ALTER TABLE public.survey_responses DROP COLUMN IF EXISTS is_teste;
-- ALTER TABLE public.survey_responses DROP COLUMN IF EXISTS seed_lote;
-- ALTER TABLE public.companies DROP COLUMN IF EXISTS is_teste;
-- ALTER TABLE public.companies DROP COLUMN IF EXISTS seed_lote;
-- ALTER TABLE public.companies DROP COLUMN IF EXISTS cnpj;
-- ALTER TABLE public.companies DROP COLUMN IF EXISTS bairro;
-- ALTER TABLE public.companies DROP COLUMN IF EXISTS cidade;
-- ALTER TABLE public.companies DROP COLUMN IF EXISTS uf;
-- ALTER TABLE public.profiles DROP COLUMN IF EXISTS is_teste;
-- ALTER TABLE public.profiles DROP COLUMN IF EXISTS seed_lote;
