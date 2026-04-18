# TinDo

> Swipe suas tarefas. IA prioriza, você julga.

Tinder das tarefas. Cards ordenados por score 0–100, 4 direções de swipe, feedback multissensorial na conclusão. Inspirado em ciência do comportamento: reduzir decisão (só a próxima), maximizar execução (reforço pós-conclusão), manter juízo humano no centro (IA sugere, nunca decide).

## Documentação (ler nesta ordem)

| # | Doc | O que tem |
|---|---|---|
| 00 | [docs/00-arquitetura.md](docs/00-arquitetura.md) | Stack, pastas, fluxos, segurança |
| 01 | [docs/01-schema.sql](docs/01-schema.sql) | Schema executável (RLS, triggers, views) |
| 02 | [docs/02-algoritmo-score.md](docs/02-algoritmo-score.md) | Fórmula determinística 0–100 |
| 03 | [docs/03-roadmap.md](docs/03-roadmap.md) | Fases 0–6 com critérios de pronto |
| 04 | [docs/04-kpis-recalibracao.md](docs/04-kpis-recalibracao.md) | KPIs e gatilhos de recalibração |
| 11 | [docs/11-card-spec.md](docs/11-card-spec.md) | Anatomia e gestos do card |
| 12 | [docs/12-neuro-recompensa.md](docs/12-neuro-recompensa.md) | Recompensa multissensorial |
| 13 | [docs/13-interacao.md](docs/13-interacao.md) | Padrões UX transversais |
| 20 | [docs/20-todoist-sync.md](docs/20-todoist-sync.md) | Arquitetura de sync com Todoist |
| 21 | [docs/21-ia-recalibracao.md](docs/21-ia-recalibracao.md) | IA: Haiku + Sonnet + gatilhos |
| — | [CLAUDE.md](CLAUDE.md) | Diretivas vinculantes pro agente Claude Code |
| — | [PLAN.md](PLAN.md) | Plano mestre deste bootstrap |
| — | [RETOMAR.md](RETOMAR.md) | Checklist do humano pra fechar Fase 0 |

## Stack

- **Framework:** Next.js 15 (App Router) + Bun
- **UI:** React 19, Tailwind 4, shadcn/ui (Radix), Framer Motion 11, Tone.js
- **Estado:** Zustand 5
- **Banco:** Supabase (Postgres 15) + RLS
- **Auth:** Magic Link
- **PWA:** next-pwa
- **Deploy:** Cloudflare Pages ou Vercel (a decidir)
- **IA:** Anthropic SDK (Haiku 4.5 + Sonnet 4.6)

## Setup local

Ver [RETOMAR.md](RETOMAR.md) pro passo a passo.

```bash
bun install
cp .env.example .env.local  # editar com sua anon key
bun dev
```

## Design

Obsidian (fundo) + Jade YaaX (accent `#198B74` / `#2CAF93`). Dark-first. Clean, minimalista, sóbrio. Celebrativo só na conclusão.

## Repositório

- GitHub: https://github.com/yaaxtech/tindo
- Supabase: project `cpcglkytrtkisrehqvsc`
- Owner: falecomseucamarao@gmail.com
