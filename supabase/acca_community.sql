-- =============================================================================
-- ACCA EDU — Community layer (ratings + comments) for blog articles & glossary.
-- Run ONCE in the Supabase project: Dashboard → SQL Editor → paste → Run.
-- The site's publishable (anon) key already in src/constants/supabase.js is
-- enough for the app once these tables + policies exist.
-- =============================================================================

create extension if not exists pgcrypto;

-- ---------- Comments ----------------------------------------------------------
create table if not exists public.acca_comments (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null unique,                 -- client-generated, for dedup
  entity_type text not null check (entity_type in ('blog','glossary')),
  entity_slug text not null,
  name        text not null,
  email       text not null,                         -- collected, never shown publicly
  role        text check (role in ('student','professional')),
  location    text check (location in ('turkey','iran')),
  body        text not null,
  lang        text,                                  -- detected source language
  created_at  timestamptz not null default now()
);
create index if not exists acca_comments_entity_idx
  on public.acca_comments (entity_type, entity_slug, created_at desc);

-- ---------- Ratings (one per browser per entity, upsertable) ------------------
create table if not exists public.acca_ratings (
  id          uuid primary key default gen_random_uuid(),
  voter_id    uuid not null,                         -- persistent per-browser id
  entity_type text not null check (entity_type in ('blog','glossary')),
  entity_slug text not null,
  stars       int  not null check (stars between 1 and 5),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (voter_id, entity_type, entity_slug)
);
create index if not exists acca_ratings_entity_idx
  on public.acca_ratings (entity_type, entity_slug);

-- ---------- Row Level Security ------------------------------------------------
alter table public.acca_comments enable row level security;
alter table public.acca_ratings  enable row level security;

-- Public can read display-safe comments/ratings (column grants below keep
-- private fields like email and voter_id out of the public Data API).
create policy "acca_comments_read"  on public.acca_comments for select using (true);
create policy "acca_ratings_read"   on public.acca_ratings  for select using (true);

-- Public can add a comment / cast a rating.
create policy "acca_comments_insert" on public.acca_comments
  for insert
  to anon, authenticated
  with check (
    entity_type in ('blog','glossary')
    and length(trim(name)) between 1 and 120
    and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    and length(trim(body)) between 2 and 2000
    and (role is null or role in ('student','professional'))
    and (location is null or location in ('turkey','iran'))
  );
create policy "acca_ratings_insert" on public.acca_ratings
  for insert
  to anon, authenticated
  with check (
    voter_id is not null
    and entity_type in ('blog','glossary')
    and stars between 1 and 5
  );

-- ---------- Public Data API grants -------------------------------------------
-- RLS decides which rows are visible; grants decide which columns are exposed.
-- Keep email and voter_id writable for insert/upsert, but never publicly
-- readable through the anon/authenticated REST API.
revoke all on public.acca_comments from anon, authenticated;
revoke all on public.acca_ratings from anon, authenticated;

grant insert on public.acca_comments to anon, authenticated;
grant select (client_id, entity_type, entity_slug, name, role, location, body, lang, created_at)
  on public.acca_comments to anon, authenticated;

grant insert on public.acca_ratings to anon, authenticated;
grant select (entity_type, entity_slug, stars, created_at, updated_at)
  on public.acca_ratings to anon, authenticated;

-- Optional hardening you may add later:
--   * a length CHECK on body (e.g. length(body) between 2 and 2000)
--   * a per-IP/time rate limit via an edge function
--   * moderation: add `approved boolean default true` and filter reads on it
