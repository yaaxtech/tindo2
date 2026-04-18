# 12 — Sistema de Recompensa Multissensorial

## Por que

Dopamina é liberada **pela antecipação E pela conclusão** de algo prazeroso. Um botão de "concluir" deve ser:
1. **Previsível** (você sabe o que vai acontecer).
2. **Excedente** (entrega mais estímulo do que você esperava — som + visual + háptico).
3. **Breve** (<1s — além disso vira fricção).
4. **Variável-suficiente** (pequenas variações impedem saturação).

Se for **constante** demais: saturação → deixa de funcionar em 2 semanas.
Se for **viciante** demais no sentido ruim (pull infinito): vira Instagram — mal. O objetivo é **reforçar conclusão**, não retenção em vão.

## Três canais sincronizados

### 1. Visual (CompletionBurst, ~720ms)
- Radial glow jade expandindo (0 → 1.4 scale em 720ms).
- 18 partículas saindo em círculo (jade-300, jade-500, white).
- ✓ 60px com spring (scale 0 → 1.2 → 1).
- Durante esses 720ms, o card está "frozen" (sem outros inputs).

### 2. Sonoro (Tone.js, ~300ms)
- Arpejo C5 → E5 → G5 → C6, cada nota em '16n' (envelope rápido).
- Synth sine, attack 4ms, decay 80ms.
- Volume -14dB (não invasivo).
- Carrega Tone.js lazy → bundle inicial sem penalidade.

### 3. Háptico (~240ms)
- Padrão: `[18, 40, 18, 60, 40, 120]` ms (crescente).
- Via `navigator.vibrate` (Android + iOS PWA compatível quando disponível).
- Fallback silencioso se API não existir.

## Graduação por contexto
Nem toda conclusão é igual. Calibramos intensidade conforme:

| Contexto | Visual | Som | Háptico |
|---|---|---|---|
| Lembrete concluído | glow curto | tick simples C6 | soft |
| Tarefa comum concluída | burst padrão | arpejo | success |
| Tarefa p1 concluída | burst + partículas extras | arpejo + oitava | success + pulse longo |
| Streak milestone (7d, 30d) | fullscreen glow | melodia 4 notas | sequência longa |

## Swipes
**Não queremos** que o swipe em si seja "viciante" — ele é mecânico. Mas precisa de feedback **sutil**:
- Visual: rotação + scale do card (sem glow).
- Som: nota curta 32n diferente por direção.
- Háptico: pulso `medium` (30ms).

## Calibragem
- Todas as animações respeitam `prefers-reduced-motion`.
- Áudio desligável: `NEXT_PUBLIC_FEATURE_AUDIO=false` ou toggle em `/ajustes`.
- Háptico desligável: idem.
- Volume controlado em `/ajustes → Feedback → Volume`.

## Anti-patterns (NÃO fazer)
- ❌ Confetti de tela cheia em toda conclusão (satura em 3 dias).
- ❌ Som longo (> 1s) — vira chato.
- ❌ Mensagens "Você é incrível!!!" — falso, detecta.
- ❌ Barra de XP subindo com animação lenta — fake-game.

## Gamificação sadia (Fase 4)
- **Streak** só conta "dias com ≥ 3 conclusões". Evita gaming de 1 lembrete/dia.
- **Retrô de sexta**: mostra conclusões da semana organizadas. Sem número só por número.
- **Comparação consigo** (semana passada vs esta) — nunca ranking contra outros usuários. Toxic.
