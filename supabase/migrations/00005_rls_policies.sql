-- ============================================================
-- Row Level Security on all tables
-- ============================================================

-- profiles
alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- threat_feed_items (read-only for authenticated users)
alter table public.threat_feed_items enable row level security;

create policy "Authenticated users can read threat feed"
  on public.threat_feed_items for select
  to authenticated
  using (true);

-- scans (users see only their own)
alter table public.scans enable row level security;

create policy "Users can read their own scans"
  on public.scans for select
  using (auth.uid() = user_id);

create policy "Users can insert their own scans"
  on public.scans for insert
  with check (auth.uid() = user_id);

-- conversations
alter table public.conversations enable row level security;

create policy "Users can read their own conversations"
  on public.conversations for select
  using (auth.uid() = user_id);

create policy "Users can insert their own conversations"
  on public.conversations for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own conversations"
  on public.conversations for update
  using (auth.uid() = user_id);

create policy "Users can delete their own conversations"
  on public.conversations for delete
  using (auth.uid() = user_id);

-- messages
alter table public.messages enable row level security;

create policy "Users can read messages in their conversations"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations
      where id = conversation_id and user_id = auth.uid()
    )
  );

create policy "Users can insert messages in their conversations"
  on public.messages for insert
  with check (
    exists (
      select 1 from public.conversations
      where id = conversation_id and user_id = auth.uid()
    )
  );

-- Storage policies for scans bucket
create policy "Users can upload their own scan files"
  on storage.objects for insert
  with check (
    bucket_id = 'scans'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can read their own scan files"
  on storage.objects for select
  using (
    bucket_id = 'scans'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
