# Supabase Schema Documentation for Date-Nite

## users

- id: uuid, primary key, references auth.users(id)
- email: text, unique, not null
- favorites: uuid[] (array of date ids)

## dates

- id: uuid, primary key
- type: text ('venue' or 'non-venue')
- name: text
- location: text
- avg_cost: numeric
- recommended_group: text
- avg_rating: numeric
- group_size: text
- icon: text (url or path)
- description: text

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
