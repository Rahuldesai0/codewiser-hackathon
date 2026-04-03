alter table quiz_sessions
add column if not exists preset_key text not null default 'custom';

alter table quiz_sessions
add column if not exists timer_enabled boolean not null default false;

alter table quiz_sessions
add column if not exists timer_duration_minutes integer not null default 0;

alter table quiz_sessions
add column if not exists timer_ends_at timestamptz;
