-- Kasbon: initial schema for personal debt tracking
-- Run this in Supabase SQL editor, or via `supabase db push` if using the CLI.

-- Enum for debt direction
create type debt_type as enum ('owed_to_me', 'i_owe');

create table if not exists public.debts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type debt_type not null,
  counterpart_name text not null check (char_length(trim(counterpart_name)) > 0),
  amount bigint not null check (amount > 0),
  note text check (note is null or char_length(note) <= 200),
  due_date date,
  settled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Helpful indexes for filtering/sorting on the dashboard
create index if not exists debts_user_id_idx on public.debts (user_id);
create index if not exists debts_user_status_idx on public.debts (user_id, settled_at);
create index if not exists debts_user_type_idx on public.debts (user_id, type);
create index if not exists debts_user_created_at_idx on public.debts (user_id, created_at desc);

-- Keep updated_at fresh on every update
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists debts_set_updated_at on public.debts;
create trigger debts_set_updated_at
  before update on public.debts
  for each row
  execute function public.set_updated_at();

-- ============ RLS ============
-- Wajib: user cuma boleh akses row miliknya sendiri, baik lewat REST API
-- langsung maupun lewat API route kita. auth.uid() diambil dari JWT Supabase.

alter table public.debts enable row level security;
-- Jaga-jaga: paksa RLS juga berlaku untuk owner tabel (mis. service role
-- yang dipakai lewat REST API dengan anon/authenticated key tetap kena).
alter table public.debts force row level security;

create policy "debts_select_own"
  on public.debts for select
  using (auth.uid() = user_id);

create policy "debts_insert_own"
  on public.debts for insert
  with check (auth.uid() = user_id);

create policy "debts_update_own"
  on public.debts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "debts_delete_own"
  on public.debts for delete
  using (auth.uid() = user_id);
