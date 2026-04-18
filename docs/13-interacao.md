# 13 — Padrões de Interação

## Atalhos de teclado (OBRIGATÓRIO em toda UI)
- **Enter** → botão primário (salvar, confirmar).
- **Esc** → fecha dialog / cancela.
- **Tab** navega campos.
- **Cmd/Ctrl + K** → command palette (Fase 2+).

## Dialogs (shadcn Dialog wrapped)
- Todo Dialog/AlertDialog/FormModal tem Enter → primário e Esc → fecha.
- Se houver campo "digitar CONFIRMAR", Enter só dispara após validação.
- Mobile: bottom-sheet (rounded-t-3xl, drag-to-close).
- Desktop: centered modal max-w-md.

## Toasts (sonner)
- Sucesso: jade. Erro: danger. Info: info. Warning: warning.
- Posição: `top-center` em mobile, `bottom-right` em desktop.
- Duração: 3s (info) / 4s (success) / 6s (error com ação "Desfazer").
- Concluir tarefa **não dispara toast** — o CompletionBurst já basta.

## Undo (pattern obrigatório)
Após ações destrutivas ou de alto custo:
- Excluir tarefa → toast "Tarefa excluída. Desfazer?" (6s).
- Concluir errado → botão "desfazer" aparece por 3s num header discreto.

## Long-press em mobile
- Long-press card (≥ 500ms) → abre menu de contexto com todas as ações (inclusive menos usadas).

## Loading states
- Skeleton com shimmer em jade-700/30 (não cinza genérico).
- Em ações < 300ms: nada (não mostra spinner).
- Em ações > 300ms: spinner inline ao lado do botão.
- Em ações > 2s: progress bar no topo da tela.

## Formulários
- Label **acima** do input, não placeholder-as-label.
- Erro inline abaixo do campo, em danger.
- Auto-focus no primeiro campo ao abrir.
- Enter submete.

## Empty states
- Ilustração simples (emoji se necessário) + título + 1 CTA primário.
- Ex: Fim do deck → ✨ + "Fim do deck" + [Adicionar tarefa].
- Nunca empty state só com "Nenhum item encontrado" sem ação.

## Confirmações
- Destrutivo reversível (soft-delete): sem confirmação, mas oferecer desfazer no toast.
- Destrutivo irreversível (hard delete, logout, desconectar Todoist): AlertDialog com "digitar CONFIRMAR".

## Microcopy
- Tom: direto, português-BR coloquial-profissional.
- Usar "você" nunca "o usuário".
- Evitar jargão técnico. "Tarefa" não "item", "lembrete" não "reminder".
- Ações em imperativo: "Concluir", "Adiar", "Pular".
- Feedback em primeira pessoa do sistema: "Enviei o link.", "Sincronizei."

## Dark-first
- App default: dark (obsidian + jade).
- Light mode: Fase 5+ (opcional, pós-validação que usuário quer).

## Densidade
- Mobile: alta densidade (pouco padding, fonte menor), scroll é fluido.
- Desktop: respiro maior (max-width limitado, padding generoso).
- Nunca "tudo fica maior no desktop" — tem que ser **diferente**, não **maior**.
