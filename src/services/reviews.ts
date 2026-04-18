import { supabase } from '@/lib/supabase';
import type { CardAction, Review } from '@/types/domain';

export async function log(params: {
  user_id: string;
  task_id: string;
  acao: CardAction;
  score_maquina: number;
  score_humano?: number;
  tempo_visualizacao_ms?: number;
}): Promise<Review> {
  const { data, error } = await supabase
    .from('reviews')
    .insert(params)
    .select('*')
    .single();
  if (error) throw error;
  return data as Review;
}
