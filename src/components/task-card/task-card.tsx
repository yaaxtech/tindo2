'use client';

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
  type PanInfo,
} from 'framer-motion';
import {
  Check,
  Edit3,
  GitBranch,
  Trash2,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/lib/cn';
import { haptic } from '@/lib/haptic';
import { swipeFeedback, completion as soundCompletion } from '@/lib/sound';
import type { SwipeDirection } from '@/types/domain';
import { getPrioridadeVar } from '@/types/domain';

import { CompletionBurst } from './completion-burst';

export interface TaskCardProps {
  task: {
    id: string;
    titulo: string;
    descricao?: string | null;
    tipo: 'tarefa' | 'lembrete';
    prioridade: number;
    score: number;
    projeto?: string;
    tags?: string[];
  };
  onSwipe?: (direction: SwipeDirection) => void;
  onComplete?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  onDependency?: () => void;
}

const THRESHOLD = 96;
const VELOCITY = 600;

export function TaskCard({
  task,
  onSwipe,
  onComplete,
  onDelete,
  onEdit,
  onDependency,
}: TaskCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-240, 0, 240], [-14, 0, 14]);
  const scale = useTransform(x, [-300, 0, 300], [0.96, 1, 0.96]);

  const [exiting, setExiting] = useState<SwipeDirection | null>(null);
  const [celebrating, setCelebrating] = useState(false);

  function directionFromPan(info: PanInfo): SwipeDirection | null {
    const { offset, velocity } = info;
    const ax = Math.abs(offset.x);
    const ay = Math.abs(offset.y);
    const vx = Math.abs(velocity.x);
    const vy = Math.abs(velocity.y);

    const horizontal = ax > ay;
    if (horizontal) {
      if (ax < THRESHOLD && vx < VELOCITY) return null;
      return offset.x > 0 ? 'right' : 'left';
    } else {
      if (ay < THRESHOLD && vy < VELOCITY) return null;
      return offset.y > 0 ? 'down' : 'up';
    }
  }

  async function handleDragEnd(_e: PointerEvent, info: PanInfo) {
    const dir = directionFromPan(info);
    if (!dir) return;
    haptic('medium');
    void swipeFeedback(dir);
    setExiting(dir);
    // aguarda a saída antes de emitir (parent avança deck)
    setTimeout(() => onSwipe?.(dir), 200);
  }

  async function handleComplete() {
    haptic('success');
    void soundCompletion();
    setCelebrating(true);
    setTimeout(() => {
      setCelebrating(false);
      onComplete?.();
    }, 720);
  }

  const exitDeltaX =
    exiting === 'right' ? 800 : exiting === 'left' ? -800 : 0;
  const exitDeltaY = exiting === 'up' ? -800 : exiting === 'down' ? 800 : 0;

  return (
    <div className="relative w-full select-none" style={{ touchAction: 'none' }}>
      <SwipeHints />

      <AnimatePresence>
        {celebrating && <CompletionBurst key="burst" />}
      </AnimatePresence>

      <motion.article
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.7}
        onDragEnd={handleDragEnd}
        style={{ x, y, rotate, scale }}
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={
          exiting
            ? {
                x: exitDeltaX,
                y: exitDeltaY,
                opacity: 0,
                transition: { duration: 0.24, ease: [0.16, 1, 0.3, 1] },
              }
            : { opacity: 1, y: 0, scale: 1 }
        }
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className={cn(
          'relative flex min-h-[440px] w-full cursor-grab flex-col overflow-hidden rounded-3xl border border-[var(--color-border-subtle)]',
          'bg-[var(--gradient-card)] p-6 shadow-[var(--shadow-card)] active:cursor-grabbing',
        )}
      >
        {/* Heat bar de prioridade (topo) */}
        <div
          aria-hidden
          className="absolute left-0 right-0 top-0 h-1"
          style={{ background: getPrioridadeVar(task.prioridade) }}
        />

        {/* Header */}
        <header className="mb-4 flex items-start justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'rounded-full px-2 py-0.5 font-mono uppercase tracking-wider',
                task.tipo === 'lembrete'
                  ? 'bg-[var(--color-swipe-postpone-manual)]/15 text-[var(--color-swipe-postpone-manual)]'
                  : 'bg-[var(--jade-600)]/15 text-[var(--jade-300)]',
              )}
            >
              {task.tipo}
            </span>
            {task.projeto && (
              <span className="text-[var(--color-fg-muted)]">
                · {task.projeto}
              </span>
            )}
          </div>
          <ScorePill score={task.score} prio={task.prioridade} />
        </header>

        {/* Corpo */}
        <div className="flex-1">
          <h2 className="text-balance text-2xl font-semibold leading-tight text-[var(--color-fg)]">
            {task.titulo}
          </h2>
          {task.descricao && (
            <p className="mt-3 text-[15px] leading-relaxed text-[var(--color-fg-muted)]">
              {task.descricao}
            </p>
          )}
          {task.tags && task.tags.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {task.tags.map((t) => (
                <li
                  key={t}
                  className="rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-surface-2)]/70 px-2.5 py-0.5 text-xs text-[var(--color-fg-muted)]"
                >
                  {t}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Rodapé — ações secundárias */}
        <footer className="mt-6 flex items-center justify-between gap-2">
          <div className="flex gap-1.5">
            <IconBtn label="Editar" onClick={onEdit}>
              <Edit3 className="size-4" />
            </IconBtn>
            <IconBtn label="Dependência" onClick={onDependency}>
              <GitBranch className="size-4" />
            </IconBtn>
            <IconBtn label="Excluir" onClick={onDelete} tone="danger">
              <Trash2 className="size-4" />
            </IconBtn>
          </div>

          <button
            onClick={handleComplete}
            aria-label="Concluir tarefa"
            className={cn(
              'group relative inline-flex items-center gap-2 rounded-full px-6 py-3 font-medium text-white',
              'shadow-[var(--shadow-accent)] transition-transform',
              'bg-[var(--gradient-jade)] hover:-translate-y-0.5 active:scale-95',
            )}
          >
            <Check className="size-5" />
            <span>Concluir</span>
          </button>
        </footer>
      </motion.article>
    </div>
  );
}

function SwipeHints() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10">
      <Hint
        className="top-1/2 -translate-y-1/2 left-3"
        icon={<ArrowLeft className="size-4" />}
        label="voltar"
        color="var(--color-swipe-back)"
      />
      <Hint
        className="top-1/2 -translate-y-1/2 right-3"
        icon={<ArrowRight className="size-4" />}
        label="pular"
        color="var(--color-swipe-skip)"
      />
      <Hint
        className="top-3 left-1/2 -translate-x-1/2"
        icon={<ArrowUp className="size-4" />}
        label="adiar"
        color="var(--color-swipe-postpone-manual)"
      />
      <Hint
        className="bottom-3 left-1/2 -translate-x-1/2"
        icon={<ArrowDown className="size-4" />}
        label="auto"
        color="var(--color-swipe-postpone-auto)"
      />
    </div>
  );
}

function Hint({
  className,
  icon,
  label,
  color,
}: {
  className: string;
  icon: React.ReactNode;
  label: string;
  color: string;
}) {
  return (
    <div
      className={`absolute flex items-center gap-1 text-[11px] uppercase tracking-wider opacity-40 ${className}`}
      style={{ color }}
    >
      {icon}
      <span>{label}</span>
    </div>
  );
}

function ScorePill({ score, prio }: { score: number; prio: number }) {
  return (
    <div className="flex items-baseline gap-1 rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-bg)]/60 px-3 py-1">
      <span
        className="text-xs font-mono"
        style={{ color: getPrioridadeVar(prio) }}
      >
        p{prio}
      </span>
      <span className="text-lg font-semibold leading-none tabular-nums">
        {Math.round(score)}
      </span>
      <span className="text-[10px] text-[var(--color-fg-subtle)]">/100</span>
    </div>
  );
}

function IconBtn({
  children,
  label,
  onClick,
  tone,
}: {
  children: React.ReactNode;
  label: string;
  onClick?: () => void;
  tone?: 'danger' | 'default';
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex size-10 items-center justify-center rounded-full border border-[var(--color-border-subtle)] transition-colors',
        'bg-[var(--color-surface-2)]/60 text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]',
        tone === 'danger' && 'hover:bg-[var(--color-danger)]/15 hover:text-[var(--color-danger)]',
      )}
    >
      {children}
    </button>
  );
}
