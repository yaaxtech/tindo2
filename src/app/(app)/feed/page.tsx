import { redirect } from 'next/navigation';

import { getServerSupabase } from '@/lib/supabase-server';

import { FeedClient } from './feed-client';

export default async function FeedPage() {
  const supabase = await getServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Placeholder — quando o schema estiver aplicado, buscar v_feed_priorizado.
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 py-8">
      <FeedClient userEmail={user.email ?? ''} />
    </main>
  );
}
