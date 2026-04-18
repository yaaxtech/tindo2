import { redirect } from 'next/navigation';

import { getServerSupabase } from '@/lib/supabase-server';

import { FeedClient } from './feed-client';

const DEV_SKIP = process.env.NEXT_PUBLIC_DEV_SKIP_AUTH === 'true';

export default async function FeedPage() {
  if (DEV_SKIP) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center px-4 py-8">
        <FeedClient userEmail="dev@localhost (DEV_SKIP_AUTH=true)" />
      </main>
    );
  }

  const supabase = await getServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 py-8">
      <FeedClient userEmail={user.email ?? ''} />
    </main>
  );
}
