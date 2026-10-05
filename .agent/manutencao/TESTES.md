# MATRIZ DE TESTES E EVIDÊNCIAS DE VERIFICAÇÃO

## 1. MATRIZ DE TESTES DE NAVEGAÇÃO E ROTAS (FASE 1 & 7)

| Item de Menu / Rota | Ação / Origem | Dispositivo | Resultado Esperado | Status |
|---|---|---|---|---|
| `/` (Início) | Clique Menu | Desktop | Scroll topo suave, header visível | OK |
| `#oquee-endometriometro` | Clique Menu | Mobile (375px) | Abre na seção "O que é o Endometriômetro", sem travar scroll | OK |
| `#sobre` | Clique Submenu | Desktop | Abre início da seção "O que é Endometriose", offset de 90px | OK |
| `#tratamento` | Clique Submenu | Desktop/Mobile | Navega para card de Tratamento, sem cortar topo | OK |
| `/pesquisa` | Link Direto / F5 | Mobile | Carrega topo da apresentação da pesquisa, sem 404 | OK |
| `/login` | Botão Entrar / Cadastrar | Desktop | Abre tela de escolha (Individual x Empresa) | OK |
| `/banco-de-dados` | Link Direto | Desktop | Redireciona para `/login?returnUrl=...` se não autenticado | OK |
| `/relatorio` | Link Direto | Desktop | Redireciona para `/login` por conta da proteção de rotas | OK |

## 2. TESTE 1 — FLUXO INDIVIDUAL COMPLETO (FASE 4)
- **Etapa 1:** Navegação até `/pesquisa` -> Apresentação do ENDOMETRIÔMETRO exibida no topo.
- **Etapa 2:** Preenchimento dos dados (idade, localidade, diagnóstico prévio).
- **Etapa 3:** Seleção de sintomas e slider de intensidade de dor.
- **Etapa 4:** Informação sobre impacto na rotina de trabalho (horas e dias).
- **Etapa 5:** Resultado da triagem exibido com probabilidade diagnóstica.
- **Etapa 6:** Gravação atômica no banco + Card de Conclusão oficial (ANEXO A5).
- **Etapa 7:** Botão "Voltar para o início" redireciona para a Home Page.
- **Resultado:** OK — Teste 1 concluído em Desktop e Celular sem duplicidade de envio.

## 3. TESTE 2 — FLUXO INSTITUCIONAL COMPLETO (FASE 5)
- **Etapa 1:** Cadastro/Login da Empresa com e-mail corporativo (ANEXO A8).
- **Etapa 2:** Redirecionamento automático para o Painel Corporativo (`/banco-de-dados`).
- **Etapa 3:** Criação de nova pesquisa com geração de token único não previsível de 128-bits.
- **Etapa 4:** Teste dos botões "Copiar Link" e "Compartilhar" (Web Share API).
- **Etapa 5:** Visualização dos gráficos agregados exclusivamente da empresa com barreira K-Anonymity >= 5.
- **Etapa 6:** Geração do Relatório em PDF profissional via botão oficial (ANEXO A9).
- **Resultado:** OK — Teste 2 concluído. Isolamento total entre duas contas institucionais de teste.

## 4. BATERIA DE TESTES DE SEGURANÇA E RLS (FASE 6)
- **RLS:** Ativa em todas as tabelas (`profiles`, `companies`, `surveys`, `survey_responses`).
- **Segredos:** Varredura no código e git — zero `service_role` ou chave privada exposta no frontend.
- **Headers Vercel:** `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `HSTS`, `Permissions-Policy` configurados em `vercel.json`.
- **Source Maps:** Desativados no build de produção (`sourcemap: false` em `vite.config.ts`).
- **Resultado:** OK — 100% dos requisitos de segurança validados.
