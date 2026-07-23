-- Shared daily current-affairs briefs for ExamPulse (one row per date + exam)

create table public.daily_briefs (
  date date not null,
  exam text not null,
  items jsonb not null,
  generated_at timestamptz not null default now(),
  primary key (date, exam)
);

grant select on public.daily_briefs to anon, authenticated;
grant all on public.daily_briefs to service_role;

alter table public.daily_briefs enable row level security;

create policy "Briefs are public"
on public.daily_briefs for select
to anon, authenticated
using (true);

create index daily_briefs_exam_date_idx
  on public.daily_briefs (exam, date desc);
