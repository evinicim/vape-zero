-- VAPE ZERO — schema inicial (Supabase / Postgres)
create extension if not exists "pgcrypto";
create type member_role as enum ('student','educator','admin');
create type trail_key as enum ('prevencao','apoio');
create type situation_category as enum ('pressao','curiosidade','parar');
create type next_step as enum ('confianca','ubs','disque136');

create table organization (id uuid primary key default gen_random_uuid(), name text not null, kind text not null default 'escola', created_at timestamptz default now());
create table class (id uuid primary key default gen_random_uuid(), org_id uuid not null references organization(id) on delete cascade, name text not null, join_code text unique not null, created_at timestamptz default now());
create table member (
  id uuid primary key references auth.users(id) on delete cascade,
  org_id uuid not null references organization(id), class_id uuid references class(id),
  role member_role not null default 'student', display_name text not null, created_at timestamptz default now());
create table situation (
  id uuid primary key default gen_random_uuid(), slug text unique not null, title text not null, category situation_category not null,
  summary text, illustration text default 'generica', illustration_path text, -- Storage
  video_asset_id text, -- hook futuro Mux/Cloudflare Stream
  published boolean default false, sort int default 0, created_at timestamptz default now());
create table scenario_step (id uuid primary key default gen_random_uuid(), situation_id uuid not null references situation(id) on delete cascade, position int not null default 0, body text not null, question text);
create table choice (id uuid primary key default gen_random_uuid(), step_id uuid not null references scenario_step(id) on delete cascade, position int default 0, label text not null, feedback text not null, trail trail_key not null, next_step next_step not null default 'confianca');
create table response (
  id uuid primary key default gen_random_uuid(), member_id uuid not null references member(id) on delete cascade,
  class_id uuid references class(id), situation_id uuid not null references situation(id) on delete cascade,
  choice_id uuid not null references choice(id) on delete cascade, trail trail_key not null, created_at timestamptz default now(),
  unique (member_id, situation_id));
create table trail (id uuid primary key default gen_random_uuid(), key trail_key unique not null, title text not null, description text, steps jsonb not null default '[]');
create table lead (id uuid primary key default gen_random_uuid(), name text not null, email text not null, institution text not null, role text, message text, created_at timestamptz default now());

-- helpers
create or replace function my_role() returns member_role language sql stable security definer set search_path = public as $$ select role from member where id = auth.uid() $$;
create or replace function my_org() returns uuid language sql stable security definer set search_path = public as $$ select org_id from member where id = auth.uid() $$;

alter table organization enable row level security;
alter table class enable row level security;
alter table member enable row level security;
alter table situation enable row level security;
alter table scenario_step enable row level security;
alter table choice enable row level security;
alter table response enable row level security;
alter table trail enable row level security;
alter table lead enable row level security;

create policy org_read on organization for select using (id = my_org());
create policy class_read on class for select using (org_id = my_org());
create policy member_self on member for select using (id = auth.uid());
create policy member_self_upd on member for update using (id = auth.uid()) with check (id = auth.uid() and role = 'student');
-- conteúdo publicado é público para usuários logados; admin gerencia tudo
create policy sit_read on situation for select using (published or my_role() = 'admin');
create policy sit_admin on situation for all using (my_role() = 'admin') with check (my_role() = 'admin');
create policy step_read on scenario_step for select using (true);
create policy step_admin on scenario_step for all using (my_role() = 'admin') with check (my_role() = 'admin');
create policy choice_read on choice for select using (true);
create policy choice_admin on choice for all using (my_role() = 'admin') with check (my_role() = 'admin');
create policy trail_read on trail for select using (true);
-- respostas: aluno só vê/grava as próprias. Educadores NÃO leem linhas individuais.
create policy resp_own on response for select using (member_id = auth.uid());
create policy resp_ins on response for insert with check (member_id = auth.uid());
create policy resp_upd on response for update using (member_id = auth.uid());
-- leads: qualquer um insere (form público); só admin lê
create policy lead_ins on lead for insert with check (true);
create policy lead_admin on lead for select using (my_role() = 'admin');

-- Painel agregado com k-anonimato (n>=10) — educadores consomem via RPC
create or replace function class_stats(min_n int default 10)
returns table(class_id uuid, class_name text, reach bigint, answers bigint)
language sql stable security definer set search_path = public as $$
  select c.id, c.name, count(distinct r.member_id), count(r.id)
  from class c left join response r on r.class_id = c.id
  where c.org_id = my_org() and my_role() in ('educator','admin')
  group by c.id, c.name having count(distinct r.member_id) >= min_n $$;
create or replace function choice_stats(min_n int default 10)
returns table(situation_id uuid, choice_id uuid, total bigint)
language sql stable security definer set search_path = public as $$
  select r.situation_id, r.choice_id, count(*) from response r join class c on c.id = r.class_id
  where c.org_id = my_org() and my_role() in ('educator','admin')
    and r.class_id in (select class_id from response group by class_id having count(distinct member_id) >= min_n)
  group by 1,2 $$;
revoke all on function class_stats, choice_stats from anon;
