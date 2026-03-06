# Supabase Schema Documentation for Date-Nite

## users

- id: uuid, primary key, references auth.users(id)
- email: text, unique, not null
- favorites: uuid[] (array of date ids)

## dates

- id: uuid, primary key
- type: text, not null ('venue' or 'non-venue')
- name: text, not null
- google_place_id: text (Google Place ID for venue dates)
- icon: text (auto-generated emoji)
- description: text (from Google Places for venues)
- avg_cost: numeric (calculated from user reviews)
- avg_rating: numeric (calculated from user reviews)
- recommended_group: text (calculated from review group_size field: single/double/triple+)

## ratings

- id: uuid, primary key
- user_id: uuid, references users(id)
- date_id: uuid, references dates(id)
- romance_level: text ('casual' or 'romantic')
- group_size: text ('single', 'double', 'group')
- cost: numeric
- good_bad: text ('good' or 'bad')
- first_date: boolean
- review: text
