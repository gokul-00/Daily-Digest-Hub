-- Per-user ExamPulse saved brief items (synced across devices)

create table public.exam_saved_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  item_id text not null,
  item jsonb not null,
  saved_at timestamptz not null default now(),
  unique (user_id, item_id)
);

create index exam_saved_items_user_saved_at_idx
  on public.exam_saved_items (user_id, saved_at desc);

alter table public.exam_saved_items enable row level security;

create policy "Users can select own exam saved items"
on public.exam_saved_items for select
using (auth.uid() = user_id);

create policy "Users can insert own exam saved items"
on public.exam_saved_items for insert
with check (auth.uid() = user_id);

create policy "Users can update own exam saved items"
on public.exam_saved_items for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own exam saved items"
on public.exam_saved_items for delete
using (auth.uid() = user_id);
