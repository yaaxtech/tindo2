import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center gap-10 px-6 py-16">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-80 [background:var(--gradient-aurora)]" />

      <header className="flex flex-col items-center gap-3 text-center">
        <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]/60 px-3 py-1 text-xs uppercase tracking-[0.2em] text-[var(--color-fg-muted)]">
          YaaX · TinDo
        </span>
        <h1 className="text-balance bg-[var(--gradient-jade)] bg-clip-text text-5xl font-semibold tracking-tight text-transparent sm:text-6xl">
          Swipe suas tarefas.
        </h1>
        <p className="max-w-xl text-balance text-base text-[var(--color-fg-muted)] sm:text-lg">
          Um card por vez, priorizado pela IA, calibrado pelo seu juízo.
          <br />
          Tinder das tarefas — menos decisão, mais execução.
        </p>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/login"
          className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--gradient-jade)] px-8 font-medium text-white shadow-[var(--shadow-accent)] transition-transform hover:-translate-y-0.5"
        >
          Entrar
        </Link>
        <Link
          href="#como-funciona"
          className="inline-flex h-12 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]/60 px-8 font-medium text-[var(--color-fg)] transition-colors hover:bg-[var(--color-surface-2)]"
        >
          Como funciona
        </Link>
      </div>

      <section
        id="como-funciona"
        className="mt-16 grid w-full max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {[
          {
            t: 'Prioriza',
            d: 'Score 0–100 baseado em importância, urgência, facilidade, projeto e prazo.',
          },
          {
            t: 'Swipe',
            d: 'Pular, voltar, adiar auto, adiar manual. Mobile + setas no PC.',
          },
          {
            t: 'Recalibra',
            d: 'A IA aprende com seu juízo. Você é o critério, não a nota.',
          },
          {
            t: 'Recompensa',
            d: 'Som, háptico e streak — concluir vicia. Por neurociência.',
          },
        ].map((f) => (
          <article
            key={f.t}
            className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)]/60 p-5 backdrop-blur-xl"
          >
            <h3 className="mb-1 font-semibold text-[var(--color-fg)]">
              {f.t}
            </h3>
            <p className="text-sm text-[var(--color-fg-muted)]">{f.d}</p>
          </article>
        ))}
      </section>

      <footer className="mt-auto pt-10 text-xs text-[var(--color-fg-subtle)]">
        v0.1 · Fase 0 · build para{' '}
        <code className="font-mono">falecomseucamarao@gmail.com</code>
      </footer>
    </main>
  );
}
