import type { BlogPost, Registration, SiteSettings, Sponsor, Video } from '@/types'
import { createDemoCollection } from './demoStore'
import {
  defaultCmsPages,
  defaultContactMessages,
  defaultFaqs,
  defaultSiteFeatures,
  defaultSiteSettings,
  defaultSiteStats,
  defaultSportsGames,
  defaultTestimonials,
  defaultTimeline,
} from './cmsDefaults'

const videosSeed: Video[] = [
  {
    id: 'v1',
    title: 'Championship Trailer — Season',
    description: 'A first look at the biggest checkers championship in Hopeland history.',
    video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail_url: null,
    published: true,
    display_order: 1,
    created_at: '2025-01-10T00:00:00Z',
    updated_at: '2025-01-10T00:00:00Z',
  },
  {
    id: 'v2',
    title: 'Meet the Defending Champion',
    description: 'An inside look at the training routine of last year\'s world title holder.',
    video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail_url: null,
    published: true,
    display_order: 2,
    created_at: '2025-02-02T00:00:00Z',
    updated_at: '2025-02-02T00:00:00Z',
  },
  {
    id: 'v3',
    title: 'How Qualifiers Work',
    description: 'Everything you need to know about the regional qualifier brackets.',
    video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail_url: null,
    published: true,
    display_order: 3,
    created_at: '2025-02-18T00:00:00Z',
    updated_at: '2025-02-18T00:00:00Z',
  },
  {
    id: 'v4',
    title: 'Behind the Board: Live Production',
    description: 'A look at how we broadcast every match to over 120 countries.',
    video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail_url: null,
    published: true,
    display_order: 4,
    created_at: '2025-03-01T00:00:00Z',
    updated_at: '2025-03-01T00:00:00Z',
  },
]

const videosCollection = createDemoCollection('videos', videosSeed)
export const mockVideos = videosCollection.data
export const persistVideos = videosCollection.persist

const sponsorsSeed: Sponsor[] = [
  { id: 's1', name: 'Northbridge Capital', logo_url: '', website_url: '#', tier: 'platinum', display_order: 1, created_at: '2025-01-01T00:00:00Z' },
  { id: 's2', name: 'Solstice Games', logo_url: '', website_url: '#', tier: 'platinum', display_order: 2, created_at: '2025-01-01T00:00:00Z' },
  { id: 's3', name: 'Ardent Media', logo_url: '', website_url: '#', tier: 'gold', display_order: 3, created_at: '2025-01-01T00:00:00Z' },
  { id: 's4', name: 'Vantage Sports', logo_url: '', website_url: '#', tier: 'gold', display_order: 4, created_at: '2025-01-01T00:00:00Z' },
  { id: 's5', name: 'Clearwater Foods', logo_url: '', website_url: '#', tier: 'silver', display_order: 5, created_at: '2025-01-01T00:00:00Z' },
  { id: 's6', name: 'Meridian Airlines', logo_url: '', website_url: '#', tier: 'silver', display_order: 6, created_at: '2025-01-01T00:00:00Z' },
  { id: 's7', name: 'Pinehall Studios', logo_url: '', website_url: '#', tier: 'partner', display_order: 7, created_at: '2025-01-01T00:00:00Z' },
  { id: 's8', name: 'Everline Bank', logo_url: '', website_url: '#', tier: 'partner', display_order: 8, created_at: '2025-01-01T00:00:00Z' },
]

const sponsorsCollection = createDemoCollection('sponsors', sponsorsSeed)
export const mockSponsors = sponsorsCollection.data
export const persistSponsors = sponsorsCollection.persist

const blogPostsSeed: BlogPost[] = [
  {
    id: 'b1',
    title: 'Registration Opens for the World Championship',
    slug: 'registration-opens',
    excerpt: 'Players from over 120 countries can now secure their spot on the road to the world title.',
    content:
      'Registration for the Hopeland Global Checkers World Championship is officially open. This year\'s tournament introduces expanded regional qualifiers, a larger prize pool, and live-streamed coverage of every match from the quarterfinals onward.\n\nPlayers of every skill level are welcome to compete in the Open Division, while the Masters Division remains reserved for federation-rated players. Early-bird registration includes a discounted entry fee and a limited-edition player badge.',
    cover_image_url: null,
    author: 'Hopeland Organizing Committee',
    published: true,
    published_at: '2025-01-15T00:00:00Z',
    created_at: '2025-01-15T00:00:00Z',
    updated_at: '2025-01-15T00:00:00Z',
  },
  {
    id: 'b2',
    title: 'Inside the New Fair-Play Review System',
    slug: 'fair-play-review-system',
    excerpt: 'A closer look at the certified referee panel and the technology keeping every match fair.',
    content:
      'Fair play is the foundation of every Hopeland Global Checkers event. This season, we\'re introducing an expanded certified referee panel alongside a digital move-review system used across all qualifier and final-stage matches.\n\nEvery board is monitored in real time, with any disputed move eligible for an instant replay review by a panel of three independent referees.',
    cover_image_url: null,
    author: 'Competition Integrity Team',
    published: true,
    published_at: '2025-02-05T00:00:00Z',
    created_at: '2025-02-05T00:00:00Z',
    updated_at: '2025-02-05T00:00:00Z',
  },
  {
    id: 'b3',
    title: 'Meet the Regional Qualifier Hosts',
    slug: 'regional-qualifier-hosts',
    excerpt: 'Nine cities across five continents will host this year\'s regional qualifying rounds.',
    content:
      'From Accra to Auckland, this year\'s regional qualifiers bring championship checkers to nine host cities across five continents. Each qualifier will crown regional champions who advance directly to the World Championship semifinal bracket.',
    cover_image_url: null,
    author: 'Hopeland Organizing Committee',
    published: true,
    published_at: '2025-02-20T00:00:00Z',
    created_at: '2025-02-20T00:00:00Z',
    updated_at: '2025-02-20T00:00:00Z',
  },
]

const blogPostsCollection = createDemoCollection('blogPosts', blogPostsSeed)
export const mockBlogPosts = blogPostsCollection.data
export const persistBlogPosts = blogPostsCollection.persist

const registrationsSeed: Registration[] = [
  {
    id: 'r1',
    first_name: 'Amara',
    last_name: 'Okafor',
    date_of_birth: '1998-04-12',
    city: 'Lagos',
    country: 'Nigeria',
    phone: '+234 801 234 5678',
    email: 'amara.okafor@example.com',
    status: 'paid',
    fee_amount: 1000,
    fee_currency: 'usd',
    stripe_session_id: 'cs_test_1',
    stripe_payment_intent: 'pi_test_1',
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-02-01T10:05:00Z',
  },
  {
    id: 'r2',
    first_name: 'Liam',
    last_name: 'Carter',
    date_of_birth: '2001-09-30',
    city: 'Toronto',
    country: 'Canada',
    phone: '+1 416 555 0182',
    email: 'liam.carter@example.com',
    status: 'paid',
    fee_amount: 1000,
    fee_currency: 'usd',
    stripe_session_id: 'cs_test_2',
    stripe_payment_intent: 'pi_test_2',
    created_at: '2025-02-03T14:22:00Z',
    updated_at: '2025-02-03T14:26:00Z',
  },
  {
    id: 'r3',
    first_name: 'Sofia',
    last_name: 'Reyes',
    date_of_birth: '1995-01-22',
    city: 'Madrid',
    country: 'Spain',
    phone: '+34 612 345 678',
    email: 'sofia.reyes@example.com',
    status: 'pending',
    fee_amount: 1000,
    fee_currency: 'usd',
    stripe_session_id: 'cs_test_3',
    stripe_payment_intent: null,
    created_at: '2025-02-10T09:15:00Z',
    updated_at: '2025-02-10T09:15:00Z',
  },
]

const registrationsCollection = createDemoCollection('registrations', registrationsSeed)
export const mockRegistrations = registrationsCollection.data
export const persistRegistrations = registrationsCollection.persist

const siteSettingsKey = 'site_settings'
function readSiteSettings(): SiteSettings {
  if (typeof window === 'undefined') return { ...defaultSiteSettings }
  try {
    const raw = window.localStorage.getItem('hopeland-demo:' + siteSettingsKey)
    if (!raw) return { ...defaultSiteSettings }
    return { ...defaultSiteSettings, extras: {}, ...JSON.parse(raw) }
  } catch {
    return { ...defaultSiteSettings }
  }
}
export let mockSiteSettings: SiteSettings = readSiteSettings()
export function persistSiteSettings() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem('hopeland-demo:' + siteSettingsKey, JSON.stringify(mockSiteSettings))
  } catch {
    /* ignore */
  }
}
export function setMockSiteSettings(next: SiteSettings) {
  mockSiteSettings = next
  persistSiteSettings()
}

const statsCollection = createDemoCollection('site_stats', defaultSiteStats)
export const mockSiteStats = statsCollection.data
export const persistSiteStats = statsCollection.persist

const featuresCollection = createDemoCollection('site_features', defaultSiteFeatures)
export const mockSiteFeatures = featuresCollection.data
export const persistSiteFeatures = featuresCollection.persist

const faqsCollection = createDemoCollection('faqs', defaultFaqs)
export const mockFaqs = faqsCollection.data
export const persistFaqs = faqsCollection.persist

const testimonialsCollection = createDemoCollection('testimonials', defaultTestimonials)
export const mockTestimonials = testimonialsCollection.data
export const persistTestimonials = testimonialsCollection.persist

const timelineCollection = createDemoCollection('timeline_items', defaultTimeline)
export const mockTimeline = timelineCollection.data
export const persistTimeline = timelineCollection.persist

const cmsPagesCollection = createDemoCollection('cms_pages', defaultCmsPages)
export const mockCmsPages = cmsPagesCollection.data
export const persistCmsPages = cmsPagesCollection.persist

const sportsCollection = createDemoCollection('sports_games', defaultSportsGames)
export const mockSportsGames = sportsCollection.data
export const persistSportsGames = sportsCollection.persist

const messagesCollection = createDemoCollection('contact_messages', defaultContactMessages)
export const mockContactMessages = messagesCollection.data
export const persistContactMessages = messagesCollection.persist
