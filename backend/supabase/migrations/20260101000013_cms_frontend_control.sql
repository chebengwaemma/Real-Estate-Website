-- CMS tables for admin → public frontend control
-- Apply via: supabase db push  OR paste into SQL Editor

-- ─── site_settings (singleton) ───────────────────────────────────────────────
create table if not exists public.site_settings (
  id integer primary key default 1 check (id = 1),
  championship_location text not null default 'Atlanta, Georgia, USA',
  championship_dates text not null default 'July 19 – 25, 2027',
  championship_dates_start date not null default '2027-07-19',
  championship_dates_end date not null default '2027-07-25',
  announcement_text text not null default 'Atlanta, Georgia, USA — July 19–25, 2027',
  announcement_cta text not null default 'Register now',
  contact_email text not null default 'contact@hcheckers.org',
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
  updated_at timestamptz not null default now()
);

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

-- ─── site_stats ────────────────────────────────────────────────────────────
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
create policy "site_stats_select_public"
  on public.site_stats for select using (true);

drop policy if exists "site_stats_write_admin" on public.site_stats;
create policy "site_stats_write_admin"
  on public.site_stats for all
  using (public.is_admin())
  with check (public.is_admin());

insert into public.site_stats (label, sublabel, value, suffix, display_order)
select * from (values
  ('Countries Represented', 'Growing every season', 128, '+', 1),
  ('Registered Players', 'Across all divisions', 42800, '+', 2),
  ('Prize Pool (USD)', 'Distributed across finalists', 250000, '', 3),
  ('Matches Played', 'Live-streamed and archived', 9600, '+', 4)
) as v(label, sublabel, value, suffix, display_order)
where not exists (select 1 from public.site_stats limit 1);

-- ─── site_features ─────────────────────────────────────────────────────────
create table if not exists public.site_features (
  id uuid primary key default gen_random_uuid(),
  icon text not null default 'Globe2',
  title text not null,
  description text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.site_features enable row level security;

drop policy if exists "site_features_select_public" on public.site_features;
create policy "site_features_select_public"
  on public.site_features for select using (true);

drop policy if exists "site_features_write_admin" on public.site_features;
create policy "site_features_write_admin"
  on public.site_features for all
  using (public.is_admin())
  with check (public.is_admin());

insert into public.site_features (icon, title, description, display_order)
select * from (values
  ('Globe2', 'Global Competition', 'Regional qualifiers on five continents feed directly into the World Championship bracket.', 1),
  ('Radio', 'Live-Streamed Matches', 'Every quarterfinal, semifinal, and final match is broadcast live with expert commentary.', 2),
  ('ShieldCheck', 'Certified Fair Play', 'An independent referee panel and digital move-review system protect every result.', 3),
  ('Trophy', 'Real Prize Pool', 'A growing prize pool is distributed across finalists in every division, every season.', 4),
  ('Layers', 'Divisions For Everyone', 'Open, Masters, and Junior divisions mean there is a bracket for every skill level.', 5),
  ('Users', 'A Global Community', 'Connect with players, coaches, and fans from more than 120 countries.', 6)
) as v(icon, title, description, display_order)
where not exists (select 1 from public.site_features limit 1);

-- ─── faqs ──────────────────────────────────────────────────────────────────
create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  published boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.faqs enable row level security;

drop policy if exists "faqs_select_public" on public.faqs;
create policy "faqs_select_public"
  on public.faqs for select
  using (published = true or public.is_admin());

drop policy if exists "faqs_write_admin" on public.faqs;
create policy "faqs_write_admin"
  on public.faqs for all
  using (public.is_admin())
  with check (public.is_admin());

insert into public.faqs (question, answer, display_order)
select * from (values
  ('Who can register for the championship?', 'Any player aged 6 or older can register for the Open or Junior division. The Masters division is reserved for federation-rated players.', 1),
  ('How do regional qualifiers work?', 'Nine host cities across five continents run single-elimination qualifiers. Regional champions advance directly to the World Championship semifinal bracket.', 2),
  ('Is the registration fee refundable?', 'Registration fees are refundable up to 14 days before your regional qualifier date. After that, fees are non-refundable but transferable to the next season.', 3),
  ('Will matches be streamed online?', 'Yes — every match from the quarterfinals onward is live-streamed with commentary, and full replays are published to the Videos hub afterward.', 4),
  ('How is fair play enforced?', 'A certified referee panel oversees every match, supported by a digital move-review system available for any disputed play.', 5),
  ('How can my organization become a sponsor?', 'Reach out through the Contact page — our partnerships team will follow up with sponsorship tiers and benefits.', 6)
) as v(question, answer, display_order)
where not exists (select 1 from public.faqs limit 1);

-- ─── testimonials ──────────────────────────────────────────────────────────
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  quote text not null,
  name text not null,
  role text not null,
  avatar_initials text not null default '',
  published boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.testimonials enable row level security;

drop policy if exists "testimonials_select_public" on public.testimonials;
create policy "testimonials_select_public"
  on public.testimonials for select
  using (published = true or public.is_admin());

drop policy if exists "testimonials_write_admin" on public.testimonials;
create policy "testimonials_write_admin"
  on public.testimonials for all
  using (public.is_admin())
  with check (public.is_admin());

insert into public.testimonials (quote, name, role, avatar_initials, display_order)
select * from (values
  ('The qualifier system gave me a real path from my local club to the world stage. Nothing else compares.', 'Amara Okafor', '2025 Open Division Finalist', 'AO', 1),
  ('The live broadcast and referee panel made every match feel like it truly mattered.', 'Liam Carter', 'Regional Champion, North America', 'LC', 2),
  ('I started in the Junior division at 12 — this season I qualified for the Open bracket.', 'Sofia Reyes', 'Junior Division Player', 'SR', 3),
  ('The transparency around seeding and results is exactly what competitive checkers needed.', 'Kenji Watanabe', 'Coach & Federation Delegate', 'KW', 4)
) as v(quote, name, role, avatar_initials, display_order)
where not exists (select 1 from public.testimonials limit 1);

-- ─── timeline_items ────────────────────────────────────────────────────────
create table if not exists public.timeline_items (
  id uuid primary key default gen_random_uuid(),
  quarter text not null,
  title text not null,
  items jsonb not null default '[]'::jsonb,
  status text not null default 'upcoming' check (status in ('done', 'active', 'upcoming')),
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.timeline_items enable row level security;

drop policy if exists "timeline_items_select_public" on public.timeline_items;
create policy "timeline_items_select_public"
  on public.timeline_items for select using (true);

drop policy if exists "timeline_items_write_admin" on public.timeline_items;
create policy "timeline_items_write_admin"
  on public.timeline_items for all
  using (public.is_admin())
  with check (public.is_admin());

insert into public.timeline_items (quarter, title, items, status, display_order)
select * from (values
  ('2027', 'World Championship — Atlanta', '["Atlanta, Georgia, USA","July 19 – 25, 2027","Checkers / Draughts"]'::jsonb, 'active', 1),
  ('Q1', 'Registration Opens', '["Early-bird entry fee","Player profile setup"]'::jsonb, 'done', 2),
  ('Q1', 'Regional Qualifiers Begin', '["9 host cities","5 continents"]'::jsonb, 'upcoming', 3),
  ('Q2', 'Qualifiers Conclude', '["Regional champions crowned","Bracket seeding published"]'::jsonb, 'upcoming', 4),
  ('Q3', 'World Semifinals', '["Live-streamed matches","Certified referee panel"]'::jsonb, 'upcoming', 5),
  ('July', 'World Final — Atlanta, USA', '["July 19 – 25, 2027","Global broadcast"]'::jsonb, 'upcoming', 6)
) as v(quarter, title, items, status, display_order)
where not exists (select 1 from public.timeline_items limit 1);

-- ─── cms_pages ─────────────────────────────────────────────────────────────
create table if not exists public.cms_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  body text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.cms_pages enable row level security;

drop policy if exists "cms_pages_select_public" on public.cms_pages;
create policy "cms_pages_select_public"
  on public.cms_pages for select using (true);

drop policy if exists "cms_pages_write_admin" on public.cms_pages;
create policy "cms_pages_write_admin"
  on public.cms_pages for all
  using (public.is_admin())
  with check (public.is_admin());

insert into public.cms_pages (slug, title, body)
values
  ('about', 'About Hopeland Global Checkers', '<p>Hopeland Global Checkers is the world’s premier checkers championship — a season-long journey from open regional qualifiers to a live-streamed world final.</p><p>Every match is judged by a certified referee panel. Open, Masters, and Junior divisions welcome every skill level.</p>'),
  ('privacy-policy', 'Privacy Policy', '<p>We collect registration and account information needed to run the championship. Payment details are processed by Stripe and are not stored on our servers.</p><p>Contact us at contact@hcheckers.org with privacy questions.</p>'),
  ('terms-of-use', 'Terms of Use', '<p>By registering you agree to championship rules, fair play standards, and the registration fee terms. Fees are refundable only as stated on the registration page.</p>')
on conflict (slug) do nothing;

-- ─── sports_games ──────────────────────────────────────────────────────────
create table if not exists public.sports_games (
  id text primary key,
  title text not null,
  provider text not null default '',
  category text not null,
  variant text not null default 'portrait' check (variant in ('original', 'portrait')),
  gradient text not null default 'from-[#312e81] to-[#0f172a]',
  accent text,
  badge text,
  display_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.sports_games enable row level security;

drop policy if exists "sports_games_select_public" on public.sports_games;
create policy "sports_games_select_public"
  on public.sports_games for select
  using (published = true or public.is_admin());

drop policy if exists "sports_games_write_admin" on public.sports_games;
create policy "sports_games_write_admin"
  on public.sports_games for all
  using (public.is_admin())
  with check (public.is_admin());

insert into public.sports_games (id, title, provider, category, variant, gradient, badge, display_order)
select * from (values
  ('o1', 'SPEED CHECKERS', 'ORIGINALS', 'originals', 'original', 'from-[#5b21b6] via-[#7c3aed] to-[#a78bfa]', null, 1),
  ('o2', 'KING HUNT', 'ORIGINALS', 'originals', 'original', 'from-[#0e7490] via-[#06b6d4] to-[#67e8f9]', null, 2),
  ('o3', 'BLITZ ARENA', 'ORIGINALS', 'originals', 'original', 'from-[#be123c] via-[#f43f5e] to-[#fb7185]', null, 3),
  ('o4', 'CAPTURE RUN', 'ORIGINALS', 'originals', 'original', 'from-[#166534] via-[#22c55e] to-[#86efac]', null, 4),
  ('o5', 'OPENING LAB', 'ORIGINALS', 'originals', 'original', 'from-[#1e3a8a] via-[#2563eb] to-[#60a5fa]', null, 5),
  ('o6', 'ENDGAME', 'ORIGINALS', 'originals', 'original', 'from-[#9a3412] via-[#f97316] to-[#fdba74]', null, 6),
  ('t1', 'WORLD BOARD', 'HOPELAND LIVE', 'trending', 'portrait', 'from-[#312e81] to-[#0f172a]', 'HOT', 7),
  ('t2', 'LAGOS LIGHTNING', 'ARENA SERIES', 'trending', 'portrait', 'from-[#831843] to-[#1e1b4b]', null, 8),
  ('t3', 'SINGAPORE DASH', 'ASIA CIRCUIT', 'trending', 'portrait', 'from-[#134e4a] to-[#0c4a6e]', null, 9),
  ('t4', 'MASTER CROWN', 'MASTERS', 'trending', 'portrait', 'from-[#713f12] to-[#3b0764]', null, 10),
  ('t5', 'JUNIOR SPARK', 'YOUTH LEAGUE', 'trending', 'portrait', 'from-[#1e3a8a] to-[#164e63]', null, 11),
  ('t6', 'DOUBLE JUMP', 'HOPELAND LIVE', 'trending', 'portrait', 'from-[#4c1d95] to-[#0f172a]', null, 12)
) as v(id, title, provider, category, variant, gradient, badge, display_order)
where not exists (select 1 from public.sports_games limit 1);

-- ─── contact_messages ──────────────────────────────────────────────────────
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
create policy "contact_messages_insert_public"
  on public.contact_messages for insert
  with check (true);

drop policy if exists "contact_messages_select_admin" on public.contact_messages;
create policy "contact_messages_select_admin"
  on public.contact_messages for select
  using (public.is_admin());

drop policy if exists "contact_messages_update_admin" on public.contact_messages;
create policy "contact_messages_update_admin"
  on public.contact_messages for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "contact_messages_delete_admin" on public.contact_messages;
create policy "contact_messages_delete_admin"
  on public.contact_messages for delete
  using (public.is_admin());
