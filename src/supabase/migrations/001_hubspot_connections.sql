create table public.hubspot_connections (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  portal_id        text not null,
  portal_name      text,
  hub_domain       text,
  access_token     text,  -- chiffré (géré en EP-01)
  refresh_token    text,  -- chiffré (géré en EP-01)
  token_expires_at timestamptz,
  scopes           text[],
  connected_at     timestamptz default now(),
  updated_at       timestamptz default now(),
  unique(user_id, portal_id)
);

alter table public.hubspot_connections enable row level security;

create policy "Users can only see their own connections"
  on public.hubspot_connections for all
  using (auth.uid() = user_id);
