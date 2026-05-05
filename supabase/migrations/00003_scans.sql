-- Enums
create type public.media_type as enum ('image', 'video', 'audio');
create type public.scan_status as enum ('pending', 'processing', 'complete', 'failed');
create type public.scan_verdict as enum ('authentic', 'likely_authentic', 'suspicious', 'likely_fake', 'fake');

-- scans
create table public.scans (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  file_name text not null,
  file_size bigint not null,
  media_type public.media_type not null,
  storage_path text not null,
  status public.scan_status not null default 'pending',
  trust_score integer check (trust_score >= 0 and trust_score <= 100),
  verdict public.scan_verdict,
  raw_analysis jsonb,
  ai_explanation text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

-- Indexes
create index scans_user_id_idx on public.scans(user_id);
create index scans_status_idx on public.scans(status);
create index scans_created_at_idx on public.scans(created_at desc);

-- Enable realtime for scan status updates
alter publication supabase_realtime add table public.scans;

-- Storage bucket for scan files
insert into storage.buckets (id, name, public)
values ('scans', 'scans', false)
on conflict (id) do nothing;
