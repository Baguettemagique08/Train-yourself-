-- ============================================================================
-- 002 — Document ingestion support
--
-- Extends the documents model with ingestion/classification metadata, adds an
-- extraction-jobs table (one row per worker run, retry-aware), and enriches
-- extracted_fields with confidence, a source pointer (page/section/snippet),
-- and a typed target mapping so a verified value can be pushed idempotently to
-- a case, measurement, spec check, or draft.
-- ============================================================================

-- ── Enums ────────────────────────────────────────────────────────────────────

create type ingest_channel as enum ('upload', 'email', 'scan', 'api');

create type ingest_status as enum (
  'uploading', 'queued', 'processing', 'ready', 'needs_review', 'failed'
);

create type extraction_job_status as enum (
  'pending', 'processing', 'complete', 'partial', 'failed', 'cancelled'
);

create type field_target_kind as enum ('case', 'measurement', 'spec', 'draft', 'none');

create type field_review_status as enum ('unreviewed', 'verified', 'corrected', 'rejected');

-- ── documents: ingestion columns ────────────────────────────────────────────
-- (documents already exists from 001; these columns support the pipeline.)

alter table documents
  add column if not exists channel                  ingest_channel not null default 'upload',
  add column if not exists ingest_status            ingest_status  not null default 'queued',
  add column if not exists classification_confidence numeric(4,3),       -- 0.000–1.000
  add column if not exists page_count               int,
  add column if not exists ingest_error             text;

-- ── extraction_jobs ─────────────────────────────────────────────────────────
-- One row per extraction attempt on a document. The worker claims a job,
-- transitions it, and records timing/model version for reproducibility.

create table if not exists extraction_jobs (
  id            uuid primary key default gen_random_uuid(),
  document_id   uuid not null references documents (id) on delete cascade,
  status        extraction_job_status not null default 'pending',
  attempt       int  not null default 1,
  max_attempts  int  not null default 3,
  model_version text,                       -- e.g. 'ocr:textract@2026-05, ext:gpt-x'
  idempotency_key text unique,              -- dedupe re-enqueues
  error         text,
  enqueued_at   timestamptz not null default now(),
  started_at    timestamptz,
  finished_at   timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_extraction_jobs_document on extraction_jobs (document_id);
create index if not exists idx_extraction_jobs_status   on extraction_jobs (status)
  where status in ('pending', 'processing');

-- ── extracted_fields: confidence, source pointer, target mapping ─────────────
-- (extracted_fields already exists from 001; these columns add traceability
--  and the typed mapping used by the review screen.)

alter table extracted_fields
  add column if not exists extraction_job_id uuid references extraction_jobs (id) on delete set null,
  add column if not exists source_page       int,
  add column if not exists source_section    text,
  add column if not exists source_snippet    text,
  add column if not exists source_bbox       jsonb,              -- {page,x,y,w,h} normalised
  add column if not exists review_status     field_review_status not null default 'unreviewed',
  add column if not exists original_value    text,               -- pre-correction value
  add column if not exists target_kind       field_target_kind not null default 'none',
  add column if not exists target_field      text,               -- column/parameter name
  add column if not exists target_id         uuid,               -- row created/updated on apply
  add column if not exists applied_at        timestamptz,
  add column if not exists applied_by        uuid references profiles (id);

create index if not exists idx_extracted_fields_document on extracted_fields (document_id);
create index if not exists idx_extracted_fields_target   on extracted_fields (target_kind, target_field)
  where review_status in ('verified', 'corrected');

-- ── apply log ────────────────────────────────────────────────────────────────
-- Records each push of a verified field into a downstream entity. Gives an
-- audit trail and supports idempotent re-application.

create table if not exists field_applications (
  id                uuid primary key default gen_random_uuid(),
  extracted_field_id uuid not null references extracted_fields (id) on delete cascade,
  target_kind       field_target_kind not null,
  target_table      text not null,
  target_id         uuid not null,
  target_field      text not null,
  applied_value     text not null,
  applied_by        uuid references profiles (id),
  applied_at        timestamptz not null default now(),
  unique (extracted_field_id, target_id, target_field)   -- idempotency
);

create index if not exists idx_field_applications_field on field_applications (extracted_field_id);

-- ── RLS (mirrors 001: authenticated read; writers insert/update) ─────────────

alter table extraction_jobs    enable row level security;
alter table field_applications enable row level security;

create policy "auth read jobs"  on extraction_jobs    for select to authenticated using (true);
create policy "auth read apps"  on field_applications for select to authenticated using (true);
-- writers (broker/analyst/admin) insert/update handled via the shared
-- is_writer() helper defined in 001.
create policy "writer write jobs" on extraction_jobs
  for all to authenticated using (is_writer()) with check (is_writer());
create policy "writer write apps" on field_applications
  for all to authenticated using (is_writer()) with check (is_writer());
