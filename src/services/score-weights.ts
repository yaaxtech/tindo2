import { supabase } from '@/lib/supabase';
import type { ScoreWeights } from '@/types/domain';
import { DEFAULT_WEIGHTS } from '@/lib/score';

export async function getOrDefault(userId: string): Promise<ScoreWeights> {
  const { data, error } = await supabase
    .from('score_weights')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  if (data) return data as ScoreWeights;

  return {
    user_id: userId,
    updated_at: new Date().toISOString(),
    ...DEFAULT_WEIGHTS,
  } satisfies ScoreWeights;
}

export async function update(
  userId: string,
  patch: Partial<Omit<ScoreWeights, 'user_id' | 'updated_at'>>,
) {
  const { error } = await supabase
    .from('score_weights')
    .upsert({ user_id: userId, ...patch });
  if (error) throw error;
}
