-- ATS Marketplace: strategies, indicators, versions, activations, receipts

create table if not exists public.creators (
  wallet_address text primary key
    constraint creators_wallet_lowercase check (wallet_address = lower(wallet_address)),
  handle text,
  bio text,
  accepted_terms_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.strategies (
  id uuid primary key default gen_random_uuid(),
  creator_wallet text not null references public.creators(wallet_address) on delete cascade,
  name text not null,
  slug text unique,
  description text not null default '',
  tags jsonb not null default '[]'::jsonb,
  asset_pairs jsonb not null default '[]'::jsonb,
  risk_level text not null default 'medium',
  status text not null default 'draft'
    constraint strategies_status_check check (
      status in (
        'draft', 'validated', 'published', 'paper_only', 'live_eligible',
        'watch', 'paused', 'delisted'
      )
    ),
  current_version_id uuid,
  draft_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.strategy_versions (
  id uuid primary key default gen_random_uuid(),
  strategy_id uuid not null references public.strategies(id) on delete cascade,
  version_number int not null,
  payload jsonb not null default '{}'::jsonb,
  human_summary text,
  validation_status text not null default 'pending'
    constraint strategy_versions_validation_check check (
      validation_status in ('pending', 'passed', 'failed')
    ),
  created_at timestamptz not null default now(),
  unique (strategy_id, version_number)
);

alter table public.strategies
  drop constraint if exists strategies_current_version_fk;

alter table public.strategies
  add constraint strategies_current_version_fk
  foreign key (current_version_id) references public.strategy_versions(id) on delete set null;

create table if not exists public.indicators (
  id uuid primary key default gen_random_uuid(),
  creator_wallet text not null references public.creators(wallet_address) on delete cascade,
  name text not null,
  slug text unique,
  description text not null default '',
  output_type text not null default 'scalar'
    constraint indicators_output_type_check check (
      output_type in ('scalar', 'boolean', 'direction')
    ),
  status text not null default 'draft'
    constraint indicators_status_check check (
      status in ('draft', 'published', 'paused', 'delisted')
    ),
  current_version_id uuid,
  draft_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.indicator_versions (
  id uuid primary key default gen_random_uuid(),
  indicator_id uuid not null references public.indicators(id) on delete cascade,
  version_number int not null,
  payload jsonb not null default '{}'::jsonb,
  input_schema jsonb not null default '[]'::jsonb,
  output_handle text not null default 'out',
  created_at timestamptz not null default now(),
  unique (indicator_id, version_number)
);

alter table public.indicators
  drop constraint if exists indicators_current_version_fk;

alter table public.indicators
  add constraint indicators_current_version_fk
  foreign key (current_version_id) references public.indicator_versions(id) on delete set null;

create table if not exists public.strategy_indicator_dependencies (
  strategy_version_id uuid not null references public.strategy_versions(id) on delete cascade,
  indicator_version_id uuid not null references public.indicator_versions(id) on delete cascade,
  primary key (strategy_version_id, indicator_version_id)
);

create table if not exists public.activations (
  id uuid primary key default gen_random_uuid(),
  user_wallet text not null
    constraint activations_user_lowercase check (user_wallet = lower(user_wallet)),
  strategy_id uuid not null references public.strategies(id) on delete cascade,
  strategy_version_id uuid not null references public.strategy_versions(id) on delete cascade,
  mode text not null default 'live'
    constraint activations_mode_check check (mode in ('live', 'research', 'paper')),
  allocation_pct numeric not null default 5,
  max_position_pct numeric not null default 2,
  max_trades_per_day int not null default 3,
  max_daily_loss_pct numeric not null default 3,
  slippage_bps int not null default 75,
  requires_confirmation boolean not null default true,
  status text not null default 'active'
    constraint activations_status_check check (
      status in ('active', 'paused', 'blocked', 'completed')
    ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.decision_receipts (
  id uuid primary key default gen_random_uuid(),
  activation_id uuid references public.activations(id) on delete set null,
  strategy_version_id uuid not null references public.strategy_versions(id) on delete cascade,
  mode text not null default 'live',
  asset_pair text,
  signal jsonb,
  input_snapshot jsonb,
  risk_checks jsonb,
  execution_request jsonb,
  execution_result jsonb,
  status text not null default 'pending',
  failure_reason text,
  tx_hash text,
  fees_native text,
  slippage_bps_actual int,
  pnl_native text,
  opened_at timestamptz not null default now(),
  closed_at timestamptz
);

create table if not exists public.bookmarks (
  user_wallet text not null
    constraint bookmarks_user_lowercase check (user_wallet = lower(user_wallet)),
  strategy_id uuid not null references public.strategies(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_wallet, strategy_id)
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_wallet text not null
    constraint reports_reporter_lowercase check (reporter_wallet = lower(reporter_wallet)),
  target_type text not null
    constraint reports_target_type_check check (target_type in ('strategy', 'indicator')),
  target_id uuid not null,
  reason text not null,
  status text not null default 'open'
    constraint reports_status_check check (status in ('open', 'resolved')),
  created_at timestamptz not null default now()
);

create table if not exists public.admin_actions (
  id uuid primary key default gen_random_uuid(),
  admin_wallet text not null
    constraint admin_actions_admin_lowercase check (admin_wallet = lower(admin_wallet)),
  action_type text not null,
  target_type text not null,
  target_id uuid not null,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.backtest_runs (
  id uuid primary key default gen_random_uuid(),
  strategy_id uuid references public.strategies(id) on delete cascade,
  strategy_version_id uuid references public.strategy_versions(id) on delete cascade,
  run_by_wallet text not null,
  candles_source text,
  summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint backtest_runs_target_check check (
    strategy_id is not null or strategy_version_id is not null
  )
);

create index if not exists idx_strategies_creator on public.strategies(creator_wallet);
create index if not exists idx_strategies_status on public.strategies(status);
create index if not exists idx_strategy_versions_strategy on public.strategy_versions(strategy_id);
create index if not exists idx_indicators_creator on public.indicators(creator_wallet);
create index if not exists idx_indicators_status on public.indicators(status);
create index if not exists idx_activations_user on public.activations(user_wallet);
create index if not exists idx_activations_strategy on public.activations(strategy_id);
create index if not exists idx_receipts_activation on public.decision_receipts(activation_id);
create index if not exists idx_receipts_strategy_version on public.decision_receipts(strategy_version_id);
create index if not exists idx_receipts_opened on public.decision_receipts(opened_at desc);

drop trigger if exists trg_strategies_set_updated_at on public.strategies;
create trigger trg_strategies_set_updated_at
before update on public.strategies
for each row execute function public.set_updated_at_timestamp();

drop trigger if exists trg_indicators_set_updated_at on public.indicators;
create trigger trg_indicators_set_updated_at
before update on public.indicators
for each row execute function public.set_updated_at_timestamp();

drop trigger if exists trg_activations_set_updated_at on public.activations;
create trigger trg_activations_set_updated_at
before update on public.activations
for each row execute function public.set_updated_at_timestamp();
