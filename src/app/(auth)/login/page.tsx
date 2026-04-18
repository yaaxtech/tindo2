'use client';

import { useState } from 'react';
import Link from 'next/link';

import { supabase } from '@/lib/supabase';
import { env } from '@/lib/env';

type Phase = 'idle' | 'loading' | 'sent' | 'error';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [message, setMessage] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPhase('loading');
    setMessage('');

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });

    if (error) {
      setPhase('error');
      setMessage(error.message);
      return;
    }
    setPhase('sent');
    setMessage('Link enviado. Abra seu email e volte.');
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)]/70 p-6 shadow-[var(--shadow-card)] backdrop-blur-xl">
        <Link
          href="/"
          className="mb-6 inline-block text-sm text-[var(--color-fg-muted)] transition hover:text-[var(--color-fg)]"
        >
          ← voltar
        </Link>

        <h1 className="mb-1 text-2xl font-semibold">Entrar no TinDo</h1>
        <p className="mb-6 text-sm text-[var(--color-fg-muted)]">
          Enviamos um link mágico pro seu email.
        </p>

        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <label className="text-xs uppercase tracking-wider text-[var(--color-fg-muted)]">
            Email
          </label>
          <input
            type="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@email.com"
            className="h-12 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 text-base outline-none transition focus:border-[var(--color-accent)] focus:shadow-[var(--shadow-accent)]"
          />

          <button
            type="submit"
            disabled={phase === 'loading' || phase === 'sent'}
            className="mt-2 inline-flex h-12 items-center justify-center rounded-xl bg-[var(--gradient-jade)] font-medium text-white shadow-[var(--shadow-accent)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {phase === 'loading'
              ? 'Enviando...'
              : phase === 'sent'
                ? 'Enviado ✓'
                : 'Enviar link'}
          </button>
        </form>

        {message && (
          <p
            className={`mt-4 text-sm ${
              phase === 'error'
                ? 'text-[var(--color-danger)]'
                : 'text-[var(--color-accent)]'
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </main>
  );
}
