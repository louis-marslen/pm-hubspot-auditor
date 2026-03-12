create table public.audit_runs (
  id               uuid primary key default gen_random_uuid(),
  connection_id    uuid not null references public.hubspot_connections(id) on delete cascade,
  user_id          uuid not null references auth.users(id) on delete cascade,
  status           text not null default 'running', -- running | completed | failed
  score            integer,
  total_critiques  integer default 0,
  total_avertissements integer default 0,
  total_infos      integer default 0,
  results          jsonb,
  error            text,
  started_at       timestamptz default now(),
  completed_at     timestamptz
);

alter table public.audit_runs enable row level security;

create policy "Users can only see their own audit runs"
  on public.audit_runs for all
  using (auth.uid() = user_id);

create index on public.audit_runs(connection_id, started_at desc);
