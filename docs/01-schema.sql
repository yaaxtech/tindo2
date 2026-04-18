-- =============================================================
-- TinDo — Schema Supabase (PostgreSQL 15)
--
-- Executar em: https://supabase.com/dashboard/project/jtpfauouvbtmhgrszybk/sql/new
--
-- Princípios:
-- - Single-tenant: cada linha tem user_id = auth.uid(), RLS estrita.
-- - Soft delete com deleted_at (nunca DELETE físico).
-- - uuid em toda PK.
-- - numeric pra dinheiro (não usado ainda mas convenção).
-- - Score é coluna física (cacheada, recalculada por trigger ou job).
--   Algoritmo vive no app — SQL só guarda o resultado.
-- - Views pro feed priorizado.
-- =============================================================

create extension if not exists "pgcrypto";

-- ------------- Trigger util: set_updated_at -------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ------------- users -------------
-- Espelho minimalista de auth.users. Populado por trigger on insert.
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  nome text,
  avatar_url text,
  timezone text not null default 'America/Sao_Paulo',
  locale text not null default 'pt-BR',
  onboarding_done boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_users_updated on public.users;
create trigger trg_users_updated before update on public.users
  for each row execute function public.set_updated_at();

alter table public.users enable row level security;

drop policy if exists "users_self_select" on public.users;
create policy "users_self_select" on public.users
  for select using (id = auth.uid());

drop policy if exists "users_self_update" on public.users;
create policy "users_self_update" on public.users
  for update using (id = auth.uid());

-- Sincroniza auth.users -> public.users no signup.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email)
  values (new.id, coalesce(new.email, ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists trg_auth_user_created on auth.users;
create trigger trg_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- ------------- projects -------------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  todoist_id text,
  nome text not null,
  cor text,
  ordem integer not null default 0,
  multiplicador numeric(4,2) not null default 1.0 check (multiplicador between 0.5 and 2.0),
  arquivado boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (user_id, todoist_id)
);

drop trigger if exists trg_projects_updated on public.projects;
create trigger trg_projects_updated before update on public.projects
  for each row execute function public.set_updated_at();

alter table public.projects enable row level security;
drop policy if exists "projects_owner" on public.projects;
create policy "projects_owner" on public.projects
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ------------- tags -------------
create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  nome text not null,
  cor text,
  tipo_peso text not null default 'multiplicador'
    check (tipo_peso in ('multiplicador', 'soma', 'percentual')),
  valor numeric(6,2) not null default 1.0,
  ativa boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, nome)
);

drop trigger if exists trg_tags_updated on public.tags;
create trigger trg_tags_updated before update on public.tags
  for each row execute function public.set_updated_at();

alter table public.tags enable row level security;
drop policy if exists "tags_owner" on public.tags;
create policy "tags_owner" on public.tags
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ------------- tasks -------------
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  todoist_id text,
  tipo text not null default 'tarefa' check (tipo in ('tarefa', 'lembrete')),
  titulo text not null,
  descricao text,
  status text not null default 'pendente'
    check (status in ('pendente', 'concluida', 'descartada')),
  prioridade smallint not null default 4 check (prioridade between 1 and 4),
  facilidade numeric(4,2) not null default 5.0 check (facilidade between 0 and 10),
  importancia numeric(4,2) not null default 5.0 check (importancia between 0 and 10),
  urgencia numeric(4,2) not null default 5.0 check (urgencia between 0 and 10),
  score numeric(5,2) not null default 50.0 check (score between 0 and 100),
  score_manual numeric(5,2) check (score_manual between 0 and 100),
  data_vencimento timestamptz,
  prazo timestamptz,
  project_id uuid references public.projects(id) on delete set null,
  parent_task_id uuid references public.tasks(id) on delete set null,
  adiada_ate timestamptz,
  vezes_adiada integer not null default 0,
  concluida_em timestamptz,
  todoist_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (user_id, todoist_id)
);

drop trigger if exists trg_tasks_updated on public.tasks;
create trigger trg_tasks_updated before update on public.tasks
  for each row execute function public.set_updated_at();

create index if not exists idx_tasks_user_status
  on public.tasks (user_id, status) where deleted_at is null;
create index if not exists idx_tasks_feed
  on public.tasks (user_id, score desc, prioridade asc)
  where status = 'pendente' and deleted_at is null;
create index if not exists idx_tasks_todoist
  on public.tasks (user_id, todoist_id) where todoist_id is not null;

alter table public.tasks enable row level security;
drop policy if exists "tasks_owner" on public.tasks;
create policy "tasks_owner" on public.tasks
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ------------- task_tags (N-N) -------------
create table if not exists public.task_tags (
  task_id uuid not null references public.tasks(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (task_id, tag_id)
);

alter table public.task_tags enable row level security;
drop policy if exists "task_tags_owner" on public.task_tags;
create policy "task_tags_owner" on public.task_tags
  for all using (
    task_id in (select id from public.tasks where user_id = auth.uid())
  ) with check (
    task_id in (select id from public.tasks where user_id = auth.uid())
  );

-- ------------- task_dependencies (N-N dentro do mesmo usuário) -------------
create table if not exists public.task_dependencies (
  task_id uuid not null references public.tasks(id) on delete cascade,
  depends_on_task_id uuid not null references public.tasks(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (task_id, depends_on_task_id),
  check (task_id <> depends_on_task_id)
);

alter table public.task_dependencies enable row level security;
drop policy if exists "task_dependencies_owner" on public.task_dependencies;
create policy "task_dependencies_owner" on public.task_dependencies
  for all using (
    task_id in (select id from public.tasks where user_id = auth.uid())
  ) with check (
    task_id in (select id from public.tasks where user_id = auth.uid())
  );

-- ------------- score_weights (preferências do score) -------------
create table if not exists public.score_weights (
  user_id uuid primary key references public.users(id) on delete cascade,
  w_importancia integer not null default 40 check (w_importancia between 0 and 100),
  w_urgencia integer not null default 25 check (w_urgencia between 0 and 100),
  w_facilidade integer not null default 15 check (w_facilidade between 0 and 100),
  w_projeto integer not null default 10 check (w_projeto between 0 and 100),
  w_prazo integer not null default 10 check (w_prazo between 0 and 100),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_score_weights_updated on public.score_weights;
create trigger trg_score_weights_updated before update on public.score_weights
  for each row execute function public.set_updated_at();

alter table public.score_weights enable row level security;
drop policy if exists "score_weights_owner" on public.score_weights;
create policy "score_weights_owner" on public.score_weights
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ------------- reviews (histórico de interações → calibração) -------------
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  acao text not null check (acao in (
    'concluir', 'pular', 'voltar', 'adiar_auto', 'adiar_manual',
    'dependencia', 'editar', 'excluir'
  )),
  score_maquina numeric(5,2) not null,
  score_humano numeric(5,2) check (score_humano between 0 and 100),
  delta numeric(6,2) generated always as (coalesce(score_humano, score_maquina) - score_maquina) stored,
  tempo_visualizacao_ms integer,
  created_at timestamptz not null default now()
);

create index if not exists idx_reviews_user_at
  on public.reviews (user_id, created_at desc);
create index if not exists idx_reviews_task
  on public.reviews (task_id);

alter table public.reviews enable row level security;
drop policy if exists "reviews_owner" on public.reviews;
create policy "reviews_owner" on public.reviews
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ------------- todoist_sync_state -------------
create table if not exists public.todoist_sync_state (
  user_id uuid primary key references public.users(id) on delete cascade,
  sync_token text not null default '*',
  last_sync_at timestamptz not null default 'epoch',
  scope text not null default 'data:read_write'
);

alter table public.todoist_sync_state enable row level security;
drop policy if exists "todoist_sync_owner" on public.todoist_sync_state;
create policy "todoist_sync_owner" on public.todoist_sync_state
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ------------- ai_calibrations -------------
create table if not exists public.ai_calibrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  pergunta text not null,
  resposta text not null,
  aplicada boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.ai_calibrations enable row level security;
drop policy if exists "ai_calibrations_owner" on public.ai_calibrations;
create policy "ai_calibrations_owner" on public.ai_calibrations
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ------------- VIEW: v_feed_priorizado -------------
create or replace view public.v_feed_priorizado
with (security_invoker = true)
as
select
  t.id,
  t.user_id,
  t.titulo,
  t.tipo,
  t.score,
  t.prioridade,
  t.data_vencimento,
  t.project_id,
  t.adiada_ate
from public.tasks t
where t.deleted_at is null
  and t.status = 'pendente'
  and (t.adiada_ate is null or t.adiada_ate <= now())
order by t.score desc, t.prioridade asc, t.data_vencimento asc nulls last;

-- ------------- VIEW: v_gamificacao (stats diárias) -------------
create or replace view public.v_gamificacao
with (security_invoker = true)
as
select
  user_id,
  count(*) filter (where acao = 'concluir' and created_at::date = now()::date) as concluidas_hoje,
  count(*) filter (where acao in ('adiar_auto','adiar_manual') and created_at::date = now()::date) as adiadas_hoje,
  count(*) filter (where acao = 'concluir' and created_at::date >= (now()::date - interval '7 days')) as concluidas_7d,
  count(distinct (created_at::date)) filter (where acao = 'concluir' and created_at >= (now() - interval '30 days')) as dias_ativos_30d
from public.reviews
group by user_id;
