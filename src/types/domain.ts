import type { Database } from './db';

type Tables = Database['public']['Tables'];

export type User = Tables['users']['Row'];
export type Project = Tables['projects']['Row'];
export type Tag = Tables['tags']['Row'];
export type Task = Tables['tasks']['Row'];
export type TaskTag = Tables['task_tags']['Row'];
export type TaskDependency = Tables['task_dependencies']['Row'];
export type ScoreWeights = Tables['score_weights']['Row'];
export type Review = Tables['reviews']['Row'];
export type TodoistSyncState = Tables['todoist_sync_state']['Row'];
export type AICalibration = Tables['ai_calibrations']['Row'];

export type TaskStatus = Task['status'];
export type TaskTipo = Task['tipo'];
export type Prioridade = 1 | 2 | 3 | 4;

/** Ação registrada quando o usuário interage com um card. */
export type CardAction =
  | 'concluir'
  | 'pular'
  | 'voltar'
  | 'adiar_auto'
  | 'adiar_manual'
  | 'dependencia'
  | 'editar'
  | 'excluir';

export type SwipeDirection = 'left' | 'right' | 'up' | 'down';

/** Mapeamento padrão gesto → ação (mudável nas configurações). */
export const DEFAULT_SWIPE_ACTION: Record<SwipeDirection, CardAction> = {
  right: 'pular', // "pra trás" no texto do produto — avança o deck
  left: 'voltar', // "pra frente" no texto do produto — retorna ao anterior
  down: 'adiar_auto',
  up: 'adiar_manual',
};

/** Sub-swipe do "adiar manual" (4 opções). */
export type PostponeManualOption =
  | 'proximo_turno' // pra trás
  | 'amanha_mesmo_horario' // pra frente
  | 'escolher_data' // pra cima
  | 'cancelar'; // pra baixo

/** Card priority heat class (CSS var binding). */
const PRIORITY_VAR_MAP: Record<Prioridade, string> = {
  1: 'var(--prio-1)',
  2: 'var(--prio-2)',
  3: 'var(--prio-3)',
  4: 'var(--prio-4)',
};

/** Lookup defensivo — clampa valores fora de [1..4]. */
export function getPrioridadeVar(p: number): string {
  const n = Math.max(1, Math.min(4, Math.round(p))) as Prioridade;
  return PRIORITY_VAR_MAP[n];
}

/** Turnos do dia (pra "próximo turno"). */
export type Turno = 'manha' | 'tarde' | 'noite';
