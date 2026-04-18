'use client';

import { useState } from 'react';

import { TaskCard } from '@/components/task-card/task-card';
import { useSwipeKeyboard } from '@/hooks/use-swipe-keyboard';
import type { CardAction, Task } from '@/types/domain';

const DEMO_TASKS: Array<
  Pick<
    Task,
    'id' | 'titulo' | 'descricao' | 'tipo' | 'prioridade' | 'score'
  > & { projeto?: string; tags?: string[] }
> = [
  {
    id: 'demo-1',
    titulo: 'Revisar contrato do cliente X',
    descricao: 'Prazo: hoje. Trava o faturamento da semana.',
    tipo: 'tarefa',
    prioridade: 1,
    score: 92,
    projeto: 'Financeiro',
    tags: ['ROI alto', 'rápido'],
  },
  {
    id: 'demo-2',
    titulo: 'Cobrar retorno do fornecedor Y',
    descricao: '2 min. Whats + follow-up.',
    tipo: 'lembrete',
    prioridade: 2,
    score: 78,
    projeto: 'Operações',
    tags: ['cobrar'],
  },
  {
    id: 'demo-3',
    titulo: 'Planejar roadmap Q2',
    descricao: 'Reunião de planejamento com time.',
    tipo: 'tarefa',
    prioridade: 3,
    score: 64,
    projeto: 'Estratégia',
    tags: ['recorrente'],
  },
];

export function FeedClient({ userEmail }: { userEmail: string }) {
  const [index, setIndex] = useState(0);
  const current = DEMO_TASKS[index];

  function handleAction(action: CardAction) {
    // TODO: registrar em `reviews`, chamar service, aplicar swipe-through.
    console.log('[feed] action', action, current?.id);
    if (action === 'voltar') {
      setIndex((i) => Math.max(0, i - 1));
      return;
    }
    setIndex((i) => Math.min(DEMO_TASKS.length, i + 1));
  }

  useSwipeKeyboard({
    onLeft: () => handleAction('voltar'),
    onRight: () => handleAction('pular'),
    onUp: () => handleAction('adiar_manual'),
    onDown: () => handleAction('adiar_auto'),
    onEnter: () => handleAction('concluir'),
  });

  if (!current) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="text-6xl">✨</div>
        <h2 className="text-2xl font-semibold">Fim do deck</h2>
        <p className="max-w-sm text-[var(--color-fg-muted)]">
          Tudo processado por hoje. Volte depois ou adicione novas tarefas.
        </p>
        <button
          onClick={() => setIndex(0)}
          className="rounded-full bg-[var(--gradient-jade)] px-6 py-3 text-sm font-medium text-white shadow-[var(--shadow-accent)]"
        >
          Ver de novo (demo)
        </button>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <header className="flex w-full items-center justify-between text-xs text-[var(--color-fg-muted)]">
        <span>
          {index + 1} / {DEMO_TASKS.length}
        </span>
        <span className="font-mono">{userEmail}</span>
      </header>

      <TaskCard
        task={current}
        onComplete={() => handleAction('concluir')}
        onDelete={() => handleAction('excluir')}
        onEdit={() => handleAction('editar')}
        onDependency={() => handleAction('dependencia')}
        onSwipe={(dir) => {
          const map = {
            left: 'voltar',
            right: 'pular',
            up: 'adiar_manual',
            down: 'adiar_auto',
          } as const;
          handleAction(map[dir]);
        }}
      />

      <p className="text-center text-xs text-[var(--color-fg-subtle)]">
        ← voltar · → pular · ↓ adiar auto · ↑ adiar manual · Enter = concluir
      </p>
    </div>
  );
}
