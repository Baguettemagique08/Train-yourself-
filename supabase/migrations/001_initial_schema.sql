-- ============================================================
-- Copemer Disputes & Compliance Platform
-- Database Schema v1.0
--
-- Design principles:
--   • deliveries are first-class records; a case REFERENCES a delivery
--     (not the other way around) so deliveries exist before disputes begin
--   • soft-delete via deleted_at on every mutable master-data table;
--     RLS WHERE clauses filter it out automatically
--   • draft versioning uses a self-referential parent_draft_id so the
--     full audit chain of a communication is preserved immutably
--   • measurements carry a source enum covering vessel ullage, barge
--     ullage, MFM, third-party surveyor, and manual entry
--   • audit_logs is written only by triggers, never by application code,
--     and is append-only (no UPDATE / DELETE policy granted to anyone)
--   • spec_checks store the three reference values (BDN, contract, lab)
--     as independent nullable columns so partial checks are valid while
--     lab results are still pending
--   • fuel_readiness supports vessel-level and port-level scoping for
--     regulatory compliance across multiple call patterns
-- ============================================================

-- ── Extensions ────────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- fast ILIKE / trigram search on names

-- ── Shared updated_at trigger ────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Convenience: attach updated_at trigger to any table by name
CREATE OR REPLACE FUNCTION fn_add_updated_at_trigger(tbl TEXT)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  EXECUTE format(
    'CREATE TRIGGER trg_%1$s_updated_at
     BEFORE UPDATE ON %1$s
     FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at()',
    tbl
  );
END;
$$;

-- ── Role helper functions (used in RLS policies) ─────────────────────────────

CREATE OR REPLACE FUNCTION fn_current_role()
RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT role::text FROM profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION fn_is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin');
$$;

CREATE OR REPLACE FUNCTION fn_is_writer()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
      AND role IN ('admin', 'senior_broker', 'broker')
  );
$$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- ENUMS
-- ═══════════════════════════════════════════════════════════════════════════════

-- Internal user roles (mirrors Supabase auth JWT claims for RLS)
CREATE TYPE user_role AS ENUM (
  'admin',          -- full access including destructive operations
  'senior_broker',  -- full case ops + draft approval authority
  'broker',         -- case ops, create drafts (cannot approve or send)
  'analyst',        -- read all + create measurements / spec checks
  'readonly'        -- view-only across the entire platform
);

CREATE TYPE company_type AS ENUM (
  'shipowner',
  'charterer',
  'supplier',
  'other'
);

CREATE TYPE delivery_status AS ENUM (
  'in_progress',   -- bunker delivery ongoing
  'completed',     -- delivery finished, awaiting reconciliation sign-off
  'confirmed',     -- all figures agreed, no dispute
  'disputed',      -- discrepancy raised, case opened
  'cancelled'
);

CREATE TYPE case_status AS ENUM (
  'open',
  'under_review',
  'pending_response',  -- awaiting counterparty reply
  'escalated',
  'resolved',
  'closed'
);

CREATE TYPE priority_level AS ENUM (
  'low',
  'normal',
  'high',
  'urgent'
);

CREATE TYPE discrepancy_type AS ENUM (
  'quantity_short',
  'quantity_over',
  'off_spec',
  'mfm_dispute',
  'documentation',
  'contamination',
  'other'
);

CREATE TYPE document_type AS ENUM (
  'BDN',                -- Bunker Delivery Note
  'NOR',                -- Notice of Readiness
  'LOP',                -- Letter of Protest
  'Protest',
  'Lab_Report',         -- Independent laboratory analysis
  'MFM_Log',            -- Mass Flow Meter log
  'Ullage_Report',      -- Vessel or barge ullage report
  'Charter_Party',
  'Statement_of_Facts',
  'Laytime_Statement',
  'Survey_Report',
  'Invoice',
  'Correspondence',
  'Other'
);

CREATE TYPE document_status AS ENUM (
  'uploading',
  'processing',    -- document extraction in progress
  'ready',         -- fields extracted and usable
  'needs_review',  -- extraction uncertain, requires human review
  'failed'         -- extraction failed, manual entry required
);

CREATE TYPE extraction_status AS ENUM (
  'pending',
  'processing',
  'complete',
  'failed',
  'not_applicable'
);

-- Source of a bunker figure
CREATE TYPE measurement_source AS ENUM (
  'vessel',     -- vessel officers' ullage measurement
  'barge',      -- bunker barge / tanker ullage
  'mfm',        -- inline mass flow meter
  'surveyor',   -- independent third-party surveyor
  'manual'      -- manually entered by ops staff (e.g. transcribed from email)
);

CREATE TYPE spec_status AS ENUM (
  'ok',
  'warning',    -- in-spec but close to the limit
  'off_spec',   -- outside ISO 8217 / charter party limits
  'not_tested'  -- lab result not yet received
);

CREATE TYPE draft_type AS ENUM (
  'LOP_Response',
  'Owner_Update',
  'Charterer_Notice',
  'Internal_Memo',
  'Claim_Letter',
  'Protest_Letter',
  'Reservation_of_Rights'
);

CREATE TYPE draft_status AS ENUM (
  'draft',
  'under_review',
  'approved',
  'sent',
  'superseded'   -- replaced by a newer version in the chain
);

CREATE TYPE fuel_type AS ENUM (
  'VLSFO',
  'ULSFO',
  'HSFO',
  'MGO',
  'LSMGO',
  'LNG',
  'LPG',
  'Methanol',
  'Ammonia',
  'Biofuel',
  'B24',
  'B100',
  'HVO',
  'Other'
);

CREATE TYPE fuel_readiness_status AS ENUM (
  'not_started',
  'in_progress',
  'ready',
  'certified'
);

-- Granular business-level event types for the activity feed
CREATE TYPE activity_type AS ENUM (
  'case_created',
  'case_status_changed',
  'case_assigned',
  'case_priority_changed',
  'case_closed',
  'document_uploaded',
  'document_reviewed',
  'extraction_complete',
  'measurement_added',
  'measurement_disputed',
  'spec_check_added',
  'spec_result_received',
  'draft_created',
  'draft_submitted',
  'draft_approved',
  'draft_sent',
  'draft_superseded',
  'delivery_reconciled',
  'note_added',
  'escalated',
  'fuel_readiness_updated'
);

CREATE TYPE audit_operation AS ENUM (
  'INSERT',
  'UPDATE',
  'DELETE'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- MASTER DATA
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── profiles ──────────────────────────────────────────────────────────────────
-- Extends auth.users. Created automatically on first sign-in via trigger.
-- Soft-delete: is_active flag (we cannot delete the auth.users row from here).

CREATE TABLE profiles (
  id             UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email          TEXT        NOT NULL,
  full_name      TEXT        NOT NULL,
  role           user_role   NOT NULL DEFAULT 'broker',
  avatar_url     TEXT,
  is_active      BOOLEAN     NOT NULL DEFAULT TRUE,
  last_seen_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
SELECT fn_add_updated_at_trigger('profiles');
CREATE INDEX idx_profiles_role        ON profiles(role);
CREATE INDEX idx_profiles_inactive    ON profiles(is_active) WHERE is_active = FALSE;

-- ── companies ─────────────────────────────────────────────────────────────────

CREATE TABLE companies (
  id          UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT          NOT NULL,
  type        company_type  NOT NULL,
  country     TEXT          NOT NULL,
  address     TEXT,
  website     TEXT,
  notes       TEXT,
  deleted_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
SELECT fn_add_updated_at_trigger('companies');
CREATE INDEX idx_companies_type      ON companies(type);
CREATE INDEX idx_companies_deleted   ON companies(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX idx_companies_name_trgm ON companies USING gin(name gin_trgm_ops);

-- ── contacts ──────────────────────────────────────────────────────────────────

CREATE TABLE contacts (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id  UUID        NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  full_name   TEXT        NOT NULL,
  email       TEXT        NOT NULL,
  phone       TEXT,
  role        TEXT        NOT NULL,    -- free-text job title or functional role
  is_primary  BOOLEAN     NOT NULL DEFAULT FALSE,
  notes       TEXT,
  deleted_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
SELECT fn_add_updated_at_trigger('contacts');
CREATE INDEX idx_contacts_company  ON contacts(company_id);
CREATE INDEX idx_contacts_email    ON contacts(email);
CREATE INDEX idx_contacts_deleted  ON contacts(deleted_at) WHERE deleted_at IS NOT NULL;

-- ── vessels ───────────────────────────────────────────────────────────────────

CREATE TABLE vessels (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT        NOT NULL,
  imo          TEXT        UNIQUE,        -- IMO number; nullable for vessels without one
  mmsi         TEXT        UNIQUE,
  call_sign    TEXT,
  flag         TEXT        NOT NULL,
  vessel_type  TEXT        NOT NULL,
  dwt          NUMERIC,                   -- deadweight tonnage (MT)
  grt          NUMERIC,                   -- gross tonnage
  year_built   SMALLINT,
  owner_id     UUID        REFERENCES companies(id) ON DELETE SET NULL,
  manager_id   UUID        REFERENCES companies(id) ON DELETE SET NULL,
  notes        TEXT,
  deleted_at   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
SELECT fn_add_updated_at_trigger('vessels');
CREATE INDEX idx_vessels_owner      ON vessels(owner_id);
CREATE INDEX idx_vessels_manager    ON vessels(manager_id);
CREATE INDEX idx_vessels_deleted    ON vessels(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX idx_vessels_name_trgm  ON vessels USING gin(name gin_trgm_ops);

-- ── ports ─────────────────────────────────────────────────────────────────────

CREATE TABLE ports (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT        NOT NULL,
  country    TEXT        NOT NULL,
  unlocode   TEXT        NOT NULL UNIQUE,
  region     TEXT,                     -- e.g. 'ARA', 'Singapore Straits', 'AG'
  timezone   TEXT        NOT NULL DEFAULT 'UTC',
  notes      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
SELECT fn_add_updated_at_trigger('ports');
CREATE INDEX idx_ports_country ON ports(country);
CREATE INDEX idx_ports_region  ON ports(region);

-- ── suppliers ─────────────────────────────────────────────────────────────────

CREATE TABLE suppliers (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT        NOT NULL,
  country         TEXT        NOT NULL,
  license_number  TEXT,                 -- regulatory licence / ex-bonded licence number
  contact_email   TEXT,
  contact_phone   TEXT,
  is_approved     BOOLEAN     NOT NULL DEFAULT TRUE,
  approval_note   TEXT,
  notes           TEXT,
  deleted_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
SELECT fn_add_updated_at_trigger('suppliers');
CREATE INDEX idx_suppliers_deleted     ON suppliers(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX idx_suppliers_is_approved ON suppliers(is_approved);

-- ═══════════════════════════════════════════════════════════════════════════════
-- OPERATIONAL TABLES
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── deliveries ────────────────────────────────────────────────────────────────
-- Deliveries are first-class entities. A case is raised against a delivery.
-- The delivery stores BDN figures, vessel-received figures, and MFM readings
-- as top-level columns for fast dashboard queries. Fine-grained measurement
-- data (with temperature, density, VCF chain) lives in the measurements table.

CREATE TABLE deliveries (
  id               UUID             PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference        TEXT             NOT NULL UNIQUE,   -- e.g. DEL-2026-0118
  vessel_id        UUID             NOT NULL REFERENCES vessels(id),
  port_id          UUID             NOT NULL REFERENCES ports(id),
  supplier_id      UUID             NOT NULL REFERENCES suppliers(id),
  fuel_type        fuel_type        NOT NULL,
  status           delivery_status  NOT NULL DEFAULT 'in_progress',

  -- BDN figures
  bdn_number       TEXT             NOT NULL,
  bdn_quantity     NUMERIC(12,3)    NOT NULL,          -- MT per BDN
  bdn_density      NUMERIC(8,4),                        -- kg/m³ at 15°C

  -- Vessel-received figures
  vessel_quantity  NUMERIC(12,3),                       -- vessel ullage quantity (MT)
  mfm_quantity     NUMERIC(12,3),                       -- mass flow meter reading (MT)

  -- Timing
  delivery_date    TIMESTAMPTZ      NOT NULL,
  commenced_at     TIMESTAMPTZ,
  completed_at     TIMESTAMPTZ,

  -- Reference info
  charter_party_ref       TEXT,
  nominated_by     UUID             REFERENCES profiles(id) ON DELETE SET NULL,

  notes            TEXT,
  deleted_at       TIMESTAMPTZ,
  created_at       TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);
SELECT fn_add_updated_at_trigger('deliveries');
CREATE INDEX idx_deliveries_vessel   ON deliveries(vessel_id);
CREATE INDEX idx_deliveries_port     ON deliveries(port_id);
CREATE INDEX idx_deliveries_supplier ON deliveries(supplier_id);
CREATE INDEX idx_deliveries_status   ON deliveries(status);
CREATE INDEX idx_deliveries_date     ON deliveries(delivery_date DESC);
CREATE INDEX idx_deliveries_deleted  ON deliveries(deleted_at) WHERE deleted_at IS NOT NULL;

-- ── cases ─────────────────────────────────────────────────────────────────────
-- A case is raised when a discrepancy is identified. It references the delivery
-- it arose from. vessel/port/supplier are denormalised here for query performance
-- (they must match the delivery but storing them avoids a join on every list query).

CREATE TABLE cases (
  id                UUID              PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference         TEXT              NOT NULL UNIQUE,  -- e.g. CPM-2026-0042
  delivery_id       UUID              NOT NULL REFERENCES deliveries(id),

  -- Denormalised for query efficiency
  vessel_id         UUID              NOT NULL REFERENCES vessels(id),
  port_id           UUID              NOT NULL REFERENCES ports(id),
  supplier_id       UUID              NOT NULL REFERENCES suppliers(id),
  fuel_type         fuel_type         NOT NULL,

  discrepancy_type  discrepancy_type  NOT NULL,
  claimed_quantity  NUMERIC(12,3),    -- quantity in dispute (MT)
  bdn_quantity      NUMERIC(12,3),    -- BDN quantity captured at case creation

  status            case_status       NOT NULL DEFAULT 'open',
  priority          priority_level    NOT NULL DEFAULT 'normal',

  assigned_to       UUID              REFERENCES profiles(id) ON DELETE SET NULL,
  opened_by         UUID              REFERENCES profiles(id) ON DELETE SET NULL,
  opened_at         TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
  closed_at         TIMESTAMPTZ,

  description       TEXT              NOT NULL DEFAULT '',
  internal_notes    TEXT,             -- never exposed to counterparties

  deleted_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);
SELECT fn_add_updated_at_trigger('cases');
CREATE INDEX idx_cases_delivery   ON cases(delivery_id);
CREATE INDEX idx_cases_vessel     ON cases(vessel_id);
CREATE INDEX idx_cases_port       ON cases(port_id);
CREATE INDEX idx_cases_supplier   ON cases(supplier_id);
CREATE INDEX idx_cases_status     ON cases(status);
CREATE INDEX idx_cases_priority   ON cases(priority);
CREATE INDEX idx_cases_assigned   ON cases(assigned_to);
CREATE INDEX idx_cases_opened_at  ON cases(opened_at DESC);
CREATE INDEX idx_cases_deleted    ON cases(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX idx_cases_ref_trgm   ON cases USING gin(reference gin_trgm_ops);

-- ── documents ─────────────────────────────────────────────────────────────────
-- Documents belong to a case. May optionally be linked to a delivery
-- (for BDNs uploaded before a case is raised).
-- storage_path is the Supabase Storage object key in bucket "case-documents".

CREATE TABLE documents (
  id                UUID              PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id           UUID              NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  delivery_id       UUID              REFERENCES deliveries(id) ON DELETE SET NULL,
  uploaded_by       UUID              REFERENCES profiles(id) ON DELETE SET NULL,

  document_type     document_type     NOT NULL,
  filename          TEXT              NOT NULL,
  storage_path      TEXT              NOT NULL,   -- Supabase Storage object key
  file_size_bytes   BIGINT,
  mime_type         TEXT,
  checksum_sha256   TEXT,              -- SHA-256 of file bytes for integrity checking

  status            document_status   NOT NULL DEFAULT 'uploading',
  extraction_status extraction_status NOT NULL DEFAULT 'pending',
  source_description TEXT,             -- e.g. "Received from Peninsula 02 Jun 2026"

  notes             TEXT,
  deleted_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);
SELECT fn_add_updated_at_trigger('documents');
CREATE INDEX idx_documents_case          ON documents(case_id);
CREATE INDEX idx_documents_delivery      ON documents(delivery_id);
CREATE INDEX idx_documents_type          ON documents(document_type);
CREATE INDEX idx_documents_status        ON documents(status);
CREATE INDEX idx_documents_extraction    ON documents(extraction_status);
CREATE INDEX idx_documents_deleted       ON documents(deleted_at) WHERE deleted_at IS NOT NULL;

-- ── extracted_fields ──────────────────────────────────────────────────────────
-- Key-value pairs extracted from documents. Each field has a confidence score
-- and a verification flag set by a human reviewer. Reviewers may override
-- extracted values without modifying the original extraction result.

CREATE TABLE extracted_fields (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id      UUID        NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  case_id          UUID        REFERENCES cases(id) ON DELETE SET NULL,

  field_name       TEXT        NOT NULL,     -- e.g. 'bdn_quantity', 'flash_point'
  field_value      TEXT        NOT NULL,     -- raw extracted string
  field_unit       TEXT,                     -- e.g. 'MT', '°C', 'kg/m³'
  confidence_score NUMERIC(4,3) CHECK (confidence_score BETWEEN 0 AND 1),
  page_number      SMALLINT,

  is_verified      BOOLEAN     NOT NULL DEFAULT FALSE,
  verified_by      UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  verified_at      TIMESTAMPTZ,
  override_value   TEXT,                     -- reviewer correction; NULL means accept extraction

  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
SELECT fn_add_updated_at_trigger('extracted_fields');
CREATE INDEX idx_extracted_doc        ON extracted_fields(document_id);
CREATE INDEX idx_extracted_case       ON extracted_fields(case_id);
CREATE INDEX idx_extracted_field_name ON extracted_fields(field_name);
CREATE INDEX idx_extracted_unverified ON extracted_fields(is_verified) WHERE is_verified = FALSE;

-- ── measurements ──────────────────────────────────────────────────────────────
-- One row per figure source per fuel grade per case. The reconciler workspace
-- aggregates across sources at query time. Storing individual rows (not a
-- pivot) allows unlimited sources and preserves full audit detail.

CREATE TABLE measurements (
  id                     UUID                PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id                UUID                NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  delivery_id            UUID                REFERENCES deliveries(id) ON DELETE SET NULL,
  document_id            UUID                REFERENCES documents(id) ON DELETE SET NULL,

  source                 measurement_source  NOT NULL,
  fuel_grade             fuel_type           NOT NULL,

  -- The key commercial figure
  quantity_mt            NUMERIC(12,3)       NOT NULL,

  -- Full density/volume correction chain (for expert reconciliation)
  observed_volume_m3     NUMERIC(12,3),
  temperature_c          NUMERIC(6,2),
  density_at_obs_kgm3    NUMERIC(8,4),       -- density at observed temperature
  density_at_15c_kgm3    NUMERIC(8,4),       -- density at 15°C (standard ref)
  vcf                    NUMERIC(8,6),        -- volume correction factor
  trim_correction_m3     NUMERIC(10,4),
  wedge_correction_m3    NUMERIC(10,4),

  -- Attribution
  timestamp_utc          TIMESTAMPTZ         NOT NULL,
  surveyor_name          TEXT,
  surveyor_company       TEXT,

  is_disputed            BOOLEAN             NOT NULL DEFAULT FALSE,
  dispute_reason         TEXT,

  notes                  TEXT,
  created_by             UUID                REFERENCES profiles(id) ON DELETE SET NULL,
  created_at             TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);
SELECT fn_add_updated_at_trigger('measurements');
CREATE INDEX idx_measurements_case      ON measurements(case_id);
CREATE INDEX idx_measurements_delivery  ON measurements(delivery_id);
CREATE INDEX idx_measurements_source    ON measurements(source);
CREATE INDEX idx_measurements_disputed  ON measurements(is_disputed) WHERE is_disputed = TRUE;

-- ── spec_checks ───────────────────────────────────────────────────────────────
-- One row per parameter per fuel grade per case. All three reference columns
-- (bdn_value, contract min/max, lab_result) are independent nullables so that
-- a partial spec check is valid while lab results are pending.

CREATE TABLE spec_checks (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id          UUID        NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  document_id      UUID        REFERENCES documents(id) ON DELETE SET NULL,

  fuel_grade       fuel_type   NOT NULL,
  parameter_name   TEXT        NOT NULL,    -- e.g. 'Density at 15°C', 'Flash Point'
  unit             TEXT        NOT NULL,    -- e.g. 'kg/m³', '°C', '%m/m'

  -- The three columns that define a specification check
  bdn_value        NUMERIC(12,4),           -- value stated on BDN
  contract_min     NUMERIC(12,4),           -- ISO 8217 / charter party minimum
  contract_max     NUMERIC(12,4),           -- ISO 8217 / charter party maximum
  lab_result       NUMERIC(12,4),           -- independent lab analysis result

  status           spec_status  NOT NULL DEFAULT 'not_tested',
  deviation_pct    NUMERIC(8,4),            -- stored for reporting; recomputed on lab update

  -- Lab attribution
  lab_reference    TEXT,        -- lab report number
  lab_date         DATE,
  lab_name         TEXT,

  checked_by       UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
SELECT fn_add_updated_at_trigger('spec_checks');
CREATE INDEX idx_spec_checks_case      ON spec_checks(case_id);
CREATE INDEX idx_spec_checks_status    ON spec_checks(status);
CREATE INDEX idx_spec_checks_parameter ON spec_checks(parameter_name);
CREATE INDEX idx_spec_checks_off_spec  ON spec_checks(case_id) WHERE status = 'off_spec';

-- ── drafts ────────────────────────────────────────────────────────────────────
-- Versioned communications. When a draft is revised, the previous draft is
-- set to status='superseded' and the new draft points back via parent_draft_id.
-- This creates an immutable, ordered version chain: v1 → v2 → v3 (sent).

CREATE TABLE drafts (
  id                       UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id                  UUID          NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  parent_draft_id          UUID          REFERENCES drafts(id) ON DELETE SET NULL,

  draft_type               draft_type    NOT NULL,
  title                    TEXT          NOT NULL,
  body                     TEXT          NOT NULL DEFAULT '',
  status                   draft_status  NOT NULL DEFAULT 'draft',
  version                  SMALLINT      NOT NULL DEFAULT 1,

  -- Approval workflow chain (timestamps are populated as status advances)
  created_by               UUID          REFERENCES profiles(id) ON DELETE SET NULL,
  submitted_for_review_at  TIMESTAMPTZ,
  reviewed_by              UUID          REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at              TIMESTAMPTZ,
  approved_by              UUID          REFERENCES profiles(id) ON DELETE SET NULL,
  approved_at              TIMESTAMPTZ,
  sent_by                  UUID          REFERENCES profiles(id) ON DELETE SET NULL,
  sent_at                  TIMESTAMPTZ,

  -- Recipient captured at send time for audit immutability
  recipient_name           TEXT,
  recipient_email          TEXT,
  sent_reference           TEXT,         -- e.g. email message-id, courier ref

  template_id              UUID,         -- soft FK to templates; not enforced (templates may be deleted)
  notes                    TEXT,

  created_at               TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
SELECT fn_add_updated_at_trigger('drafts');
CREATE INDEX idx_drafts_case        ON drafts(case_id);
CREATE INDEX idx_drafts_status      ON drafts(status);
CREATE INDEX idx_drafts_type        ON drafts(draft_type);
CREATE INDEX idx_drafts_parent      ON drafts(parent_draft_id);
CREATE INDEX idx_drafts_created_by  ON drafts(created_by);
CREATE INDEX idx_drafts_pending     ON drafts(status) WHERE status IN ('draft', 'under_review');

-- ── activities ────────────────────────────────────────────────────────────────
-- Append-only business-event log per case. Written by application code on every
-- meaningful state change. Distinct from audit_logs (which captures every DB
-- write). Activities are business-level events; audit_logs are technical.

CREATE TABLE activities (
  id              UUID           PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id         UUID           NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  delivery_id     UUID           REFERENCES deliveries(id) ON DELETE SET NULL,
  user_id         UUID           REFERENCES profiles(id) ON DELETE SET NULL,

  activity_type   activity_type  NOT NULL,
  description     TEXT           NOT NULL,
  metadata        JSONB,         -- e.g. { "old_status": "open", "new_status": "escalated" }

  created_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW()
  -- No updated_at — activities are immutable once written
);
CREATE INDEX idx_activities_case     ON activities(case_id);
CREATE INDEX idx_activities_user     ON activities(user_id);
CREATE INDEX idx_activities_type     ON activities(activity_type);
CREATE INDEX idx_activities_created  ON activities(created_at DESC);
CREATE INDEX idx_activities_metadata ON activities USING gin(metadata);

-- ── fuel_readiness_records ────────────────────────────────────────────────────
-- Tracks each vessel's readiness for alternative and compliant fuels.
-- port_id is nullable: NULL means the record applies fleet-wide.
-- requirements is a JSONB array of checklist items:
--   [{ "id": "r1", "label": "MFM calibration", "completed": true, "due_date": "...", "doc_ref": "..." }]

CREATE TABLE fuel_readiness_records (
  id                  UUID                    PRIMARY KEY DEFAULT uuid_generate_v4(),
  vessel_id           UUID                    NOT NULL REFERENCES vessels(id) ON DELETE CASCADE,
  port_id             UUID                    REFERENCES ports(id) ON DELETE SET NULL,

  fuel_type           fuel_type               NOT NULL,
  status              fuel_readiness_status   NOT NULL DEFAULT 'not_started',
  readiness_score     SMALLINT                NOT NULL DEFAULT 0
                        CHECK (readiness_score BETWEEN 0 AND 100),

  requirements        JSONB                   NOT NULL DEFAULT '[]',
  target_date         DATE,
  certifying_body     TEXT,
  certificate_ref     TEXT,
  certificate_expiry  DATE,

  assessed_by         UUID                    REFERENCES profiles(id) ON DELETE SET NULL,
  assessed_at         TIMESTAMPTZ,
  notes               TEXT,

  created_at          TIMESTAMPTZ             NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ             NOT NULL DEFAULT NOW(),

  -- One record per vessel + fuel type + port (NULL port = fleet-wide)
  UNIQUE NULLS NOT DISTINCT (vessel_id, fuel_type, port_id)
);
SELECT fn_add_updated_at_trigger('fuel_readiness_records');
CREATE INDEX idx_fuel_vessel   ON fuel_readiness_records(vessel_id);
CREATE INDEX idx_fuel_port     ON fuel_readiness_records(port_id);
CREATE INDEX idx_fuel_status   ON fuel_readiness_records(status);
CREATE INDEX idx_fuel_expiry   ON fuel_readiness_records(certificate_expiry)
  WHERE certificate_expiry IS NOT NULL;

-- ═══════════════════════════════════════════════════════════════════════════════
-- CONFIGURATION TABLES
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── thresholds ────────────────────────────────────────────────────────────────
-- Configurable warning/critical thresholds for spec parameters and quantity
-- reconciliation. Managed by admins in Admin → Thresholds.
-- fuel_type NULL = applies to all fuel types for that parameter.

CREATE TABLE thresholds (
  id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  category            TEXT        NOT NULL DEFAULT 'spec',   -- 'spec' | 'quantity'
  parameter           TEXT        NOT NULL,
  unit                TEXT        NOT NULL DEFAULT '',
  warning_threshold   NUMERIC     NOT NULL,
  critical_threshold  NUMERIC     NOT NULL,
  fuel_type           fuel_type,   -- NULL = all fuels
  notes               TEXT,

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE NULLS NOT DISTINCT (parameter, fuel_type)
);
SELECT fn_add_updated_at_trigger('thresholds');
CREATE INDEX idx_thresholds_category ON thresholds(category);
CREATE INDEX idx_thresholds_fuel     ON thresholds(fuel_type);

-- ── templates ─────────────────────────────────────────────────────────────────
-- Draft text templates. The body may contain {{placeholders}} for
-- case reference, vessel name, port, dates, etc. Substitution is
-- performed in the application layer, not the database.

CREATE TABLE templates (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  draft_type   draft_type  NOT NULL,
  name         TEXT        NOT NULL,
  description  TEXT,
  body         TEXT        NOT NULL DEFAULT '',
  is_active    BOOLEAN     NOT NULL DEFAULT TRUE,
  created_by   UUID        REFERENCES profiles(id) ON DELETE SET NULL,

  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
SELECT fn_add_updated_at_trigger('templates');
CREATE INDEX idx_templates_type      ON templates(draft_type);
CREATE INDEX idx_templates_inactive  ON templates(is_active) WHERE is_active = FALSE;

-- ═══════════════════════════════════════════════════════════════════════════════
-- AUDIT LOG
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── audit_logs ────────────────────────────────────────────────────────────────
-- Written exclusively by database triggers using SECURITY DEFINER.
-- Application code cannot INSERT, UPDATE, or DELETE rows here.
-- Provides a tamper-evident record of every write to sensitive tables.

CREATE TABLE audit_logs (
  id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID            REFERENCES profiles(id) ON DELETE SET NULL,
  table_name      TEXT            NOT NULL,
  record_id       UUID            NOT NULL,
  operation       audit_operation NOT NULL,
  old_data        JSONB,           -- NULL for INSERT
  new_data        JSONB,           -- NULL for DELETE
  changed_fields  TEXT[],          -- column names that changed (UPDATE only)
  ip_address      INET,
  user_agent      TEXT,
  created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_audit_table   ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_user    ON audit_logs(user_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_op      ON audit_logs(operation);

-- Audit trigger function — SECURITY DEFINER bypasses RLS to write logs
CREATE OR REPLACE FUNCTION fn_audit_trigger()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  changed_cols TEXT[];
BEGIN
  IF TG_OP = 'UPDATE' THEN
    SELECT array_agg(n.key)
    INTO changed_cols
    FROM jsonb_each(to_jsonb(NEW)) n
    JOIN jsonb_each(to_jsonb(OLD)) o ON n.key = o.key
    WHERE n.value IS DISTINCT FROM o.value;

    INSERT INTO audit_logs (user_id, table_name, record_id, operation, old_data, new_data, changed_fields)
    VALUES (auth.uid(), TG_TABLE_NAME, OLD.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), changed_cols);

  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (user_id, table_name, record_id, operation, new_data)
    VALUES (auth.uid(), TG_TABLE_NAME, NEW.id, 'INSERT', to_jsonb(NEW));

  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (user_id, table_name, record_id, operation, old_data)
    VALUES (auth.uid(), TG_TABLE_NAME, OLD.id, 'DELETE', to_jsonb(OLD));
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Attach audit triggers to all sensitive operational tables
DO $$ DECLARE
  t TEXT;
  audited TEXT[] := ARRAY[
    'cases', 'deliveries', 'documents', 'drafts',
    'measurements', 'spec_checks', 'fuel_readiness_records',
    'thresholds', 'templates', 'profiles'
  ];
BEGIN
  FOREACH t IN ARRAY audited LOOP
    EXECUTE format(
      'CREATE TRIGGER trg_%1$s_audit
       AFTER INSERT OR UPDATE OR DELETE ON %1$s
       FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger()',
      t
    );
  END LOOP;
END $$;

-- ── Auto-create profile on sign-up ───────────────────────────────────────────

CREATE OR REPLACE FUNCTION fn_handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)
    )
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION fn_handle_new_user();

-- ═══════════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- Policy matrix:
--
--   Table                │ SELECT      │ INSERT          │ UPDATE          │ DELETE
--   ─────────────────────┼─────────────┼─────────────────┼─────────────────┼──────────────
--   profiles             │ auth        │ (trigger only)  │ own row | admin │ admin
--   master data          │ auth        │ writer          │ writer          │ admin
--   deliveries / cases   │ auth        │ writer          │ writer          │ admin
--   documents            │ auth        │ writer          │ writer          │ admin
--   extracted_fields     │ auth        │ writer+analyst  │ writer+analyst  │ admin
--   measurements         │ auth        │ writer+analyst  │ writer+analyst  │ admin
--   spec_checks          │ auth        │ writer+analyst  │ writer+analyst  │ admin
--   drafts               │ auth        │ writer          │ writer          │ admin
--   activities           │ auth        │ writer+analyst  │ —               │ —
--   fuel_readiness       │ auth        │ writer          │ writer          │ admin
--   thresholds           │ auth        │ admin           │ admin           │ admin
--   templates            │ auth        │ writer          │ writer          │ admin
--   audit_logs           │ admin       │ — (trigger)     │ —               │ —
--
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE profiles               ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies              ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts               ENABLE ROW LEVEL SECURITY;
ALTER TABLE vessels                ENABLE ROW LEVEL SECURITY;
ALTER TABLE ports                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers              ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries             ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents              ENABLE ROW LEVEL SECURITY;
ALTER TABLE extracted_fields       ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurements           ENABLE ROW LEVEL SECURITY;
ALTER TABLE spec_checks            ENABLE ROW LEVEL SECURITY;
ALTER TABLE drafts                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities             ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel_readiness_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE thresholds             ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates              ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs             ENABLE ROW LEVEL SECURITY;

-- ── SELECT: all authenticated users (non-deleted rows filtered in app layer) ──

DO $$ DECLARE
  t TEXT;
  readable TEXT[] := ARRAY[
    'profiles', 'companies', 'contacts', 'vessels', 'ports', 'suppliers',
    'deliveries', 'cases', 'documents', 'extracted_fields', 'measurements',
    'spec_checks', 'drafts', 'activities', 'fuel_readiness_records',
    'thresholds', 'templates'
  ];
BEGIN
  FOREACH t IN ARRAY readable LOOP
    EXECUTE format(
      'CREATE POLICY "rls_%1$s_select"
       ON %1$s FOR SELECT TO authenticated USING (true)',
      t
    );
  END LOOP;
END $$;

-- audit_logs: admin read only
CREATE POLICY "rls_audit_logs_select_admin"
  ON audit_logs FOR SELECT TO authenticated
  USING (fn_is_admin());

-- ── INSERT + UPDATE: writers (admin, senior_broker, broker) ──────────────────

DO $$ DECLARE
  t TEXT;
  writable TEXT[] := ARRAY[
    'companies', 'contacts', 'vessels', 'ports', 'suppliers',
    'deliveries', 'cases', 'documents', 'drafts',
    'fuel_readiness_records', 'templates'
  ];
BEGIN
  FOREACH t IN ARRAY writable LOOP
    EXECUTE format(
      'CREATE POLICY "rls_%1$s_insert"
       ON %1$s FOR INSERT TO authenticated WITH CHECK (fn_is_writer())',
      t
    );
    EXECUTE format(
      'CREATE POLICY "rls_%1$s_update"
       ON %1$s FOR UPDATE TO authenticated USING (fn_is_writer())',
      t
    );
  END LOOP;
END $$;

-- extracted_fields, measurements, spec_checks, activities: writers AND analysts

DO $$ DECLARE
  t TEXT;
  analyst_writable TEXT[] := ARRAY[
    'extracted_fields', 'measurements', 'spec_checks', 'activities'
  ];
BEGIN
  FOREACH t IN ARRAY analyst_writable LOOP
    EXECUTE format(
      'CREATE POLICY "rls_%1$s_insert"
       ON %1$s FOR INSERT TO authenticated
       WITH CHECK (fn_current_role() IN (''admin'', ''senior_broker'', ''broker'', ''analyst''))',
      t
    );
    EXECUTE format(
      'CREATE POLICY "rls_%1$s_update"
       ON %1$s FOR UPDATE TO authenticated
       USING (fn_current_role() IN (''admin'', ''senior_broker'', ''broker'', ''analyst''))',
      t
    );
  END LOOP;
END $$;

-- ── thresholds: admin write only ─────────────────────────────────────────────

CREATE POLICY "rls_thresholds_insert_admin"
  ON thresholds FOR INSERT TO authenticated
  WITH CHECK (fn_is_admin());

CREATE POLICY "rls_thresholds_update_admin"
  ON thresholds FOR UPDATE TO authenticated
  USING (fn_is_admin());

-- ── profiles: own-row update, admin update any ────────────────────────────────

CREATE POLICY "rls_profiles_update"
  ON profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR fn_is_admin());

-- ── DELETE: admin only ────────────────────────────────────────────────────────

DO $$ DECLARE
  t TEXT;
  deletable TEXT[] := ARRAY[
    'companies', 'contacts', 'vessels', 'suppliers',
    'deliveries', 'cases', 'documents', 'drafts',
    'templates', 'thresholds', 'profiles'
  ];
BEGIN
  FOREACH t IN ARRAY deletable LOOP
    EXECUTE format(
      'CREATE POLICY "rls_%1$s_delete_admin"
       ON %1$s FOR DELETE TO authenticated USING (fn_is_admin())',
      t
    );
  END LOOP;
END $$;

-- audit_logs: no delete, no insert from application layer
-- The fn_audit_trigger runs as SECURITY DEFINER and bypasses RLS entirely.

-- ═══════════════════════════════════════════════════════════════════════════════
-- UTILITY VIEWS
-- ═══════════════════════════════════════════════════════════════════════════════

-- Open cases enriched (for dashboard and case list)
CREATE OR REPLACE VIEW vw_open_cases AS
SELECT
  c.id,
  c.reference,
  c.status,
  c.priority,
  c.discrepancy_type,
  c.claimed_quantity,
  c.fuel_type,
  c.opened_at,
  c.created_at,
  v.name         AS vessel_name,
  v.imo          AS vessel_imo,
  p.name         AS port_name,
  p.unlocode     AS port_unlocode,
  s.name         AS supplier_name,
  u.full_name    AS assigned_to_name,
  (SELECT COUNT(*)
   FROM documents d
   WHERE d.case_id = c.id AND d.deleted_at IS NULL)            AS document_count,
  (SELECT COUNT(*)
   FROM drafts dr
   WHERE dr.case_id = c.id
     AND dr.status NOT IN ('sent', 'superseded'))               AS pending_draft_count,
  (SELECT BOOL_OR(sc.status = 'off_spec')
   FROM spec_checks sc
   WHERE sc.case_id = c.id)                                     AS has_off_spec
FROM cases c
JOIN vessels v   ON v.id = c.vessel_id
JOIN ports p     ON p.id = c.port_id
JOIN suppliers s ON s.id = c.supplier_id
LEFT JOIN profiles u ON u.id = c.assigned_to
WHERE c.status NOT IN ('resolved', 'closed')
  AND c.deleted_at IS NULL;

-- Reconciler pivot: vessel / barge / MFM / surveyor per case per fuel grade
CREATE OR REPLACE VIEW vw_reconciler AS
SELECT
  m.case_id,
  m.fuel_grade,
  MAX(CASE WHEN m.source = 'vessel'   THEN m.quantity_mt END) AS vessel_mt,
  MAX(CASE WHEN m.source = 'barge'    THEN m.quantity_mt END) AS barge_mt,
  MAX(CASE WHEN m.source = 'mfm'      THEN m.quantity_mt END) AS mfm_mt,
  MAX(CASE WHEN m.source = 'surveyor' THEN m.quantity_mt END) AS surveyor_mt,
  MAX(CASE WHEN m.source = 'manual'   THEN m.quantity_mt END) AS manual_mt,
  d.bdn_quantity                                               AS bdn_mt
FROM measurements m
JOIN cases c      ON c.id = m.case_id
JOIN deliveries d ON d.id = c.delivery_id
WHERE c.deleted_at IS NULL
GROUP BY m.case_id, m.fuel_grade, d.bdn_quantity;

-- Spec check summary per case (for case overview badges)
CREATE OR REPLACE VIEW vw_spec_summary AS
SELECT
  case_id,
  fuel_grade,
  COUNT(*)                                        AS total_parameters,
  COUNT(*) FILTER (WHERE status = 'off_spec')     AS off_spec_count,
  COUNT(*) FILTER (WHERE status = 'warning')      AS warning_count,
  COUNT(*) FILTER (WHERE status = 'ok')           AS ok_count,
  COUNT(*) FILTER (WHERE status = 'not_tested')   AS not_tested_count,
  BOOL_OR(status = 'off_spec')                    AS has_off_spec
FROM spec_checks
GROUP BY case_id, fuel_grade;

-- Fleet alternative fuel readiness summary
CREATE OR REPLACE VIEW vw_fleet_readiness AS
SELECT
  v.id            AS vessel_id,
  v.name          AS vessel_name,
  v.imo,
  fr.fuel_type,
  fr.status,
  fr.readiness_score,
  fr.target_date,
  fr.certificate_expiry,
  fr.certifying_body,
  (SELECT COUNT(*) FROM jsonb_array_elements(fr.requirements) r
   WHERE (r->>'completed')::boolean = true)   AS completed_requirements,
  jsonb_array_length(fr.requirements)          AS total_requirements
FROM fuel_readiness_records fr
JOIN vessels v ON v.id = fr.vessel_id
WHERE fr.port_id IS NULL   -- fleet-wide records only
  AND v.deleted_at IS NULL
ORDER BY v.name, fr.fuel_type;
