-- Enums
create type public.threat_source as enum ('nvd', 'cve_mitre', 'hibp', 'news', 'manual');
create type public.severity_level as enum ('critical', 'high', 'medium', 'low', 'info');

-- threat_feed_items
create table public.threat_feed_items (
  id uuid primary key default uuid_generate_v4(),
  external_id text not null unique,
  source public.threat_source not null,
  title text not null,
  description text not null,
  summary text,
  severity public.severity_level not null default 'info',
  cvss_score numeric(4,1),
  affected_products jsonb,
  references jsonb,
  published_at timestamptz not null,
  is_summarized boolean not null default false,
  raw_data jsonb,
  created_at timestamptz not null default now()
);

-- Indexes
create index threat_feed_severity_idx on public.threat_feed_items(severity);
create index threat_feed_published_idx on public.threat_feed_items(published_at desc);
create index threat_feed_source_idx on public.threat_feed_items(source);
create index threat_feed_is_summarized_idx on public.threat_feed_items(is_summarized) where is_summarized = false;

-- Enable realtime for live threat feed
alter publication supabase_realtime add table public.threat_feed_items;
