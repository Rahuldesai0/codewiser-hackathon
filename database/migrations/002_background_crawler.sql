create table if not exists crawler_runs (
  id bigserial primary key,
  reason text not null,
  status text not null check (status in ('running', 'completed', 'failed', 'skipped')),
  subjects jsonb not null default '[]'::jsonb,
  fetched_count integer not null default 0,
  inserted_count integer not null default 0,
  updated_count integer not null default 0,
  warning_count integer not null default 0,
  error_message text,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists idx_crawler_runs_started on crawler_runs(started_at desc);
