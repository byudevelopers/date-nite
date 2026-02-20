-- Supabase schema for date-nite app

-- Users table (with favorites as array of date ids)
create table users (
  id uuid primary key references auth.users(id),
  email text unique not null,
  favorites uuid[] -- array of date ids
);

-- Dates table
default null,
create table dates (
  id uuid primary key default gen_random_uuid(),
  type text not null, -- 'venue' or 'non-venue'
  name text not null,
  location text,
  avg_cost numeric,
  recommended_group text,
  avg_rating numeric,
  group_size text,
  icon text, -- url or path to icon/picture
  description text
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