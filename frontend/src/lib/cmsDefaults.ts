import type {
  CmsPage,
  ContactMessage,
  FaqRow,
  FeatureRow,
  SiteSettings,
  SiteStatRow,
  SportsGameRow,
  TestimonialRow,
  TimelineRow,
} from '@/types'
import { GAMES } from '@/data/sportsGames'

export const defaultSiteSettings: SiteSettings = {
  id: 1,
  championship_location: 'Atlanta, Georgia, USA',
  championship_dates: 'July 19 – 25, 2027',
  championship_dates_start: '2027-07-19',
  championship_dates_end: '2027-07-25',
  announcement_text: 'Atlanta, Georgia, USA — July 19–25, 2027',
  announcement_cta: 'Register now',
  contact_email: 'chebengwaemma@gmail.com',
  contact_phone: '',
  contact_address: 'Atlanta, Georgia, USA',
  site_name: 'Hopeland Global Checkers',
  website_url: 'https://hcheckers.org',
  logo_url: '',
  footer_tagline:
    'Hopeland Global Checkers (Draughts) Federation — the Global Checkers/Draughts Championship in Atlanta, Georgia, USA, July 19–25, 2027.',
  social_twitter: '#',
  social_instagram: '#',
  social_facebook: '#',
  social_youtube: '#',
  hero_eyebrow: 'Hopeland Global Checkers (Draughts) Federation',
  hero_title: 'Where Every Move Writes History',
  hero_subtitle:
    'The official home of the Global Checkers / Draughts Championship — Atlanta, Georgia, USA, 19–25 July 2027. Live-streamed, fairly judged, and open to every skill level.',
  final_cta_title: 'Atlanta, Georgia, USA — July 19–25, 2027',
  final_cta_subtitle:
    'Global Checkers / Draughts Championship. Register now — your player profile opens only after Stripe payment succeeds.',
  about_teaser:
    "Hopeland Global Checkers is the world's premier checkers championship — a season-long journey from open regional qualifiers to a live-streamed world final. Every match is judged by a certified referee panel, every player has a path to the top board, and every result is public and verifiable.",
  extras: {
    prize_first: '25000',
    prize_second: '10000',
    prize_third: '5000',
    registration_from_email: 'chebengwaemma@gmail.com',
    registration_admin_email: 'chebengwaemma@gmail.com',
  },
  updated_at: new Date().toISOString(),
}

export const defaultSiteStats: SiteStatRow[] = [
  { id: 'st1', label: 'Countries Represented', sublabel: 'Growing every season', value: 128, suffix: '+', display_order: 1, created_at: '' },
  { id: 'st2', label: 'Registered Players', sublabel: 'Across all divisions', value: 42800, suffix: '+', display_order: 2, created_at: '' },
  { id: 'st3', label: 'Prize Pool (USD)', sublabel: 'Distributed across finalists', value: 250000, suffix: '', display_order: 3, created_at: '' },
  { id: 'st4', label: 'Matches Played', sublabel: 'Live-streamed and archived', value: 9600, suffix: '+', display_order: 4, created_at: '' },
]

export const defaultSiteFeatures: FeatureRow[] = [
  { id: 'sf1', icon: 'Globe2', title: 'Global Competition', description: 'Regional qualifiers on five continents feed directly into the World Championship bracket.', display_order: 1, created_at: '' },
  { id: 'sf2', icon: 'Radio', title: 'Live-Streamed Matches', description: 'Every quarterfinal, semifinal, and final match is broadcast live with expert commentary.', display_order: 2, created_at: '' },
  { id: 'sf3', icon: 'ShieldCheck', title: 'Certified Fair Play', description: 'An independent referee panel and digital move-review system protect every result.', display_order: 3, created_at: '' },
  { id: 'sf4', icon: 'Trophy', title: 'Real Prize Pool', description: 'A growing prize pool is distributed across finalists in every division, every season.', display_order: 4, created_at: '' },
  { id: 'sf5', icon: 'Layers', title: 'Divisions For Everyone', description: 'Open, Masters, and Junior divisions mean there is a bracket for every skill level.', display_order: 5, created_at: '' },
  { id: 'sf6', icon: 'Users', title: 'A Global Community', description: 'Connect with players, coaches, and fans from more than 120 countries.', display_order: 6, created_at: '' },
]

export const defaultFaqs: FaqRow[] = [
  { id: 'f1', question: 'Who can register for the championship?', answer: 'Any player aged 6 or older can register for the Open or Junior division. The Masters division is reserved for federation-rated players.', published: true, display_order: 1, created_at: '' },
  { id: 'f2', question: 'How do regional qualifiers work?', answer: 'Nine host cities across five continents run single-elimination qualifiers. Regional champions advance directly to the World Championship semifinal bracket.', published: true, display_order: 2, created_at: '' },
  { id: 'f3', question: 'Is the registration fee refundable?', answer: 'Registration fees are refundable up to 14 days before your regional qualifier date. After that, fees are non-refundable but transferable to the next season.', published: true, display_order: 3, created_at: '' },
  { id: 'f4', question: 'Will matches be streamed online?', answer: 'Yes — every match from the quarterfinals onward is live-streamed with commentary, and full replays are published to the Videos hub afterward.', published: true, display_order: 4, created_at: '' },
  { id: 'f5', question: 'How is fair play enforced?', answer: 'A certified referee panel oversees every match, supported by a digital move-review system available for any disputed play.', published: true, display_order: 5, created_at: '' },
  { id: 'f6', question: 'How can my organization become a sponsor?', answer: 'Reach out through the Contact page — our partnerships team will follow up with sponsorship tiers and benefits.', published: true, display_order: 6, created_at: '' },
]

export const defaultTestimonials: TestimonialRow[] = [
  { id: 'te1', quote: 'The qualifier system gave me a real path from my local club to the world stage. Nothing else compares.', name: 'Amara Okafor', role: '2025 Open Division Finalist', avatar_initials: 'AO', published: true, display_order: 1, created_at: '' },
  { id: 'te2', quote: 'The live broadcast and referee panel made every match feel like it truly mattered.', name: 'Liam Carter', role: 'Regional Champion, North America', avatar_initials: 'LC', published: true, display_order: 2, created_at: '' },
  { id: 'te3', quote: 'I started in the Junior division at 12 — this season I qualified for the Open bracket.', name: 'Sofia Reyes', role: 'Junior Division Player', avatar_initials: 'SR', published: true, display_order: 3, created_at: '' },
  { id: 'te4', quote: 'The transparency around seeding and results is exactly what competitive checkers needed.', name: 'Kenji Watanabe', role: 'Coach & Federation Delegate', avatar_initials: 'KW', published: true, display_order: 4, created_at: '' },
]

export const defaultTimeline: TimelineRow[] = [
  { id: 't0', quarter: '2027', title: 'World Championship — Atlanta', items: ['Atlanta, Georgia, USA', 'July 19 – 25, 2027', 'Checkers / Draughts'], status: 'active', display_order: 1, created_at: '' },
  { id: 't1', quarter: 'Q1', title: 'Registration Opens', items: ['Early-bird entry fee', 'Player profile setup'], status: 'done', display_order: 2, created_at: '' },
  { id: 't2', quarter: 'Q1', title: 'Regional Qualifiers Begin', items: ['9 host cities', '5 continents'], status: 'upcoming', display_order: 3, created_at: '' },
  { id: 't3', quarter: 'Q2', title: 'Qualifiers Conclude', items: ['Regional champions crowned', 'Bracket seeding published'], status: 'upcoming', display_order: 4, created_at: '' },
  { id: 't4', quarter: 'Q3', title: 'World Semifinals', items: ['Live-streamed matches', 'Certified referee panel'], status: 'upcoming', display_order: 5, created_at: '' },
  { id: 't5', quarter: 'July', title: 'World Final — Atlanta, USA', items: ['July 19 – 25, 2027', 'Global broadcast'], status: 'upcoming', display_order: 6, created_at: '' },
]

export const defaultCmsPages: CmsPage[] = [
  {
    id: 'p-about',
    slug: 'about',
    title: 'About Hopeland Global Checkers',
    body: '<p>Hopeland Global Checkers is the world’s premier checkers championship — a season-long journey from open regional qualifiers to a live-streamed world final.</p><p>Every match is judged by a certified referee panel. Open, Masters, and Junior divisions welcome every skill level.</p>',
    updated_at: '',
  },
  {
    id: 'p-privacy',
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    body: '<p>We collect registration and account information needed to run the championship. Payment details are processed by Stripe and are not stored on our servers.</p><p>Contact us at Info@HCheckers.org with privacy questions.</p>',
    updated_at: '',
  },
  {
    id: 'p-terms',
    slug: 'terms-of-use',
    title: 'Terms of Use',
    body: '<p>By registering you agree to championship rules, fair play standards, and the registration fee terms. Fees are refundable only as stated on the registration page.</p>',
    updated_at: '',
  },
  {
    id: 'p-leadership',
    slug: 'leadership',
    title: 'Leadership Board',
    body: '<p>Meet the leadership of Hopeland Global Checkers (Draughts) Federation.</p><p>Edit this page in Admin → Pages to add names, roles, and biographies.</p>',
    updated_at: '',
  },
  {
    id: 'p-rules',
    slug: 'rules',
    title: 'Rules',
    body: '<p>Championship rules, fair-play standards, and competition format will be published here.</p><p>Edit this page in Admin → Pages to add the official rulebook.</p>',
    updated_at: '',
  },
  {
    id: 'p-competition',
    slug: 'competition-2027',
    title: '2027 Competition',
    body: '<p>The Global Checkers / Draughts Championship takes place in Atlanta, Georgia, USA, July 19–25, 2027.</p><p>Edit this page in Admin → Pages to add schedule, venues, and competition details.</p>',
    updated_at: '',
  },
]

export const defaultSportsGames: SportsGameRow[] = GAMES.map((g, i) => ({
  id: g.id,
  title: g.title,
  provider: g.provider,
  category: g.category,
  variant: g.variant,
  gradient: g.gradient,
  accent: g.accent ?? null,
  badge: g.badge ?? null,
  image_url: null,
  display_order: i + 1,
  published: true,
  created_at: '',
}))

export const defaultContactMessages: ContactMessage[] = []
