-- Optional title for timed digest artifacts (run after 001_initial.sql)
alter table public.digests
  add column if not exists title text;

-- Backfill titles from created_at for existing rows
update public.digests
set title = 'Evening edition — ' || to_char(created_at at time zone 'UTC', 'Dy, Mon DD, YYYY · HH12:MI AM')
where title is null;
