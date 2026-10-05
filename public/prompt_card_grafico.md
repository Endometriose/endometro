# PROMPT COMPLEMENTAR — FASE 2D: PAINEL DE TOTAIS, CARDS E GRÁFICOS DA PESQUISA (Individual × Empresas)

> **Como usar:** cole **tudo abaixo da linha** no Antigravity, na mesma conversa/projeto do Prompt Mestre e das Fases 2B e 2C. Se ele aceitar imagens, anexe também a captura da tela Dados, o relatório do seed e as duas folhas do rascunho; o texto abaixo já descreve tudo o que elas mostram.

---

## 1. ESTUDO FEITO ANTES DESTE PROMPT (achados)

### 1.1 O relatório de dados de seed (lote `TESTE-2026-10`) mostra estes números

| Indicador | Valor |
|---|---|
| Total de respostas | **30** (20 individuais + 10 colaboradoras da ctor4.com) |
| Com sintomas | **40%** (12 de 30) |
| Diagnóstico | Com endometriose **8 (27%)** · Em investigação **4 (13%)** · Sem endometriose **18 (60%)** |
| Por bairro (individuais) | Centro 5 · Vila Vargas 5 · Bom Jesus 5 · Recanto do Lago 5; a empresa aparece como "Empresa (sede)" 10 |
| Impacto no trabalho | média **11,5 h/mês** perdidas · média **1,8 dia/ano** de atestado · **12 (40%)** com impacto |
| Faixas etárias (combinado) | 18–24: 7 · 25–34: 9 · 35–44: 9 · 45–54: 4 · 55+: 1 |
| Top 5 "sintomas" | Cólica intensa 4 · Fadiga extrema 4 · Dor na relação 3 · Dor pélvica crônica 3 · Uso de analgésicos 3 |

### 1.2 A tela real **Dados e Estatísticas** NÃO bate com o seed (defeitos confirmados na captura)

1. **Faixa etária:** a pizza mostra **todas as fatias com 17%** (seis categorias iguais, inclusive "Menos de 18 anos", que o seed nem tem), todas na mesma cor. O correto pelo seed seria 23% / 30% / 30% / 13% / 3%. Parece valor fixo ou contagem errada.
2. **Prevalência de Diagnóstico:** mostra **93% / 7%** com duas categorias; o seed tem **27% / 13% / 60%** (três categorias, incluindo "Em investigação").
3. **Frequência dos Sintomas:** os rótulos (Cólica incapacitante, Ansiedade pela dor, Dor intestinal, Dor pélvica crônica, Dor ao urinar, Histórico familiar) **não coincidem** com os do seed, e as barras aparecem **praticamente invisíveis**.
4. **Impacto Médio no Trabalho:** coloca **horas/mês** e **dias de atestado/ano** (unidades diferentes) **no mesmo eixo**, com valores aproximados de 6 e 1, que **não conferem** com 11,5 h e 1,8 dia do seed.
5. **Tempo até o Diagnóstico** e **Eficácia dos Tratamentos** aparecem como "Indicador será ativado quando a pergunta correspondente fizer parte do questionário" (comportamento esperado da Fase 2B, se o questionário não tiver essas perguntas).
6. **Pontos que funcionam:** o cabeçalho "n = 30 respostas válidas", o botão "Atualizar Dados" e o selo "Dados de teste incluídos — não representam respostas reais".
7. **Suspeitas sobre o seed (verificar):** (a) o **relatório de seed parece uma página à parte**, com números que não saem das mesmas consultas do sistema; (b) os rótulos do seed (ex.: "Uso de analgésicos" como sintoma, colunas "Dor" e "Resultado Alta/Baixa") podem **não existir no questionário real**; (c) a empresa foi gravada como localidade "Empresa (sede)", e não com o bairro das colaboradoras.
8. **Fora do escopo, mas importante:** a seção **"Vozes e Relatos"** exibe depoimentos com nome e idade sob o texto "Histórias reais de quem convive com a endometriose". **Se forem texto fixo no código, não são histórias reais.** Ver tarefa D0.

### 1.3 O que o usuário pediu (rascunho à mão e lista "FAZER OS CARDS")

**Cards numéricos:**
- K1 — Número total geral de mulheres pesquisadas
- K2 — Número total de mulheres que podem apresentar o sintoma
- K3 — Percentual de mulheres com sintoma em relação ao total pesquisado
- K4 — Nº de mulheres que fizeram a pesquisa individual
- K5 — Nº de mulheres que fizeram a pesquisa na empresa
- K6 — Nº de empresas pesquisadas

**Gráficos circulares (rascunho):**
- D1 — "Total de mulheres pesquisadas (geral)"
- D2 — "Total de mulheres que podem apresentar o sintoma"
- D3 — "Percentual de mulheres com sintoma ao número total pesquisado"
- D4 — "Gráfico do total da pesquisa individual": colocar o **total de mulheres** e o **percentual com sintoma**
- D5 — "Gráfico total da pesquisa empresa": colocar o **total de mulheres pesquisadas na empresa** e o **percentual com sintoma**

**Blocos com list box ("opção: list box e gerar o gráfico"):**
- B1 — Nº de mulheres pesquisadas **individual** por **bairro / idade / [3ª opção]**
- B2 — Nº de mulheres **na empresa** por **bairro / idade / [3ª opção]**

> **Leitura incerta:** a 3ª opção da lista está em letra difícil de ler (parece "ofício" ou "setor"). **Não invente.** Verifique se o questionário tem um campo de ocupação/setor/ofício. Se tiver, ofereça a opção; se não, ofereça só **Bairro** e **Faixa etária** e registre a dúvida em `DECISOES.md` e no `RELATORIO_FINAL.md` para o usuário confirmar.

**Item descartado:** o rascunho tem uma linha **riscada** ("Nº de grupos pesquisados..."). **Não implementar.**

## 2. DEFINIÇÕES (registrar em `DECISOES.md` antes de codar)

| Termo | Definição |
|---|---|
| **Pesquisada** | resposta com status `concluida` (regra da F2.3) |
| **Com sintomas** | pesquisada que marcou **pelo menos um sintoma** na pergunta de sintomas do questionário real. **Não é diagnóstico.** |
| **Percentual** | com sintomas ÷ pesquisadas × 100 (formato pt-BR; denominador zero exibe "—") |
| **Individual / Empresa** | origem da resposta: pesquisa individual (conjunto geral) ou pesquisa institucional |
| **Empresa pesquisada (K6)** | instituição do tipo empresa com **ao menos 1 resposta concluída** |
| **Idade** | sempre por **faixa etária** do questionário, nunca idade exata |

**Linguagem:** usar "mulheres com sintomas relatados" (e "podem apresentar sintomas"), **nunca** "mulheres com endometriose" para K2/K3/D2–D5. Incluir nota fixa na tela: *"Sintomas relatados não equivalem a diagnóstico."*

## 3. REGRAS

Valem as do Prompt Mestre e das Fases 2B e 2C, mais:

1. **Fonte única da verdade:** cards, gráficos, relatório de seed, painel da instituição e PDF devem ler **as mesmas funções de agregação**. Proibido número fixo, calculado no frontend a partir de lista bruta ou vindo de página separada. O **relatório de seed deve ser regenerado a partir dessas mesmas funções** (ou removido).
2. **Privacidade na tela pública:**
   - **nunca** exibir o nome de uma empresa; empresas só aparecem **agregadas**;
   - dados de saúde agregados de "empresas" só aparecem quando houver **pelo menos `MIN_EMPRESAS_PUBLICO` empresas** (padrão **3**); em desenvolvimento com dados de teste e selo, permitir `MIN_EMPRESAS_PUBLICO=1`;
   - o detalhamento de **uma empresa específica** só existe na **área protegida** da própria instituição.
3. **Limite mínimo de grupo (n ≥ 5, inclusive)** em qualquer recorte (bairro, faixa etária, etc.). Grupo com menos de 5 **não aparece sozinho**: some-o a um grupo **"Demais (agrupados)"**, se a soma for ≥ 5; se mesmo assim ficar abaixo de 5, **oculte** e mostre aviso. Isso evita descobrir o grupo escondido por subtração.
4. **Parâmetro de dimensão em lista fechada** (`bairro`, `faixa_etaria`, e a 3ª só se existir): validar no banco contra uma lista permitida. **Nunca** aceitar nome de coluna livre vindo do cliente.
5. **Dados de teste:** continuam sujeitos ao parâmetro `incluir_teste` e ao selo **"Dados de teste"** (Fase 2C/S4).
6. Seguir o protocolo da Seção 3.3 do Prompt Mestre (ler `PROGRESSO.md` → executar → verificar → registrar → commit → próxima).

## 4. COMO ENCAIXAR NO PLANO (faça primeiro)

1. Leia `PROGRESSO.md` e `PLANO.md`.
2. Insira a **FASE 2D** (D0 a D9) **depois da 2C** e antes da Fase 3, status `PENDENTE`. Registre em `DECISOES.md`: "FASE 2D inserida a pedido do usuário".
3. Se estiver em outra fase, termine a tarefa em andamento, faça a 2D e **retome** de onde parou.
4. A 2D depende da 2B (agregação) e da 2C (dados de teste). Se faltarem, execute-as antes.

## 5. ESPECIFICAÇÃO DO PAINEL

### 5.1 Posição na tela

Na página **Dados e Estatísticas**, nova seção **"Panorama da Pesquisa"** **logo abaixo do cabeçalho da seção** (título, n, "Atualizar Dados", selo de teste) e **antes** dos 6 gráficos existentes ("primeiro os totais"). Ordem: **K1–K6 → D1–D3 → D4 e D5 lado a lado → B1 e B2 → gráficos existentes**.

### 5.2 Cards K1–K6

Número grande, rótulo curto, ícone, acessível por leitor de tela. Valores esperados com os dados de teste: **K1 = 30 · K2 = 12 · K3 = 40% · K4 = 20 · K5 = 10 · K6 = 1** (a K6 só aparece pública conforme a regra 2).

### 5.3 Gráficos circulares D1–D5 (donut, número no centro)

| Gráfico | Centro | Fatias | Esperado (teste) |
|---|---|---|---|
| D1 Total geral | **30** "mulheres pesquisadas" | Individuais · Empresas | 20 / 10 |
| D2 Com sintomas | **12** "com sintomas relatados" | Com sintomas · Sem sintomas | 12 / 18 |
| D3 Percentual | **40%** | Com sintomas · Sem sintomas | 40 / 60 |
| D4 Pesquisa individual | **20** + "40% com sintomas" | Com · Sem | 8 / 12 |
| D5 Pesquisa empresas | **10** + "40% com sintomas" | Com · Sem | 4 / 6 |

Mostrar **legenda com número e percentual**, tooltip, cores com contraste, botão "Expandir" (como nos demais), e **tabela equivalente oculta** para leitor de tela.

### 5.4 Blocos B1 e B2 (list box + gráfico)

- **Select** com as dimensões (Bairro, Faixa etária, [3ª opção se existir]). Ao escolher, o gráfico **é gerado/atualizado na hora** (pode ter botão "Gerar gráfico" além disso, para acessibilidade).
- **Gráfico de barras agrupadas por categoria:** série 1 = **pesquisadas**, série 2 = **com sintomas**; rótulos com **n e %**.
- Tabela abaixo do gráfico com `categoria | pesquisadas | com sintomas | %`.
- Aplicar as regras 3 e 4 (agrupamento "Demais", lista fechada).
- Padrões: B1 abre em **Bairro**; B2 abre em **Faixa etária**.
- Esperado (teste), B1 por bairro: **Centro 5 (2) · Vila Vargas 5 (2) · Bom Jesus 5 (2) · Recanto do Lago 5 (2)**. Faixa etária: conferir por **SQL direto**.

## 6. TAREFAS

### D0 — Auditoria (somente leitura)
Registrar em `ACHADOS.md`: (a) de onde vem **cada número** da tela atual e **por que** a faixa etária aparece 17% em tudo, por que Prevalência dá 93/7, por que as barras de sintomas somem e por que Impacto mistura unidades; (b) onde está a **página do relatório de seed** e como ela calcula; (c) se os **rótulos, "Dor" e "Resultado Alta/Baixa" do seed existem no questionário real** e se o seed passou pela finalização real (regra 5 da 2C); (d) se existe campo de **ocupação/setor/ofício**; (e) a origem dos depoimentos de **"Vozes e Relatos"** (texto fixo? tabela moderada?).

### D1 — Contrato de dados
Definições da Seção 2 em `DECISOES.md`. Especificar as funções: `get_panorama(incluir_teste)` (K1–K6 e D1–D5) e `get_distribuicao(origem, dimensao, incluir_teste)` (B1/B2). Se a 2B já criou `get_indicadores`, **estender** em vez de duplicar.

### D2 — Banco (migração aditiva e reversível, RLS ativa)
Implementar as funções com: só `concluida`; `incluir_teste` (padrão falso); lista fechada de dimensões; limite n ≥ 5 com agrupamento "Demais"; `MIN_EMPRESAS_PUBLICO`; **sem nenhum dado pessoal nem nome de empresa** no retorno público; verificação de posse dentro da função quando o escopo for de uma instituição.

### D3 — Cards K1–K6 e D4 — Gráficos D1–D5
Componentes novos, reutilizando a biblioteca de gráficos e o hook da 2B (estados carregando/erro/vazio, "n = X", "Atualizado às HH:MM", atualização automática). Responsivo: cards em 2 colunas no celular, donuts empilhados, nada cortado ou com rolagem horizontal.

### D5 — Blocos B1 e B2 (list box)
Conforme a Seção 5.4.

### D6 — Corrigir os gráficos existentes (G1, G2, G3, G5)
Religar a **Prevalência de Diagnóstico** (três categorias reais: com diagnóstico / em investigação / sem), **Frequência dos Sintomas** (rótulos do questionário, barras visíveis, ordenadas), **Impacto no Trabalho** (**dois gráficos ou dois eixos**, nunca horas e dias no mesmo eixo) e **Faixa Etária** (valores reais, cores distintas, sem categoria vazia exibida como 17%). Tudo pelas mesmas funções. G4 e G6 permanecem "aguardando pergunta" **se** o questionário realmente não coletar esses dados.

### D7 — Ajuste do seed
Executar `seed:remove` e reaplicar (`seed:apply`) para: (a) usar **somente rótulos e perguntas reais** do questionário (remover do seed o que não existir lá); (b) gravar para as 10 colaboradoras o **bairro de residência** em vez de "Empresa (sede)": para a demonstração de B2 funcionar com o limite n ≥ 5, usar **5 em Centro e 5 em Bom Jesus** (parametrizável), registrando a escolha em `DECISOES.md`; (c) **regenerar o relatório de seed pelas mesmas funções** do sistema.

### D8 — Reuso na área da instituição e no PDF
Na área protegida (Fase 5), a instituição vê o **Panorama da própria pesquisa** (K1–K3, D5 equivalente e B2) com escopo `pesquisa`, e o **PDF** usa os mesmos números e o selo "TESTE" quando houver dado de teste. Adicionar a tarefa `F5.11` no `PLANO.md`: "Conferir Panorama da instituição de teste e PDF".

### D9 — Testes e portão da fase
Registrar em `TESTES.md`:
1. **Conferência numérica por SQL direto** de K1–K6, D1–D5, B1 e B2 (valores da Seção 5).
2. Resposta parcial não altera nada; concluir uma resposta altera tudo em até 60 s.
3. Faixa etária deixa de mostrar 17% em tudo e bate com a contagem real.
4. Dimensão inválida enviada pelo cliente é **rejeitada** pelo banco.
5. Grupo com n < 5 é **agrupado em "Demais"** ou oculto (simular), sem permitir deduzir o valor por subtração.
6. A tela pública **não traz o nome da empresa** nem dado pessoal; com menos de `MIN_EMPRESAS_PUBLICO` empresas, os dados de empresas ficam ocultos (e liberados só em desenvolvimento com selo).
7. Selo "Dados de teste" aparece quando incluídos; com `incluir_teste` falso, voltam ao estado "sem dados suficientes".
8. Visual em 320, 375, 768, 1024 e 1440 px sem cortes; expandir em tela cheia funciona e fecha por toque e `Esc`.
9. Relatório de seed e tela mostram **os mesmos números**.

**Critérios de aceite:** todos os itens acima OK; nenhum número fixo restante; `build` limpo. Registrar "FASE 2D CONCLUÍDA" e **retomar o plano**.

## 7. ACHADO EXTRA: DEPOIMENTOS EM "VOZES E RELATOS"
Se os depoimentos (ex.: "Maria S., 28 anos") forem texto fixo, **não apresente como reais**. Opções, em ordem de preferência: (1) alimentar a lista **só** com relatos **moderados e autorizados** vindos do banco; (2) rotular como **"Exemplo ilustrativo"** e trocar "Histórias reais" por texto neutro; (3) remover. Registrar a escolha em `DECISOES.md` e informar no `RELATORIO_FINAL.md`. **Não** publicar relato real sem a moderação e a autorização já prometidas no formulário.

## 8. FORMATO DAS RESPOSTAS
A cada tarefa: `[ID] concluída — o que mudou — evidência — próxima: [ID]`. Mensagem longa só se houver bloqueio (por exemplo, a 3ª opção da lista ou a decisão sobre os depoimentos).

## 9. COMECE AGORA
Execute a Seção 4 e depois **D0**. Siga sozinho até o portão **D9** e então retome o plano original.
