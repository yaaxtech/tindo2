import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/db';
import type { Task } from '@/types/domain';

type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
type TaskUpdate = Database['public']['Tables']['tasks']['Update'];

export async function listFeed(limit = 50): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .is('deleted_at', null)
    .eq('status', 'pendente')
    .order('score', { ascending: false })
    .order('prioridade', { ascending: true })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as Task[];
}

export async function concluir(id: string) {
  const patch: TaskUpdate = {
    status: 'concluida',
    concluida_em: new Date().toISOString(),
  };
  const { error } = await supabase.from('tasks').update(patch).eq('id', id);
  if (error) throw error;
}

export async function adiar(id: string, ate: Date) {
  const patch: TaskUpdate = { adiada_ate: ate.toISOString() };
  const { error } = await supabase.from('tasks').update(patch).eq('id', id);
  if (error) throw error;
}

export async function softDelete(id: string) {
  const patch: TaskUpdate = { deleted_at: new Date().toISOString() };
  const { error } = await supabase.from('tasks').update(patch).eq('id', id);
  if (error) throw error;
}

export async function upsert(task: TaskInsert): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .upsert(task)
    .select('*')
    .single();
  if (error) throw error;
  return data as Task;
}
