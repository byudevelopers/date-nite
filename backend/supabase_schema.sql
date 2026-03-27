-- Supabase schema for date-nite app

-- Users table (with favorites as array of date ids)
create table users (
  id uuid primary key references auth.users(id),
  email text unique not null,
  favorites uuid[] -- array of date ids
);

-- Dates table
create table dates (
  id uuid primary key default gen_random_uuid(),
  type text not null, -- 'venue' or 'non-venue'
  name text not null,
  google_place_id text, -- Google Place ID for venue dates
  icon text, -- auto-generated emoji
  description text, -- from Google Places for venues
  avg_cost numeric, -- calculated from reviews
  avg_rating numeric, -- calculated from reviews
  recommended_group text -- calculated from review group_size (single/double/triple+)
);

-- Ratings table
create table ratings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  date_id uuid references dates(id),
  romance_level text, -- 'casual' or 'romantic'
  group_size text, -- 'single', 'double', 'group'
  cost numeric,
  good_bad text, -- 'good' or 'bad'
  first_date boolean,
  review text
);