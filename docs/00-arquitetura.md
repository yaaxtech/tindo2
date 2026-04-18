# 00 — Arquitetura

## Objetivo-âncora
TinDo é um app de tarefas em cards swipeáveis. IA prioriza, gamificação recompensa, **o humano julga**. O principal papel do humano, ao usar IA, é exercer juízo de valor — e é isso que calibra o sistema.

## Stack travada
| Camada | Tecnologia | Justificativa |
|---|---|---|
| Framework | Next.js 15 (App Router) | SSR + route handlers + edge-ready |
| Runtime | Bun | Rápido instalar/rodar, lock file determinístico |
| UI | React 19 + Tailwind 4 + shadcn/ui | Tokens via `@theme inline`, Radix primitives |
| Animação | Framer Motion 11 | drag/gesto sólidos, AnimatePresence |
| Áudio | Tone.js (lazy) | Feedback sonoro pós-conclusão |
| Estado | Zustand 5 | Global leve; nada de Redux |
| Validação | Zod | Env + payloads externos (Todoist, IA) |
| Banco | Supabase (Postgres 15) + RLS | `cpcglkytrtkisrehqvsc` |
| Auth | Supabase Magic Link | OTP email; WhatsApp fica pra v2 |
| Deploy frontend | Cloudflare Pages OU Vercel | Decisão de manhã (user) |
| PWA | `next-pwa` | Instalável mobile + offline cache |
| IA | Anthropic SDK (Haiku + Sonnet) | Haiku pra alta frequência, Sonnet pra raciocínio |

## Estrutura de pastas
```
tindo2/
├── src/
│   ├── app/                    # Next App Router
│   │   ├── (app)/feed/         # rota protegida principal
│   │   ├── (auth)/login/       # magic link
│   │   ├── (auth)/auth/callback/
│   │   ├── layout.tsx
│   │   ├── page.tsx            # landing
│   │   └── globals.css
│   ├── components/
│   │   ├── task-card/          # card swipeável + burst
│   │   └── ui/                 # shadcn primitives (add via CLI)
│   ├── hooks/
│   ├── lib/
│   │   ├── cn.ts
│   │   ├── env.ts              # Zod guard
│   │   ├── haptic.ts
│   │   ├── score.ts            # fórmula 0–100 determinística
│   │   ├── sound.ts            # Tone.js lazy
│   │   ├── supabase.ts         # browser client
│   │   └── supabase-server.ts  # server client (cookies)
│   ├── services/               # TODA leitura/escrita via aqui
│   ├── stores/                 # Zustand
│   ├── styles/tokens.css       # Obsidian + Jade YaaX
│   ├── types/db.ts             # gerado do Supabase
│   ├── types/domain.ts         # tipos de produto
│   └── middleware.ts           # auth guard
├── docs/
│   ├── 00-arquitetura.md       # este
│   ├── 01-schema.sql           # verdade do banco
│   ├── 02-algoritmo-score.md   # fórmula + testes
│   ├── 03-roadmap.md           # Fases 0-6
│   ├── 04-kpis-recalibracao.md # juízo humano
│   ├── 11-card-spec.md         # anatomia + gestos
│   ├── 12-neuro-recompensa.md  # dopamina bem calibrada
│   ├── 13-interacao.md         # atalhos, dialogs, UX cross
│   ├── 20-todoist-sync.md      # arquitetura de sync
│   └── 21-ia-recalibracao.md   # quando e como IA atua
├── public/
│   ├── icons/
│   └── manifest.webmanifest
├── CLAUDE.md                   # diretivas pro agente
├── PLAN.md                     # plano mestre (este projeto)
├── RETOMAR.md                  # checklist humano
└── README.md
```

## Fluxos principais

### Feed
1. `/feed` (Server Component) → `getServerSupabase().auth.getUser()`.
2. Busca `v_feed_priorizado` (score desc, prioridade asc, prazo asc).
3. Hidrata store Zustand. Renderiza `<TaskCard>` do topo.
4. User interage (swipe/botão) → `services/reviews.log()` + `services/tasks.update()` → `feed-store.next()`.

### Sync Todoist (cascata)
1. User autoriza OAuth → token em Supabase Vault (server-side).
2. Edge Function `todoist-pull` (cron 10min): `sync` API com `sync_token` incremental.
3. Resolvemos em `tasks` com `upsert ON CONFLICT (user_id, todoist_id)`.
4. Mudanças no TinDo → `todoist-push` (webhook) chama Todoist REST.
5. Detalhes em `docs/20-todoist-sync.md`.

### Calibração IA
1. Onboarding: 2 perguntas ("o que te despreocuparia hoje?", "critério de sucesso?").
2. Respostas salvas em `ai_calibrations`.
3. Haiku roda a cada N tarefas novas: gera `importancia`/`urgencia`/tags sugeridas.
4. Sonnet roda em gatilhos (ver `docs/21-ia-recalibracao.md`): reordena projetos, sugere quebras de tarefa, propõe recalibração.
5. **Humano aprova toda mudança** — IA não escreve direto no banco sem revisão.

## Segurança
- RLS em **toda** tabela; policies por `user_id = auth.uid()`.
- Tokens de API (Todoist, Anthropic) apenas server-side / Edge Functions.
- `.env.local` nunca commitado. `.env.example` é fonte.
- `service_role_key` só em Edge Functions — nunca no client bundle.

## Convenções
- **TypeScript strict.** Sem `any`. `noUncheckedIndexedAccess` ligado.
- **Camada de serviços obrigatória.** Componentes usam `src/services/*`, não `@supabase/supabase-js`.
- Imports via `@/*`.
- Commits: Conventional (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`).
- ESLint + Prettier no check. Build quebra com warning.
- PRs explicam **por quê**, não **o quê**.

## Performance
- `optimizePackageImports` pra lucide-react + framer-motion.
- Tone.js carrega lazy (só ao primeiro swipe/conclusão).
- Supabase client singleton via Proxy lazy.
- Views priorizadas com índices: `idx_tasks_feed` cobre 95% do feed.
