create extension if not exists "uuid-ossp";

create table app_user (
  id uuid primary key default uuid_generate_v4(),
  email text not null unique,
  display_name text,
  password_hash text,
  created_at timestamptz not null default now()
);

create type reminder_category as enum ('MEDICATION','MEAL');

create table reminder (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references app_user(id) on delete cascade,
  time timestamptz not null,
  category reminder_category not null,
  note text,
  created_at timestamptz not null default now()
);

-- indexes you’ll actually feel
create index idx_reminder_user_time on reminder(user_id, time);
