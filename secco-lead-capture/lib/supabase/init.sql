create table leads (
  id bigint generated always as identity primary key,
  first_name text not null,
  last_name text not null,
  email text not null unique,
  company text,
  source text,
  message text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table leads enable row level security;

create policy "Allow anonymous inserts"
on leads
for insert
to anon
with check (true);

alter table public.leads enable row level security;

grant usage on schema public to anon, authenticated, service_role;

grant insert on table public.leads
to anon, authenticated;

grant select on table public.leads
to service_role;

grant usage, select on sequence public.leads_id_seq
to anon, authenticated, service_role;