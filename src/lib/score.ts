/**
 * Algoritmo de Score (0–100) — TinDo
 *
 * Filosofia:
 * - Determinístico. Dado o mesmo input, o score é idêntico. IA não reescreve
 *   a nota no runtime — só inputa atributos (importancia/urgencia/facilidade)
 *   que entram na fórmula.
 * - Juízo humano prevalece via `score_manual`. Se presente, vence.
 * - Prazo/vencimento entram como bônus multiplicativo (0..+15) baseado na
 *   distância até a data-limite.
 * - Tags aplicam ajustes pós-cálculo (multiplicador, soma, percentual).
 *
 * Pesos padrão (somam 100):
 *   importancia = 40
 *   urgencia    = 25
 *   facilidade  = 15
 *   projeto     = 10
 *   prazo       = 10
 *
 * Todos os inputs brutos em escala 0..10. O resultado final é clampado 0..100.
 */

import type { Tag, Task, Project, ScoreWeights } from '@/types/domain';

export const DEFAULT_WEIGHTS: Omit<ScoreWeights, 'user_id' | 'updated_at'> = {
  w_importancia: 40,
  w_urgencia: 25,
  w_facilidade: 15,
  w_projeto: 10,
  w_prazo: 10,
};

export interface ScoreInputs {
  task: Pick<
    Task,
    | 'importancia'
    | 'urgencia'
    | 'facilidade'
    | 'prioridade'
    | 'score_manual'
    | 'data_vencimento'
    | 'prazo'
    | 'vezes_adiada'
  >;
  project?: Pick<Project, 'ordem' | 'multiplicador'> | null;
  tags?: Array<Pick<Tag, 'tipo_peso' | 'valor'>>;
  weights?: Partial<typeof DEFAULT_WEIGHTS>;
  now?: Date;
}

export interface ScoreBreakdown {
  base: number;
  prazoBonus: number;
  projetoFactor: number;
  tagsDelta: number;
  prioridadeDelta: number;
  adiamentoPenalty: number;
  final: number;
  manualOverride: boolean;
}

export function calcularScore(i: ScoreInputs): ScoreBreakdown {
  if (typeof i.task.score_manual === 'number') {
    return {
      base: i.task.score_manual,
      prazoBonus: 0,
      projetoFactor: 1,
      tagsDelta: 0,
      prioridadeDelta: 0,
      adiamentoPenalty: 0,
      final: clamp(i.task.score_manual, 0, 100),
      manualOverride: true,
    };
  }

  const w = { ...DEFAULT_WEIGHTS, ...(i.weights ?? {}) };
  const sumW =
    w.w_importancia +
    w.w_urgencia +
    w.w_facilidade +
    w.w_projeto +
    w.w_prazo;

  const imp = clamp(i.task.importancia ?? 0, 0, 10);
  const urg = clamp(i.task.urgencia ?? 0, 0, 10);
  const fac = clamp(i.task.facilidade ?? 0, 0, 10);

  // Componente projeto 0..10 via multiplicador (0.5..2.0 → 0..10).
  const projMult = i.project?.multiplicador ?? 1;
  const projScore = clamp(((projMult - 0.5) / 1.5) * 10, 0, 10);

  // Componente prazo 0..10 via distância do vencimento.
  const now = i.now ?? new Date();
  const prazoScore = computePrazoScore(
    i.task.data_vencimento,
    i.task.prazo,
    now,
  );

  const baseWeighted =
    (imp * w.w_importancia +
      urg * w.w_urgencia +
      fac * w.w_facilidade +
      projScore * w.w_projeto +
      prazoScore * w.w_prazo) /
    sumW;

  // baseWeighted está em 0..10 (já normalizado pelos pesos). Escala pra 0..100.
  const base = baseWeighted * 10;

  // Heat bonus por prioridade humana (Todoist-style p1..p4): p1 +8, p2 +4, p3 +0, p4 -4.
  const prioridadeDelta =
    i.task.prioridade === 1
      ? 8
      : i.task.prioridade === 2
        ? 4
        : i.task.prioridade === 3
          ? 0
          : -4;

  // Tags: aplicam ajuste pós-base.
  let tagsDelta = 0;
  let scoreAfterTags = base + prioridadeDelta;
  if (i.tags && i.tags.length > 0) {
    for (const t of i.tags) {
      if (t.tipo_peso === 'soma') {
        tagsDelta += t.valor;
      } else if (t.tipo_peso === 'multiplicador') {
        const before = scoreAfterTags;
        scoreAfterTags = scoreAfterTags * t.valor;
        tagsDelta += scoreAfterTags - before;
      } else if (t.tipo_peso === 'percentual') {
        const before = scoreAfterTags;
        scoreAfterTags = scoreAfterTags * (1 + t.valor / 100);
        tagsDelta += scoreAfterTags - before;
      }
    }
    if (!i.tags.find((t) => t.tipo_peso === 'soma')) {
      // caso só haja mult/percent, o delta já foi contabilizado acima.
    } else {
      scoreAfterTags += i.tags.reduce(
        (acc, t) => (t.tipo_peso === 'soma' ? acc + t.valor : acc),
        0,
      );
      // prevenção de dupla contagem:
      scoreAfterTags -= i.tags.reduce(
        (acc, t) => (t.tipo_peso === 'soma' ? acc + t.valor : acc),
        0,
      );
    }
  }

  // Penalidade leve por adiamento excessivo (tarefa que vira "bola preta"
  // merece atenção, mas não deve subir indefinidamente no deck).
  const vezesAdiada = i.task.vezes_adiada ?? 0;
  const adiamentoPenalty = Math.min(vezesAdiada * 1.5, 10);

  const final = clamp(scoreAfterTags - adiamentoPenalty, 0, 100);

  return {
    base,
    prazoBonus: prazoScore,
    projetoFactor: projMult,
    tagsDelta,
    prioridadeDelta,
    adiamentoPenalty,
    final,
    manualOverride: false,
  };
}

function computePrazoScore(
  vencimento: string | null | undefined,
  prazo: string | null | undefined,
  now: Date,
): number {
  const target = prazo ?? vencimento;
  if (!target) return 3; // neutro-baixo quando não há data
  const dt = new Date(target);
  if (Number.isNaN(dt.getTime())) return 3;
  const diffDays = (dt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

  if (diffDays < 0) return 10; // atrasado — urgência máxima
  if (diffDays <= 1) return 9;
  if (diffDays <= 3) return 7;
  if (diffDays <= 7) return 5;
  if (diffDays <= 14) return 3;
  if (diffDays <= 30) return 2;
  return 1;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/**
 * Comparador de deck. Ordena por:
 * 1. Score desc
 * 2. Prioridade asc (1 vem antes de 4)
 * 3. Prazo asc (mais próximo primeiro)
 * 4. Facilidade desc (quick wins primeiro dentro do mesmo score)
 */
export function compareDeck(a: Task, b: Task): number {
  const sd = (b.score ?? 0) - (a.score ?? 0);
  if (sd !== 0) return sd;
  const pd = (a.prioridade ?? 4) - (b.prioridade ?? 4);
  if (pd !== 0) return pd;
  const ad = a.data_vencimento ? new Date(a.data_vencimento).getTime() : Infinity;
  const bd = b.data_vencimento ? new Date(b.data_vencimento).getTime() : Infinity;
  if (ad !== bd) return ad - bd;
  return (b.facilidade ?? 0) - (a.facilidade ?? 0);
}
