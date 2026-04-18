# 04 — KPIs e Gatilhos de Recalibração

## Filosofia
O único critério real de sucesso é **o humano sentindo que as tarefas que aparecem são as que ele deveria estar fazendo**. Tudo aqui instrumenta isso.

## KPIs primários (review semanal)

| KPI | Fórmula | Meta | Onde medir |
|---|---|---|---|
| **Taxa de conclusão** | `concluídas / (concluídas + adiadas + puladas)` em 7d | ≥ 60% | view `v_gamificacao` |
| **Dias ativos** | dias distintos com ≥ 1 conclusão nos últimos 30d | ≥ 22 | view `v_gamificacao` |
| **Tempo médio por card** | `avg(tempo_visualizacao_ms)` por sessão | 2–8s | `reviews.tempo_visualizacao_ms` |
| **Delta humano–máquina** | `avg(|score_humano - score_maquina|)` entre reviews com score_humano | ≤ 12 | `reviews.delta` |
| **Taxa de ideia da IA aceita** | `aceitas / (aceitas + rejeitadas)` em sugestões | ≥ 70% | `ai_calibrations.aplicada` |

## Gatilhos de recalibração automática

### Gatilho A — Recalibração de pesos/preocupações
**Dispara quando:** `|score_humano - score_maquina| > 15` em **≥ 5 reviews nas últimas 48h**.
**Ação:** sugere ajuste de `score_weights` via Sonnet. User aprova.
**Ajustável em:** `/ajustes → Recalibração → Threshold humano–máquina` (default 15).

### Gatilho B — Recalibração do caminho crítico
**Dispara quando:** **≥ 40%** das últimas 20 sugestões da IA foram rejeitadas.
**Ação:** re-pergunta as 2 perguntas de onboarding. Atualiza `ai_calibrations`.
**Ajustável em:** `/ajustes → Recalibração → % rejeição trigger` (default 40%).

### Gatilho C — Muito adiamento
**Dispara quando:** ≥ 5 tarefas adiadas 3+ vezes em 7 dias.
**Ação:** tela friendly com essas 5 tarefas em slider 0–100. User ordena. Compara com score atual. Se correlação < 0.5 → sugere recalibração de pesos.

## Dashboard de recalibração (`/calibrar`, Fase 4+)
- Gráfico: evolução do KPI "taxa de conclusão" nos últimos 30 dias.
- Heat map: horário × dia da semana × conclusões.
- Lista: tarefas com delta humano–máquina > 15 (revisar manualmente).
- Botão: "Me recalibre agora" (força recalibração mesmo sem atingir threshold).

## Meta-KPI do projeto (mensal)
- **"Uso acumulado"**: semanas consecutivas com ≥ 5 dias ativos.
  - 4+ semanas = o produto funcionou pra mim.
  - 2–3 semanas = precisa melhorar algo específico (ver qual KPI caiu).
  - < 2 semanas = repensar.

Essa é a régua do juízo humano sobre o projeto inteiro — não só sobre tarefas individuais.
