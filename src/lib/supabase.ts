import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

import { env } from './env';
import type { Database } from '@/types/db';

let singleton: SupabaseClient<Database> | null = null;

function getClient(): SupabaseClient<Database> {
  if (singleton) return singleton;
  singleton = createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
  return singleton;
}

/**
 * Client Supabase do browser. Lazy — só instancia na primeira leitura.
 * Componentes NÃO importam direto; usam `src/services/*`.
 */
export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get(_t, prop: keyof SupabaseClient<Database>) {
    return getClient()[prop];
  },
});
