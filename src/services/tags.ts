import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/db';
import type { Tag } from '@/types/domain';

type TagInsert = Database['public']['Tables']['tags']['Insert'];

export async function list(): Promise<Tag[]> {
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .eq('ativa', true)
    .order('nome', { ascending: true });
  if (error) throw error;
  return (data ?? []) as Tag[];
}

export async function upsert(tag: TagInsert): Promise<Tag> {
  const { data, error } = await supabase
    .from('tags')
    .upsert(tag)
    .select('*')
    .single();
  if (error) throw error;
  return data as Tag;
}
