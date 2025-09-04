create type meal_requirement_type as enum (
  'VEGETARIAN','VEGAN','GLUTEN_FREE','LACTOSE_FREE','NUT_ALLERGY','OTHER'
);

create table meal_requirement (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references app_user(id) on delete cascade,
  type meal_requirement_type not null,
  notes text,                       -- freeform detail (e.g., "no almonds")
  created_at timestamptz not null default now(),
  unique (user_id, type)            -- one row per type per user
);
