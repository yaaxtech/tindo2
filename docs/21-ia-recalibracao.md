# 21 — IA e Recalibração

## Princípios
1. **IA sugere. Humano decide.** Nenhuma escrita direta no banco sem review.
2. **Modelos Anthropic** (Claude 4 family):
   - **Haiku 4.5** (`claude-haiku-4-5-20251001`): classificação alta-frequência (barato, rápido).
   - **Sonnet 4.6** (`claude-sonnet-4-6`): raciocínio profundo, recalibração.
3. **Prompt cache obrigatório** em todas as chamadas (reduz custo ~85% em contexto estável — ver `claude-api` skill).
4. **Tudo server-side** (Edge Function). Keys nunca no client.

## Onboarding (primeira vez, 2 perguntas)
1. *"Hoje, quais coisas você faria que mais te despreocupariam?"* → texto livre.
2. *"Qual seu critério de sucesso pra alcançar essas despreocupações?"* → texto livre.

Ambas salvas em `ai_calibrations`. Viram contexto persistente pro Haiku (via prompt cache — estável por dias).

## Módulo A — Classificação de tarefa nova (Haiku)
**Gatilho:** nova tarefa criada (local ou via Todoist pull).

**Input:**
```
[contexto estável, cacheado]
  - Respostas de onboarding.
  - Pesos de score atuais.
  - Tags existentes do usuário (com tipo_peso + valor).
  - Projetos ordenados.

[input dinâmico]
  - Título + descrição da tarefa.
  - Data de vencimento (se houver).
  - Projeto detectado (se houver).
```

**Output JSON:**
```json
{
  "importancia": 0..10,
  "urgencia": 0..10,
  "facilidade": 0..10,
  "tags_sugeridas": ["ROI alto", "rápido"],
  "tipo_sugerido": "tarefa" | "lembrete",
  "justificativa": "frase curta",
  "confianca": 0..1
}
```

- Se `confianca < 0.6`: manda pra "inbox de revisão" antes de aplicar.
- Senão: aplica, registra em `ai_calibrations` com `aplicada=true`.

## Módulo B — Sugestões ativas (Sonnet)
**Gatilho:** manual via `/calibrar` ou após 50 tarefas novas (cron diário).

Propõe:
- **Renomear**: título mais claro.
- **Quebrar**: tarefa muito grande → 2–5 sub-tarefas.
- **Mesclar**: duas tarefas parecidas → uma só.
- **Excluir**: tarefa estagnada 30+ dias sem progresso.
- **Criar**: nova tarefa necessária pra atingir critério de sucesso declarado.
- **Reordenar projetos**: baseado em performance recente.

Tudo numa tela única de diff ("roadmap suggestions") — aceita/rejeita em batch.

## Módulo C — Recalibração (Sonnet)
Ver `docs/04-kpis-recalibracao.md` pros gatilhos.

### Recalibração de pesos
- Input: últimas 30 reviews com `score_humano` preenchido.
- Sonnet calcula regressão simples e sugere novos `w_*`.
- Apresenta antes/depois com explicação.
- Aplica em `score_weights` se aprovado.

### Recalibração de caminho crítico
- Re-pergunta as 2 perguntas do onboarding.
- Mostra 5 tarefas "flagship" atuais e pergunta: *"estas ainda representam o que você quer?"*.
- Se não: reinicia a classificação com novo contexto.

## Prompt cache strategy
- **Blocos estáveis** (cacheados 5min+):
  - System prompt.
  - Respostas de onboarding do usuário.
  - Lista de tags/projetos.
  - Pesos de score.
- **Bloco dinâmico**: a tarefa sendo classificada OU o batch de reviews recentes.

Estrutura `messages` com breakpoint `cache_control: { type: "ephemeral" }` no último bloco estável.

## Custo-alvo
- Haiku: ~$0.001 por classificação (com cache hit).
- Sonnet: ~$0.02 por recalibração.
- Meta: < $2/mês por usuário ativo.

## Telemetria
- Todo call IA registrado: modelo, input tokens, output tokens, latência, cache hit ratio.
- `/calibrar → IA Stats` mostra custo acumulado e taxa de aceitação.

## Falhas e fallback
- Erro na IA não deve impactar UX:
  - Classificação falha → tarefa entra com valores default (5/5/5) e flag "precisa classificar".
  - Recalibração falha → toast "Não consegui recalibrar agora. Tente manualmente em /ajustes".
- Retry: exponencial 1s, 4s, 16s. Depois disso, para.
