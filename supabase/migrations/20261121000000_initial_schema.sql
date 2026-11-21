-- WorkTak — Backend Schema (Supabase / Postgres)
-- Migration: 20261121000000_initial_schema.sql

create extension if not exists "pgcrypto";
create extension if not exists vector;

-- Types & Enums
create type user_role as enum ('ADMIN','HR','FINANCE','MANAGER','EMPLOYEE');
create type employee_status as enum ('ACTIVE','ON_LEAVE','TERMINATED');
create type attendance_status as enum ('PRESENT','LATE','HALF_DAY','ABSENT','ON_LEAVE','HOLIDAY','WEEKEND');
create type attendance_source as enum ('FACE','KIOSK','MANUAL');
create type request_status as enum ('PENDING','APPROVED','REJECTED','CANCELLED');
create type payroll_status as enum ('DRAFT','SUBMITTED','APPROVED','PAID');
create type doc_status as enum ('UPLOADED','PENDING_REVIEW','VERIFIED','REJECTED');
create type signal_status as enum ('OPEN','REVIEWED','DISMISSED');
create type severity as enum ('LOW','MEDIUM','HIGH');

-- JWT / Session helpers (values come from app_metadata or server context)
create or replace function auth_company_id() returns uuid language sql stable as
$$ select nullif(auth.jwt() -> 'app_metadata' ->> 'company_id','')::uuid $$;

create or replace function auth_role() returns user_role language sql stable as
$$ select (auth.jwt() -> 'app_metadata' ->> 'role')::user_role $$;

create or replace function auth_employee_id() returns uuid language sql stable as
$$ select id from employees where user_id = auth.uid() limit 1 $$;

-- 1. Companies
create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  industry text,
  timezone text not null default 'Asia/Kolkata',
  currency text not null default 'INR',
  settings jsonb not null default '{"face_required":true,"face_threshold":0.5,"face_margin":0.05,"late_grace_minutes":10}',
  created_at timestamptz not null default now()
);

-- 2. Departments
create table if not exists departments (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies on delete cascade,
  name text not null,
  unique (company_id, name)
);

-- 3. Shifts
create table if not exists shifts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies on delete cascade,
  name text not null,
  start_time time not null default '09:30',
  end_time time not null default '18:30',
  grace_minutes int not null default 10,
  working_days int[] not null default '{1,2,3,4,5}'  -- 1=Mon..7=Sun
);

-- 4. Holidays
create table if not exists holidays (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies on delete cascade,
  date date not null,
  name text not null,
  unique (company_id, date)
);

-- 5. Employees
create table if not exists employees (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies on delete cascade,
  user_id uuid unique,
  employee_code text not null,
  full_name text not null,
  email text not null,
  phone text,
  role user_role not null default 'EMPLOYEE',
  department_id uuid references departments,
  designation text,
  manager_id uuid references employees,
  shift_id uuid references shifts,
  date_of_joining date not null default current_date,
  status employee_status not null default 'ACTIVE',
  avatar_url text,
  created_at timestamptz not null default now(),
  unique (company_id, employee_code),
  unique (company_id, email)
);
create index if not exists idx_employees_comp_dept on employees (company_id, department_id);
create index if not exists idx_employees_manager on employees (manager_id);

-- Helper: is_manager_of
create or replace function is_manager_of(emp uuid) returns boolean language sql stable security definer as
$$ select exists (select 1 from employees e where e.id = emp and e.manager_id = auth_employee_id()) $$;

-- 6. Face Recognition Tables
create table if not exists face_consents (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies on delete cascade,
  employee_id uuid not null references employees on delete cascade,
  consent_text_version text not null,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz
);

create table if not exists face_profiles (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies on delete cascade,
  employee_id uuid not null unique references employees on delete cascade,
  embedding vector(128) not null,
  samples int not null default 5,
  quality_score real,
  is_active boolean not null default true,
  enrolled_at timestamptz not null default now()
);

create table if not exists face_challenges (
  nonce uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies on delete cascade,
  employee_id uuid references employees on delete cascade,
  challenge text not null check (challenge in ('BLINK_2','TURN_LEFT','TURN_RIGHT','SMILE')),
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists face_attempts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies on delete cascade,
  employee_id uuid references employees on delete set null,
  mode text not null check (mode in ('VERIFY','IDENTIFY','ENROLL')),
  success boolean not null,
  distance real,
  confidence real,
  failure_reason text,
  device_info jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_face_attempts_audit on face_attempts (company_id, employee_id, created_at desc);

create table if not exists kiosk_devices (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies on delete cascade,
  name text not null,
  token_hash text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 7. Attendance
create table if not exists attendance_records (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies on delete cascade,
  employee_id uuid not null references employees on delete cascade,
  work_date date not null,
  check_in_at timestamptz,
  check_out_at timestamptz,
  status attendance_status not null default 'ABSENT',
  source attendance_source,
  face_confidence real,
  minutes_worked int generated always as
    (case when check_in_at is not null and check_out_at is not null
          then (extract(epoch from (check_out_at - check_in_at))/60)::int end) stored,
  note text,
  unique (employee_id, work_date)
);
create index if not exists idx_attendance_comp_date on attendance_records (company_id, work_date);

create table if not exists manual_requests (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies on delete cascade,
  employee_id uuid not null references employees on delete cascade,
  work_date date not null,
  requested_time timestamptz not null,
  kind text not null check (kind in ('CHECK_IN','CHECK_OUT')),
  reason text not null,
  status request_status not null default 'PENDING',
  decided_by uuid references employees,
  decided_at timestamptz,
  decision_note text,
  created_at timestamptz not null default now()
);

-- 8. Leaves
create table if not exists leave_types (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies on delete cascade,
  code text not null,
  name text not null,
  annual_quota numeric(5,1) not null default 0,
  is_paid boolean not null default true,
  unique (company_id, code)
);

create table if not exists leave_balances (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies on delete cascade,
  employee_id uuid not null references employees on delete cascade,
  leave_type_id uuid not null references leave_types,
  year int not null,
  allocated numeric(5,1) not null,
  used numeric(5,1) not null default 0,
  unique (employee_id, leave_type_id, year),
  check (used >= 0)
);

create table if not exists leave_requests (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies on delete cascade,
  employee_id uuid not null references employees on delete cascade,
  leave_type_id uuid not null references leave_types,
  from_date date not null,
  to_date date not null,
  half_day boolean not null default false,
  days numeric(4,1) not null,
  reason text,
  status request_status not null default 'PENDING',
  decided_by uuid references employees,
  decided_at timestamptz,
  decision_note text,
  created_at timestamptz not null default now(),
  check (to_date >= from_date)
);

-- 9. Payroll
create table if not exists salary_structures (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies on delete cascade,
  employee_id uuid not null references employees on delete cascade,
  effective_from date not null,
  basic numeric(12,2) not null,
  hra numeric(12,2) not null default 0,
  allowances jsonb not null default '{}',
  fixed_deductions jsonb not null default '{}',
  unique (employee_id, effective_from)
);

create table if not exists payroll_runs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies on delete cascade,
  period_month date not null,
  status payroll_status not null default 'DRAFT',
  total_gross numeric(14,2) default 0,
  total_net numeric(14,2) default 0,
  created_by uuid references employees,
  approved_by uuid references employees,
  approved_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  unique (company_id, period_month)
);

create table if not exists payroll_items (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references payroll_runs on delete cascade,
  company_id uuid not null references companies on delete cascade,
  employee_id uuid not null references employees,
  working_days numeric(4,1) not null,
  present_days numeric(4,1) not null,
  paid_leave_days numeric(4,1) not null default 0,
  lop_days numeric(4,1) not null default 0,
  gross numeric(12,2) not null,
  deductions jsonb not null default '{}',
  adjustments jsonb not null default '[]',
  net numeric(12,2) not null,
  flags jsonb not null default '[]',
  unique (run_id, employee_id)
);

create table if not exists payslips (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies on delete cascade,
  item_id uuid not null unique references payroll_items on delete cascade,
  employee_id uuid not null references employees,
  period_month date not null,
  storage_path text not null,
  created_at timestamptz not null default now()
);

-- 10. Documents
create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies on delete cascade,
  employee_id uuid not null references employees on delete cascade,
  doc_type text not null check (doc_type in ('PAN','ADDRESS_PROOF','EDUCATION','OFFER_LETTER','OTHER')),
  storage_path text not null,
  mime_type text not null,
  size_bytes int not null check (size_bytes <= 5242880),
  status doc_status not null default 'UPLOADED',
  extracted jsonb,
  name_match_score real,
  reviewed_by uuid references employees,
  reviewed_at timestamptz,
  rejection_reason text,
  expires_on date,
  created_at timestamptz not null default now()
);

-- 11. AI, Risk & Collaboration
create table if not exists ai_conversations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies on delete cascade,
  user_id uuid not null,
  title text,
  created_at timestamptz not null default now()
);

create table if not exists ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references ai_conversations on delete cascade,
  company_id uuid not null references companies on delete cascade,
  role text not null check (role in ('user','assistant','tool')),
  content text not null,
  tools_used jsonb,
  tokens_in int,
  tokens_out int,
  created_at timestamptz not null default now()
);

create table if not exists ai_reports (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies on delete cascade,
  requested_by uuid not null,
  report_type text not null check (report_type in
    ('ATTENDANCE_MONTHLY','LEAVE_SUMMARY','PAYROLL_SUMMARY','COMPANY_OVERVIEW')),
  period_from date not null,
  period_to date not null,
  metrics jsonb not null,
  narrative jsonb not null,
  pdf_path text,
  created_at timestamptz not null default now()
);

create table if not exists risk_signals (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies on delete cascade,
  employee_id uuid references employees on delete cascade,
  kind text not null check (kind in
    ('CHECKIN_OUTLIER','LATE_STREAK','LEAVE_PATTERN','PAYROLL_DELTA','FACE_FAILURES')),
  severity severity not null default 'LOW',
  explanation text not null,
  evidence jsonb not null default '{}',
  status signal_status not null default 'OPEN',
  reviewed_by uuid references employees,
  review_note text,
  detected_at timestamptz not null default now()
);

-- 12. Audit Logs (Immutable, Hash-Chained)
create table if not exists audit_logs (
  id bigint generated always as identity primary key,
  company_id uuid not null references companies on delete cascade,
  actor_user_id uuid,
  actor_role user_role,
  action text not null,
  entity text,
  entity_id text,
  metadata jsonb not null default '{}',
  ip text,
  prev_hash text,
  hash text not null,
  created_at timestamptz not null default now()
);
