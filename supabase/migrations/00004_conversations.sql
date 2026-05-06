-- message_role enum
create type public.message_role as enum ('user', 'assistant', 'system');

-- conversations
create table public.conversations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'New Investigation',
  context jsonb,
  model text not null default 'claude-opus-4-5',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger conversations_updated_at
  before update on public.conversations
  for each row execute procedure public.set_updated_at();

-- messages
create table public.messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  role public.message_role not null,
  content text not null,
  input_tokens integer,
  output_tokens integer,
  created_at timestamptz not null default now()
);

-- Indexes
create index conversations_user_id_idx on public.conversations(user_id);
create index conversations_updated_at_idx on public.conversations(updated_at desc);
create index messages_conversation_id_idx on public.messages(conversation_id);
create index messages_created_at_idx on public.messages(created_at asc);
