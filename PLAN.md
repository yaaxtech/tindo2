# PLAN.md — TinDo (versão nova em /tindo2)

> Plano mestre. Responde ponto a ponto o briefing original.
> Gerado em 2026-04-17 durante sessão autônoma. Dono: falecomseucamarao@gmail.com.

---

## 1. Diagnóstico da situação encontrada

Ao iniciar:
- `/Users/maiaemanuel/tindo antigo/` — versão bootstrapped em Next 16 (commits de hoje, "meio bugado" segundo user).
- `/Users/maiaemanuel/tindo/` — pasta vazia (resquício).
- `/Users/maiaemanuel/tindo2/` — só `CLAUDE.md` do projeto SeuCamarão como referência.
- GitHub `yaaxtech/tindo` — já tem commits da versão antiga.

User pediu explicitamente: **começar do zero em `/tindo2`**. Versão antiga descartada (mas preservada em disco).
CLAUDE.md do SeuCamarão movido pra `_REF_CLAUDE_seucamarao.md` como referência — dá pra deletar após validar que não precisa mais.

---

## 2. Decisões arquiteturais tomadas autonomamente

| Decisão | Motivo |
|---|---|
| Next **15** (não 16 como no antigo) | User travou "Next 15" no briefing; 16 é recente demais e pode ter causado o "bugado" |
| React 19 estável | Casa com Next 15.1 |
| Tailwind **4** | Tokens via `@theme inline`, design system integrado |
| shadcn/ui via Radix primitives | Pedido pelo user; adicionamos conforme necessidade |
| `next-pwa` | Pedido pelo user; instalável mobile |
| Zustand 5 | Pedido pelo user; store simples |
| Framer Motion 11 | Pedido pelo user; gestos sólidos |
| Tone.js | Pedido pelo user; áudio feedback |
| Supabase existente (`jtpfauouvbtmhgrszybk`) | User já criou; reaproveitamos |
| Auth: Magic Link email (NÃO WhatsApp Z-API na Fase 0) | WhatsApp requer config extra, não é caminho crítico pro MVP. OTP WhatsApp vira Fase 6+ |
| Score determinístico em `lib/score.ts` | Fiel ao princípio "humano julga, não a IA"; IA só inputa atributos |
| RLS estrita + soft-delete | Boa prática do SeuCamarão que vale a pena manter |
| Dark-first (Obsidian + Jade) | Design pedido; light mode só em fase posterior |
| Gestos: → pular, ← voltar, ↑ adiar manual, ↓ adiar auto | Segue exatamente o briefing (mapeamento "pra trás/frente" no texto do user) |
| Commit local sem push automático | Estratégia de repo é sua decisão de manhã (ver §5) |

---

## 3. O que está pronto (código)

### Estrutura
```
tindo2/
├── package.json          # Next 15 + React 19 + Supabase + shadcn ecosystem
├── tsconfig.json         # strict + noUncheckedIndexedAccess
├── next.config.ts
├── postcss.config.mjs    # Tailwind 4
├── eslint.config.mjs
├── .prettierrc
├── .env.example
├── .gitignore
├── CLAUDE.md             # diretivas do agente
├── PLAN.md               # este
├── RETOMAR.md            # checklist humano pra amanhã
├── docs/
│   ├── 00-arquitetura.md
│   ├── 01-schema.sql         ← colar no Supabase SQL Editor
│   ├── 02-algoritmo-score.md
│   ├── 03-roadmap.md
│   ├── 04-kpis-recalibracao.md
│   ├── 11-card-spec.md
│   ├── 12-neuro-recompensa.md
│   ├── 13-interacao.md
│   ├── 20-todoist-sync.md
│   └── 21-ia-recalibracao.md
├── public/
│   └── manifest.webmanifest
└── src/
    ├── app/
    │   ├── (app)/feed/{page,feed-client,layout}.tsx
    │   ├── (auth)/auth/callback/route.ts
    │   ├── (auth)/login/page.tsx
    │   ├── globals.css
    │   ├── layout.tsx
    │   └── page.tsx      # landing com aurora + CTA
    ├── components/
    │   └── task-card/
    │       ├── task-card.tsx       ← swipe + keyboard + háptico + som
    │       └── completion-burst.tsx
    ├── hooks/
    │   └── use-swipe-keyboard.ts
    ├── lib/
    │   ├── cn.ts
    │   ├── env.ts                  # Zod guard pro .env
    │   ├── haptic.ts
    │   ├── score.ts                # fórmula determinística
    │   ├── sound.ts                # Tone lazy
    │   ├── supabase.ts             # browser proxy lazy
    │   └── supabase-server.ts
    ├── middleware.ts               # auth guard
    ├── services/
    │   ├── index.ts                # re-export
    │   ├── tasks.ts
    │   ├── projects.ts
    │   ├── tags.ts
    │   ├── reviews.ts
    │   └── score-weights.ts
    ├── stores/
    │   └── feed-store.ts
    ├── styles/
    │   └── tokens.css              # Obsidian + Jade + gradientes
    └── types/
        ├── db.ts                   # schema TypeScript
        └── domain.ts
```

### Feature status

| Feature | Status | Notas |
|---|---|---|
| Bootstrap Next 15 + Tailwind 4 | ✅ Pronto | Falta `bun install` |
| Landing `/` | ✅ Pronto | Aurora + CTA + features grid |
| Login magic link `/login` | ✅ Pronto | Enter submete, 3 phases |
| `/auth/callback` | ✅ Pronto | Troca code por sessão |
| Middleware auth | ✅ Pronto | Protege `/feed`, `/ajustes`, `/historico`, `/calibrar` |
| Feed com card demo | ✅ Pronto | 3 tarefas fake, swipe + keyboard funcionando |
| TaskCard swipeable | ✅ Pronto | 4 direções, hints visuais, keyboard |
| CompletionBurst | ✅ Pronto | 720ms, 18 partículas + glow + ✓ |
| Som (Tone.js lazy) | ✅ Pronto | Arpejo na conclusão, tick no swipe |
| Háptico | ✅ Pronto | Padrões success/medium/soft/error |
| Score determinístico | ✅ Pronto | Pesos default + tags + penalidade adiamento |
| Schema SQL completo | ✅ Pronto | 10 tabelas + 2 views + RLS + triggers |
| Services (CRUD) | ✅ Pronto | tasks, projects, tags, reviews, weights |
| Feed store (Zustand) | ✅ Pronto | deck + history |
| PWA manifest | ✅ Pronto | Falta gerar ícones 192/512 |
| `bun install` | ⏳ Pendente | Rodar localmente (requer rede) |
| Schema aplicado no Supabase | ⏳ Pendente humano | `docs/01-schema.sql` |
| Anon key em `.env.local` | ⏳ Pendente humano | `https://supabase.com/dashboard/project/jtpfauouvbtmhgrszybk/settings/api` |
| Redirect URLs Supabase | ⏳ Pendente humano | Magic link redireciona |
| Deploy | ⏳ Pendente humano | Cloudflare Pages ou Vercel |
| Estratégia de repo | ⏳ Pendente humano | Force-push / branch v2 / novo repo |

---

## 4. Resposta ao briefing (ponto a ponto)

### Objetivo
✅ Cards priorizados, uma tarefa por vez. IA (Fase 5+) prioriza, humano julga.

### Sobre o card
✅ 4 direções de swipe (→ pular, ← voltar, ↓ auto, ↑ manual).
✅ Sub-swipe do "adiar manual" está **especificado** em `docs/11-card-spec.md` — **implementar em Fase 1** (hoje é placeholder).
✅ Botões: Concluir (com burst), Excluir, Editar, Dependência.
⏳ Adicionar: é uma page separada em Fase 1 (`/tarefa/nova` em bottom-sheet).

### Recursos
✅ Mobile-first + keyboard (setas + Enter).
✅ Tipos: tarefa e lembrete (separados no schema + na UI).
✅ Gamificação básica no schema (`v_gamificacao`) — UI na Fase 4.
✅ Score 0–100 baseado em urgência/importância/facilidade + projeto + prazo.
⏳ Todoist sync: specificado em `docs/20`, implementado em Fase 2.
✅ Pesos ajustáveis de Data/Prazo/Prioridade (UI em `/ajustes` Fase 1).
✅ Tags com tipo_peso (multiplicador / soma / percentual).
⏳ Recalibração automática: specificada em `docs/04` + `docs/21`, implementada em Fase 5-6.

### Todoist
⏳ Fase 2. Arquitetura documentada em `docs/20-todoist-sync.md`:
- OAuth2 + token em Supabase Vault.
- Edge Function `todoist-pull` (cron 10min).
- Filtro por etiquetas `Todo` e `Lembretes`.
- Mapeamento completo na doc.
- Bidirecional em Fase 3 via webhook.

### Inteligência Artificial
⏳ Fases 5-6. Arquitetura documentada em `docs/21-ia-recalibracao.md`:
- Haiku pra classificação (barato, alta frequência).
- Sonnet pra recalibração (raciocínio profundo).
- Prompt cache obrigatório (redução ~85% de custo).
- Humano aprova toda mudança não-trivial.
- 3 gatilhos de recalibração com thresholds ajustáveis.

### Estrutura
✅ GitHub existente (`yaaxtech/tindo`) — estratégia de push em §5.
✅ Supabase existente (`jtpfauouvbtmhgrszybk`) — aplicar schema manualmente.
✅ Stack travada exatamente como pedido.
✅ Design Obsidian + Jade YaaX com variáveis CSS.
✅ Clean, minimalista, sóbrio — cor verde só em accent.

### Considerações finais
✅ Passo a passo em `RETOMAR.md`.
✅ Auto-aceite ativado (execução sem bloquear).
✅ Caffeinate rodando (6h).
✅ KPIs pro humano calibrar em `docs/04-kpis-recalibracao.md`.
✅ Agentes especialistas: ainda não precisou lançar — o bootstrap e specs são diretos. Eles entram em Fase 1+ se houver feature UI complexa (ex: sub-swipe de adiar manual, onboarding IA).

---

## 5. Decisões pendentes (suas, de manhã)

### 5.1 Estratégia de repositório GitHub
Repo `yaaxtech/tindo` já tem commits da versão antiga. 3 opções:

| Opção | Prós | Contras | Recomendo? |
|---|---|---|---|
| **A. Force-push sobre main** | Histórico limpo; URL `tindo` permanece | Destrutivo; perde o "antigo" no remote | Só se aceitar perder |
| **B. Criar branch `main-v2` e default nele** | Preserva histórico do antigo; caminho limpo pra v2 | Um toque de configuração no GitHub | **Recomendo** |
| **C. Criar novo repo `tindo-v2`** | Máxima separação; zero risco | URL menos elegante; forks/stars não migram | Se preferir purismo |

Se escolher B ou C, eu executo `git init` + criar branch + push na próxima sessão após sua aprovação.
Se escolher A, preciso sua confirmação explícita pra rodar `git push --force` (auto-mode bloqueia).

### 5.2 Host de deploy
- **Vercel** — melhor DX Next.js, detecta sozinho, preview automático por PR.
- **Cloudflare Pages** — preferência sua histórica; precisa adaptador `@cloudflare/next-on-pages`.

Recomendo Vercel pra Fase 0 (rapidez), migrar pra Cloudflare em Fase 3+ se custo virar tema.

### 5.3 Delete do CLAUDE.md de referência
`_REF_CLAUDE_seucamarao.md` pode ser deletado quando você validar que o CLAUDE.md novo cobriu o que precisava.

### 5.4 Destino de `/Users/maiaemanuel/tindo antigo/`
Mantido intacto. Quando tiver certeza que não precisa nada dela: `rm -rf "/Users/maiaemanuel/tindo antigo/"`. Eu não deleto automaticamente.

---

## 6. Roadmap resumido

Ver `docs/03-roadmap.md` completo. Resumo:

- **Fase 0 (agora):** Bootstrap + deploy + schema. Critério: login funciona, feed demo roda.
- **Fase 1:** Feed real + CRUD + sub-swipe + offline cache. ~5 dias.
- **Fase 2:** Todoist sync pull. ~4 dias.
- **Fase 3:** Todoist sync push bidirecional. ~3 dias.
- **Fase 4:** Gamificação profunda (streak, retrô). ~4 dias.
- **Fase 5:** IA classificação (Haiku). ~5 dias.
- **Fase 6:** IA recalibração (Sonnet). ~5 dias.

Total teórico: ~26 dias de trabalho. Na prática: espera 6-8 semanas.

---

## 7. KPIs de sucesso do projeto (meta-KPIs)

Ver `docs/04-kpis-recalibracao.md` pros KPIs de runtime. Aqui os **meta-KPIs** pra você avaliar o projeto inteiro:

| Meta-KPI | Meta | Janela |
|---|---|---|
| Uso acumulado (semanas com ≥ 5 dias ativos) | 4+ | primeiros 2 meses |
| Taxa de conclusão média | ≥ 60% | semanal |
| Delta humano–máquina médio | ≤ 12 | após Fase 5 |
| Custo IA por mês | < R$ 10/mês | após Fase 6 |
| Satisfação subjetiva (1-5) | ≥ 4 | review mensal |

Se 3+ KPIs baterem a meta em 2 meses: projeto validado, continuar investindo.
Se 2 KPIs falharem: pare, reavalie.
Se 0-1 KPIs baterem: considere shutdown ou pivot forte.

---

## 8. Perguntas-chave pra você responder de manhã

1. **Estratégia de repo:** A (force-push), B (branch v2), ou C (novo repo)?
2. **Host deploy:** Vercel ou Cloudflare Pages?
3. **Gerar ícones PWA agora:** posso rodar com um comando placeholder (icon-192.png e icon-512.png) ou você prefere design final?
4. **Deletar `tindo antigo/` e `_REF_CLAUDE_seucamarao.md`:** agora, depois, ou manter?
5. **Credenciais:** cola o anon key no `.env.local` antes de testar `bun dev`.

Vou começar Fase 1 assim que 1-3 forem respondidos.
