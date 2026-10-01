# RELATÓRIO COMPLETO DE ACHADOS E AUDITORIA DE CÓDIGO (FASE 0)

## 1. MAPA DA STACK TECNOLÓGICA (F0.2)
- **Framework Frontend:** React 18.3.1 (Vite 5.4.19 + TypeScript 5.8.3)
- **UI Components:** TailwindCSS 3.4.17 + Radix UI primitives + Lucide React icons + Sonner/Toaster
- **Gerenciamento de Estado / Fetching:** @tanstack/react-query 5.83.0
- **Roteamento:** react-router-dom 6.30.1 (SPA client-side router)
- **Gráficos:** Recharts 2.15.4
- **Backend / Banco / Auth:** Supabase (`@supabase/supabase-js` 2.105.1)
- **Variáveis de Ambiente:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- **Build / Lint / Testes:** Vite + ESLint 9 + Vitest 3.2.4

## 2. MAPA DE ROTAS E NAVEGAÇÃO (F0.3)
- `/` -> `src/pages/Index.tsx` (Home com Header, HeroCore, ChartsSection, SurveyButton, EducativoSection, RelatosSection, Footer)
- `/login` -> `src/pages/Login.tsx` (Autenticação individual / empresa)
- `/pesquisa` -> `src/pages/Pesquisa.tsx` (Questionário da pesquisa com múltiplos passos)
- `/relatorio` -> `src/pages/RelatorioIndividual.tsx` (Relatório atualmente público — deve ser movido para área protegida)
- `/dashboard` -> `src/pages/Dashboard.tsx` (Redirecionamento / dashboard)
- `/banco-de-dados` -> `src/pages/EmpresaDashboard.tsx` (Dashboard institucional / exportação de dados)
- `*` -> `src/pages/NotFound.tsx` (404)

### Âncoras do Menu (`/ #id`):
- `#sobre` -> Seção EducativoSection
- `#sintomas` -> Card Sintomas em EducativoSection
- `#tratamento` -> Card Tratamento em EducativoSection
- `#relatos` -> Seção RelatosSection
- `#duvidas` -> Mapeado para `#relatos` em Header.tsx
- `#graficos` -> Seção ChartsSection
- `#impacto` -> Mapeado para `#graficos`
- `#contato` -> Footer

## 3. MAPA DO BANCO DE DADOS SUPABASE (F0.4)
Tabelas e colunas identificadas no código:
- `profiles`: `id` (UUID reference auth.users), `full_name`, `email`, `role`, `company_id`, `created_at`
- `companies`: `id` (UUID), `name`, `cnpj_or_identifier`, `contact_email`, `created_at`
- `survey_responses`: `id` (UUID), `user_id` (opcional), `responses` (JSONB), `created_at`, `status`
- `testimonials`: `id` (UUID), `author_name`, `content`, `approved`, `created_at`
- `chat_history`: `id` (UUID), `user_id`, `message`, `sender`, `timestamp`

Fluxo atual: `Usuário -> Login -> Responde Pesquisa -> Grava survey_responses (JSONB) -> Exibe ChartsSection`.

## 4. AUDITORIA DE SERVIÇOS AUXILIARES (F0.6)
- **E-mail:** Nenhum provedor de e-mail integrado (ausência de Edge Functions / SMTP / Resend). Será estruturado na Fase 4.
- **PDF:** Nenhuma biblioteca de geração de PDF configurada. Será adicionada na Fase 5 (ex.: `jsPDF` / `@react-pdf/renderer` / print CSS).

## 5. ERROS ENCONTRADOS E DIAGNÓSTICO DE CAUSAS-RAIZ (F0.7 & F0.8)
1. **Erro de Build no Header (Resolvido):**
   - *Sintoma:* `ERROR: Multiple exports with the same name "default"` em `Header.tsx`.
   - *Causa-Raiz:* O arquivo continha uma declaração `export default Header;` duplicada na linha 151.
   - *Resolução:* Corrigido na Fase 0.
2. **404 ao atualizar (F5) em rotas profundas na Vercel:**
   - *Causa-Raiz:* Faltava `vercel.json` com reescritas do SPA para `index.html`.
3. **Rolagem desordenada ao clicar em "Participe -> Pesquisa":**
   - *Causa-Raiz:* O link `/pesquisa` apontava para a página e o formulário dava auto-foco no final ou rolava direto.
4. **Relatório PÚBLICO em `/relatorio`:**
   - *Causa-Raiz:* A rota `/relatorio` renderizava diretamente sem checagem de perfil ou sessão do Supabase.
