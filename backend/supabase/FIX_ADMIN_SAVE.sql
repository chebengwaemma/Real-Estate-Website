-- =============================================================================
-- FIX_ADMIN_SAVE.sql — run ONCE on project xydliulffdmacdfnkqts
-- Supabase Dashboard → SQL Editor → paste all → Run
-- Fixes: missing CMS tables, is_admin(), RLS, save_site_settings RPC, admin role
-- Safe to re-run (idempotent). Does not drop your data.
-- =============================================================================

-- ── 1) Profiles + is_admin ───────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  role text not null default 'user' check (role in ('user', 'admin', 'superadmin')),
  created_at timestamptz not null default now()
);

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check
  check (role in ('user', 'admin', 'superadmin'));
alter table public.profiles alter column role set default 'user';
alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_superadmin_all" on public.profiles;
create policy "profiles_superadmin_all"
  on public.profiles for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'superadmin'
    )
  );

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'user')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role in ('admin', 'superadmin')
  );
$$;

grant execute on function public.is_admin() to anon, authenticated;

create or replace function public.sync_admin_access()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  my_email text;
  my_role text;
  admin_count int;
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;

  select email into my_email from auth.users where id = uid;

  insert into public.profiles (id, email, role)
  values (uid, coalesce(my_email, ''), 'user')
  on conflict (id) do update
  set email = coalesce(excluded.email, public.profiles.email);

  if my_email is not null
     and lower(my_email) = lower('sheikhsayeed0002@gmail.com') then
    update public.profiles set role = 'admin' where id = uid;
  end if;

  select count(*) into admin_count
  from public.profiles
  where role in ('admin', 'superadmin');

  if admin_count = 0 then
    update public.profiles set role = 'admin' where id = uid;
  end if;

  select role into my_role from public.profiles where id = uid;
  return my_role;
end;
$$;

grant execute on function public.sync_admin_access() to authenticated;

create or replace function public.ensure_my_profile()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  my_email text;
  my_role text;
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;
  select email into my_email from auth.users where id = uid;
  insert into public.profiles (id, email, role)
  values (uid, coalesce(my_email, ''), 'user')
  on conflict (id) do update
  set email = coalesce(excluded.email, public.profiles.email);
  select role into my_role from public.profiles where id = uid;
  return my_role;
end;
$$;

grant execute on function public.ensure_my_profile() to authenticated;
grant usage on schema public to anon, authenticated;
grant select on table public.profiles to anon, authenticated;

insert into public.profiles (id, email, role)
select id, coalesce(email, ''), 'user'
from auth.users
on conflict (id) do update
set email = coalesce(excluded.email, public.profiles.email);

-- Promote admin account
update public.profiles
set role = 'admin'
where id in (
  select id from auth.users
  where lower(email) = lower('sheikhsayeed0002@gmail.com')
);

-- ── 2) site_settings + save RPC ──────────────────────────────────────────────
create table if not exists public.site_settings (
  id integer primary key default 1 check (id = 1),
  championship_location text not null default 'Atlanta, Georgia, USA',
  championship_dates text not null default 'July 19 – 25, 2027',
  championship_dates_start date not null default '2027-07-19',
  championship_dates_end date not null default '2027-07-25',
  announcement_text text not null default 'Atlanta, Georgia, USA — July 19–25, 2027',
  announcement_cta text not null default 'Register now',
  contact_email text not null default 'contact@hcheckers.org',
  contact_phone text not null default '',
  contact_address text not null default 'Atlanta, Georgia, USA',
  site_name text not null default 'Hopeland Global Checkers',
  website_url text not null default 'https://hcheckers.org',
  logo_url text not null default '',
  footer_tagline text not null default 'Hopeland Global Checkers (Draughts) Federation — Atlanta, Georgia, USA, July 19–25, 2027.',
  social_twitter text not null default '#',
  social_instagram text not null default '#',
  social_facebook text not null default '#',
  social_youtube text not null default '#',
  hero_eyebrow text not null default 'Hopeland Global Checkers (Draughts) Federation',
  hero_title text not null default 'Where Every Move Writes History',
  hero_subtitle text not null default 'The official home of the Global Checkers / Draughts Championship.',
  final_cta_title text not null default 'Atlanta, Georgia, USA — July 19–25, 2027',
  final_cta_subtitle text not null default 'Register now — your player profile opens only after Stripe payment succeeds.',
  about_teaser text not null default 'Hopeland Global Checkers is the world''s premier checkers championship.',
  extras jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.site_settings add column if not exists contact_phone text not null default '';
alter table public.site_settings add column if not exists contact_address text not null default 'Atlanta, Georgia, USA';
alter table public.site_settings add column if not exists site_name text not null default 'Hopeland Global Checkers';
alter table public.site_settings add column if not exists website_url text not null default 'https://hcheckers.org';
alter table public.site_settings add column if not exists logo_url text not null default '';
alter table public.site_settings add column if not exists extras jsonb not null default '{}'::jsonb;

alter table public.site_settings enable row level security;
drop policy if exists "site_settings_select_public" on public.site_settings;
create policy "site_settings_select_public" on public.site_settings for select using (true);
drop policy if exists "site_settings_write_admin" on public.site_settings;
create policy "site_settings_write_admin" on public.site_settings for all
  using (public.is_admin()) with check (public.is_admin());

insert into public.site_settings (id) values (1) on conflict (id) do nothing;
grant select on public.site_settings to anon, authenticated;
grant insert, update, delete on public.site_settings to authenticated;

create or replace function public.save_site_settings(data jsonb)
returns public.site_settings
language plpgsql
security definer
set search_path = public
as $$
declare
  saved public.site_settings;
  extras_in jsonb;
begin
  if auth.uid() is null or not public.is_admin() then
    raise exception 'Only admins can save settings' using errcode = '42501';
  end if;

  insert into public.site_settings (id) values (1) on conflict (id) do nothing;

  extras_in := coalesce(data->'extras', '{}'::jsonb);
  if jsonb_typeof(extras_in) <> 'object' then
    extras_in := '{}'::jsonb;
  end if;

  update public.site_settings set
    championship_location = coalesce(nullif(data->>'championship_location', ''), championship_location),
    championship_dates = coalesce(nullif(data->>'championship_dates', ''), championship_dates),
    championship_dates_start = coalesce((data->>'championship_dates_start')::date, championship_dates_start),
    championship_dates_end = coalesce((data->>'championship_dates_end')::date, championship_dates_end),
    announcement_text = coalesce(data->>'announcement_text', announcement_text),
    announcement_cta = coalesce(data->>'announcement_cta', announcement_cta),
    contact_email = coalesce(nullif(data->>'contact_email', ''), contact_email),
    contact_phone = coalesce(data->>'contact_phone', contact_phone),
    contact_address = coalesce(data->>'contact_address', contact_address),
    site_name = coalesce(nullif(data->>'site_name', ''), site_name),
    website_url = coalesce(nullif(data->>'website_url', ''), website_url),
    logo_url = coalesce(data->>'logo_url', logo_url),
    footer_tagline = coalesce(data->>'footer_tagline', footer_tagline),
    social_twitter = coalesce(data->>'social_twitter', social_twitter),
    social_instagram = coalesce(data->>'social_instagram', social_instagram),
    social_facebook = coalesce(data->>'social_facebook', social_facebook),
    social_youtube = coalesce(data->>'social_youtube', social_youtube),
    hero_eyebrow = coalesce(data->>'hero_eyebrow', hero_eyebrow),
    hero_title = coalesce(data->>'hero_title', hero_title),
    hero_subtitle = coalesce(data->>'hero_subtitle', hero_subtitle),
    final_cta_title = coalesce(data->>'final_cta_title', final_cta_title),
    final_cta_subtitle = coalesce(data->>'final_cta_subtitle', final_cta_subtitle),
    about_teaser = coalesce(data->>'about_teaser', about_teaser),
    extras = extras_in,
    updated_at = now()
  where id = 1
  returning * into saved;

  return saved;
end;
$$;

revoke all on function public.save_site_settings(jsonb) from public;
grant execute on function public.save_site_settings(jsonb) to authenticated;

-- ── 3) CMS content tables ────────────────────────────────────────────────────
create table if not exists public.site_stats (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  sublabel text,
  value integer not null default 0,
  suffix text not null default '',
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);
alter table public.site_stats enable row level security;
drop policy if exists "site_stats_select_public" on public.site_stats;
create policy "site_stats_select_public" on public.site_stats for select using (true);
drop policy if exists "site_stats_write_admin" on public.site_stats;
create policy "site_stats_write_admin" on public.site_stats for all
  using (public.is_admin()) with check (public.is_admin());

create table if not exists public.site_features (
  id uuid primary key default gen_random_uuid(),
  icon text not null default 'Globe2',
  title text not null,
  description text not null default '',
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);
alter table public.site_features enable row level security;
drop policy if exists "site_features_select_public" on public.site_features;
create policy "site_features_select_public" on public.site_features for select using (true);
drop policy if exists "site_features_write_admin" on public.site_features;
create policy "site_features_write_admin" on public.site_features for all
  using (public.is_admin()) with check (public.is_admin());

create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null default '',
  published boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);
alter table public.faqs enable row level security;
drop policy if exists "faqs_select_public" on public.faqs;
create policy "faqs_select_public" on public.faqs for select
  using (published = true or public.is_admin());
drop policy if exists "faqs_write_admin" on public.faqs;
create policy "faqs_write_admin" on public.faqs for all
  using (public.is_admin()) with check (public.is_admin());

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  quote text not null,
  name text not null,
  role text not null default '',
  avatar_initials text not null default '',
  published boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);
alter table public.testimonials enable row level security;
drop policy if exists "testimonials_select_public" on public.testimonials;
create policy "testimonials_select_public" on public.testimonials for select
  using (published = true or public.is_admin());
drop policy if exists "testimonials_write_admin" on public.testimonials;
create policy "testimonials_write_admin" on public.testimonials for all
  using (public.is_admin()) with check (public.is_admin());

create table if not exists public.timeline_items (
  id uuid primary key default gen_random_uuid(),
  quarter text not null,
  title text not null,
  items jsonb not null default '[]'::jsonb,
  status text not null default 'upcoming',
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);
alter table public.timeline_items enable row level security;
drop policy if exists "timeline_items_select_public" on public.timeline_items;
create policy "timeline_items_select_public" on public.timeline_items for select using (true);
drop policy if exists "timeline_items_write_admin" on public.timeline_items;
create policy "timeline_items_write_admin" on public.timeline_items for all
  using (public.is_admin()) with check (public.is_admin());

create table if not exists public.cms_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  body text not null default '',
  updated_at timestamptz not null default now()
);
alter table public.cms_pages enable row level security;
drop policy if exists "cms_pages_select_public" on public.cms_pages;
create policy "cms_pages_select_public" on public.cms_pages for select using (true);
drop policy if exists "cms_pages_write_admin" on public.cms_pages;
create policy "cms_pages_write_admin" on public.cms_pages for all
  using (public.is_admin()) with check (public.is_admin());

insert into public.cms_pages (slug, title, body) values
  ('about', 'About', '<p>Hopeland Global Checkers.</p>'),
  ('privacy-policy', 'Privacy Policy', '<p>Privacy policy content.</p>'),
  ('terms-of-use', 'Terms of Use', '<p>Terms of use content.</p>')
on conflict (slug) do nothing;

create table if not exists public.sports_games (
  id text primary key,
  title text not null,
  provider text not null default '',
  category text not null default 'original',
  variant text not null default 'original',
  gradient text not null default '',
  accent text,
  badge text,
  display_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.sports_games enable row level security;
drop policy if exists "sports_games_select_public" on public.sports_games;
create policy "sports_games_select_public" on public.sports_games for select
  using (published = true or public.is_admin());
drop policy if exists "sports_games_write_admin" on public.sports_games;
create policy "sports_games_write_admin" on public.sports_games for all
  using (public.is_admin()) with check (public.is_admin());

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.contact_messages enable row level security;
drop policy if exists "contact_messages_insert_public" on public.contact_messages;
create policy "contact_messages_insert_public" on public.contact_messages for insert
  with check (true);
drop policy if exists "contact_messages_select_admin" on public.contact_messages;
create policy "contact_messages_select_admin" on public.contact_messages for select
  using (public.is_admin());
drop policy if exists "contact_messages_update_admin" on public.contact_messages;
create policy "contact_messages_update_admin" on public.contact_messages for update
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists "contact_messages_delete_admin" on public.contact_messages;
create policy "contact_messages_delete_admin" on public.contact_messages for delete
  using (public.is_admin());

grant select on public.site_stats, public.site_features, public.faqs, public.testimonials,
  public.timeline_items, public.cms_pages, public.sports_games to anon, authenticated;
grant insert, update, delete on public.site_stats, public.site_features, public.faqs,
  public.testimonials, public.timeline_items, public.cms_pages, public.sports_games,
  public.contact_messages to authenticated;
grant insert on public.contact_messages to anon, authenticated;
grant select, update, delete on public.contact_messages to authenticated;

-- Confirm admin
select u.email, p.role
from auth.users u
join public.profiles p on p.id = u.id
where lower(u.email) = lower('sheikhsayeed0002@gmail.com');
