# 02 — Algoritmo de Score (0–100)

## Princípios
1. **Determinístico.** Mesmo input → mesmo output. Facilita debug e confiança do usuário.
2. **IA inputa atributos, nunca a nota final.** Haiku/Sonnet sugerem `importancia`, `urgencia`, `facilidade`, tags; a fórmula calcula.
3. **Juízo humano prevalece.** `score_manual` preenchido vence tudo.
4. **Penalidade leve por adiamento.** Tarefa que vira "bola preta" merece atenção — mas subir indefinidamente é ruim.

## Fórmula

### Componentes (escala 0–10)
- `importancia` — 0 = irrelevante, 10 = te desbloqueia hoje
- `urgencia` — 0 = pode esperar meses, 10 = agora
- `facilidade` — 0 = enorme, 10 = 2 min
- `projeto_score` — derivado de `projeto.multiplicador` (0.5..2.0 → 0..10)
- `prazo_score` — derivado da distância até vencimento/prazo (ver tabela)

### Pesos padrão (somam 100)
```
importancia: 40
urgencia:    25
facilidade:  15
projeto:     10
prazo:       10
```
Ajustáveis em `/ajustes → Pesos` (editar sliders).

### Cálculo base
```
base = ((imp * 40 + urg * 25 + fac * 15 + proj * 10 + prazo * 10) / 100) * 10
```
→ `base` em 0..100.

### Heat de prioridade (p1..p4)
```
p1 (afeta sono)    → +8
p2 (afeta rotina)  → +4
p3 (bom ROI)       →  0
p4 (outras)        → -4
```

### Tags
Cada tag aplica um ajuste pós-base, baseado no `tipo_peso`:
- `soma` — `score += valor`
- `multiplicador` — `score *= valor`
- `percentual` — `score *= (1 + valor/100)`

Ordem de aplicação: soma primeiro, depois multiplicativos (pra evitar que tag de +5 vire +10 após 2x).

### Adiamento
```
penalidade = min(vezes_adiada * 1.5, 10)
final = clamp(base + prio + tags - penalidade, 0, 100)
```

### Tabela prazo_score
| Distância ao vencimento | prazo_score |
|---|---|
| Atrasado (negativo) | 10 |
| ≤ 1 dia | 9 |
| ≤ 3 dias | 7 |
| ≤ 7 dias | 5 |
| ≤ 14 dias | 3 |
| ≤ 30 dias | 2 |
| Sem data ou > 30 dias | 1–3 |

## Comparador de deck
Ordena por:
1. `score` desc
2. `prioridade` asc (1 vem antes de 4)
3. `data_vencimento` asc (mais próximo primeiro)
4. `facilidade` desc (quick wins pra quebrar empates)

## Testes (futuros, Fase 2)
Em `src/__tests__/score.test.ts`:
- Tarefa atrasada p1 com imp=10, urg=10, fac=8 → score ≥ 95
- `score_manual = 50` ignora tudo → score = 50
- 5 adiamentos com base 80 → score ≤ 72.5
- Tag "ROI alto" com `+10 soma` realmente soma 10

## Limitações conhecidas
- Não leva em conta **contexto temporal** (manhã vs noite) — V3.
- Não aprende com reviews passadas — V2 com módulo IA.
- Trata lembrete e tarefa igual na fórmula — separação vem no **filtro** do deck, não no score.
