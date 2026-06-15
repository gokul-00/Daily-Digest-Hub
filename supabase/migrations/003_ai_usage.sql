-- AI usage metrics (per generate-digest and future AI operations)

create table public.ai_usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  digest_id uuid references public.digests (id) on delete set null,
  operation text not null default 'generate_digest',
  model text not null,
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  total_tokens integer not null default 0,
  estimated_cost_usd numeric(12, 8) not null default 0,
  dump_count integer not null default 0,
  url_count integer not null default 0,
  prompt_chars integer not null default 0,
  duration_ms integer,
  created_at timestamptz not null default now()
);

create index ai_usage_events_user_id_created_at_idx
  on public.ai_usage_events (user_id, created_at desc);

create index ai_usage_events_digest_id_idx
  on public.ai_usage_events (digest_id)
  where digest_id is not null;

alter table public.ai_usage_events enable row level security;

create policy "Users can select own ai usage"
on public.ai_usage_events for select
using (auth.uid() = user_id);

create policy "Users can insert own ai usage"
on public.ai_usage_events for insert
with check (auth.uid() = user_id);
