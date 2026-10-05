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

## 6. AUDITORIA DOS GRÁFICOS E ESTATÍSTICAS (FASE 2B - F2B.0 / F2B.1)
Análise do componente `ChartsSection.tsx` e dos dados gravados em `Pesquisa.tsx` (`payload` no campo JSONB `responses`).

| Gráfico | Fonte Atual (ChartsSection) | Pergunta no Questionário (`Pesquisa.tsx`) | Classificação (F2B.0) | Comentário / Hipótese de Cálculo (F2B.1) |
|---|---|---|---|---|
| **G1 Prevalência** | `prevalenceData` (lê de `diagnostico` c/ fallback fixo 15/85) | "Já possui diagnóstico formal prévio?" (`diagnostico`: Sim / Em investigação / Não) | **Tipo A** | % de `Sim` vs (`Não` + `Em investigação`). Falta garantir regra "só status=concluida". |
| **G2 Sintomas** | `symptomsData` (array fixo) | "Marque situações e sintomas..." (`sintomas`: array de strings) | **Tipo A** | Contagem/Total de cada sintoma. Será preciso parear as chaves (`colica_intensa`, etc) com os rótulos do gráfico. |
| **G3 Impacto (Produtividade)** | `productivityData` (array fixo) | "Média de horas/mês com dor" (`horasAusencia`) e "Dias de atestado" (`diasAtestado`) | **Tipo A / Parcial** | Presenteísmo vem de `horasAusencia` (média). Absenteísmo pode ser estimado por `diasAtestado` * 8h, ou exibido em dias. |
| **G4 Atraso Diagnóstico** | `diagnosisDelayData` (array fixo) | **Nenhuma** (não há pergunta sobre quando começaram os sintomas ou quando confirmou) | **Tipo C** | O indicador será ativado quando a pergunta correspondente fizer parte do questionário. |
| **G5 Faixa Etária** | `ageDistributionData` (array fixo) | "Sua Faixa Etária" (`idade`: Menos de 18, 18-24, 25-34, 35-44, 45-54, 55+) | **Tipo A** | Agrupamento por faixa selecionada, calculando %. |
| **G6 Eficácia Tratamentos** | `treatmentEfficacyData` (array fixo) | **Nenhuma** (não há pergunta sobre tratamentos realizados) | **Tipo C** | O indicador será ativado quando a pergunta correspondente fizer parte do questionário. |

**Conclusão da Auditoria:** Hoje apenas o G1 tenta ler o banco de dados. Os demais são arrays `const` que não reagem a novas respostas. G4 e G6 exigirão aviso de "Aguardando pergunta". G3 precisará de uma conversão de dias para horas ou aviso.

## 7. AUDITORIA FASE 2C — SEED (S0)

Payload real do questionario gravado como JSONB com campos: idade, cidade, bairro, uf, diagnostico, sintomas (array), intensidadeDor, trabalha, impactoTrabalho, horasAusencia, diasAtestado, resultado, lgpd_aceito.
Campo bairro JA EXISTE no formulario (Pesquisa.tsx linha 64). Nao foi necessaria coluna adicional.
Insercao via service_role_key (seed bypass RLS) pois submit_survey_response exige auth.uid() — decisao registrada em DECISOES.md.
