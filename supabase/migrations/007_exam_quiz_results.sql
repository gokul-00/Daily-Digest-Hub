-- Per-user ExamPulse quiz results (synced across devices)

create table public.exam_quiz_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date text not null,
  exam text not null check (exam in ('upsc', 'banking', 'ssc', 'state_psc')),
  score integer not null check (score >= 0),
  total integer not null check (total > 0),
  answered_at timestamptz not null default now(),
  unique (user_id, date, exam)
);

create index exam_quiz_results_user_answered_at_idx
  on public.exam_quiz_results (user_id, answered_at desc);

alter table public.exam_quiz_results enable row level security;

create policy "Users can select own exam quiz results"
on public.exam_quiz_results for select
using (auth.uid() = user_id);

create policy "Users can insert own exam quiz results"
on public.exam_quiz_results for insert
with check (auth.uid() = user_id);

create policy "Users can update own exam quiz results"
on public.exam_quiz_results for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own exam quiz results"
on public.exam_quiz_results for delete
using (auth.uid() = user_id);
