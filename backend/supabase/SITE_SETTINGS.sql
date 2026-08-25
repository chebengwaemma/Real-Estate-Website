-- =============================================================================
-- SITE SETTINGS — run once in Supabase → SQL Editor → Run
-- Creates/upgrades site_settings + secure save API (RPC) for Admin → Frontend
-- Prerequisite: public.is_admin() exists (SETUP.sql / ADMIN_AUTH_FIX.sql)
-- =============================================================================

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
  footer_tagline text not null default 'Hopeland Global Checkers (Draughts) Federation — the Global Checkers/Draughts Championship in Atlanta, Georgia, USA, July 19–25, 2027.',
  social_twitter text not null default '#',
  social_instagram text not null default '#',
  social_facebook text not null default '#',
  social_youtube text not null default '#',
  hero_eyebrow text not null default 'Hopeland Global Checkers (Draughts) Federation',
  hero_title text not null default 'Where Every Move Writes History',
  hero_subtitle text not null default 'The official home of the Global Checkers / Draughts Championship — Atlanta, Georgia, USA, 19–25 July 2027. Live-streamed, fairly judged, and open to every skill level.',
  final_cta_title text not null default 'Atlanta, Georgia, USA — July 19–25, 2027',
  final_cta_subtitle text not null default 'Global Checkers / Draughts Championship. Register now — your player profile opens only after Stripe payment succeeds.',
  about_teaser text not null default 'Hopeland Global Checkers is the world''s premier checkers championship — a season-long journey from open regional qualifiers to a live-streamed world final. Every match is judged by a certified referee panel, every player has a path to the top board, and every result is public and verifiable.',
  extras jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Upgrade older installs (safe to re-run)
alter table public.site_settings add column if not exists contact_phone text not null default '';
alter table public.site_settings add column if not exists contact_address text not null default 'Atlanta, Georgia, USA';
alter table public.site_settings add column if not exists site_name text not null default 'Hopeland Global Checkers';
alter table public.site_settings add column if not exists website_url text not null default 'https://hcheckers.org';
alter table public.site_settings add column if not exists logo_url text not null default '';
alter table public.site_settings add column if not exists extras jsonb not null default '{}'::jsonb;

alter table public.site_settings enable row level security;

drop policy if exists "site_settings_select_public" on public.site_settings;
create policy "site_settings_select_public"
  on public.site_settings for select
  using (true);

drop policy if exists "site_settings_write_admin" on public.site_settings;
create policy "site_settings_write_admin"
  on public.site_settings for all
  using (public.is_admin())
  with check (public.is_admin());

insert into public.site_settings (id) values (1)
on conflict (id) do nothing;

grant select on public.site_settings to anon, authenticated;
grant insert, update, delete on public.site_settings to authenticated;

-- Secure Settings update API (Admin JWT + is_admin required)
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
    raise exception 'Only admins can save settings'
      using errcode = '42501';
  end if;

  insert into public.site_settings (id) values (1)
  on conflict (id) do nothing;

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
