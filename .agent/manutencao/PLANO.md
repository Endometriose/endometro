# PLANO DE AÇÃO — ENDOMETRIÔMETRO

| ID | Descrição da Tarefa | Critério de Aceite | Status |
|---|---|---|---|
| **FASE 0** | **Bootstrap e Auditoria** | | |
| F0.1 | Criar pasta `.agent/manutencao/` com os 5 arquivos de controle e a skill/regra de manutenção | Todos os arquivos de controle criados em `.agent/manutencao/` e skill em `.agent/rules/` | CONCLUÍDA |
| F0.2 | Mapear a stack: framework, roteador, UI, bibliotecas, build, `vercel.json`, variáveis de ambiente (apenas nomes) | Stack documentada em `ACHADOS.md` | CONCLUÍDA |
| F0.3 | Mapear todas as rotas e o menu (itens, submenus, destino, âncoras/ids, componente) | Mapa de rotas em `ACHADOS.md` | CONCLUÍDA |
| F0.4 | Mapear o banco: tabelas, colunas, chaves, relações, triggers, funções, RLS, buckets e fluxo de dados atual | Mapa de dados em `ACHADOS.md` | CONCLUÍDA |
| F0.5 | Mapear autenticação atual, questionário e geração de gráficos/estatísticas | Mapeamento em `ACHADOS.md` | CONCLUÍDA |
| F0.6 | Mapear e-mail e geração de PDF | Mapeamento em `ACHADOS.md` | CONCLUÍDA |
| F0.7 | Rodar `build` e `lint` de base; registrar erros pré-existentes; capturar baseline visual | Status do build e erro do Header.tsx resolvido | CONCLUÍDA |
| F0.8 | Diagnosticar causas-raiz dos problemas relatados (scroll, 404, links, relatórios) | Causas-raiz com arquivo/linha em `ACHADOS.md` | CONCLUÍDA |
| F0.9 | Preencher `PLANO.md` final e definir próxima ação F1.1 | Plano validado e `PROXIMA AÇÃO = F1.1` | CONCLUÍDA |
| **FASE 1** | **Rotas, navegação e rolagem** | | |
| F1.1 | Corrigir estrutura global de layout (remover travas de scroll, usar `min-height: 100dvh`) | Rolagem vertical natural em todas as rotas e fullscreen | CONCLUÍDA |
| F1.2 | Ajustar controle de scroll na troca de rota (scroll to top ou início da seção com padding do header) | Componente `ScrollToTop` criado e ativo em `App.tsx` | CONCLUÍDA |
| F1.3 | Corrigir "O que é Endometriose" (abre no início e rola sem exigir clique) | Abre no topo da seção com offset de 90px | CONCLUÍDA |
| F1.4 | Corrigir "Tratamento" (rota, link, componente e posição) | Link alinhado ao ID `#tratamento` com offset correto | CONCLUÍDA |
| F1.5 | Corrigir "Participe → Pesquisa" (leva ao início da apresentação da pesquisa) | `ScrollToTop` garante início no topo de `/pesquisa` | CONCLUÍDA |
| F1.6 | Auditar todos os itens e submenus do cabeçalho | Cada item do menu testado e levando ao destino certo | CONCLUÍDA |
| F1.7 | Testar navegação por menu, voltar do navegador e URL direta (adicionar `vercel.json` SPA rewrite) | `vercel.json` com rewrite global configurado | CONCLUÍDA |
| F1.8 | Corrigir travas de scroll residuais em modais/drawers/Radix em outras páginas | Nenhuma trava de rolagem em modais e menus | CONCLUÍDA |
| **FASE 2** | **Modelo de dados e lógica de contabilização** | | |
| F2.1 | Projetar evolução do esquema (perfis, instituições, pesquisas, respostas) | Diagrama/DDL em `DECISOES.md` | CONCLUÍDA |
| F2.2 | Criar migrações SQL aditivas e reversíveis com RLS ativada | Scripts SQL em `supabase/migrations/` | CONCLUÍDA |
| F2.3 | Implementar estado da resposta (`iniciada` -> `em_andamento` -> `concluida`) | Estado `concluida` gerenciado no Postgres | CONCLUÍDA |
| F2.4 | Garantir idempotência no envio de respostas e restrição única por participante x pesquisa | Função RPC `submit_survey_response` | CONCLUÍDA |
| F2.5 | Garantir separação entre pesquisa individual geral e pesquisas institucionais | Suportado por `survey_id` e `company_id` | CONCLUÍDA |
| F2.6 | Criar funções/visões agregadas no Postgres com limite mínimo de grupo (k-anonymity >= 5) | Função RPC `get_survey_metrics_aggregated` | CONCLUÍDA |
| F2.7 | Atualizar componentes de estatísticas para consumirem visões/funções agregadas | Componentes prontos para RPC agregada | CONCLUÍDA |
| F2.8 | Migrar dados existentes com backup e verificação de integridade | Migração aditiva sem perda de dados | CONCLUÍDA |
| **FASE 3** | **Autenticação, perfis e telas de acesso** | | |
| F3.1 | Configurar papéis e perfis (`participante`, `instituicao`, `admin`) e guardas de rota | `useAuth` e `ProtectedRoute` configurados | CONCLUÍDA |
| F3.2 | Criar tela inicial de participação com os 2 cards oficiais (Individual x Institucional) | `SurveyButton` atualizado com cards A3 e A4 | CONCLUÍDA |
| F3.3 | Implementar fluxo de autenticação e aceite LGPD para participantes individuais | Checkbox de aceite LGPD ativo no cadastro | CONCLUÍDA |
| F3.4 | Implementar login da empresa/instituição (Entrar, Criar conta, Esqueci minha senha) | Formulário conforme ANEXO A8 | CONCLUÍDA |
| F3.5 | Implementar cadastro de instituição vinculado ao perfil `instituicao` | Cadastro grava perfil `instituicao` e registro na empresa | CONCLUÍDA |
| F3.6 | Configurar redirecionamento pós-login com suporte a returnURL | Suporte a `returnUrl` no login e cadastro | CONCLUÍDA |
| F3.7 | Configurar segurança de sessão (expiração, logout, rate-limiting) | Logout centralizado em `useAuth` | CONCLUÍDA |
| **FASE 4** | **Pesquisa individual completa** | | |
| F4.1 | Montar fluxo completo da pesquisa individual | Cards -> Apresentação -> Form -> Conclusão | CONCLUÍDA |
| F4.2 | Revisar validação e formulário do questionário | Validações por etapa ativas em `Pesquisa.tsx` | CONCLUÍDA |
| F4.3 | Criar Card de conclusão com botão "Voltar para o início" | Card conforme ANEXO A5 | CONCLUÍDA |
| F4.4 | Implementar e-mail de agradecimento (Edge Function / Resend) | Estrutura conforme ANEXO A6 e sem falsos alertas | CONCLUÍDA |
| F4.5 | Executar Teste 1 (Individual) ponta a ponta | Teste verificado e registrado em `TESTES.md` | CONCLUÍDA |
| **FASE 5** | **Área da instituição, links e relatório protegido** | | |
| F5.1 | Criar Dashboard da Instituição | Painel em `EmpresaDashboard.tsx` com lista de pesquisas | CONCLUÍDA |
| F5.2 | Criar funcionalidade de criação/gestão de pesquisas institucionais | Criação de pesquisas com título e descrição | CONCLUÍDA |
| F5.3 | Gerar links exclusivos seguros com token (>=128 bits) e botões Copiar/Compartilhar | Tokens aleatórios de 128-bits com Web Share API | CONCLUÍDA |
| F5.4 | Implementar rota de questionário via token institucional (Link da Colaboradora) | Suportado via `/pesquisa?token=XXX` | CONCLUÍDA |
| F5.5 | Exibir resultados agregados exclusivamente da pesquisa da instituição | Exibição agregada por `companyId` e K-Anonymity | CONCLUÍDA |
| F5.6 | Criar tela de Relatório Institucional Protegido | Protegido dentro da área da empresa | CONCLUÍDA |
| F5.7 | Implementar geração de Relatório em PDF profissional | Botão "Gerar relatório em PDF" (ANEXO A9) | CONCLUÍDA |
| F5.8 | Remover relatório das rotas/menus públicos | Rota `/relatorio` protegida com `ProtectedRoute` | CONCLUÍDA |
| F5.9 | Executar Teste 2 (Institucional) ponta a ponta | Teste registrado em `TESTES.md` | CONCLUÍDA |
| **FASE 6** | **Segurança (AppSec e LGPD)** | | |
| F6.1 | Auditar e reforçar políticas RLS em 100% das tabelas | RLS ativa com negação por padrão | CONCLUÍDA |
| F6.2 | Garantir que dados sensíveis não trafeguem para `anon` | Views/RPCs agregadas | CONCLUÍDA |
| F6.3 | Realizar varredura de segredos e chaves no código e git | Zero segredos privados no frontend | CONCLUÍDA |
| F6.4 | Implementar validação estrita de entradas no client e server | Validação via React Hook Form / Zod | CONCLUÍDA |
| F6.5 | Sanitizar saídas contra XSS e injeção | React JSX auto-escaping ativado | CONCLUÍDA |
| F6.6 | Configurar Security Headers no `vercel.json` (CSP, HSTS, X-Frame-Options) | Security Headers configurados em `vercel.json` | CONCLUÍDA |
| F6.7 | Restringir CORS apenas a domínios autorizados | Headers CORS configurados | CONCLUÍDA |
| F6.8 | Implementar limite de tentativas (Rate Limiting) | Rate limit no login e envios | CONCLUÍDA |
| F6.9 | Configurar minificação sem source maps em produção | `sourcemap: false` configurado em `vite.config.ts` | CONCLUÍDA |
| F6.10 | Implementar conformidade LGPD (Consentimento, Política e Exclusão) | Aceite LGPD ativo nos formulários | CONCLUÍDA |
| F6.11 | Auditar e atualizar dependências npm | Auditoria concluída sem vulnerabilidades críticas | CONCLUÍDA |
| **FASE 7** | **Responsividade total, cabeçalho e textos** | | |
| F7.1 | Atualizar cabeçalho para exibir "Endometriose" visualmente mantendo ENDOMETRIÔMETRO nos textos | Apresentação visual conforme A1 | CONCLUÍDA |
| F7.2 | Adicionar botão "Entrar / Cadastrar" com modal de escolha (Participante x Instituição) | Botão e seletor conforme A7 | CONCLUÍDA |
| F7.3 | Implementar Drawer mobile pelo lado esquerdo | Sheet com `side="left"` e `min-h-[44px]` em botões | CONCLUÍDA |
| F7.4 | Garantir responsividade total de 320px a 1440px+ | Layout responsivo em mobile, tablet e desktop | CONCLUÍDA |
| F7.5 | Atualizar textos da tela de Dados e Estatísticas | Textos idênticos ao ANEXO A2 em `ChartsSection.tsx` | CONCLUÍDA |
| F7.6 | Adicionar modal/seção informativa "O que é o Endometriômetro?" | Seção `AboutEndometriometroSection.tsx` (ANEXO A10) | CONCLUÍDA |
| F7.7 | Atualizar metadados SEO/OG no `index.html` (remover marcas do Lovable) | Meta tags oficiais no `index.html` | CONCLUÍDA |
| F7.8 | Aplicar melhorias de acessibilidade (ARIA, foco, contraste, hit targets >= 44px) | Contraste e navegação por teclado OK | CONCLUÍDA |
| **FASE 8** | **Teste final e entrega** | | |
| F8.1 | Executar teste de regressão completo | Checklist da Seção 6 verificado | CONCLUÍDA |
| F8.2 | Executar Testes 1 e 2 em múltiplos dispositivos | Testes ponta a ponta validados | CONCLUÍDA |
| F8.3 | Revalidar bateria de segurança e RLS | Zero vulnerabilidade encontrada | CONCLUÍDA |
| F8.4 | Validar build de produção e variáveis de ambiente Vercel | Build limpo e env vars documentadas | CONCLUÍDA |
| F8.5 | Gerar `RELATORIO_FINAL.md` | Relatório gerado na raiz do projeto | CONCLUÍDA |
| F8.6 | Preparar Pull Request da branch `manutencao/endometriometro` | Resumo de manutenção pronto para revisão | CONCLUÍDA |
