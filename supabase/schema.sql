-- Volunteers (created on Google login or phone signup)
create table volunteers (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  name text,
  avatar_url text,
  phone text,
  phone_verified boolean default false,
  sms_opt_in boolean default false,
  city text,
  total_points int default 0,
  weekly_points int default 0,
  level int default 1,
  streak_days int default 0,
  last_active timestamptz,
  role text default 'volunteer',
  created_at timestamptz default now()
);

-- Drafts for campaign creation (one per organizer, overwritten on each save)
create table campaign_drafts (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid references volunteers(id) not null unique,
  payload jsonb not null default '{}',
  updated_at timestamptz default now()
);

-- Campaigns (flyering events)
create table campaigns (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid references volunteers(id),
  name text not null,
  neighborhood text,
  lat float,
  lng float,
  location_name text,
  campaign_date timestamptz,
  language text default 'en',
  target_group text default 'families',
  volunteers_needed int default 5,
  status text default 'upcoming',
  ref_tag text unique,
  flyers_count int default 0,
  created_at timestamptz default now()
);

-- Volunteers signed up to a campaign
create table campaign_volunteers (
  campaign_id uuid references campaigns(id),
  volunteer_id uuid references volunteers(id),
  joined_at timestamptz default now(),
  primary key (campaign_id, volunteer_id)
);

-- Flyer drop pins on the map
create table flyer_pins (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references campaigns(id),
  volunteer_id uuid references volunteers(id),
  lat float not null,
  lng float not null,
  photo_url text,
  created_at timestamptz default now()
);

-- QR scan + conversion events
create table conversions (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references campaigns(id),
  volunteer_id uuid references volunteers(id),
  ref_tag text,
  source text,
  lat float,
  lng float,
  created_at timestamptz default now()
);

-- Points audit log
create table point_events (
  id uuid primary key default gen_random_uuid(),
  volunteer_id uuid references volunteers(id),
  campaign_id uuid references campaigns(id),
  event_type text,
  points int,
  created_at timestamptz default now()
);

-- Badges
create table badges (
  id uuid primary key default gen_random_uuid(),
  volunteer_id uuid references volunteers(id),
  badge_type text,
  earned_at timestamptz default now()
);

-- Chat messages
create table messages (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references campaigns(id),
  sender_id uuid references volunteers(id),
  content text,
  type text default 'text',
  created_at timestamptz default now()
);

-- Enable Realtime on messages
alter publication supabase_realtime add table messages;

-- ─── Forum ──────────────────────────────────────────────────────────────────

-- Forum threads (top-level posts)
create table forum_threads (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references volunteers(id) not null,
  title text not null,
  body text not null default '',
  tag text not null default 'general',
  upvotes int default 0,
  reply_count int default 0,
  created_at timestamptz default now()
);

-- Forum replies (comments on threads)
create table forum_replies (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid references forum_threads(id) on delete cascade not null,
  author_id uuid references volunteers(id) not null,
  body text not null,
  upvotes int default 0,
  created_at timestamptz default now()
);

-- Forum votes (upvotes on threads or replies, one per user per item)
create table forum_votes (
  id uuid primary key default gen_random_uuid(),
  volunteer_id uuid references volunteers(id) not null,
  thread_id uuid references forum_threads(id) on delete cascade,
  reply_id uuid references forum_replies(id) on delete cascade,
  value int not null default 1,
  created_at timestamptz default now(),
  constraint one_vote_per_thread unique (volunteer_id, thread_id),
  constraint one_vote_per_reply unique (volunteer_id, reply_id),
  constraint vote_target check (
    (thread_id is not null and reply_id is null) or
    (thread_id is null and reply_id is not null)
  )
);

-- Enable Realtime on forum tables
alter publication supabase_realtime add table forum_threads;
alter publication supabase_realtime add table forum_replies;
