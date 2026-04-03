create extension if not exists pgcrypto;

create table if not exists app_users (
  id bigserial primary key,
  username text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists questions (
  id bigserial primary key,
  subject text not null,
  topic text not null,
  subtopic text not null,
  type text not null check (type in ('mcq', 'short_text')),
  prompt text not null,
  options jsonb not null default '[]'::jsonb,
  accepted_answers jsonb not null default '[]'::jsonb,
  explanation text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists quiz_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id bigint not null references app_users(id),
  username_snapshot text not null,
  requested_subjects jsonb not null,
  preset_key text not null default 'custom',
  question_target integer not null check (question_target > 0),
  batch_size integer not null check (batch_size in (5, 10)),
  timer_enabled boolean not null default false,
  timer_duration_minutes integer not null default 0,
  timer_ends_at timestamptz,
  status text not null check (status in ('active', 'completed', 'abandoned')),
  current_batch_index integer not null default 0,
  total_correct integer not null default 0,
  total_answered integer not null default 0,
  analysis_state jsonb not null default '{}'::jsonb,
  warnings jsonb not null default '[]'::jsonb,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists session_batches (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references quiz_sessions(id) on delete cascade,
  batch_index integer not null,
  questions jsonb not null,
  selection_reason jsonb not null default '{}'::jsonb,
  status text not null check (status in ('ready', 'completed')),
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (session_id, batch_index)
);

create table if not exists session_answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references quiz_sessions(id) on delete cascade,
  batch_index integer not null,
  question_id bigint not null,
  subject text not null,
  topic text not null,
  subtopic text not null,
  difficulty_label text not null,
  question_type text not null,
  prompt_snapshot text not null,
  submitted_answer text not null default '',
  submitted_option_id text,
  is_correct boolean not null,
  correct_answer_snapshot text not null,
  explanation_snapshot text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists session_question_cache (
  question_id bigint not null,
  session_id uuid not null references quiz_sessions(id) on delete cascade,
  source_name text not null,
  source_url text,
  source_id text not null,
  subject text not null,
  topic text not null,
  subtopic text not null,
  type text not null check (type in ('mcq', 'short_text')),
  prompt text not null,
  options jsonb not null default '[]'::jsonb,
  accepted_answers jsonb not null default '[]'::jsonb,
  explanation text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  fetched_at timestamptz not null default now(),
  unique (session_id, question_id),
  unique (session_id, source_name, source_id)
);

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

create index if not exists idx_questions_subject on questions(subject);
create index if not exists idx_questions_subtopic on questions(subject, subtopic);
create index if not exists idx_quiz_sessions_user on quiz_sessions(user_id, started_at desc);
create index if not exists idx_session_batches_lookup on session_batches(session_id, batch_index);
create index if not exists idx_session_answers_lookup on session_answers(session_id, batch_index);
create index if not exists idx_session_question_cache_session on session_question_cache(session_id, fetched_at);
create index if not exists idx_crawler_runs_started on crawler_runs(started_at desc);
create index if not exists idx_question_import_runs_started on question_import_runs(started_at desc);
