---
name: Implantacao Skill 001
description: Processos de implantação descritos no arquivo skill-001.pdf para o projeto ENDOMETRIÔMETRO.
---

# Implantação das Regras do skill-001.pdf

Este arquivo contém todas as regras e o roteiro de execução em etapas, extraídos **exclusivamente do documento skill-001.pdf**. A execução será feita passo a passo, sendo validada pelo usuário antes de prosseguir.

## Regras Gerais de Execução
1. **NÃO ALTERAR LAYOUT NEM PALETA DE CORES.** As mudanças são apenas de comportamento e dados.
2. Reutilize os mesmos estilos de input/botão já usados nas telas existentes para qualquer novo elemento.
3. Não remova nenhum conteúdo educativo ("Entendendo a Endometriose" e "Vozes e Relatos").
4. Antes de executar cada passo, o agente deve explicar o que será feito e aguardar a ordem do usuário.

---

## Passo 1: Ajustes no Schema do Banco de Dados (SQL)
- Tornar o campo `company_id` nulo na tabela `profiles` quando a pessoa não tem empresa vinculada.
- Adicionar Foreign Key (FKEY) de `company_id` para `companies(id)`.
- Tornar `survey_id` obrigatório (`NOT NULL`) em `survey_responses`.
- Adicionar Foreign Key (FKEY) de `survey_id` para `surveys(id)`.
- Adicionar constraint `UNIQUE (user_id, survey_id)` em `survey_responses` para limitar uma resposta por pessoa por pesquisa.
- Habilitar `Row Level Security (RLS)` na tabela `survey_responses`.
- Criar policy para que o participante veja apenas a própria resposta (`auth.uid() = user_id`).
- Criar policy para que a empresa veja apenas as respostas vinculadas a ela (onde `company_id` corresponda ao perfil logado com role 'instituicao').

---

## Passo 2: Funções RPC e Privacidade / K-Anonymity (SQL)
- Criar função RPC `get_survey_metrics_aggregated(p_survey_id, p_company_id)` que verifica se o total de respostas concluídas é menor que 5. Se for menor, retornar nulo. Se for maior ou igual, retornar os dados reais.
- Criar função RPC `get_global_indicators()` para a home pública. Mesma regra: se total < 5, retornar nulo. Caso contrário, calcular as estatísticas baseadas nos dados de respostas.
- Criar View Materializada `mv_global_indicators` para cache dos indicadores públicos.
- Criar índice único `mv_global_indicators_unique` na view materializada.

---

## Passo 3: Fluxo de Autenticação (Frontend/React)
- Transformar os formulários "Pesquisa Individual" e "Área da Empresa" num fluxo real de login/cadastro usando Supabase Auth.
- Adicionar o campo de senha (mínimo 8 caracteres) aos formulários.
- No formulário individual, e-mail e senha passam a ser obrigatórios.
- No cadastro de empresa, exigir senha.
- Unificar o link "Entrar / Cadastrar" do cabeçalho para apontar para a tela de login já utilizada pelas abas atuais.
- No componente de Login, alternar entre "Entrar" e "Criar conta" na mesma tela.
- Ao cadastrar, gravar o usuário na tabela `profiles` (se participante, com `company_id` nulo).

---

## Passo 4: Componentes de Formulário (Consentimento, Vínculo e Localização) (Frontend/React)
- Substituir a caixa informativa LGPD por um `checkbox` obrigatório. O botão "Próximo" ficará desabilitado até ser marcado.
- Aplicar checkbox idêntico para a seção "Vozes e Relatos" (texto adaptado).
- Remover o campo de texto livre "Nome da Empresa em que trabalha". O vínculo só existirá via token. Se entrar pela home, o `company_id` é nulo.
- Substituir o campo único de "Cidade e Estado" por três campos: Cidade (texto), Bairro (texto) e Estado (Select de UFs).

---

## Passo 5: Correções Visuais (CSS)
- Corrigir o vazamento (overflow) nos rótulos dos gráficos de pizza ("Prevalência" e "Distribuição por Faixa Etária").
- Aplicar contenção na classe `.stat-card` e nos labels `.recharts-pie-label-text` e `.recharts-legend-item-text` ajustando quebras de linha (`word-break`, `white-space`) e tamanho da fonte, sem alterar cores ou layout.
