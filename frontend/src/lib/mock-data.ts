export type Link = {
  id: string;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  domain: string;
  clicks: number;
  createdAt: string;
  lastClickedAt: string;
  tags: string[];
  status: 'active' | 'archived';
  // v2: link management
  pinned: boolean;
  note: string;
  // v2: device targeting
  mobileUrl: string;
  // v2: scheduling
  scheduledFrom: string;
  scheduledUntil: string;
  fallbackUrl: string;
  // v2: social preview
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  // v2: health & notifications
  healthStatus: 'ok' | 'warn' | 'error' | 'unknown';
  milestoneThreshold: number; // 0 = disabled
};

export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  plan: 'Free' | 'Pro' | 'Business';
  linksCount: number;
  status: 'active' | 'invited' | 'suspended';
  joinedAt: string;
};

export type Domain = {
  id: string;
  domain: string;
  status: 'active' | 'pending' | 'error';
  linksCount: number;
  addedAt: string;
  sslEnabled: boolean;
};

export type Activity = {
  id: string;
  type: 'link_created' | 'user_signup' | 'domain_added' | 'link_clicked';
  description: string;
  timestamp: string;
  userId?: string;
};

export type Notification = {
  id: string;
  type: 'milestone' | 'digest' | 'health' | 'schedule';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  linkShortUrl?: string;
};

export const mockLinks: Link[] = [
  {
    id: '1', originalUrl: 'https://example.com/very-long-url-marketing-campaign-2023-q4',
    shortCode: 'cmp-q4', shortUrl: 'sh.rt/cmp-q4', domain: 'sh.rt', clicks: 12450,
    createdAt: '2023-10-01T10:00:00Z', lastClickedAt: '2023-12-05T14:32:00Z',
    tags: ['marketing', 'q4'], status: 'active',
    pinned: true, note: 'Used in the Q4 email blast — 40k subscribers',
    mobileUrl: 'https://apps.apple.com/app/example/id123456', scheduledFrom: '', scheduledUntil: '', fallbackUrl: 'https://example.com',
    ogTitle: 'Q4 Campaign 2023', ogDescription: 'Exclusive Q4 deals for our subscribers.', ogImage: '',
    healthStatus: 'ok', milestoneThreshold: 15000,
  },
  {
    id: '2', originalUrl: 'https://github.com/features/copilot',
    shortCode: 'gh-copilot', shortUrl: 'sh.rt/gh-copilot', domain: 'sh.rt', clicks: 8302,
    createdAt: '2023-11-15T08:20:00Z', lastClickedAt: '2023-12-05T12:11:00Z',
    tags: ['dev', 'social'], status: 'active',
    pinned: false, note: '',
    mobileUrl: '', scheduledFrom: '', scheduledUntil: '', fallbackUrl: '',
    ogTitle: '', ogDescription: '', ogImage: '',
    healthStatus: 'ok', milestoneThreshold: 10000,
  },
  {
    id: '3', originalUrl: 'https://notion.so/workspace/design-system',
    shortCode: 'ds-v2', shortUrl: 'acme.co/ds-v2', domain: 'acme.co', clicks: 450,
    createdAt: '2023-12-01T09:15:00Z', lastClickedAt: '2023-12-04T16:45:00Z',
    tags: ['internal', 'design'], status: 'active',
    pinned: true, note: 'Share with new design hires only',
    mobileUrl: '', scheduledFrom: '2026-01-01T09:00', scheduledUntil: '2026-06-30T23:59', fallbackUrl: 'https://acme.co',
    ogTitle: 'Acme Design System v2', ogDescription: 'Our internal component library and guidelines.', ogImage: '',
    healthStatus: 'warn', milestoneThreshold: 0,
  },
  {
    id: '4', originalUrl: 'https://zoom.us/j/1234567890',
    shortCode: 'standup', shortUrl: 'acme.co/standup', domain: 'acme.co', clicks: 120,
    createdAt: '2023-01-10T11:00:00Z', lastClickedAt: '2023-12-05T09:00:00Z',
    tags: ['internal'], status: 'active',
    pinned: false, note: '',
    mobileUrl: 'zoommtg://zoom.us/join?confno=1234567890', scheduledFrom: '', scheduledUntil: '', fallbackUrl: '',
    ogTitle: '', ogDescription: '', ogImage: '',
    healthStatus: 'ok', milestoneThreshold: 0,
  },
  {
    id: '5', originalUrl: 'https://figma.com/file/12345/App-V2',
    shortCode: 'app-designs', shortUrl: 'sh.rt/app-designs', domain: 'sh.rt', clicks: 89,
    createdAt: '2023-11-20T14:20:00Z', lastClickedAt: '2023-12-03T10:05:00Z',
    tags: ['design'], status: 'active',
    pinned: false, note: '',
    mobileUrl: '', scheduledFrom: '', scheduledUntil: '', fallbackUrl: '',
    ogTitle: '', ogDescription: '', ogImage: '',
    healthStatus: 'error', milestoneThreshold: 0,
  },
];

export const mockUsers: User[] = [
  { id: 'u1', name: 'Alice Johnson', email: 'alice@acme.co', avatarUrl: '', plan: 'Business', linksCount: 45, status: 'active', joinedAt: '2022-01-15T00:00:00Z' },
  { id: 'u2', name: 'Bob Smith', email: 'bob@acme.co', avatarUrl: '', plan: 'Business', linksCount: 12, status: 'active', joinedAt: '2022-03-20T00:00:00Z' },
  { id: 'u3', name: 'Charlie Davis', email: 'charlie@acme.co', avatarUrl: '', plan: 'Pro', linksCount: 89, status: 'active', joinedAt: '2023-05-10T00:00:00Z' },
  { id: 'u4', name: 'Diana Prince', email: 'diana@acme.co', avatarUrl: '', plan: 'Free', linksCount: 0, status: 'invited', joinedAt: '2023-12-01T00:00:00Z' },
];

export const mockDomains: Domain[] = [
  { id: 'd1', domain: 'sh.rt', status: 'active', linksCount: 1250, addedAt: '2021-01-01T00:00:00Z', sslEnabled: true },
  { id: 'd2', domain: 'acme.co', status: 'active', linksCount: 345, addedAt: '2022-06-15T00:00:00Z', sslEnabled: true },
  { id: 'd3', domain: 'promo.link', status: 'pending', linksCount: 0, addedAt: '2023-12-04T00:00:00Z', sslEnabled: false },
  { id: 'd4', domain: 'my-brand.com', status: 'error', linksCount: 12, addedAt: '2023-11-01T00:00:00Z', sslEnabled: true },
];

export const mockActivity: Activity[] = [
  { id: 'a1', type: 'link_created', description: 'Created sh.rt/cmp-q4', timestamp: '2023-12-05T14:00:00Z', userId: 'u1' },
  { id: 'a2', type: 'link_clicked', description: 'sh.rt/gh-copilot reached 8,000 clicks', timestamp: '2023-12-05T12:00:00Z' },
  { id: 'a3', type: 'domain_added', description: 'Added domain promo.link', timestamp: '2023-12-04T10:00:00Z', userId: 'u1' },
  { id: 'a4', type: 'user_signup', description: 'Diana Prince invited', timestamp: '2023-12-01T09:00:00Z', userId: 'u1' },
];

export const mockNotifications: Notification[] = [
  { id: 'n1', type: 'milestone', title: 'Milestone reached 🎉', description: 'sh.rt/cmp-q4 crossed 12,000 clicks — you set a 12k alert for this link.', timestamp: '2023-12-05T14:00:00Z', read: false, linkShortUrl: 'sh.rt/cmp-q4' },
  { id: 'n2', type: 'health', title: 'Destination unreachable', description: 'sh.rt/app-designs is returning 404. The destination URL may have moved or been deleted.', timestamp: '2023-12-05T08:30:00Z', read: false, linkShortUrl: 'sh.rt/app-designs' },
  { id: 'n3', type: 'health', title: 'Slow redirect detected', description: 'acme.co/ds-v2 destination is responding slowly (>3s). Consider updating the destination URL.', timestamp: '2023-12-04T18:15:00Z', read: true, linkShortUrl: 'acme.co/ds-v2' },
  { id: 'n4', type: 'digest', title: 'Your weekly digest', description: 'Last week: 8,100 total clicks across 5 links. Top link: sh.rt/cmp-q4 with 2,450 clicks.', timestamp: '2023-12-04T08:00:00Z', read: true },
  { id: 'n5', type: 'milestone', title: 'Milestone reached 🎉', description: 'sh.rt/gh-copilot crossed 8,000 clicks.', timestamp: '2023-12-03T12:00:00Z', read: true, linkShortUrl: 'sh.rt/gh-copilot' },
  { id: 'n6', type: 'schedule', title: 'Link schedule started', description: 'acme.co/ds-v2 is now active — its scheduled window began at 9:00 AM.', timestamp: '2026-01-01T09:00:00Z', read: true, linkShortUrl: 'acme.co/ds-v2' },
];

export const mockAnalyticsOverTime = [
  { date: 'Mon', clicks: 1200, uniqueVisitors: 850 },
  { date: 'Tue', clicks: 1350, uniqueVisitors: 920 },
  { date: 'Wed', clicks: 1100, uniqueVisitors: 780 },
  { date: 'Thu', clicks: 1600, uniqueVisitors: 1150 },
  { date: 'Fri', clicks: 2100, uniqueVisitors: 1400 },
  { date: 'Sat', clicks: 950, uniqueVisitors: 620 },
  { date: 'Sun', clicks: 800, uniqueVisitors: 540 },
];

export const mockAnalyticsReferrers = [
  { name: 'Twitter / X', count: 4500, percentage: 35, trend: +12 },
  { name: 'LinkedIn', count: 3200, percentage: 25, trend: +8 },
  { name: 'Direct', count: 2800, percentage: 22, trend: -3 },
  { name: 'Email', count: 1200, percentage: 9, trend: +2 },
  { name: 'GitHub', count: 650, percentage: 5, trend: +21 },
  { name: 'Other', count: 550, percentage: 4, trend: 0 },
];

export const mockAnalyticsDevices = [
  { name: 'Mobile', count: 8500, percentage: 60 },
  { name: 'Desktop', count: 4200, percentage: 30 },
  { name: 'Tablet', count: 1400, percentage: 10 },
];
