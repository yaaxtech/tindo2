import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/db';
import type { Project } from '@/types/domain';

type ProjectInsert = Database['public']['Tables']['projects']['Insert'];

export async function list(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .is('deleted_at', null)
    .order('ordem', { ascending: true });
  if (error) throw error;
  return (data ?? []) as Project[];
}

export async function upsert(project: ProjectInsert): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .upsert(project)
    .select('*')
    .single();
  if (error) throw error;
  return data as Project;
}
