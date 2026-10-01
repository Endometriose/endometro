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
