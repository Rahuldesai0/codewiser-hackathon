create table if not exists question_import_runs (
  id bigserial primary key,
  file_name text not null,
  status text not null check (status in ('running', 'completed', 'failed', 'skipped')),
  subjects jsonb not null default '[]'::jsonb,
  total_records integer not null default 0,
  prepared_count integer not null default 0,
  skipped_count integer not null default 0,
  error_message text,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists idx_question_import_runs_started
on question_import_runs(started_at desc);
