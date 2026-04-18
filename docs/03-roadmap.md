# 03 — Roadmap por Fases

Fases curtas (2–5 dias cada). Cada fase tem critério de pronto objetivo.

## Fase 0 — Bootstrap (em andamento)
**Critério de pronto:**
- [x] Next 15 + Bun + Tailwind 4 + TS strict + shadcn-ready
- [x] Tokens CSS Obsidian + Jade + gradientes
- [x] Supabase client (browser + server) + middleware
- [x] Rotas: `/`, `/login`, `/auth/callback`, `/feed` (protegida)
- [x] Score determinístico com testes mentais
- [x] TaskCard swipeável (Framer) + keyboard + háptico + som
- [ ] Anon key no `.env.local` (humano copia)
- [ ] Schema aplicado no Supabase (humano roda `docs/01-schema.sql`)
- [ ] Redirect URLs configuradas no Supabase Auth
- [ ] Deploy preview (Cloudflare ou Vercel) com URL verde
- [ ] Ícones PWA 192/512 gerados

Ver `RETOMAR.md` pro checklist humano exato.

## Fase 1 — Feed real (sem Todoist ainda)
**Objetivo:** usuário loga, vê cards de tarefas reais do banco, swipe atualiza estado.

- Seed SQL com 10 tarefas demo (dev-only).
- CRUD de tarefa via FormModal (shadcn Dialog).
- Adiar manual com sub-swipe (4 opções).
- Historico `/historico` simples (últimas 50 reviews).
- Offline cache via next-pwa (só read).
- **Critério:** swipe fecha em ≤ 180ms, próxima tarefa aparece sem flicker. Deck carrega em < 300ms.

## Fase 2 — Sincronização Todoist (leitura)
**Objetivo:** pull de tarefas Todoist com etiquetas `Todo` e `Lembretes`.

- OAuth Todoist + token no Supabase Vault.
- Edge Function `todoist-pull` com sync incremental.
- Mapeamento: etiqueta → tipo (`Todo`/`Lembretes`).
- Mapeamento: projeto → `projects`, priority → `prioridade`.
- Import em massa com dedupe `ON CONFLICT (user_id, todoist_id)`.
- **Critério:** ao conectar conta, 100% das tarefas com as etiquetas certas aparecem no feed em < 60s.

## Fase 3 — Sincronização Todoist (bidirecional)
- Push: concluir/adiar/editar no TinDo → chamada REST Todoist.
- Webhook Todoist → Edge Function `todoist-webhook`.
- Resolução de conflito: "last write wins" com timestamp.
- **Critério:** fluxo de uma tarefa: criar no Todoist → aparece no TinDo → concluir no TinDo → marcada no Todoist em < 15s (sem precisar recarregar).

## Fase 4 — Gamificação profunda
- Streak diário (concluir ≥ 3/dia).
- Ranking de projetos por conclusão semanal.
- Tela de "vitórias da semana" (retrô de sexta).
- Sons e bursts calibrados (ver `docs/12-neuro-recompensa.md`).
- **Critério:** usuário visita `/historico` voluntariamente ao menos 1x por dia na primeira semana.

## Fase 5 — IA: classificação de tarefas
- Onboarding IA (2 perguntas calibração).
- Haiku classifica `importancia`/`urgencia`/`facilidade` em novas tarefas.
- User revisa sugestões em tela de "inbox de sugestões".
- Métrica: % aceito vs rejeitado → gatilho de recalibração.
- **Critério:** primeiras 20 sugestões aceitas ≥ 70%.

## Fase 6 — IA: recalibração + sugestões
- Sonnet roda em gatilhos (KPIs em `docs/04`).
- Reordenação de projetos sugerida, com explicação.
- Quebra de tarefa grande em sub-tarefas (aceitar/rejeitar).
- Sugestão de novas tarefas baseado no critério de sucesso.
- Tela de "calibração manual" (5 tarefas em slider 0-100).
- **Critério:** 3 ciclos de recalibração aceitos com satisfação média ≥ 4/5.

## Backlog fora de fase
- OTP WhatsApp (Z-API).
- Multi-device sync sem Todoist (Realtime).
- Integração Google Calendar (adiar inline).
- Modo escritório (PC primário).
- Compartilhar tarefa com outra pessoa.
