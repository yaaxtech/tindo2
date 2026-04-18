/**
 * Camada de serviços. Componentes usam APENAS daqui.
 * NUNCA importar `@supabase/supabase-js` em componente/page.
 */
export * as tasks from './tasks';
export * as projects from './projects';
export * as tags from './tags';
export * as reviews from './reviews';
export * as scoreWeights from './score-weights';
