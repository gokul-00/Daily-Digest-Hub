-- Snapshots of archived pile items (cleared from main pile, linked to digest when applicable)

create table public.pile_archives (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  digest_id uuid references public.digests (id) on delete set null,
  label text not null,
  items jsonb not null default '[]'::jsonb,
  item_count integer not null default 0,
  archived_at timestamptz not null default now()
);

create index pile_archives_user_id_archived_at_idx
  on public.pile_archives (user_id, archived_at desc);

create index pile_archives_digest_id_idx
  on public.pile_archives (digest_id)
  where digest_id is not null;

alter table public.pile_archives enable row level security;

create policy "Users can select own pile archives"
on public.pile_archives for select
using (auth.uid() = user_id);

create policy "Users can insert own pile archives"
on public.pile_archives for insert
with check (auth.uid() = user_id);
