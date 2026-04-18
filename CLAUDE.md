# CLAUDE.md — TinDo

> Diretivas vinculantes pro agente Claude Code neste repositório.
> Em caso de conflito entre este arquivo e um pedido pontual do usuário: **pergunte antes de violar**.

---

## REGRA ZERO — Verificar antes de afirmar

Consulte os arquivos do projeto antes de responder qualquer coisa técnica.
Não invente. Não assuma. Se não souber, pergunte.
Se dois docs se contradisserem: **pare e avise**.

---

## AUTONOMIA — REGRAS DE DECISÃO AUTÔNOMA

> Reduza input necessário do dev. Siga-as antes de perguntar.

### Quando NÃO perguntar

| Situação | Ação autônoma |
|---|---|
| Dúvida sobre schema/colunas | Leia `docs/01-schema.sql` e decida |
| Dúvida sobre fórmula de score | Leia `docs/02-algoritmo-score.md` e decida |
| Dúvida sobre convenção de código | Leia `docs/00-arquitetura.md` e decida |
| Task com escopo claro (<3 arquivos) | Execute direto — sem plan mode |
| Typecheck/lint após edição | Rode e corrija sem pedir |
| Mensagem de commit | Analise diff e decida |
| Nome de variável/função/arquivo | Siga convenção do projeto |
| Gesto/ação de UI padrão | Siga `docs/11-card-spec.md` e `docs/13-interacao.md` |

**Transparência:** ao executar autonomamente, declare as suposições no início da resposta.

### Quando perguntar
- Ambiguidade de **regra de negócio** não coberta pelos docs.
- Mudança que afeta **múltiplos módulos** não relacionados.
- Ação **destrutiva irreversível** (DROP, hard DELETE, force-push).
- Pedido que **contradiz** doc interno.

---

## FLUXO DE DESENVOLVIMENTO

1. Plan mode só pra tarefas **>3 arquivos** ou mudança arquitetural.
2. **Antes de implementar, defina critério de pronto** (ex: "build verde, swipe abre em ≤180ms, score recalcula").
3. Implementa seguindo as regras abaixo.
4. `bun run check` (typecheck + lint + format:check) antes de commitar.
5. Verifica o critério do passo 2.
6. Ao finalizar uma feature, atualiza `docs/03-roadmap.md`.

---

## HIERARQUIA DE CONSULTA (nesta ordem)

| # | Doc | O que tem |
|---|---|---|
| 00 | `docs/00-arquitetura.md` | Stack, pastas, fluxos, segurança |
| 01 | `docs/01-schema.sql` | Verdade do banco (RLS, triggers, views) |
| 02 | `docs/02-algoritmo-score.md` | Fórmula determinística 0–100 |
| 03 | `docs/03-roadmap.md` | Fases e critérios de pronto |
| 04 | `docs/04-kpis-recalibracao.md` | KPIs e gatilhos |
| 11 | `docs/11-card-spec.md` | Anatomia + gestos do card |
| 12 | `docs/12-neuro-recompensa.md` | Recompensa multissensorial |
| 13 | `docs/13-interacao.md` | Dialogs, atalhos, microcopy |
| 20 | `docs/20-todoist-sync.md` | Arquitetura do sync |
| 21 | `docs/21-ia-recalibracao.md` | IA: Haiku + Sonnet + gatilhos |
| — | `CLAUDE.md` | Regras do agente (este) |
| — | Código existente | |
| — | Pergunte ao usuário | |

Não invente decisões já documentadas. Se um doc está desatualizado, atualize-o no mesmo PR.

---

## STACK (FIXADA — não alterar sem aprovação)

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 15 (App Router) |
| Runtime | Bun |
| UI | React 19 + Tailwind 4 + shadcn/ui (Radix) |
| Estado | Zustand 5 |
| Animação | Framer Motion 11 |
| Áudio | Tone.js (lazy) |
| Validação | Zod |
| Banco | Supabase (Postgres 15) — project `jtpfauouvbtmhgrszybk` |
| Auth | Supabase Magic Link (OTP email) |
| PWA | `next-pwa` |
| Deploy | Cloudflare Pages OU Vercel (decidir antes de Fase 1) |
| IA | Anthropic SDK (Haiku 4.5 + Sonnet 4.6), prompt cache obrigatório |

**Formatação:** 2 espaços, aspas simples, ponto-e-vírgula, ~80 chars.
**Commits:** Conventional (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`).

---

## REGRAS DE CÓDIGO

- **TypeScript strict.** Sem `any`. Sem `as unknown as X`. Se precisa, refatora o tipo.
- **Camada de serviços obrigatória.** Componentes **nunca** importam `@supabase/supabase-js`. Sempre via `src/services/*`.
- Tipos do banco em `src/types/db.ts` (gerado por `bunx supabase gen types`). Tipos de domínio em `src/types/domain.ts`.
- Hooks em `src/hooks/`, stores em `src/stores/`.
- Imports absolutos via `@/`.
- Sem comentários decorativos. Comentário explica **por quê**, não **o quê**.
- ESLint + Prettier rodam no check.

---

## REGRAS DE BANCO (PostgreSQL / Supabase)

```sql
-- PK sempre uuid
id uuid PRIMARY KEY DEFAULT gen_random_uuid()

-- RLS obrigatório em toda tabela
-- Policy padrão:
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid())

-- Dinheiro (quando vier): numeric(12,2), nunca float
-- Soft delete operacional: deleted_at timestamptz NULL
-- Toda query: WHERE deleted_at IS NULL

-- Status: varchar com CHECK, nunca enum PostgreSQL
status text NOT NULL CHECK (status IN ('pendente','concluida','descartada'))

-- Timestamps: created_at, updated_at via trigger set_updated_at()
```

---

## REGRAS DE UI (mobile-first)

- **Dark-first.** Light mode só em Fase 5+.
- Todo dialog: Enter → primário, Esc → fecha.
- Feedback de conclusão: visual + som + háptico em < 720ms (ver `docs/12`).
- Respeitar `prefers-reduced-motion`.
- Touch: `touch-action: none` onde o drag captura eventos.
- Focus ring em Jade (var(--color-accent)).
- Nunca bloquear UI durante chamada IA — fallback para default, ajusta depois.

---

## REGRAS DE NEGÓCIO CRÍTICAS

| ID | Regra |
|---|---|
| RN-01 | Toda tabela tem `user_id = auth.uid()` + RLS estrita |
| RN-02 | Soft-delete em `tasks`, `projects`, `tags` — nunca DELETE físico |
| RN-03 | `score_manual` sempre vence score calculado |
| RN-04 | Score é determinístico — IA só inputa atributos, nunca sobrescreve score final |
| RN-05 | Toda sugestão de IA passa por review humano antes de aplicar (exceto confiança > 0.6 em classificação) |
| RN-06 | Todoist é fonte da verdade até Fase 3; depois conversamos |
| RN-07 | Lembretes SEMPRE devem ser concluídos ou adiados — nunca ficam pendentes sem ação |
| RN-08 | Prioridade (p1..p4) = "o que te despreocuparia mais", não "o que é mais importante abstratamente" |
| RN-09 | Concluir tarefa registra review com `acao='concluir'` + `score_maquina` — histórico é fonte de recalibração |
| RN-10 | Todo call à IA precisa de prompt cache explícito (senão custo escala mal) |

---

## AUTONOMIA DO AGENTE (auto-mode)

Usuário ativou auto-mode + auto-aceite. Siga:
- **Execute direto** em tarefas de escopo claro.
- **Minimize perguntas** — assume default razoável, documenta suposição.
- **Nunca ação destrutiva irreversível** sem confirmação: `DROP`, `DELETE FROM` hard, force-push, deploy prod, envio de email.
- **Nunca expõe segredo** (credential, token, service_role) no client bundle, log, ou doc público.
- **Caffeinate** ligado enquanto trabalhando (dev rodando, claude pensando).
- **Commit ≠ push**. Commit local é livre. Push precisa nome de branch intencional.

---

## HIERARQUIA DE DIAGNÓSTICO (quando algo quebra)

1. Build falhou? → `bun run build` local, lê erro, corrige.
2. Typecheck falhou? → `bun run typecheck`, corrige tipos antes de PR.
3. Runtime 500? → checa server log (Next), checa RLS (Supabase log).
4. "Nada aparece no feed"? → checa `auth.getUser()`, checa `v_feed_priorizado`, checa RLS, checa se `deleted_at is null`.
5. Swipe não responde? → `touch-action: none`? pointer events? threshold?
6. Ainda travado? → para e pergunta.

---

## AO CONCLUIR UMA TAREFA

- `bun run check` local.
- Atualiza doc impactado (especialmente `docs/00-arquitetura.md` se mexeu em estrutura, `docs/03-roadmap.md` se marcou fase como pronta).
- Commit + PR com título claro e descrição de **por quê**.
- Reporte no chat: o que mudou, como verificar, o que ficou de fora.

---

## REFERÊNCIA EXTERNA

- Repo: https://github.com/yaaxtech/tindo
- Supabase: https://supabase.com/dashboard/project/jtpfauouvbtmhgrszybk
- Email do owner: `falecomseucamarao@gmail.com`
- Projeto anterior (histórico, não usar código): `/Users/maiaemanuel/tindo antigo/`
