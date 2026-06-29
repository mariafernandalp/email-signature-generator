create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  cargo text not null,
  ramal text not null,
  email text not null,
  whatsapp text not null,
  branch_code text not null,
  branch_label text not null,
  endereco text not null,
  created_at timestamptz not null default now()
);

create index if not exists contact_submissions_created_at_idx
  on public.contact_submissions (created_at desc);

alter table public.contact_submissions enable row level security;

create policy "Allow public insert on contact submissions"
  on public.contact_submissions
  for insert
  to anon
  with check (true);

create policy "Allow public upload to signatures bucket"
  on storage.objects
  for insert
  to anon
  with check (bucket_id = 'assinaturas');

create policy "Allow public update to signatures bucket"
  on storage.objects
  for update
  to anon
  using (bucket_id = 'assinaturas')
  with check (bucket_id = 'assinaturas');

create policy "Allow public read from signatures bucket"
  on storage.objects
  for select
  to anon
  using (bucket_id = 'assinaturas');

-- criar o bucket (se ainda nao existir)
insert into storage.buckets (id, name, public, avif_autodetection)
values ('assinaturas', 'assinaturas', true, false)
on conflict (id) do nothing;