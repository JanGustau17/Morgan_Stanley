-- Campaign drafts: one per organizer, overwritten on each save.
-- Run this in Supabase SQL Editor if campaign_drafts does not exist yet.

create table if not exists campaign_drafts (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid references volunteers(id) on delete cascade not null unique,
  payload jsonb not null default '{}',
  updated_at timestamptz default now()
);

-- Optional: RLS so only the organizer can read/update their draft (API uses service role, so this is extra safety if anon ever accesses the table).
-- alter table campaign_drafts enable row level security;
-- create policy "Users can manage own draft" on campaign_drafts
--   for all using (organizer_id = auth.uid()::uuid);
