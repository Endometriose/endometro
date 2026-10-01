# SKILL — MANUTENÇÃO DO ENDOMETRIÔMETRO

**Descrição:** Use sempre que o assunto for a manutenção do Endometriômetro, ao retomar o trabalho, ao perder o contexto, ou quando o usuário disser "continuar manutenção" ou "plan".

## REGRAS INVIOLÁVEIS
1. Analisar antes de alterar (código + banco).
2. Não recriar o que já existe (corrigir e aprimorar).
3. Preservar dados e manter migrações aditivas/reversíveis.
4. Não inventar dados ou credenciais fictícias.
5. Nunca expor credenciais privadas no frontend.
6. Segurança real no backend/banco (RLS + Auth).
7. Mudanças pequenas e verificáveis.
8. Verificar de verdade com evidência (build, lint, runtime).
9. Avance autonomamente conforme o protocolo.

## PROTOCOLO DE EXECUÇÃO (CICLO A -> B -> C -> D)
1. **Início / Retomada:** Ler `.agent/manutencao/PROGRESSO.md` (topo) e `.agent/manutencao/PLANO.md`. Confirmar a tarefa atual.
2. **Loop por Tarefa:**
   - Marcar tarefa em andamento.
   - Ler código/banco.
   - Implementar menor mudança correta.
   - Verificar (build, lint, testes).
   - Registrar evidências em `PROGRESSO.md` e marcar concluída.
3. **Portão de Fase:** Validar critérios de aceite, rodar build de produção e iniciar próxima fase.
4. **Fim:** Na Fase 8, gerar `RELATORIO_FINAL.md`.

## CAMINHOS DE CONTROLE
- `.agent/manutencao/PLANO.md`
- `.agent/manutencao/PROGRESSO.md`
- `.agent/manutencao/ACHADOS.md`
- `.agent/manutencao/DECISOES.md`
- `.agent/manutencao/TESTES.md`
