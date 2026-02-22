-- Quiz Images: generate-once, reuse-forever image pipeline
-- Run this in the Supabase SQL editor (Dashboard > SQL Editor)

create table if not exists public.quiz_images (
  id              uuid        primary key default gen_random_uuid(),
  cache_key       text        unique not null,
  quiz_item_id    text        null,
  prompt          text        not null,
  model           text        not null default 'gpt-image-1-mini',
  quality         text        not null default 'low',
  size            text        not null default '1024x1024',
  storage_bucket  text        not null,
  storage_path    text        not null,
  public_url      text        not null,
  status          text        not null default 'ready'
                              check (status in ('ready', 'failed', 'pending')),
  error           text        null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_quiz_images_quiz_item_id
  on public.quiz_images (quiz_item_id);

create index if not exists idx_quiz_images_status
  on public.quiz_images (status);

-- Auto-update updated_at on every UPDATE
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_quiz_images_updated_at on public.quiz_images;
create trigger trg_quiz_images_updated_at
  before update on public.quiz_images
  for each row execute function public.set_updated_at();

-- RLS: only the service role (Edge Functions) may write; anon may read
alter table public.quiz_images enable row level security;

drop policy if exists "Service role full access" on public.quiz_images;
create policy "Service role full access"
  on public.quiz_images
  using (true)
  with check (true);
