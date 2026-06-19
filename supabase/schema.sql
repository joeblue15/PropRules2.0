-- ============================================================
-- PropRules — Supabase Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ────────────────────────────────────────────────────────────
-- ADMIN USERS
-- ────────────────────────────────────────────────────────────
create table if not exists admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  is_admin boolean not null default false,
  created_at timestamptz default now()
);

alter table admin_users enable row level security;

create policy "Admin users visible to self" on admin_users
  for select using (auth.uid() = id);

create policy "Admin users insertable by self on signup" on admin_users
  for insert with check (auth.uid() = id);

-- ────────────────────────────────────────────────────────────
-- SITE SETTINGS
-- ────────────────────────────────────────────────────────────
create table if not exists site_settings (
  id uuid primary key default uuid_generate_v4(),
  updates_section_active boolean default true,
  seo_title_es text default 'PropRules — Reglas de prop firms sin letra pequeña',
  seo_title_en text default 'PropRules — Prop firm rules, no fine print',
  seo_description_es text default 'Encuentra las reglas que las prop firms no destacan. Drawdown, consistencia, payout y restricciones explicadas de forma clara.',
  seo_description_en text default 'Find the rules prop firms don''t highlight. Drawdown, consistency, payout and restrictions explained clearly.'
);

insert into site_settings (id) values (uuid_generate_v4()) on conflict do nothing;

alter table site_settings enable row level security;
create policy "Site settings readable by all" on site_settings for select using (true);
create policy "Site settings writable by admin" on site_settings for update using (
  exists (select 1 from admin_users where id = auth.uid() and is_admin = true)
);

-- ────────────────────────────────────────────────────────────
-- HERO CONTENT
-- ────────────────────────────────────────────────────────────
create table if not exists hero_content (
  id uuid primary key default uuid_generate_v4(),
  title_es text default 'Encuentra las reglas que las prop firms no destacan.',
  title_en text default 'Find the rules prop firms don''t highlight.'
);

insert into hero_content (id) values (uuid_generate_v4()) on conflict do nothing;

alter table hero_content enable row level security;
create policy "Hero readable by all" on hero_content for select using (true);
create policy "Hero writable by admin" on hero_content for update using (
  exists (select 1 from admin_users where id = auth.uid() and is_admin = true)
);

-- ────────────────────────────────────────────────────────────
-- PROPS
-- ────────────────────────────────────────────────────────────
create table if not exists props (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  logo_url text,
  type text not null check (type in ('CFD', 'Futuros')),
  secondary_info text,
  badge_text text,
  badge_color text check (badge_color in ('success', 'warning', 'danger', 'info')),
  active boolean default true,
  "order" integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table props enable row level security;
create policy "Props readable by all" on props for select using (true);
create policy "Props writable by admin" on props for all using (
  exists (select 1 from admin_users where id = auth.uid() and is_admin = true)
);

-- ────────────────────────────────────────────────────────────
-- DISCOUNTS
-- ────────────────────────────────────────────────────────────
create table if not exists discounts (
  id uuid primary key default uuid_generate_v4(),
  prop_id uuid references props(id) on delete cascade,
  code text not null,
  description text,
  affiliate_url text,
  active boolean default true,
  created_at timestamptz default now()
);

alter table discounts enable row level security;
create policy "Discounts readable by all" on discounts for select using (true);
create policy "Discounts writable by admin" on discounts for all using (
  exists (select 1 from admin_users where id = auth.uid() and is_admin = true)
);

-- ────────────────────────────────────────────────────────────
-- CHALLENGES
-- ────────────────────────────────────────────────────────────
create table if not exists challenges (
  id uuid primary key default uuid_generate_v4(),
  prop_id uuid references props(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  tags text[] default '{}',
  active boolean default true,
  "order" integer default 0,
  last_updated date,
  fine_print text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(prop_id, slug)
);

alter table challenges enable row level security;
create policy "Challenges readable by all" on challenges for select using (true);
create policy "Challenges writable by admin" on challenges for all using (
  exists (select 1 from admin_users where id = auth.uid() and is_admin = true)
);

-- ────────────────────────────────────────────────────────────
-- QUICK SUMMARIES
-- ────────────────────────────────────────────────────────────
create table if not exists quick_summaries (
  id uuid primary key default uuid_generate_v4(),
  challenge_id uuid references challenges(id) on delete cascade unique,
  allowed text[] default '{}',
  not_allowed text[] default '{}',
  attention text[] default '{}',
  risk_score numeric(3,1)
);

alter table quick_summaries enable row level security;
create policy "Quick summaries readable by all" on quick_summaries for select using (true);
create policy "Quick summaries writable by admin" on quick_summaries for all using (
  exists (select 1 from admin_users where id = auth.uid() and is_admin = true)
);

-- ────────────────────────────────────────────────────────────
-- RISK RULES
-- ────────────────────────────────────────────────────────────
create table if not exists risk_rules (
  id uuid primary key default uuid_generate_v4(),
  challenge_id uuid references challenges(id) on delete cascade unique,
  max_drawdown text,
  daily_drawdown text,
  drawdown_type text check (drawdown_type in ('static', 'trailing', 'end-of-day')),
  drawdown_basis text check (drawdown_basis in ('equity', 'balance')),
  max_lot_size text,
  hedging boolean,
  max_simultaneous_positions text,
  max_exposure_per_trade text,
  martingale boolean,
  grid_trading boolean
);

alter table risk_rules enable row level security;
create policy "Risk rules readable by all" on risk_rules for select using (true);
create policy "Risk rules writable by admin" on risk_rules for all using (
  exists (select 1 from admin_users where id = auth.uid() and is_admin = true)
);

-- ────────────────────────────────────────────────────────────
-- TARGET RULES
-- ────────────────────────────────────────────────────────────
create table if not exists target_rules (
  id uuid primary key default uuid_generate_v4(),
  challenge_id uuid references challenges(id) on delete cascade unique,
  phase1_target text,
  phase2_target text,
  consistency_rule text,
  min_trading_days text,
  max_days_to_complete text,
  min_profit text
);

alter table target_rules enable row level security;
create policy "Target rules readable by all" on target_rules for select using (true);
create policy "Target rules writable by admin" on target_rules for all using (
  exists (select 1 from admin_users where id = auth.uid() and is_admin = true)
);

-- ────────────────────────────────────────────────────────────
-- TRADING RULES
-- ────────────────────────────────────────────────────────────
create table if not exists trading_rules (
  id uuid primary key default uuid_generate_v4(),
  challenge_id uuid references challenges(id) on delete cascade unique,
  news_trading text check (news_trading in ('allowed', 'forbidden', 'partial')),
  overnight_holding boolean,
  weekend_holding boolean,
  copy_trading boolean,
  ea_allowed boolean,
  scalping boolean,
  hft boolean,
  latency_arbitrage boolean,
  reverse_arbitrage boolean,
  one_sided_betting boolean,
  operational_restrictions text
);

alter table trading_rules enable row level security;
create policy "Trading rules readable by all" on trading_rules for select using (true);
create policy "Trading rules writable by admin" on trading_rules for all using (
  exists (select 1 from admin_users where id = auth.uid() and is_admin = true)
);

-- ────────────────────────────────────────────────────────────
-- SPECIAL RESTRICTIONS
-- ────────────────────────────────────────────────────────────
create table if not exists special_restrictions (
  id uuid primary key default uuid_generate_v4(),
  challenge_id uuid references challenges(id) on delete cascade,
  title text not null,
  description text,
  type text default 'warning' check (type in ('warning', 'danger', 'info')),
  "order" integer default 0
);

alter table special_restrictions enable row level security;
create policy "Special restrictions readable by all" on special_restrictions for select using (true);
create policy "Special restrictions writable by admin" on special_restrictions for all using (
  exists (select 1 from admin_users where id = auth.uid() and is_admin = true)
);

-- ────────────────────────────────────────────────────────────
-- FUNDED RULES
-- ────────────────────────────────────────────────────────────
create table if not exists funded_rules (
  id uuid primary key default uuid_generate_v4(),
  challenge_id uuid references challenges(id) on delete cascade unique,
  profit_split text,
  payout_frequency text,
  minimum_payout text,
  scaling_plan text,
  max_account_size text,
  first_withdrawal text
);

alter table funded_rules enable row level security;
create policy "Funded rules readable by all" on funded_rules for select using (true);
create policy "Funded rules writable by admin" on funded_rules for all using (
  exists (select 1 from admin_users where id = auth.uid() and is_admin = true)
);

-- ────────────────────────────────────────────────────────────
-- LEGAL RULES
-- ────────────────────────────────────────────────────────────
create table if not exists legal_rules (
  id uuid primary key default uuid_generate_v4(),
  challenge_id uuid references challenges(id) on delete cascade unique,
  vpn_allowed boolean,
  vps_allowed boolean,
  shared_ip boolean,
  multiple_accounts boolean,
  country_restrictions text,
  kyc text,
  abuse_policy text
);

alter table legal_rules enable row level security;
create policy "Legal rules readable by all" on legal_rules for select using (true);
create policy "Legal rules writable by admin" on legal_rules for all using (
  exists (select 1 from admin_users where id = auth.uid() and is_admin = true)
);

-- ────────────────────────────────────────────────────────────
-- ALERTS (shared by all rule sections)
-- ────────────────────────────────────────────────────────────
create table if not exists alerts (
  id uuid primary key default uuid_generate_v4(),
  section text not null, -- 'risk' | 'targets' | 'trading' | 'special' | 'funded' | 'legal'
  section_id uuid not null, -- id of the parent rule row
  type text not null check (type in ('warning', 'danger', 'info')),
  title text not null,
  description text,
  "order" integer default 0
);

alter table alerts enable row level security;
create policy "Alerts readable by all" on alerts for select using (true);
create policy "Alerts writable by admin" on alerts for all using (
  exists (select 1 from admin_users where id = auth.uid() and is_admin = true)
);

-- ────────────────────────────────────────────────────────────
-- INTERPRETATIONS
-- ────────────────────────────────────────────────────────────
create table if not exists interpretations (
  id uuid primary key default uuid_generate_v4(),
  section text not null,
  section_id uuid not null,
  positive boolean not null default true,
  text text not null,
  "order" integer default 0
);

alter table interpretations enable row level security;
create policy "Interpretations readable by all" on interpretations for select using (true);
create policy "Interpretations writable by admin" on interpretations for all using (
  exists (select 1 from admin_users where id = auth.uid() and is_admin = true)
);

-- ────────────────────────────────────────────────────────────
-- PRACTICAL CASES
-- ────────────────────────────────────────────────────────────
create table if not exists practical_cases (
  id uuid primary key default uuid_generate_v4(),
  section text not null,
  section_id uuid not null,
  category text,
  title text not null,
  story text,
  lesson text,
  amount_lost text,
  "order" integer default 0
);

alter table practical_cases enable row level security;
create policy "Practical cases readable by all" on practical_cases for select using (true);
create policy "Practical cases writable by admin" on practical_cases for all using (
  exists (select 1 from admin_users where id = auth.uid() and is_admin = true)
);

-- ────────────────────────────────────────────────────────────
-- UPDATES
-- ────────────────────────────────────────────────────────────
create table if not exists updates (
  id uuid primary key default uuid_generate_v4(),
  prop_id uuid references props(id) on delete cascade,
  title text not null,
  detail text,
  featured boolean default false,
  active boolean default true,
  date date not null default current_date,
  created_at timestamptz default now()
);

alter table updates enable row level security;
create policy "Updates readable by all" on updates for select using (true);
create policy "Updates writable by admin" on updates for all using (
  exists (select 1 from admin_users where id = auth.uid() and is_admin = true)
);

-- ────────────────────────────────────────────────────────────
-- SEED DATA — FTMO
-- ────────────────────────────────────────────────────────────
do $$
declare
  ftmo_id uuid := uuid_generate_v4();
  ftmo_2step_id uuid := uuid_generate_v4();
  ftmo_swing_id uuid := uuid_generate_v4();
  risk_2step_id uuid := uuid_generate_v4();
  target_2step_id uuid := uuid_generate_v4();
  trading_2step_id uuid := uuid_generate_v4();
  funded_2step_id uuid := uuid_generate_v4();
  legal_2step_id uuid := uuid_generate_v4();
begin

  -- FTMO prop
  insert into props (id, name, slug, type, secondary_info, badge_text, badge_color, active, "order")
  values (ftmo_id, 'FTMO', 'ftmo', 'CFD', '3 challenges disponibles', 'Popular', 'info', true, 1);

  -- FTMO discount
  insert into discounts (prop_id, code, description, affiliate_url, active)
  values (ftmo_id, 'PROPRULES', '10% de descuento en todos los challenges FTMO', 'https://ftmo.com/?ref=proprules', true);

  -- FTMO 2-Step Challenge
  insert into challenges (id, prop_id, name, slug, description, tags, active, "order", last_updated)
  values (
    ftmo_2step_id, ftmo_id,
    'FTMO Challenge — 2 Pasos',
    '2-step',
    'El challenge más popular de FTMO. Demuestra consistencia en dos fases para obtener una cuenta financiada.',
    array['10% Target F1', '5% Target F2', 'DD 10%'],
    true, 1, current_date
  );

  -- FTMO Swing Challenge
  insert into challenges (id, prop_id, name, slug, description, tags, active, "order", last_updated)
  values (
    ftmo_swing_id, ftmo_id,
    'FTMO Swing Challenge',
    'swing',
    'Diseñado para traders de swing. Permite mantener posiciones durante el fin de semana y operar durante noticias.',
    array['Weekend OK', 'News OK', 'DD 10%'],
    true, 2, current_date
  );

  -- Quick summary for 2-Step
  insert into quick_summaries (challenge_id, allowed, not_allowed, attention, risk_score)
  values (
    ftmo_2step_id,
    array['EAs (bots) permitidos', 'Hedging permitido', 'Scalping permitido', 'Cuentas desde $10K hasta $200K'],
    array['Martingale prohibido', 'Grid Trading prohibido', 'Latency Arbitrage prohibido', 'Copy Trading prohibido'],
    array['Drawdown trailing desde el equity más alto', 'Daily DD se reinicia a medianoche CET', 'Sin regla de consistencia mínima'],
    6.5
  );

  -- Risk rules for 2-Step
  insert into risk_rules (id, challenge_id, max_drawdown, daily_drawdown, drawdown_type, drawdown_basis, max_lot_size, hedging, max_simultaneous_positions, max_exposure_per_trade, martingale, grid_trading)
  values (
    risk_2step_id, ftmo_2step_id,
    '10%', '5%', 'trailing', 'equity',
    null, true, null, null, false, false
  );

  -- Alerts for risk
  insert into alerts (section, section_id, type, title, description, "order") values
  ('risk', risk_2step_id, 'danger', 'Drawdown trailing desde el máximo de equity',
   'El drawdown máximo se calcula desde el punto más alto de equity alcanzado, no desde el balance inicial. Si subes tu cuenta a $11,000 y luego bajas a $9,900, la cuenta se cierra aunque solo hayas perdido $100 desde el pico.', 1),
  ('risk', risk_2step_id, 'warning', 'Daily drawdown se reinicia a medianoche CET',
   'El drawdown diario se calcula desde el equity al cierre del día anterior (medianoche hora de Europa Central). No se calcula desde el inicio del día de trading.', 2);

  -- Interpretations for risk
  insert into interpretations (section, section_id, positive, text, "order") values
  ('risk', risk_2step_id, false, 'Si abres una cuenta con $10,000 y llegas a $11,500 de equity, tu drawdown máximo permitido ahora es llegar a $10,350 (10% desde $11,500). No desde los $10,000 iniciales.', 1),
  ('risk', risk_2step_id, true, 'El hedging está permitido. Puedes tener posiciones largas y cortas del mismo instrumento simultáneamente.', 2),
  ('risk', risk_2step_id, false, 'Martingale y grid trading están explícitamente prohibidos en los términos de servicio.', 3);

  -- Practical cases for risk
  insert into practical_cases (section, section_id, category, title, story, lesson, amount_lost, "order") values
  ('risk', risk_2step_id, 'Trailing DD',
   'Cuenta cerrada por trailing drawdown inesperado',
   'Un trader comenzó con $10,000, llegó a $10,800 de equity en dos semanas, y luego tuvo una racha mala perdiendo $1,100 hasta quedarse en $9,700. Aunque pensaba que le quedaba margen hasta $9,000 (10% de $10,000), su cuenta fue cerrada porque el 10% se calculó desde $10,800, no desde $10,000.',
   'El trailing drawdown se mueve con cada nuevo máximo de equity. Siempre calcula tu drawdown real desde el punto más alto que hayas alcanzado, no desde el balance inicial.',
   '$1,080', 1);

  -- Target rules for 2-Step
  insert into target_rules (id, challenge_id, phase1_target, phase2_target, consistency_rule, min_trading_days, max_days_to_complete, min_profit)
  values (target_2step_id, ftmo_2step_id, '10%', '5%', null, '4 días', '30 días / 60 días', null);

  insert into alerts (section, section_id, type, title, description, "order") values
  ('targets', target_2step_id, 'info', 'Sin regla de consistencia',
   'FTMO no tiene regla de consistencia mínima. Puedes hacer todo el profit target en un solo día si así lo deseas.', 1);

  insert into interpretations (section, section_id, positive, text, "order") values
  ('targets', target_2step_id, true, 'No hay límite en el profit diario. Puedes hacer el 10% de profit target en un solo trade sin problema.', 1),
  ('targets', target_2step_id, false, 'Si no alcanzas el profit target en el tiempo máximo, el challenge expira y perderás el pago.', 2);

  -- Trading rules for 2-Step
  insert into trading_rules (id, challenge_id, news_trading, overnight_holding, weekend_holding, copy_trading, ea_allowed, scalping, hft, latency_arbitrage, reverse_arbitrage, one_sided_betting)
  values (trading_2step_id, ftmo_2step_id, 'forbidden', true, false, false, true, true, false, false, false, false);

  insert into alerts (section, section_id, type, title, description, "order") values
  ('trading', trading_2step_id, 'danger', 'Prohibido operar durante noticias de alto impacto',
   'No puedes abrir ni cerrar posiciones durante los 2 minutos antes y después de noticias de alto impacto (NFP, decisiones del Fed, CPI, etc.). FTMO monitorea esto activamente.', 1),
  ('trading', trading_2step_id, 'warning', 'Weekend holding no permitido en 2-Step estándar',
   'Las posiciones deben cerrarse antes del viernes al cierre del mercado. Si quieres mantener posiciones el fin de semana, considera el Swing Challenge.', 2);

  insert into interpretations (section, section_id, positive, text, "order") values
  ('trading', trading_2step_id, true, 'Los EAs (bots de trading) están permitidos. Puedes usar cualquier estrategia automatizada siempre que no sea latency arbitrage o HFT.', 1),
  ('trading', trading_2step_id, false, 'El copy trading está prohibido. No puedes copiar señales de otra cuenta, incluyendo las tuyas propias.', 2),
  ('trading', trading_2step_id, false, 'Si tienes una posición abierta al cierre del viernes, FTMO la puede cerrar automáticamente y puede contar como violación.', 3);

  -- Funded rules for 2-Step
  insert into funded_rules (id, challenge_id, profit_split, payout_frequency, minimum_payout, scaling_plan, max_account_size, first_withdrawal)
  values (funded_2step_id, ftmo_2step_id, '80% (hasta 90%)', 'Cada 30 días (primer payout a los 30 días)', '$1 (sin mínimo en la práctica)', 'Hasta $2,000,000 combinados', '$400,000 por cuenta', 'A los 30 días del primer día de trading en la cuenta financiada');

  insert into alerts (section, section_id, type, title, description, "order") values
  ('funded', funded_2step_id, 'info', 'Scaling hasta 90% de profit split',
   'Si mantienes consistencia durante 4 meses consecutivos con profit positivo, FTMO puede aumentar tu profit split del 80% al 90%.', 1);

  -- Legal rules for 2-Step
  insert into legal_rules (id, challenge_id, vpn_allowed, vps_allowed, shared_ip, multiple_accounts, country_restrictions, kyc, abuse_policy)
  values (
    legal_2step_id, ftmo_2step_id,
    true, true, false, true,
    'No disponible en EEUU, Canadá, Irán, Corea del Norte y otros países sancionados.',
    'KYC requerido antes del primer payout. Necesitas documento de identidad y comprobante de domicilio.',
    'FTMO prohíbe cualquier forma de manipulación, abuso de plataforma o comportamiento que busque explotar vulnerabilidades del sistema.'
  );

  insert into alerts (section, section_id, type, title, description, "order") values
  ('legal', legal_2step_id, 'warning', 'IP compartida puede generar problemas',
   'Si múltiples traders comparten la misma IP (por ejemplo, en un prop firm físico o usando el mismo VPN), FTMO puede investigar por sospecha de cuentas coordinadas.', 1);

  -- Fine print for 2-Step
  update challenges set fine_print = 'FTMO es actualmente una de las prop firms más estrictas en el cumplimiento de sus reglas, especialmente en lo referente al trailing drawdown y las noticias. Lo que no dicen tan claramente: el drawdown trailing puede activarse incluso con posiciones abiertas. Si tienes posiciones flotando en profit y el precio se revierte, el equity baja y puede activar el drawdown sin que hayas cerrado ningún trade. Otra cosa importante: FTMO puede rechazar payouts si detectan patrones de trading que consideran "abusivos", incluso si técnicamente no violaste ninguna regla específica. El término "abusive trading behavior" en sus términos es amplio y les da margen para interpretar.' = fine_print
  where id = ftmo_2step_id;

  -- Update for FTMO
  insert into updates (prop_id, title, detail, featured, active, date)
  values (
    ftmo_id,
    'FTMO actualiza política de noticias en todas las cuentas',
    'A partir de junio 2025, FTMO ha reforzado la ventana de restricción durante noticias de alto impacto de 1 minuto a 2 minutos antes y después del evento. Esto aplica tanto al challenge como a las cuentas financiadas.',
    true, true, current_date - interval '2 days'
  );

end $$;
