-- Passo 1: Ajustes no schema

-- Adicionar as colunas company_id e role caso elas ainda não existam na tabela profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_id UUID;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'participante' CHECK (role IN ('participante', 'instituicao', 'admin'));

-- company_id nulo (não "zero") quando a pessoa não tem empresa vinculada
ALTER TABLE public.profiles ALTER COLUMN company_id DROP NOT NULL;

-- Adicionar a chave estrangeira (ignora erro se já existir usando um bloco DO)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'profiles_company_id_fkey') THEN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL;
    END IF;
END $$;

-- survey_id obrigatório em toda resposta
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS survey_id UUID;
ALTER TABLE public.survey_responses ALTER COLUMN survey_id SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'survey_responses_survey_id_fkey') THEN
        ALTER TABLE public.survey_responses ADD CONSTRAINT survey_responses_survey_id_fkey FOREIGN KEY (survey_id) REFERENCES public.surveys(id);
    END IF;
END $$;

-- Uma resposta por pessoa, por pesquisa
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'survey_responses_unique_per_survey') THEN
        ALTER TABLE public.survey_responses ADD CONSTRAINT survey_responses_unique_per_survey UNIQUE (user_id, survey_id);
    END IF;
END $$;

-- RLS — quem pode ler o quê
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

-- Limpar policies antigas para recriar
DROP POLICY IF EXISTS "Participante vê só a própria resposta" ON public.survey_responses;
DROP POLICY IF EXISTS "Empresa vê só respostas vinculadas a ela" ON public.survey_responses;

CREATE POLICY "Participante vê só a própria resposta" ON public.survey_responses FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Empresa vê só respostas vinculadas a ela" ON public.survey_responses FOR SELECT USING (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE id = auth.uid() AND role = 'instituicao'
  )
);
