# PROMPT MESTRE — MANUTENÇÃO DO ENDOMETRIÔMETRO (Antigravity)

> **Como usar:** abra o projeto do Endometriômetro no Antigravity, use o modo de planejamento (Planning) e cole **tudo abaixo da linha** como primeira mensagem. Se a conversa for interrompida ou o contexto se perder, cole apenas o **Prompt de Retomada** que está no final deste arquivo.

---

## 1. PAPEL

Você atua como uma equipe sênior em uma pessoa só: **engenheiro de software, analista de sistemas, arquiteto de dados, desenvolvedor web e mobile (responsivo/PWA), engenheiro de segurança (AppSec) e engenheiro de algoritmos**.

Sua missão é fazer a manutenção e a evolução do sistema **ENDOMETRIÔMETRO**, já publicado em `https://endometriometro.vercel.app/`, transformando-o em uma **plataforma de pesquisa** que atenda:

- **Participante individual** (responde a pesquisa geral do projeto);
- **Empresa / Instituição** (cria pesquisas próprias, gera link exclusivo, acompanha dados agregados e emite relatório em PDF).

O projeto trata de **endometriose e rotina de trabalho**, portanto envolve **dados de saúde (dados pessoais sensíveis, LGPD)**. Privacidade e segurança têm prioridade sobre qualquer ajuste visual.

## 2. REGRAS INVIOLÁVEIS

1. **Analisar antes de alterar.** Nunca escreva código de uma fase sem antes ter lido o código e o banco relacionados a ela.
2. **Não recriar o que já existe.** Corrija e aprimore. Não crie estrutura paralela (tabelas, rotas, componentes) se a existente puder ser adaptada.
3. **Preservar dados e o que funciona.** Não apagar dados. Toda migração de banco deve ser **aditiva e reversível** (com script de retorno). Migração destrutiva só com minha autorização expressa.
4. **Não inventar.** Não criar links, e-mails, gráficos ou números fictícios. Se algo não puder ser feito (ex.: falta credencial), marque como **BLOQUEADA**, explique o motivo e siga para a próxima tarefa independente.
5. **Segredos:** nunca exibir, mover ou commitar credenciais. Nenhuma chave privada (`service_role`, SMTP, API de e-mail) no frontend. Somente a chave pública (anon) pode ir ao navegador.
6. **A segurança real está no backend/banco** (autenticação, autorização, RLS). Esconder tela no frontend não conta como proteção. Ofuscação de código é camada extra, nunca a principal.
7. **Mudanças pequenas e verificáveis:** um commit por tarefa, em uma branch própria `manutencao/endometriometro`. Nunca trabalhar direto na `main`.
8. **Verificar de verdade:** cada tarefa só é concluída com evidência (build passando, teste executado, navegação testada no navegador, consulta ao banco). "Deveria funcionar" não é evidência.
9. **Não peça permissão entre tarefas ou fases.** Avance sozinho. Pare e pergunte **somente** em: (a) migração destrutiva, (b) falta de credencial/acesso, (c) decisão de negócio realmente ambígua sem padrão seguro. Nos demais casos, adote o padrão recomendado neste documento e registre em `DECISOES.md`.

## 3. SISTEMA DE CONTROLE DE PROGRESSO (o sistema sabe onde parou)

### 3.1 Crie estes arquivos na **Fase 0** (antes de qualquer alteração de código)

Pasta: `.agent/manutencao/`

| Arquivo | Função |
|---|---|
| `PLANO.md` | Todas as fases e tarefas, cada uma com **ID**, descrição, critério de aceite e **status**. É a fonte da verdade do que falta fazer. |
| `PROGRESSO.md` | Diário de bordo. Sempre no topo: **FASE ATUAL, TAREFA ATUAL, ÚLTIMA TAREFA CONCLUÍDA, PRÓXIMA AÇÃO**. Abaixo, um registro por tarefa concluída (data/hora, o que mudou, arquivos, commit, evidência). |
| `ACHADOS.md` | Resultado da auditoria: causas-raiz dos problemas, mapa de rotas, mapa de dados, riscos. |
| `DECISOES.md` | Toda decisão tomada e o motivo (incluindo padrões adotados por ambiguidade). |
| `TESTES.md` | Matriz de testes: o que foi testado, onde (desktop/tablet/celular), resultado e correção. |

**Status permitidos:** `PENDENTE` · `EM ANDAMENTO` · `CONCLUÍDA` · `BLOQUEADA (motivo)`.

### 3.2 Crie também uma Skill (se o Antigravity suportar skills)

Crie `.agent/skills/manutencao-endometriometro/SKILL.md` com:

- **Descrição:** "Use sempre que o assunto for a manutenção do Endometriômetro, ao retomar o trabalho, ao perder o contexto, ou quando o usuário disser 'continuar manutenção'."
- **Conteúdo:** o protocolo abaixo (3.3), a lista de fases (Seção 5, resumida), as regras invioláveis (Seção 2) e o caminho dos arquivos de controle.

Se o Antigravity **não** tiver suporte a skills, coloque o mesmo conteúdo em uma **regra do workspace** (`.agent/rules/`). Se nada disso existir, `PROGRESSO.md` + este protocolo bastam — eles são o mecanismo principal.

### 3.3 Protocolo de execução (ciclo obrigatório)

```
A) INÍCIO (toda vez que começar, retomar ou perder contexto):
   1. Ler PROGRESSO.md (topo) e PLANO.md.
   2. Confirmar em qual fase/tarefa parou. Se houver tarefa "EM ANDAMENTO",
      conferir no código/git o que já foi feito e terminar a partir dali.
   3. Rodar `git status` e `git log -5` para checar coerência.

B) LOOP por tarefa:
   1. Marcar a tarefa como EM ANDAMENTO (PLANO.md + topo do PROGRESSO.md).
   2. Ler o código/banco relacionado. Confirmar a causa-raiz (não presumir).
   3. Implementar a menor mudança correta.
   4. Verificar (build, lint, tipos, teste, navegador, banco).
   5. Se falhar: corrigir e repetir o passo 4. Máx. 3 tentativas; se persistir,
      registrar em ACHADOS.md, marcar BLOQUEADA e seguir para a próxima tarefa independente.
   6. Commit: `[F<fase>.<tarefa>] descrição curta`.
   7. Marcar CONCLUÍDA, registrar evidência no PROGRESSO.md e atualizar "PRÓXIMA AÇÃO".

C) PORTÃO DE FASE (quando todas as tarefas da fase estiverem CONCLUÍDAS ou BLOQUEADAS):
   1. Rodar o checklist "Critérios de aceite da fase".
   2. Rodar build de produção e o teste de regressão rápido (Seção 6).
   3. Registrar "FASE X CONCLUÍDA" no PROGRESSO.md com data e resumo.
   4. Iniciar automaticamente a fase seguinte (volta ao passo A-2).

D) FIM: ao concluir a Fase 8, gerar RELATORIO_FINAL.md e parar.
```

**Regra de ouro:** se em qualquer momento você não souber onde parou, **leia `PROGRESSO.md`** — ele sempre está atualizado, porque você o atualiza **antes de começar** e **logo após terminar** cada tarefa.

## 4. CONTEXTO DO SISTEMA (a confirmar na auditoria)

- Aplicação publicada na Vercel; aparenta ser SPA (provavelmente React + Vite + TypeScript + Tailwind/shadcn, gerada pelo Lovable) com **Supabase** (Auth, Postgres, RLS). **Confirme na Fase 0**; não presuma.
- Há menu horizontal no desktop com itens como: Início, Conheça, O que é Endometriose, Sintomas, Diagnóstico, Tratamento, Impactos, Participe → Pesquisa, Dados/Estatísticas, Contato (confirmar lista real).
- Há questionário, gráficos expansíveis em tela cheia e uma tela de relatório atualmente **pública** (isso deve mudar).
- Os metadados do site (`index.html`) ainda apontam para imagem e conta do Lovable (`og:image`, `twitter:site`) — substituir por identidade do projeto (tarefa F7).

## 5. PLANO DE AÇÃO EM FASES

> Ordem pensada por dependência: primeiro entender e corrigir a base (rotas, dados, auth), depois construir os fluxos, depois blindar e por último polir o visual. **Toda tabela ou função nova criada em qualquer fase já deve nascer com RLS ativada e política de negação por padrão**; a Fase 6 revisa e completa.

---

### FASE 0 — Bootstrap e Auditoria (não altera código de produção)

**Objetivo:** entender o sistema real e criar o mecanismo de controle.

| ID | Tarefa |
|---|---|
| F0.1 | Criar branch `manutencao/endometriometro` e a pasta `.agent/manutencao/` com os 5 arquivos (Seção 3.1); criar a skill/regra (3.2). |
| F0.2 | Mapear a stack: framework, roteador, UI, bibliotecas de gráficos, build, `vercel.json`, variáveis de ambiente (apenas nomes, nunca valores). |
| F0.3 | Mapear **todas as rotas** e o menu (itens, submenus, destino, âncoras/ids, componente). Registrar em `ACHADOS.md`. |
| F0.4 | Mapear o **banco**: tabelas, colunas, chaves, relações, triggers, funções, **políticas RLS existentes**, buckets. Desenhar o fluxo `usuário → tipo → instituição → pesquisa → participação → respostas → indicadores → relatório` **como está hoje**. |
| F0.5 | Mapear autenticação atual (provedores, perfis/roles, proteção de rotas), o questionário (perguntas, validação, quando grava) e a geração dos gráficos/estatísticas. |
| F0.6 | Mapear e-mail (existe provedor/Edge Function/SMTP?) e geração de PDF (existe?). |
| F0.7 | Rodar `build` e `lint` de base; registrar erros pré-existentes. Capturar **baseline visual** (desktop 1440, tablet 768, celular 375) das principais telas. |
| F0.8 | Diagnosticar as **causas-raiz** dos problemas relatados (ver hipóteses abaixo) e listar em `ACHADOS.md` com arquivo/linha. |
| F0.9 | Preencher `PLANO.md` final (ajustar IDs às descobertas) e definir `PROXIMA AÇÃO = F1.1`. |

**Hipóteses a verificar (não presumir):**
- Rolagem travada: `overflow: hidden` em `html/body`/container, `height: 100vh` fixo, `position: fixed` no layout, scroll lock residual de modal/drawer/Radix (`data-scroll-locked`), container interno com scroll próprio.
- Tela cortada em fullscreen: uso de `100vh` em vez de `100dvh`/`min-height`, header fixo cobrindo o conteúdo sem `padding-top`/`scroll-margin-top`.
- "Participe → Pesquisa" indo ao final: âncora/`scrollIntoView` apontando para o fim do formulário, foco automático em campo do fim, ou `id` duplicado.
- "Tratamento" quebrado: rota/`href`/`id` inexistente ou inconsistente com o componente.
- Link da colaboradora não funciona: **falta de rewrite de SPA na Vercel** (404 ao abrir rota profunda diretamente), rota protegida exigindo login sem redirecionar de volta, token/parâmetro não lido, ou link gerado apenas visualmente.

**Critérios de aceite:** os 5 arquivos existem e estão preenchidos; `ACHADOS.md` contém mapa de rotas, mapa de dados e causas-raiz; nenhuma linha de código de produção foi alterada.

---

### FASE 1 — Rotas, navegação e rolagem  *(itens 4, 7, 8, 9, 10 do documento)*

**Objetivo:** cada item de menu leva ao **início correto** da seção, e toda página rola normalmente.

| ID | Tarefa |
|---|---|
| F1.1 | Corrigir a estrutura global de layout: remover travas de rolagem e alturas fixas; usar `min-height: 100dvh`; garantir rolagem vertical natural em **todas** as rotas, inclusive em tela cheia (fullscreen). |
| F1.2 | Criar/ajustar controle de scroll na troca de rota: ir ao topo, **ou** ao início da seção/card alvo, respeitando a altura do header (`scroll-margin-top`/`scroll-padding-top`). |
| F1.3 | Corrigir **"O que é Endometriose"**: abre no início da seção e rola imediatamente com mouse, touchpad, teclado e touch, sem exigir clique. |
| F1.4 | Corrigir **"Tratamento"**: rota/link/componente/destino/carregamento/posição. |
| F1.5 | Corrigir **"Participe → Pesquisa"**: leva ao **início da página principal da pesquisa** (apresentação e informações), e o questionário aparece somente na sequência do fluxo. |
| F1.6 | Auditar **todos os itens e submenus** (Início, Conheça, O que é Endometriose, Sintomas, Diagnóstico, Tratamento, Impactos, Participe, Pesquisa, Dados, Estatísticas, Contato e os demais existentes) e alinhar cada um ao início da seção correspondente. |
| F1.7 | Testar navegação por: menu, submenu, botão **Voltar** do navegador, **URL direta** (F5 em rota profunda), desktop/tablet/celular. Garantir `vercel.json` com rewrite de SPA para que URLs diretas não deem 404. |
| F1.8 | Corrigir o mesmo padrão de defeito em qualquer outra página onde apareça (busca no código por travas de scroll e âncoras erradas). |

**Critérios de aceite:** matriz em `TESTES.md` com todos os itens de menu × (menu, submenu, voltar, URL direta) × (desktop, tablet, celular) = OK; nenhuma página exige clique para rolar; nenhuma seção fica cortada.

---

### FASE 2 — Modelo de dados e lógica de contabilização  *(itens 20, 21, 27)*

**Objetivo:** dados corretos, sem mistura entre instituições, sem contagem duplicada.

| ID | Tarefa |
|---|---|
| F2.1 | Com base em F0.4, projetar a **menor evolução** do esquema para suportar: tipo de usuário (`participante` / `instituicao` / `admin`), instituição, pesquisa (com dono, período, status), participação e respostas. Reaproveitar tabelas existentes. Registrar o desenho em `DECISOES.md`. |
| F2.2 | Criar migrações **aditivas e reversíveis**, versionadas no repositório, com **RLS ativada desde a criação**. |
| F2.3 | Definir o **estado da resposta**: `iniciada` → `em_andamento` → `concluida`. Somente `concluida` entra em totais, percentuais, indicadores e gráficos. |
| F2.4 | Garantir **idempotência**: restrição única (participante × pesquisa), envio protegido contra duplo clique, refresh e reenvio; a finalização acontece em **uma transação** no banco (função/RPC). |
| F2.5 | Separação: **individual** → conjunto geral do Endometriômetro (anonimizado conforme regra do projeto); **institucional** → vinculada à `pesquisa_id`/instituição correspondente. |
| F2.6 | Criar **funções/visões de agregação** (contagens, percentuais, indicadores) que retornam **apenas dados agregados**, com **limite mínimo de grupo** (padrão recomendado: não exibir recortes com menos de 5 respostas, valor configurável) para evitar reidentificação. |
| F2.7 | Fazer os gráficos e estatísticas consumirem essas agregações; atualizar automaticamente após a conclusão. |
| F2.8 | Migrar dados existentes de forma segura (sem perda), com **backup/export prévio** e verificação de contagem antes/depois. |

**Padrão de privacidade recomendado (adotar, salvo se a estrutura atual já garantir o mesmo):** manter a identificação de quem participou (para impedir duplicidade) **separada** do conteúdo das respostas, de modo que as respostas usadas nos indicadores não exponham nome, e-mail nem identificador direto.

**Critérios de aceite:** teste com dados de exemplo mostra que iniciar ≠ concluir; resposta parcial não conta; reenvio não duplica; duas instituições de teste não se misturam; agregados batem com a contagem direta no banco.

---

### FASE 3 — Autenticação, perfis e telas de acesso  *(itens 5, 13, 14, 15, 18)*

**Objetivo:** separar claramente **Participante Individual** e **Empresa/Instituição**.

| ID | Tarefa |
|---|---|
| F3.1 | Criar/ajustar perfis e papéis (`participante`, `instituicao`, `admin`) e o guarda de rotas (frontend) **com verificação equivalente no backend**. |
| F3.2 | Criar a **tela inicial de participação** com dois cards (textos oficiais no ANEXO A): *Pesquisa Individual* → botão **Participar da pesquisa**; *Pesquisa para Empresas e Instituições* → botão **Acessar área da instituição**. |
| F3.3 | **Autenticação individual:** tela de login/cadastro do participante (com aceite de termo de consentimento/LGPD antes do questionário). |
| F3.4 | **Login da Empresa/Instituição:** campos e-mail e senha; ações **Entrar**, **Criar conta**, **Esqueci minha senha** (fluxo real de recuperação). |
| F3.5 | Cadastro da instituição com dados mínimos (nome, tipo, e-mail do responsável), vinculado ao perfil `instituicao`. |
| F3.6 | Redirecionamento pós-login por perfil e **retorno à página de origem** (importante para o link recebido por e-mail/WhatsApp). |
| F3.7 | Sessão segura: expiração, logout, proteção contra tentativas excessivas (usar o limite do provedor de Auth e complementar quando possível). |

**Regra de ambiguidade (DECISOES.md):** para responder por **link institucional**, o participante passa pela **autenticação de participante** (F3.3) e retorna ao questionário daquela pesquisa. Se a estrutura atual já resolver isso de forma melhor e segura, mantenha e registre.

**Critérios de aceite:** um participante não acessa área da instituição; uma instituição só acessa a própria área; rotas protegidas redirecionam para login e voltam ao destino após autenticar.

---

### FASE 4 — Pesquisa individual completa  *(itens 15, 16, 17, 25 — Teste 1)*

| ID | Tarefa |
|---|---|
| F4.1 | Fluxo: cards → login/cadastro → **apresentação da pesquisa** → questionário → preenchimento → finalizar → validação → registro → contabilização → conclusão → e-mail. |
| F4.2 | Revisão completa do questionário: perguntas obrigatórias, tipos, validações, navegação entre etapas, salvamento de progresso, mensagens de erro claras. |
| F4.3 | **Card de conclusão** (texto no ANEXO A) com botão **Voltar para o início**. |
| F4.4 | **E-mail de agradecimento** (texto no ANEXO A) enviado ao e-mail da participante. Usar o serviço já configurado; se não existir, criar a estrutura de integração (Edge Function + provedor, ex.: Resend/SMTP) com **chave somente no servidor**, registro do envio (`enviado`/`falhou`) e **nunca dizer que enviou se não enviou**. Se faltar credencial, marcar BLOQUEADA parcial e deixar tudo pronto para ativar. |
| F4.5 | Executar o **Teste 1 (individual)** ponta a ponta e registrar em `TESTES.md`. |

**Critérios de aceite:** Teste 1 passa em desktop e celular; indicadores/gráficos refletem a nova resposta; reenvio não duplica; mensagem de e-mail só aparece como enviada quando o envio foi confirmado.

---

### FASE 5 — Área da instituição, links e relatório protegido  *(itens 12, 19, 22, 23, 24, 26)*

| ID | Tarefa |
|---|---|
| F5.1 | **Dashboard da instituição:** lista das suas pesquisas, número de participantes, status. |
| F5.2 | **Criar pesquisa:** título, descrição, período, status (ativa/encerrada). |
| F5.3 | **Link exclusivo real:** token aleatório não previsível (≥128 bits), vinculado à pesquisa e à instituição, com validade/ativação/encerramento e opção de desativar. Botões **copiar** e **compartilhar** (Web Share API no celular). |
| F5.4 | **Correção do link da colaboradora:** rota pública do questionário por token, funcionando em celular e em navegador externo (abrir por WhatsApp, e-mail etc.); tratar link inválido/expirado com mensagem clara; após autenticar, voltar à pesquisa. |
| F5.5 | **Resultados agregados:** quantidades, percentuais e gráficos **somente** da pesquisa daquela instituição (com o limite mínimo de grupo da F2.6). Sem nome, e-mail ou respostas individuais. |
| F5.6 | **Relatório em formulário próprio**, dentro da área protegida (Login → Dashboard → Pesquisa → Resultados → Relatório): identificação, período, participantes, indicadores, gráficos, resultados, percentuais, observações. |
| F5.7 | Botão **Gerar relatório em PDF** com layout profissional (cabeçalho, identificação, gráficos legíveis, rodapé, paginação); gerado **sem dados pessoais**. |
| F5.8 | **Remover** o relatório atual do menu/rotas públicas. |
| F5.9 | Executar o **Teste 2 (instituição)** ponta a ponta e registrar em `TESTES.md`. |

**Critérios de aceite:** relatório inacessível sem login, inacessível por URL direta e por troca de parâmetros; instituição A nunca vê dados da B (testado com duas contas); PDF abre correto e com dados batendo com a tela.

---

### FASE 6 — Segurança  *(itens 6, 24, 28)*

| ID | Tarefa |
|---|---|
| F6.1 | **Auditoria de RLS em todas as tabelas:** RLS ativada, políticas por perfil e por dono (`auth.uid()`), sem política permissiva ampla. Testar cada política com usuário anônimo, participante, instituição A, instituição B e admin. |
| F6.2 | Garantir que consultas públicas usem **apenas** visões/funções agregadas; nenhuma tabela com dado pessoal legível por `anon`. Funções `SECURITY DEFINER` com `search_path` fixo e verificação de autorização interna. |
| F6.3 | **Varredura de segredos:** nenhuma chave privada no código, no bundle nem no histórico do git; `.env` no `.gitignore`; se houver vazamento, **avisar** e recomendar rotação. |
| F6.4 | **Validação de entradas** no cliente **e** no servidor (esquema, tipos, tamanhos, listas permitidas); proteção contra manipulação de parâmetros e IDs (não confiar em `pesquisa_id`/`instituicao_id` vindos do cliente sem checagem de posse). |
| F6.5 | **XSS e injeção:** não usar `dangerouslySetInnerHTML` com conteúdo de usuário; sanitizar o que for exibido; consultas sempre parametrizadas/via cliente do Supabase. |
| F6.6 | **Headers de segurança na Vercel** (`vercel.json`): Content-Security-Policy compatível com Supabase e fontes usadas, `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`/`frame-ancestors`, `Permissions-Policy`, HSTS. Testar sem quebrar o app. |
| F6.7 | **CORS** restrito aos domínios necessários (Edge Functions incluídas). |
| F6.8 | **Limite de tentativas:** no login, no cadastro, na recuperação de senha e no envio de respostas (rate limit no provedor/Edge Function). |
| F6.9 | **Minificação e ofuscação** do JS/TS no build de produção **se compatível** (ex.: minificação com terser + plugin de ofuscação para o bundler em uso), **desativando source maps em produção**. Validar que o app continua funcionando e sem perda relevante de desempenho; se a ofuscação quebrar algo, manter só a minificação e registrar em `DECISOES.md`. |
| F6.10 | **LGPD:** termo de consentimento, texto de finalidade, política de privacidade acessível, e caminho para a participante solicitar exclusão dos dados. Dados sensíveis: coletar somente o necessário. |
| F6.11 | `npm audit` (ou equivalente) e atualização de dependências vulneráveis que não gerem quebra. |

**Critérios de aceite:** tabela de testes de acesso (papel × tabela × operação) toda conforme esperado; nenhum segredo exposto; headers ativos e app funcionando; build de produção validado.

---

### FASE 7 — Responsividade total, cabeçalho e textos  *(itens 2, 3, 5, 11 e o texto "O que é o Endometriômetro?")*

> Esta é a fase visual e vem **depois** da base estável.

| ID | Tarefa |
|---|---|
| F7.1 | **Cabeçalho:** exibir "**Endometriose**" apenas na **apresentação visual** da barra superior. O nome oficial **ENDOMETRIÔMETRO** permanece em títulos, textos, e-mails, relatórios e metadados. |
| F7.2 | **Botão "Entrar / Cadastrar"** no canto superior direito: moderno, destacado, coerente com a identidade, área de clique adequada (≥44 px), ao abrir oferece a escolha **Participante** ou **Empresa / Instituição**. No mobile pode ir dentro do menu lateral. |
| F7.3 | **Desktop:** manter o menu horizontal atual. **Tablet e celular:** menu lateral (drawer) **pelo lado esquerdo**, moderno, com foco/teclado/fechamento por toque fora e por `Esc`, sem prender a rolagem depois de fechar. |
| F7.4 | **Responsividade de todas as telas:** páginas, cards, formulários, gráficos, menus, tabelas, modais e relatórios. Nada cortado, escondido, sobreposto, fora da largura da tela nem com rolagem horizontal desnecessária. Testar em 320, 375, 414, 768, 1024, 1280 e 1440 px. Tabelas com rolagem interna controlada; gráficos redimensionáveis. |
| F7.5 | **Tela de Dados e Estatísticas:** trocar os textos pelos do ANEXO A e manter a orientação de expandir gráficos. Garantir que a expansão em tela cheia funcione no mobile e possa ser fechada. |
| F7.6 | **Form/seção informativa "O que é o Endometriômetro?"** com o texto do ANEXO A (card/modal/seção acessível pelo menu **Conheça** e pela tela inicial; registrar a escolha em `DECISOES.md`). |
| F7.7 | **Metadados:** substituir `og:image`, `twitter:site` e descrições que apontam para o Lovable por identidade do Endometriômetro (título, descrição, imagem própria). |
| F7.8 | **Acessibilidade básica:** contraste, foco visível, `aria-label` nos botões de ícone, ordem de tabulação, tamanho mínimo de toque. |

**Critérios de aceite:** varredura visual nos 7 tamanhos sem cortes nem rolagem horizontal; drawer funcional; textos do documento aplicados literalmente.

---

### FASE 8 — Teste final e entrega  *(itens 25, 26, 29)*

| ID | Tarefa |
|---|---|
| F8.1 | **Regressão completa** conforme a Seção 6. |
| F8.2 | Repetir **Teste 1 (individual)** e **Teste 2 (instituição)** do início ao fim em desktop **e** celular. |
| F8.3 | Repetir a bateria de **segurança** (acesso direto por URL, troca de parâmetros, isolamento entre instituições, RLS, relatório protegido). |
| F8.4 | `build` de produção limpo, sem erros nem avisos críticos; checar variáveis de ambiente necessárias na Vercel (listar nomes, sem valores). |
| F8.5 | Gerar `RELATORIO_FINAL.md`: o que foi feito por fase, o que ficou BLOQUEADO e por quê, o que depende de mim (credenciais, provedor de e-mail, domínio), riscos restantes e passos de publicação/reversão. |
| F8.6 | Abrir o Pull Request da branch `manutencao/endometriometro` com o resumo. **Não fazer merge/deploy em produção sem minha confirmação.** |

## 6. TESTE DE REGRESSÃO (usar no portão de cada fase e na Fase 8)

- **Navegação:** todos os menus, submenus, rotas, links internos e botões; Voltar do navegador; URL direta.
- **Responsividade:** desktop, notebook, tablet, celular.
- **Pesquisa:** individual; instituição; geração de link; preenchimento; conclusão; contabilização.
- **Dados:** gráficos, percentuais, totais, separação entre pesquisas, atualização após conclusão.
- **Segurança:** autenticação, autorização, acesso direto por URL, isolamento entre instituições, RLS, proteção das informações pessoais.
- **Relatórios:** acesso protegido, geração, PDF, dados corretos.

## 7. FORMATO DAS SUAS RESPOSTAS

A cada tarefa concluída, responda em no máximo poucas linhas: `[ID] concluída — o que mudou — evidência — próxima: [ID]`. Ao fechar cada fase: resumo curto + "Iniciando Fase N+1". Só escreva mensagens longas se houver bloqueio que exija minha decisão.

## 8. COMECE AGORA

Execute a **Fase 0** (F0.1 → F0.9). Ao terminar, siga sozinho para a Fase 1, e assim sucessivamente, respeitando o protocolo da Seção 3.3, até concluir a Fase 8.

---

# ANEXO A — TEXTOS OFICIAIS (aplicar exatamente como escritos)

**A1. Cabeçalho (apenas apresentação visual):** `Endometriose`

**A2. Tela de Dados e Estatísticas**
- Título: `DADOS E ESTATÍSTICAS DA ENDOMETRIOSE`
- Subtítulo: `Transformando respostas em dados para compreender realidades`
- Texto: `Visualize os dados coletados pelo ENDOMETRIÔMETRO e compreenda os sintomas, os impactos da endometriose e seus reflexos na rotina de trabalho.`
- Manter também a orientação de que os gráficos podem ser expandidos em tela cheia para análise detalhada.

**A3. Card 1 — Pesquisa Individual**
- Descrição: `Responda à pesquisa de forma individual e contribua para a construção de dados sobre a endometriose, seus sintomas e seus impactos na rotina de trabalho.`
- Botão: `Participar da pesquisa`

**A4. Card 2 — Pesquisa para Empresas e Instituições**
- Descrição: `Sua empresa ou instituição precisa compreender melhor a realidade da endometriose? Crie uma pesquisa, convide participantes e acompanhe os dados de forma organizada.`
- Botão: `Acessar área da instituição`

**A5. Card de conclusão**
- Título: `Pesquisa concluída!`
- Texto: `Agradecemos sua participação no ENDOMETRIÔMETRO. Suas respostas contribuem para ampliar o conhecimento sobre a endometriose e seus impactos na rotina de trabalho.`
- Botão: `Voltar para o início`

**A6. E-mail de agradecimento**
- Assunto: `Agradecemos sua participação no ENDOMETRIÔMETRO`
- Corpo:
  `Olá!`
  `Agradecemos sua participação na pesquisa ENDOMETRIÔMETRO.`
  `Sua contribuição é importante para ampliar o conhecimento sobre a endometriose, seus sintomas e seus impactos na rotina de trabalho.`
  `Obrigado por participar.`

**A7. Botão do cabeçalho:** `Entrar / Cadastrar`

**A8. Login da Empresa / Instituição:** campos `E-mail` e `Senha`; ações `Entrar`, `Criar conta`, `Esqueci minha senha`.

**A9. Botão do relatório:** `Gerar relatório em PDF`

**A10. Form informativo — "O que é o Endometriômetro?"**

> **O que é o Endometriômetro?**
>
> O **ENDOMETRIÔMETRO** é um instrumento digital de pesquisa desenvolvido para coletar, organizar e analisar informações relacionadas à endometriose. Por meio da plataforma, é possível realizar pesquisas com diferentes públicos e obter dados que podem contribuir para compreender melhor a realidade, as necessidades e as experiências relacionadas à endometriose.
>
> **Para que serve?**
>
> A plataforma permite que prefeituras, empresas, hospitais, instituições de ensino, organizações de saúde e outras instituições possam solicitar ou realizar pesquisas, disponibilizando formulários por meio de links para os participantes.
>
> Após a coleta das respostas, os dados podem ser organizados, apresentados em gráficos e utilizados na geração de relatórios, facilitando a visualização e a interpretação das informações obtidas.
>
> O Endometriômetro é, portanto, o instrumento de pesquisa, enquanto os gráficos, indicadores e relatórios constituem a camada de análise e apresentação dos dados coletados.
>
> Dessa forma, a plataforma pode ser utilizada para apoiar pesquisas, estudos, ações institucionais, planejamento e tomada de decisões, de acordo com os objetivos definidos por cada organização responsável pela pesquisa.

---

# PROMPT DE RETOMADA (cole se a conversa parar ou o contexto se perder)

```
Continue a manutenção do ENDOMETRIÔMETRO.
Leia .agent/manutencao/PROGRESSO.md (topo) e .agent/manutencao/PLANO.md,
confira `git status` e `git log -5`, identifique a fase e a tarefa em que
parou e prossiga conforme o protocolo da skill "manutencao-endometriometro"
(ciclo A → B → C). Não refaça o que já está CONCLUÍDA. Se houver tarefa
EM ANDAMENTO, verifique o que já existe no código antes de continuar.
Avance sozinho até a Fase 8, parando apenas nos casos previstos na Regra 9.
```
