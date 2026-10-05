# PROMPT COMPLEMENTAR — FASE 5B: RELATÓRIOS EM PDF (Empresa/Instituição e Pesquisa Individual)

> **Como usar:** cole **tudo abaixo da linha** no Antigravity, na mesma conversa/projeto do Prompt Mestre e das Fases 2B, 2C e 2D.

---

## 1. POR QUE ESTE PROMPT EXISTE

Os prompts anteriores trataram o PDF de forma rasa: o Prompt Mestre só tinha uma linha para o PDF da instituição (F5.7), a 2D apenas "reutilizava" números, e **nada cobria um relatório em PDF da pesquisa individual**. Esta é a **FASE 5B**, que **substitui F5.6, F5.7 e a parte de PDF da D8**.

**Entregáveis:**

| Código | Relatório | Quem acessa | Conteúdo |
|---|---|---|---|
| **R1** | **Relatório da Empresa/Instituição** (por pesquisa) | Somente a instituição dona da pesquisa (e admin) | Dados agregados da **própria** pesquisa |
| **R2** | **Relatório da Pesquisa Individual** (panorama geral) | Público, na tela Dados e Estatísticas | Dados **agregados** das respostas individuais, sem nenhuma empresa nomeada |
| **R3** | Resumo pessoal da participante | **Opcional, NÃO implementar agora** (ver R8) | — |

## 2. REGRAS

Valem as do Prompt Mestre e das Fases 2B/2C/2D, mais:

1. **Nenhum dado pessoal no PDF:** sem nome, e-mail, ID de usuário, nem resposta individual. Só agregados.
2. **Mesmos números da tela:** o PDF **não calcula nada por conta própria**. Ele recebe **um único JSON** do banco (R1) montado pelas **mesmas funções** da 2B/2D. Tela, PDF e SQL direto têm que bater.
3. **Limite mínimo de grupo (n ≥ 5)** e **agrupamento "Demais"** da 2D valem no PDF. Seção sem dados suficientes é **omitida** ou substituída por aviso curto; **nunca** preencher com número inventado.
4. **Dados de teste:** quando houver qualquer dado de teste incluído, **marca-d'água diagonal "TESTE"** em todas as páginas e selo no cabeçalho ("Relatório de teste, não representa respostas reais").
5. **Proibido gerar PDF por "print" da tela** (html2canvas/captura de imagem): fica borrado, corta gráficos entre páginas e captura interface. Gerar **documento próprio**, com **gráficos vetoriais** desenhados a partir dos dados.
6. **Segurança no servidor:** a permissão de acesso ao relatório é decidida **no banco** (posse da pesquisa), não só no botão da tela.
7. Linguagem: "sintomas relatados", **nunca** "mulheres com endometriose" para os indicadores de sintomas.
8. Seguir o protocolo da Seção 3.3 do Prompt Mestre (ler `PROGRESSO.md` → executar → verificar → registrar → commit → próxima).

## 3. COMO ENCAIXAR NO PLANO (faça primeiro)

1. Leia `PROGRESSO.md` e `PLANO.md`.
2. Insira a **FASE 5B** (R0 a R9) **logo depois das tarefas F5.1–F5.5** e antes da Fase 6. **Marque F5.6 e F5.7 como "substituídas pela 5B"** e a parte de PDF da D8 também. Em `F5.9`, `F5.10` e `F5.11`, acrescente a conferência dos PDFs. Registre em `DECISOES.md`.
3. Se já passou da Fase 5, termine a tarefa em andamento, faça a 5B e **retome** de onde parou.
4. Dependências: 2B/2D (números), 2C (dados de teste), F3 (login) e F5.1–F5.5 (área da instituição). O **R2 (público)** só depende da 2D e pode ser feito logo que ela estiver concluída.

## 4. ESPECIFICAÇÃO DOS RELATÓRIOS

Formato **A4 retrato**, margens de 20 mm, fonte **embutida** que suporte português (acentos e cedilha), cores da identidade do projeto **legíveis também em impressão preto e branco** (diferenciar por rótulos e padrões, não só por cor). Cabeçalho e rodapé em todas as páginas; **"Página X de Y"**; evitar quebra de página no meio de gráfico ou tabela.

### 4.1 R1 — Relatório da Empresa/Instituição

**Página 1 — Identificação e resumo**
- Logo e título: `Relatório da Pesquisa ENDOMETRIÔMETRO`
- Instituição (nome, CNPJ, cidade/UF), título da pesquisa, **período** (primeira à última resposta concluída), **data e hora de geração** (fuso America/Bahia) e **ID do relatório**
- Resumo em cartões: **mulheres pesquisadas**, **com sintomas relatados (n e %)**, e **taxa de adesão** *se* a pesquisa tiver o campo opcional "colaboradoras elegíveis" (ver R1.3); se não tiver, omitir a adesão
- Gráfico circular: com sintomas × sem sintomas

**Página 2 — Perfil das participantes**
- Faixa etária (barras: pesquisadas × com sintomas)
- Bairro (barras agrupadas, com regra do "Demais") e a 3ª dimensão **somente se existir no questionário**

**Página 3 — Sintomas e impacto**
- Sintomas relatados (barras horizontais ordenadas, com n e %)
- Impacto no trabalho: **dois indicadores separados**, "horas/mês perdidas" e "dias de atestado/ano" (**nunca na mesma escala**)
- Situação de diagnóstico (com diagnóstico / em investigação / sem), conforme o questionário

**Página 4 — Fechamento**
- Tempo até o diagnóstico e tratamentos **apenas se o questionário coletar**; senão, omitir
- **Observações da instituição** (texto livre opcional, ver R3)
- **Metodologia e limitações:** definições (pesquisada, com sintomas), dados autodeclarados, amostra não probabilística, regra de n ≥ 5 e agrupamento, "Sintomas relatados não equivalem a diagnóstico", "Este relatório não substitui avaliação médica", "Não contém dados pessoais identificáveis"
- **Código de verificação** (hash curto do JSON usado) e versão do relatório

### 4.2 R2 — Relatório da Pesquisa Individual (público)

Mesmo padrão visual, **sem identificação de instituição**:
- Pág. 1: total de mulheres pesquisadas na pesquisa individual, com sintomas (n, %), gráfico circular D4, data/hora, ID
- Pág. 2: faixa etária e bairro
- Pág. 3: sintomas relatados, impacto no trabalho (dois indicadores), situação de diagnóstico
- Pág. final: metodologia, limitações, código de verificação
- **Disponível apenas se houver pelo menos 5 respostas individuais concluídas** (senão, botão desativado com a mensagem "Relatório disponível quando houver ao menos 5 respostas concluídas").

## 5. TAREFAS

### R0 — Auditoria (somente leitura)
Registrar em `ACHADOS.md`: a stack e se já há biblioteca de PDF instalada; onde está a página/formulário de relatório atual (F5.6/F5.8) e se ainda é pública; ativos disponíveis (logo, fontes, tokens de cor); quais números exigidos pelas Seções 4.1/4.2 **já existem** nas funções da 2B/2D e **quais faltam**; onde ficarão os botões.

### R1 — Contrato de dados
- **R1.1** Criar/estender `get_relatorio(tipo, pesquisa_id, incluir_teste)` que devolve **um JSON único** (versão do esquema, `gerado_em` do servidor, todos os blocos das Seções 4.1/4.2, `n` de cada bloco, flags de suficiência, `tem_dado_de_teste`, hash). **Reutilizar** as funções existentes; não duplicar cálculo.
- **R1.2** Posse verificada **dentro da função**: `tipo='instituicao'` exige o dono da `pesquisa_id` (ou admin); `tipo='individual'` é público e agregado.
- **R1.3** Campo **opcional e aditivo** `colaboradoras_elegiveis` na pesquisa (cadastro da pesquisa, F5.2), usado só para calcular adesão. Se vazio, a adesão não aparece.
- **R1.4** Tabela de auditoria `relatorios_gerados` (id, tipo, pesquisa_id, gerado_por, gerado_em, hash, tem_dado_de_teste), **sem conteúdo do relatório**, com RLS (cada instituição lê só os seus) e inserção feita pela função.
- Migração **aditiva e reversível**, RLS ativa.

### R2 — Motor de PDF
- Módulo próprio (ex.: `src/lib/relatorio-pdf/`), **carregado sob demanda** (import dinâmico) para não pesar o site.
- Reaproveitar a biblioteca de PDF já instalada, se existir; senão, escolher uma que gere **vetorial** e permita fontes embutidas (por exemplo, `@react-pdf/renderer`, `pdf-lib` ou `pdfmake`), registrando a escolha e o motivo em `DECISOES.md`.
- Componentes reutilizáveis: cabeçalho, rodapé com paginação, cartão numérico, **donut e barras em SVG/vetor**, tabela, marca-d'água, bloco de texto.
- **Metadados limpos** no arquivo (título, autor "ENDOMETRIÔMETRO"), sem e-mail nem nome de usuário.
- **Nenhum recurso externo** durante a geração (fontes e imagens embutidas), para funcionar offline e sem violar a CSP.
- Nome do arquivo seguro: `relatorio-<tipo>-<AAAA-MM-DD>.pdf` (sem caracteres perigosos).

### R3 — Relatório R1 na área da instituição
- Botão **"Gerar relatório em PDF"** em **Resultados** e no **formulário de Relatório** (F5.6).
- Antes de gerar, uma janela curta com: **Observações da instituição** (opcional, texto simples, **máx. 1.000 caracteres**, sanitizado, sem HTML) e as seções opcionais a incluir.
- Estados: gerando (com progresso), sucesso (download) e erro amigável com "Tentar novamente".
- Acesso por URL direta ou troca de parâmetros **não pode** gerar relatório de pesquisa alheia (checagem do banco, R1.2).

### R4 — Relatório R2 na tela pública
Botão **"Baixar relatório da pesquisa individual (PDF)"** na seção **Panorama da Pesquisa** (Fase 2D), com a regra de disponibilidade da Seção 4.2 e sem qualquer referência a empresas.

### R5 — Segurança e privacidade
- Limite de geração por usuário (ex.: **10 por hora**, contado em `relatorios_gerados`) e por IP/anônimo no relatório público (cache curto do JSON público para não sobrecarregar o banco).
- Texto de "Observações" **nunca** interpretado como código; remover caracteres de controle.
- Conferir a **CSP** (F6.6): permitir apenas o necessário para baixar o arquivo gerado (por exemplo `blob:`, e `worker-src blob:` se a biblioteca usar worker), sem abrir brechas.
- Testar que **nenhum campo de identificação** aparece em nenhuma página, nem nos metadados.

### R6 — Celular e navegadores
O download deve funcionar em **Chrome e Safari, no desktop e no celular**. Quando o navegador bloquear download por `blob`, usar **Web Share API com arquivo** ou abrir o PDF em nova aba com botão "Salvar". Testar em tela de 375 px.

### R7 — Testes automatizados e manuais (registrar em `TESTES.md`)
Gerar os PDFs com os **dados de teste** (Fase 2C) e conferir:
1. **Texto extraído do PDF** (ex.: `pdftotext` ou biblioteca de leitura) contra os valores esperados: **R1 (ctor4.com): 10 pesquisadas, 4 com sintomas (40%)**; **R2: 20 pesquisadas, 8 com sintomas (40%)**, bairros 5/5/5/5. Demais valores por **SQL direto**.
2. **Número no PDF = número na tela = SQL**, e o **código de verificação** bate com o hash do JSON.
3. Marca-d'água "TESTE" em todas as páginas quando houver dado de teste; sem ela quando não houver.
4. Rasterizar cada página (ex.: `pdftoppm`) e **inspecionar**: sem texto cortado, sem gráfico partido entre páginas, acentos corretos, legível em preto e branco.
5. Casos de borda: **n < 5** (seção omitida/aviso), **zero respostas** (botão desativado), nome de pesquisa muito longo, observações no limite de 1.000 caracteres, caracteres especiais e emojis.
6. **Segurança:** usuário anônimo não gera R1; instituição B não gera relatório da pesquisa da A (testar com `pesquisa_id` trocado); relatório público não contém nome de empresa; nenhum dado pessoal em nenhuma página.
7. Tamanho do arquivo (meta: abaixo de 2 MB), tempo de geração aceitável e site sem lentidão ao carregar (módulo sob demanda).
8. Relatório aberto em leitor de PDF no desktop e no celular.

### R8 — R3 (resumo pessoal da participante): NÃO implementar agora
Registrar em `DECISOES.md` como **pendente de confirmação do usuário**. Observação técnica: a separação entre **participação** e **respostas** (Fase 2) impede ligar uma resposta à pessoa depois. Se o usuário quiser o resumo pessoal, a alternativa segura é gerar o PDF **na hora da conclusão**, a partir do que ela acabou de enviar, **sem guardar o conteúdo** vinculado ao cadastro. Listar essa pergunta no `RELATORIO_FINAL.md`.

### R9 — Portão da fase
**Critérios de aceite:** R1 e R2 gerados e conferidos (R7 completo); relatório antigo público removido (F5.8); nenhuma checagem de acesso só no frontend; sem dado pessoal; `build` limpo. Registrar "FASE 5B CONCLUÍDA" no `PROGRESSO.md` e **retomar o plano**.

## 6. FORMATO DAS RESPOSTAS
A cada tarefa: `[ID] concluída — o que mudou — evidência — próxima: [ID]`. Mensagem longa só se houver bloqueio (por exemplo, falta de logo/fonte ou dúvida sobre o R3).

## 7. COMECE AGORA
Execute a Seção 3 e depois **R0**. Siga sozinho até o portão **R9** e então retome o plano original.
