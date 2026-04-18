/**
 * Feedback háptico.
 *
 * Usa `navigator.vibrate` (suporte amplo em Android; iOS PWA depende da versão).
 * Curva ditada por neurociência do reforço: pulso curto pra feedback contínuo,
 * padrão crescente pra conclusão (pico de dopamina).
 */

type Intensity = 'tick' | 'soft' | 'medium' | 'success' | 'error';

const PATTERNS: Record<Intensity, number | number[]> = {
  tick: 8,
  soft: 18,
  medium: 30,
  success: [18, 40, 18, 60, 40, 120],
  error: [40, 60, 40],
};

export function haptic(intensity: Intensity = 'soft') {
  if (typeof navigator === 'undefined') return;
  const nav = navigator as Navigator & {
    vibrate?: (pattern: number | number[]) => boolean;
  };
  if (!nav.vibrate) return;
  try {
    nav.vibrate(PATTERNS[intensity]);
  } catch {
    // ignora silently — háptico é bônus, não crítico.
  }
}
