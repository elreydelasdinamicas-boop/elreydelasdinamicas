-- ═══════════════════════════════════════════════════════
-- LOS REYES DE LAS DINÁMICAS — Tablas de Supabase
-- Ejecuta este SQL en Supabase > SQL Editor
-- ═══════════════════════════════════════════════════════

-- 1. PERFIL DE USUARIOS
create table if not exists users_profile (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  phone text,
  email text,
  role text default 'customer',
  credits numeric default 500,
  points integer default 1000,
  is_promoter boolean default false,
  referral_code text unique,
  sponsor_id uuid references users_profile(id),
  created_at timestamptz default now()
);
alter table users_profile enable row level security;
create policy "Usuarios pueden ver su propio perfil" on users_profile for select using (auth.uid() = id);
create policy "Usuarios pueden actualizar su perfil" on users_profile for update using (auth.uid() = id);
create policy "Admins pueden ver todos" on users_profile for all using (auth.jwt() ->> 'role' = 'admin');

-- 2. SORTEOS
create table if not exists raffles (
  id bigserial primary key,
  title text not null,
  description text,
  number_range integer default 100,
  ticket_price numeric not null,
  raffle_date date,
  lottery_name text,
  prizes jsonb default '[]',
  status text default 'active',
  is_featured boolean default false,
  created_at timestamptz default now()
);
alter table raffles enable row level security;
create policy "Todos pueden ver sorteos activos" on raffles for select using (status = 'active');
create policy "Admins pueden gestionar sorteos" on raffles for all using (auth.jwt() ->> 'role' = 'admin');

-- 3. BOLETOS
create table if not exists tickets (
  id bigserial primary key,
  user_id uuid references users_profile(id) on delete cascade,
  raffle_id bigint references raffles(id),
  numbers integer[] not null,
  status text default 'reserved',
  total_amount numeric,
  payment_proof_url text,
  created_at timestamptz default now()
);
alter table tickets enable row level security;
create policy "Usuarios ven sus boletos" on tickets for select using (auth.uid() = user_id);
create policy "Usuarios crean boletos" on tickets for insert with check (auth.uid() = user_id);
create policy "Usuarios actualizan sus boletos" on tickets for update using (auth.uid() = user_id);
create policy "Admins ven todos los boletos" on tickets for all using (auth.jwt() ->> 'role' = 'admin');

-- 4. PROMOTORES
create table if not exists promoters (
  id bigserial primary key,
  user_id uuid references users_profile(id) unique,
  referral_code text unique,
  total_earnings numeric default 0,
  pending_earnings numeric default 0,
  level1_rate numeric default 15,
  level2_rate numeric default 7,
  level3_rate numeric default 3,
  created_at timestamptz default now()
);
alter table promoters enable row level security;
create policy "Promotores ven su panel" on promoters for select using (auth.uid() = user_id);
create policy "Promotores se crean" on promoters for insert with check (auth.uid() = user_id);
create policy "Promotores actualizan su info" on promoters for update using (auth.uid() = user_id);

-- 5. REFERIDOS
create table if not exists referrals (
  id bigserial primary key,
  promoter_id uuid references users_profile(id),
  referred_user_id uuid references users_profile(id),
  level integer default 1,
  commission_amount numeric default 0,
  status text default 'pending',
  created_at timestamptz default now()
);
alter table referrals enable row level security;
create policy "Promotores ven sus referidos" on referrals for select using (auth.uid() = promoter_id);

-- 6. TRANSACCIONES
create table if not exists transactions (
  id bigserial primary key,
  user_id uuid references users_profile(id),
  type text,
  amount numeric,
  description text,
  created_at timestamptz default now()
);
alter table transactions enable row level security;
create policy "Usuarios ven sus transacciones" on transactions for select using (auth.uid() = user_id);

-- 7. MENSAJES DE SOPORTE
create table if not exists support_messages (
  id bigserial primary key,
  user_id uuid references users_profile(id),
  message text,
  from_admin boolean default false,
  created_at timestamptz default now()
);
alter table support_messages enable row level security;
create policy "Usuarios ven sus mensajes" on support_messages for select using (auth.uid() = user_id);
create policy "Usuarios envian mensajes" on support_messages for insert with check (auth.uid() = user_id);

-- 8. RETIROS
create table if not exists withdrawals (
  id bigserial primary key,
  promoter_id uuid references users_profile(id),
  amount numeric,
  status text default 'pending',
  created_at timestamptz default now()
);
alter table withdrawals enable row level security;
create policy "Promotores ven sus retiros" on withdrawals for select using (auth.uid() = promoter_id);
create policy "Promotores crean retiros" on withdrawals for insert with check (auth.uid() = promoter_id);

-- 9. TRIGGER: crear perfil automáticamente al registrarse
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users_profile (id, full_name, phone, email, role, credits, points, referral_code)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone',
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'customer'),
    500,
    1000,
    new.raw_user_meta_data->>'referral_code'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 10. SORTEO DE EJEMPLO
insert into raffles (title, number_range, ticket_price, raffle_date, lottery_name, prizes, status, is_featured)
values (
  'MOTO YAMAHA MT-03 + $500.000 EN EFECTIVO',
  100,
  5000,
  '2025-06-15',
  'DE BOGOTÁ',
  '[{"amount": "Moto Yamaha MT-03 0km"}, {"amount": "$500.000 en efectivo"}, {"amount": "$200.000 en efectivo"}]',
  'active',
  true
);
