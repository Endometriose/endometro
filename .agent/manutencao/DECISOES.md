# REGISTRO DE DECISÕES DE ARQUITETURA E NEGÓCIO

## DECISÃO 001 — Estrutura de Controle do Agente (Manutenção Continuada)
- **Data:** 2026-09-30
- **Contexto:** Garantir que a execução seja autônoma, rastreável e auditável por fases.
- **Decisão:** Adotada a estrutura padronizada `.agent/manutencao/` contendo os 5 arquivos de controle (`PLANO.md`, `PROGRESSO.md`, `ACHADOS.md`, `DECISOES.md`, `TESTES.md`) e a regra de workspace `.agent/rules/manutencao-endometriometro.md`.

## DECISÃO 002 — Separação de Identidade e Respostas (LGPD & K-Anonymity)
- **Data:** 2026-09-30
- **Contexto:** Trata-se de dados sensíveis de saúde e rotina de trabalho de mulheres e pessoas que menstruam.
- **Decisão:** Manter a identificação do participante (para prevenir duplicidade) isolada do payload de respostas em tabelas separadas. Todo dashboard estatístico consumirá apenas views/RPCs agregadas com k-anonymity >= 5.

## DECISÃO 003 — Reescrever SPA em Vercel via vercel.json
- **Data:** 2026-09-30
- **Contexto:** Links diretos enviados para participantes/colaboradoras em WhatsApp/E-mail geram 404 em plataformas SPA se a Vercel não souber redirecionar para `index.html`.
- **Decisão:** Adicionar `vercel.json` com regra de rewrite global `"source": "/(.*)", "destination": "/index.html"`.

## DECISÃO 004 — Modelo de Dados de Pesquisas e Respostas (Fase 2)
- **Data:** 2026-09-30
- **Contexto:** Suportar pesquisas individuais e institucionais sem misturar dados entre empresas e impedindo respostas duplicadas.
- **Decisão:** 
  1. Adicionada a tabela `surveys` para gerenciar pesquisas gerais e institucionais com tokens únicos de 128-bits.
  2. Adicionados campos `survey_id`, `company_id`, `status` (`iniciada` | `em_andamento` | `concluida`) e `completed_at` em `survey_responses`.
  3. Criada a RPC `submit_survey_response` para inserção atômica e idempotente.
  4. Criada a RPC `get_survey_metrics_aggregated` com barreira K-Anonymity >= 5 para impedir a reidentificação de participantes.

## DECISÃO 005 — Substituição da tarefa F2.7 pela FASE 2B (Gráficos Dinâmicos)
- **Data:** 2026-10-05
- **Contexto:** A tarefa F2.7 original era insuficiente para cobrir a complexidade de transformar os 6 gráficos estáticos em dinâmicos, lidando com agregação, RLS, auto-update e tratamento de dados ausentes (k-anonymity).
- **Decisão:** Inserida a FASE 2B completa a pedido do usuário. Ela expande a F2.7 em 10 tarefas detalhadas (F2B.0 a F2B.9), garantindo que nenhum gráfico use mocks e que a lógica do questionário seja rigorosamente espelhada no banco de dados e UI.

## DECISÃO 006 — FASE 2C inserida a pedido do usuário
- **Data:** 2026-10-05
- **Contexto:** Os gráficos ficam zerados por falta de respostas reais. A FASE 2C cria um conjunto pequeno, fictício, determinístico e removível de dados de teste para popular os gráficos e validar o sistema end-to-end.
- **Decisão:** Inserida FASE 2C após a 2B. Tarefas S0 a S7 adicionadas ao PLANO.md. Registrar "FASE 2C CONCLUÍDA" no PROGRESSO.md ao término e retomar o plano original.

## DECISÃO 007 — Inserção direta no seed em vez de usar submit_survey_response
- **Data:** 2026-10-05
- **Contexto:** A função `submit_survey_response` (F2.4) usa `auth.uid()` internamente, exigindo um usuário logado por requisição. Criar 30 sessões de auth para o seed seria excessivo e frágil.
- **Decisão:** O seed usa `service_role_key` via Admin API para inserir diretamente em `survey_responses` com o mesmo schema JSONB e `status='concluida'`. O mesmo schema de validação é respeitado manualmente. Risco: se o schema JSONB mudar, o seed pode gerar dados inconsistentes. Mitigação: o script é idempotente e pode ser removido e reaplicado com `npm run seed:remove` + `npm run seed:apply`.

## DECISÃO 008 — Quantidade de individuais adotada: 20 (4 bairros × 5)
- **Data:** 2026-10-05
- **Contexto:** O prompt original mencionou "10 mulheres individuais" e ao mesmo tempo "5 por bairro" em 4 bairros (= 20). Valores contraditórios.
- **Decisão:** Adotado 20 (4 × 5) para satisfazer o limite de k-anonymity ≥ 5 por bairro. Quantidade parametrizável via `SEED_INDIVIDUAIS_POR_BAIRRO` no `.env.seed.local`.

## DECISÃO 009 — Campo bairro já existe no questionário
- **Data:** 2026-10-05
- **Contexto:** O prompt da FASE 2C previa a necessidade de adicionar campo `bairro` ao questionário.
- **Decisão:** Verificado que `bairro` JÁ é coletado em `Pesquisa.tsx` (linha 64) e gravado no JSONB `responses`. Não foi necessária coluna adicional nem alteração no formulário.

## DECISÃO 010 — FASE 2D inserida a pedido do usuário
- **Data:** 2026-10-05
- **Contexto:** Os gráficos atuais usavam valores fixos em alguns eixos, divergiam dos relatórios do seed e não refletiam o novo wireframe focado em Donut Charts e distinção Individual vs Empresa.
- **Decisão:** Inserida a FASE 2D completa no PLANO.md para recriar as funções SQL e transformar os componentes visuais.
