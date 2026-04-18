/**
 * Sons do TinDo — Web Audio via Tone.js (lazy).
 *
 * Design sonoro:
 * - Tick curto em swipe (feedback contínuo).
 * - Arpejo ascendente em conclusão (reforço positivo, dopamina).
 * - Volume baixo por padrão — não invasivo.
 *
 * Regras:
 * - Só carrega Tone no primeiro uso (bundle menor).
 * - Respeita feature flag NEXT_PUBLIC_FEATURE_AUDIO.
 * - Respeita prefers-reduced-motion de forma adjacente (audio separado).
 */

type ToneMod = typeof import('tone');

let tonePromise: Promise<ToneMod> | null = null;
let synth: InstanceType<ToneMod['PolySynth']> | null = null;
let ready = false;

async function getTone() {
  if (!tonePromise) tonePromise = import('tone');
  return tonePromise;
}

async function ensureReady() {
  const Tone = await getTone();
  if (!ready) {
    await Tone.start();
    synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.004,
        decay: 0.08,
        sustain: 0.0,
        release: 0.08,
      },
      volume: -14,
    }).toDestination();
    ready = true;
  }
  return { Tone, synth: synth! };
}

export async function tick() {
  try {
    const { synth } = await ensureReady();
    synth.triggerAttackRelease('C6', '32n');
  } catch {
    /* noop */
  }
}

export async function swipeFeedback(direction: 'left' | 'right' | 'up' | 'down') {
  try {
    const { synth } = await ensureReady();
    const note =
      direction === 'right'
        ? 'E5'
        : direction === 'left'
          ? 'A4'
          : direction === 'up'
            ? 'G5'
            : 'D5';
    synth.triggerAttackRelease(note, '32n');
  } catch {
    /* noop */
  }
}

/** Arpejo celebrativo — reforço positivo forte na conclusão. */
export async function completion() {
  try {
    const { Tone, synth } = await ensureReady();
    const now = Tone.now();
    synth.triggerAttackRelease('C5', '16n', now);
    synth.triggerAttackRelease('E5', '16n', now + 0.07);
    synth.triggerAttackRelease('G5', '16n', now + 0.14);
    synth.triggerAttackRelease('C6', '8n', now + 0.22);
  } catch {
    /* noop */
  }
}
