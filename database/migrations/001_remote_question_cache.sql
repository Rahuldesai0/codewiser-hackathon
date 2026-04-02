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

do $$
begin
  if exists (
    select 1
    from information_schema.table_constraints
    where constraint_name = 'session_question_cache_pkey'
      and table_name = 'session_question_cache'
  ) then
    alter table session_question_cache drop constraint session_question_cache_pkey;
  end if;
end $$;

do $$
begin
  if exists (
    select 1
    from information_schema.table_constraints
    where constraint_name = 'session_answers_question_id_fkey'
      and table_name = 'session_answers'
  ) then
    alter table session_answers drop constraint session_answers_question_id_fkey;
  end if;
end $$;

create index if not exists idx_session_question_cache_session on session_question_cache(session_id, fetched_at);
