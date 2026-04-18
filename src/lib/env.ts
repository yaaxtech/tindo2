import { z } from 'zod';

/**
 * Env pública. Durante build/lint, variáveis podem estar ausentes.
 * Por isso validamos de forma frouxa aqui e aplicamos validação estrita
 * apenas quando o cliente Supabase é instanciado (runtime real).
 */
const PublicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .default('https://placeholder.supabase.co'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().default('placeholder-anon-key'),
  NEXT_PUBLIC_APP_URL: z.string().default('http://localhost:3000'),
  NEXT_PUBLIC_APP_ENV: z
    .enum(['development', 'preview', 'production'])
    .default('development'),
  NEXT_PUBLIC_FEATURE_AI: z
    .string()
    .optional()
    .transform((v) => v === 'true'),
  NEXT_PUBLIC_FEATURE_TODOIST_SYNC: z
    .string()
    .optional()
    .transform((v) => v === 'true'),
  NEXT_PUBLIC_FEATURE_AUDIO: z
    .string()
    .optional()
    .transform((v) => v !== 'false'),
  NEXT_PUBLIC_FEATURE_HAPTIC: z
    .string()
    .optional()
    .transform((v) => v !== 'false'),
});

const parsed = PublicEnvSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
  NEXT_PUBLIC_FEATURE_AI: process.env.NEXT_PUBLIC_FEATURE_AI,
  NEXT_PUBLIC_FEATURE_TODOIST_SYNC: process.env.NEXT_PUBLIC_FEATURE_TODOIST_SYNC,
  NEXT_PUBLIC_FEATURE_AUDIO: process.env.NEXT_PUBLIC_FEATURE_AUDIO,
  NEXT_PUBLIC_FEATURE_HAPTIC: process.env.NEXT_PUBLIC_FEATURE_HAPTIC,
});

export const env = parsed;
export type PublicEnv = typeof env;

/**
 * Chamar antes de usar clients Supabase reais. Retorna a mensagem de erro
 * amigável se algo está errado. Em build-time, ignorado.
 */
export function assertSupabaseEnv(): string | null {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return (
      'Faltam NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
      'Copie .env.example pra .env.local e preencha.'
    );
  }
  try {
    new URL(env.NEXT_PUBLIC_SUPABASE_URL);
  } catch {
    return `NEXT_PUBLIC_SUPABASE_URL não é URL válida: ${env.NEXT_PUBLIC_SUPABASE_URL}`;
  }
  return null;
}
