# 11 — Anatomia do Card e Gestos

## Anatomia
```
┌──────────────────────────────────────┐
│▓▓▓▓▓▓▓▓▓▓▓▓ heat bar (p1..p4) ▓▓▓▓▓▓│
├──────────────────────────────────────┤
│ [tarefa · Projeto]      [p1  92/100] │  ← header
│                                      │
│  Título em 2xl, 2 linhas máx         │
│                                      │
│  Descrição discreta, até 4 linhas    │
│                                      │
│  [tag1] [tag2] [tag3]                │
│                                      │
├──────────────────────────────────────┤
│ [✎] [↔] [🗑]          [ ✓ Concluir ] │  ← rodapé
└──────────────────────────────────────┘
     ↑                           ↑
   ações secundárias       botão primário
```

- **Heat bar:** 4px no topo, cor do `prio-N`. Dá leitura periférica instantânea.
- **Header:** tipo + projeto à esquerda, score pill à direita.
- **Corpo:** título (24px semibold), descrição (15px muted), tags opcionais.
- **Rodapé:** 3 ícones à esquerda (editar, dependência, excluir), botão primário à direita.

## Gestos
4 direções de swipe. Threshold: **96px OU velocity ≥ 600 px/s**.

| Direção | Ação padrão | Cor hint | Som | Háptico |
|---|---|---|---|---|
| **→ Direita** ("pra trás") | Pular (avança deck) | Warning #F5A524 | A4 curto | medium |
| **← Esquerda** ("pra frente") | Voltar (card anterior) | Jade | E5 curto | medium |
| **↓ Baixo** | Adiar auto (sistema escolhe) | Violeta #8B5CF6 | D5 curto | medium |
| **↑ Cima** | Adiar manual (abre sub-swipe) | Azul #3E95FF | G5 curto | medium |

**Rotação visual:** de -14° a +14° baseado em X.
**Scale:** diminui até 0.96 conforme distância aumenta (feedback tátil visual).

## Sub-swipe "adiar manual"
Após swipe up, o card é substituído por um "card de adiamento" com 4 opções:

| Direção | Opção |
|---|---|
| → (pra trás) | **Próximo turno** (manhã→tarde, tarde→noite, noite→amanhã manhã) |
| ← (pra frente) | **Amanhã, mesmo horário** |
| ↑ (pra cima) | **Escolher data e horário** (abre date picker) |
| ↓ (pra baixo) | **Cancelar** (volta ao card original) |

Sub-swipe usa o mesmo `<TaskCard>` com prop `variant="postpone"`.

## Teclado (desktop)
- `←` voltar, `→` pular, `↓` adiar auto, `↑` adiar manual
- `Enter` concluir (botão primário)
- `Esc` fecha dialogs
- `e` editar, `d` dependência, `Shift+Del` excluir

Ignorado quando foco em input/textarea/contenteditable.

## Microinterações
- Durante drag: hints nas bordas ganham opacidade 100% quando o gesto passa de 60% do threshold.
- Conclusão: **CompletionBurst** (~720ms) — radial glow + 18 partículas jade/white + ✓ 60px com spring.
- Som de conclusão: arpejo C5→E5→G5→C6 em 4 attacks (300ms total). Volume -14dB padrão.

## Estados do card
- **Normal:** default acima.
- **Drag:** `cursor-grabbing`, scale 0.96, shadow elevada.
- **Exit:** translateX/Y 800px + opacity 0 em 240ms.
- **Celebrando:** frozen 720ms com CompletionBurst sobreposto.
- **Vazio do deck:** mostra "✨ Fim do deck" com CTA "Adicionar tarefa" + stats do dia.

## Responsividade
- Mobile (< 640px): card 100% width, max 400px.
- Tablet/desktop: card max-w-md (448px). Layout centralizado.
- Touch action: `touch-action: none` no article pra capturar drag sem scroll.

## Acessibilidade
- `role="article"` no card.
- `aria-label` nos ícones.
- Focus ring em Jade.
- `prefers-reduced-motion`: animações reduzidas a 10ms, burst opacity-only.
- Screen reader: ao entrar no feed, anuncia "Tarefa 1 de N. Score. Título."
