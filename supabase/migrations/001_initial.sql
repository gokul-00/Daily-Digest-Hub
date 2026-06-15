-- Later. / Daily Digest Hub — initial schema

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- dumps
-- ---------------------------------------------------------------------------
create table public.dumps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (type in ('read', 'todo', 'idea', 'note')),
  kind text not null check (kind in ('link', 'text')),
  content text not null,
  done boolean not null default false,
  created_at timestamptz not null default now(),
  done_at timestamptz,
  updated_at timestamptz not null default now()
);

create index dumps_user_id_created_at_idx on public.dumps (user_id, created_at desc);

create trigger dumps_set_updated_at
before update on public.dumps
for each row execute function public.set_updated_at();

alter table public.dumps enable row level security;

create policy "Users can select own dumps"
on public.dumps for select
using (auth.uid() = user_id);

create policy "Users can insert own dumps"
on public.dumps for insert
with check (auth.uid() = user_id);

create policy "Users can update own dumps"
on public.dumps for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own dumps"
on public.dumps for delete
using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- digests
-- ---------------------------------------------------------------------------
create table public.digests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  payload jsonb not null,
  dump_count integer not null default 0,
  title text,
  created_at timestamptz not null default now()
);

create index digests_user_id_created_at_idx on public.digests (user_id, created_at desc);

alter table public.digests enable row level security;

create policy "Users can select own digests"
on public.digests for select
using (auth.uid() = user_id);

create policy "Users can insert own digests"
on public.digests for insert
with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- source_extractions (server-side cache, no RLS — service role only)
-- ---------------------------------------------------------------------------
create table public.source_extractions (
  url_hash text primary key,
  url text not null,
  source_type text not null,
  status text not null check (status in ('ok', 'error', 'partial')),
  provider text not null,
  title text,
  body text,
  metadata jsonb not null default '{}'::jsonb,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index source_extractions_expires_at_idx on public.source_extractions (expires_at);

create trigger source_extractions_set_updated_at
before update on public.source_extractions
for each row execute function public.set_updated_at();

alter table public.source_extractions enable row level security;

-- No policies: only service role should access this table.
