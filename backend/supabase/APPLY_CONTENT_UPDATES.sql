-- Run this in Supabase → SQL Editor (production).
-- Same contents as migrations/20260101000014_content_i18n_registration.sql


alter table public.registrations
  add column if not exists nationality text;

alter table public.registrations
  add column if not exists confirmation_email_sent_at timestamptz;

alter table public.registrations
  alter column fee_amount set default 25000;

update public.site_settings
set contact_email = 'Info@HCheckers.org'
where id = 1;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'site_settings'
      and column_name = 'extras'
  ) then
    update public.site_settings
    set extras = coalesce(extras, '{}'::jsonb) || jsonb_build_object(
      'prize_first', coalesce(extras->>'prize_first', '25000'),
      'prize_second', coalesce(extras->>'prize_second', '10000'),
      'prize_third', coalesce(extras->>'prize_third', '5000'),
      'registration_from_email', coalesce(extras->>'registration_from_email', 'Admin@HCheckers.org'),
      'registration_admin_email', coalesce(extras->>'registration_admin_email', 'Admin@HCheckers.org')
    )
    where id = 1;
  end if;
end $$;

insert into public.cms_pages (slug, title, body)
values
  (
    'leadership',
    'Leadership Board',
    '<p>Meet the leadership of Hopeland Global Checkers (Draughts) Federation.</p><p>Edit this page in Admin → Pages to add names, roles, and biographies.</p>'
  ),
  (
    'rules',
    'Rules',
    '<p>Championship rules, fair-play standards, and competition format will be published here.</p><p>Edit this page in Admin → Pages to add the official rulebook.</p>'
  ),
  (
    'competition-2027',
    '2027 Competition',
    '<p>The Global Checkers / Draughts Championship takes place in Atlanta, Georgia, USA, July 19–25, 2027.</p><p>Edit this page in Admin → Pages to add schedule, venues, and competition details.</p>'
  )
on conflict (slug) do nothing;

update public.cms_pages
set body = replace(body, 'contact@hcheckers.org', 'Info@HCheckers.org')
where body ilike '%contact@hcheckers.org%';
